import scrapy
from scrapy import signals
from w3lib.html import remove_tags
from urllib.parse import urljoin, urlparse
import re
import google.generativeai as genai
import os
import time
from dotenv import load_dotenv
from collections import deque
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

PAGES_CRAWLED_PER_WEBSITE = 10
SPIDER_DURATION_HRS = 0.5

class NewsSpider(scrapy.Spider):
    name = "news_spider"
    custom_settings = {
        'CLOSESPIDER_TIMEOUT': SPIDER_DURATION_HRS * 60 * 60 # seconds
    }

    def __init__(self, urls_file=None, *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        if urls_file:
            with open(urls_file, 'r') as f:
                self.start_urls = [url.strip() for url in f if url.strip()]
        else:
            self.start_urls = []

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not found in environment variables.")
        genai.configure(api_key=api_key)
        self.genai_model = genai.GenerativeModel("gemini-2.0-flash")

        # --- Gemini rate limiting state ---
        self.gemini_requests_today = 0
        self.gemini_request_times = deque()
        self.gemini_day = datetime.utcnow().date()

    # --- Rate limiting ---
    def can_make_gemini_request(self):
        now = datetime.utcnow()
        if now.date() != self.gemini_day:
            self.gemini_requests_today = 0
            self.gemini_day = now.date()
            self.gemini_request_times.clear()
        if self.gemini_requests_today >= 1500:
            self.logger.warning("Gemini daily limit reached (1,500 requests). Skipping AI call.")
            return False
        while self.gemini_request_times and (now - self.gemini_request_times[0]).total_seconds() > 60:
            self.gemini_request_times.popleft()
        if len(self.gemini_request_times) >= 15:
            wait_time = 60 - (now - self.gemini_request_times[0]).total_seconds()
            self.logger.info(f"Gemini rate limit hit. Sleeping for {int(wait_time)+1} seconds.")
            time.sleep(wait_time + 1)
        return True

    # --- Section title extraction ---
    def extract_section_titles(self, response):
        sections = response.xpath('//section | //div')
        titles_and_sections = []
        for section in sections:
            section_title = section.xpath('.//h1/text() | .//h2/text() | .//h3/text()').get()
            if section_title:
                titles_and_sections.append((section_title, section))
        return titles_and_sections

    # --- AI batch section classification ---
    def classify_sections_with_ai(self, titles_and_sections):
        selected_indices = []
        if titles_and_sections and self.can_make_gemini_request():
            titles_list = [t[0] for t in titles_and_sections]
            prompt = (
                "Here is a list of section titles from a news website:\n"
                + "\n".join(f"{i+1}. {title}" for i, title in enumerate(titles_list))
                + "\n\nWhich of these are likely to contain a list of news articles? "
                "Reply with the numbers of the relevant sections, separated by commas."
            )
            try:
                ai_response = self.genai_model.generate_content(prompt)
                self.gemini_requests_today += 1
                self.gemini_request_times.append(datetime.utcnow())
                answer = ai_response.text.strip()
                selected_indices = [int(s) - 1 for s in re.findall(r'\d+', answer) if 0 < int(s) <= len(titles_list)]
            except Exception as e:
                self.logger.warning(f"AI API error: {e}")
        return selected_indices

    # --- Article link checking ---
    def is_article_link(self, href):
       # Exclude Twitter, LinkedIn, TikTok, and YouTube
        if (
            "twitter.com" in href or
            "linkedin.com" in href or
            "tiktok.com" in href or
            "youtube.com" in href
        ):
            return False

        # Exclude mailto and tel links
        if href.startswith("mailto:") or href.startswith("tel:"):
            return False
        # Exclude image files by extension
        IMAGE_EXTENSIONS = (
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', '.ico', '.mng', '.pct', '.psd', '.ai', '.drw', '.dxf', '.eps', '.ps', '.cdr'
        )
        if href.lower().endswith(IMAGE_EXTENSIONS):
            return False
        # Exclude category/tag/section URLs
        if re.search(r'/category/|/tag/|/section/', href):
            return False
        # Exclude homepage and very short paths
        path = urlparse(href).path
        if path in ('/', ''):
            return False
        # Allow links with at least two segments (e.g. /some-slug/)
        if len(path.strip("/").split("/")) < 1:
            return False
        return True



    # --- Article link extraction ---
    def extract_article_links(self, section, base_url):
        article_links = section.xpath('.//a/@href').getall()
        found_articles = set()
        for link in article_links:
            if not link or link.startswith('javascript:') or link.startswith('#'):
                continue
            absolute_link = urljoin(base_url, link)
            if self.is_article_link(absolute_link):
                found_articles.add(absolute_link)
        return found_articles

    def get_next_page_url(self, response, current_page=1, max_pages=10):
        # --- Page limit check ---
        if current_page >= max_pages:
            return None

        next_page_selectors = [
            '//a[contains(text(), "Next") or contains(text(), "next") or contains(text(), "Older") or contains(text(), "older") or @rel="next"]/@href',
            '//li[@class="next"]/a/@href',
            '//a[contains(@class, "next")]/@href',
            '//a[contains(@aria-label, "Next")]/@href'
        ]
        for selector in next_page_selectors:
            next_page_url = response.xpath(selector).get()
            if next_page_url and next_page_url.startswith(('http', '/')):
                if not next_page_url.startswith(('mailto:', 'tel:')):
                    return urljoin(response.url, next_page_url)
                    
        # Numeric fallback
        current_url = response.url
        current_page_num = None
        match = re.search(r'page[=/\-]?(\d+)', current_url)
        if match:
            current_page_num = int(match.group(1))
        page_links = response.xpath('//a[contains(@href, "page")]/@href').getall()
        page_nums = []
        for link in page_links:
            num_match = re.search(r'page[=/\-]?(\d+)', link)
            if num_match:
                page_num = int(num_match.group(1))
                if current_page_num is None or page_num > current_page_num:
                    page_nums.append((page_num, link))
        if page_nums:
            return urljoin(response.url, min(page_nums, key=lambda x: x[0])[1])
        return None
    # --- Category/section traversal ---
    def get_section_links(self, response):
        section_links = response.xpath('//a[contains(@href, "/category/") or contains(@href, "/tag/")]/@href').getall()
        return [urljoin(response.url, link) for link in section_links]


    # def parse_article(self, response):
    #     date_str = response.xpath('//time/@datetime').get()
    #     if date_str:
    #         try:
    #             article_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
    #             one_week_ago = datetime.now() - timedelta(days=7)
    #             if article_date >= one_week_ago:
    #                 with open("parsed.txt", "a", encoding="utf-8") as f:
    #                     f.write(response.url + "\n")
    #                 self.logger.info(f"Saved article from {article_date.date()}: {response.url}")
    #         except Exception as e:
    #             self.logger.warning(f"Failed to parse date for {response.url}: {e}")

    # --- Main parse ---
    def parse(self, response):
        self.logger.info(f"Scanning Page: {response.url}")

        # 1. Extract section titles and references
        titles_and_sections = self.extract_section_titles(response)

        # 2. Use AI to classify which sections likely contain news articles
        selected_indices = self.classify_sections_with_ai(titles_and_sections)

        # 3. Extract article links from selected sections
        found_articles = set()
        for idx in selected_indices:
            section = titles_and_sections[idx][1]
            found_articles |= self.extract_article_links(section, response.url)

        # 4. For each candidate article, yield a request to parse_article
        for url in found_articles:
            yield scrapy.Request(url, callback=self.parse_article)

        # 5. Follow pagination if present, but only up to max_pages per start URL
        current_page = response.meta.get('current_page', 1)
        max_pages = PAGES_CRAWLED_PER_WEBSITE

        if current_page < max_pages:
            next_page_url = self.get_next_page_url(response, current_page=current_page, max_pages=max_pages)
            if next_page_url:
                self.logger.info(f"Following pagination to: {next_page_url} (page {current_page + 1} of {max_pages})")
                yield scrapy.Request(
                    next_page_url,
                    callback=self.parse,
                    meta={'current_page': current_page + 1}
                )
        else:
            self.logger.info(f"✅ Crawled {max_pages} pages for {response.url}. Moving on to next link.")


        # 6. Recursively follow category/section links
        for section_url in self.get_section_links(response):
            yield scrapy.Request(section_url, callback=self.parse)

    def parse_article(self, response):
        title = response.xpath('//h1/text()').get()
        summary = response.xpath('//meta[@name="description"]/@content').get()
        
        # Enhanced content extraction from <p> tags within likely content containers
        content_container = response.xpath(
            '//*[contains(@class, "content") or contains(@class, "article") or contains(@class, "post")]'
        )
        content = ""
        description = ""  # For the one-line summary from the first non-empty <p>
        boilerplate = [
            "Your email address will not be published",
            "Required fields are marked",
            "Submit Comment",
            "Website",
            "Comment",
            "Your Name",
            "Your E-mail"
        ]
        seen = set()
        cleaned_paragraphs = []

        if content_container:
            paragraphs = content_container.xpath('.//p[not(ancestor::form) and not(ancestor::aside) and not(ancestor::footer)]//text()').getall()
        else:
            # Fallback: try all <p> tags on the page, excluding forms/asides/footers
            paragraphs = response.xpath('//p[not(ancestor::form) and not(ancestor::aside) and not(ancestor::footer)]//text()').getall()

        for p in paragraphs:
            p_strip = p.strip()
            if (
                p_strip and
                p_strip not in seen and
                not any(bp in p_strip for bp in boilerplate)
            ):
                cleaned_paragraphs.append(p_strip)
                seen.add(p_strip)

        content = " ".join(cleaned_paragraphs)

        # Improved summary: first non-empty, non-boilerplate, non-duplicate <p>
        if cleaned_paragraphs:
            description = cleaned_paragraphs[0]

        date_str = response.xpath('//time/@datetime').get()
        formatted_date = ""

        if date_str:
            try:
                article_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
                formatted_date = article_date.strftime("%Y-%m-%d")
            except Exception:
                formatted_date = date_str  # fallback to raw string

        # If not found or failed, try <li class="meta-date">
        if not formatted_date or formatted_date == date_str:
            alt_date_str = response.xpath('//li[contains(@class, "meta-date")]/text()').get()
            if alt_date_str:
                try:
                    # Try parsing "May 16, 2025" format
                    article_date = datetime.strptime(alt_date_str.strip(), "%B %d, %Y")
                    formatted_date = article_date.strftime("%Y-%m-%d")
                except Exception:
                    formatted_date = alt_date_str.strip()  # fallback to raw string

        # --- Example entity extraction (replace with real methods or logic) ---
        people_names = self.extract_people_names(content)
        positions = self.extract_positions(content)
        companies = self.extract_companies(content)
        institutions = self.extract_institutions(content)
        institution_people = self.extract_institution_people(content)
        category = self.extract_category(content)

        # --- Validate required fields ---
        # if not title or not content or len(content) < 100:
        #     return

        yield {
            "URL": response.url,
            "Título": title.strip() if title else "",
            "Descripción en una frase": description or summary or "",
            "Resumen": content,  # Full article content, cleaned and deduplicated
            "Nombres de personas": people_names,
            "Puesto": positions,
            "Empresa": companies,
            "Instituciones nombradas": institutions,
            "Personas de instituciones": institution_people,
            "Categoría": category,
            "Fecha": formatted_date,
        }


        
    # parsing logic for fields
    def extract_people_names(self, text):
        # Extracts likely person names based on capitalization patterns
        matches = re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?\b', text)
        return ", ".join(sorted(set(matches)))

    def extract_positions(self, text):
        # Extracts common professional positions from the text
        positions = re.findall(r'\b(?:CEO|CTO|CFO|COO|Founder|Cofounder|President|Director|Manager|Engineer|Developer|Editor|Journalist|Analyst|Consultant|Chairman|Partner|Head|Lead|Officer|Chief)\b', text, re.IGNORECASE)
        return ", ".join(sorted(set(positions)))

    def extract_companies(self, text):
        # Extracts company names based on common business suffixes
        companies = re.findall(r'\b([A-Z][A-Za-z0-9&\.\- ]+ (?:Inc|LLC|Ltd|Corporation|Corp|S\.A\.|GmbH|S\.L\.|Pty|S\.A\.S\.))\b', text)
        return ", ".join(sorted(set(companies)))

    def extract_institutions(self, text):
        # Extracts institution names using common institution keywords
        institutions = re.findall(r'\b([A-Z][A-Za-z0-9&\.\- ]+ (?:University|Institute|College|Hospital|School|Summit|Conference|Forum|Council|Academy|Association|Foundation|Ministry|Bank|Laboratory|Center|Centre))\b', text)
        return ", ".join(sorted(set(institutions)))

    def extract_institution_people(self, text):
        # person pattern (allows for middle initials, etc.)
        # institution pattern, but still prefers known institution keywords
        pattern = re.compile(
            r'([A-Z][a-z]+(?: [A-Z][a-z]+)*)(?:,? [A-Za-z]+)? (?:of|from|at|en|de)\s+([A-Z][A-Za-z0-9&\.\- ]{2,}(?:University|Institute|College|Hospital|School|Summit|Conference|Forum|Council|Academy|Association|Foundation|Ministry|Bank|Laboratory|Center|Centre|Inc|LLC|Ltd|Corporation|Corp|S\.A\.|GmbH|S\.L\.|Pty|S\.A\.S\.))',
            re.IGNORECASE
        )
        matches = pattern.findall(text)
        # Filter out generic "person" terms
        generic_terms = {"The president", "The Brazilian", "Three major", "Facebook and", "Amazon is", "Uruguay is"}
        results = []
        for name, inst in matches:
            if name.strip() not in generic_terms and len(name.strip().split()) >= 2:
                results.append(f"{name.strip()} - {inst.strip()}")
        return "; ".join(results) if results else "-"


    def extract_category(self, text):
        # Assigns categories based on keywords found in the text
        categories = []
        if re.search(r'\b(sustainability|sostenibilidad|environment|medio ambiente|green|climate)\b', text, re.IGNORECASE):
            categories.append("Sostenibilidad")
        if re.search(r'\b(innovation|innovación|startup|tecnología|technology|digital)\b', text, re.IGNORECASE):
            categories.append("Innovación")
        if re.search(r'\b(finance|finanzas|bank|banco|investment|inversión)\b', text, re.IGNORECASE):
            categories.append("Finanzas")
        return ", ".join(categories) if categories else "General"
    



    def remove_duplicates_from_file(self, filename="parsed.txt"):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                lines = f.readlines()
            unique_links = sorted(set(line.strip() for line in lines if line.strip()))
            with open(filename, "w", encoding="utf-8") as f:
                for link in unique_links:
                    f.write(link + "\n")
            self.logger.info(f"Removed duplicates. {len(unique_links)} unique links remain in {filename}.")
        except Exception as e:
            self.logger.error(f"Error removing duplicates from {filename}: {e}")
            
        
    @classmethod 
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        crawler.signals.connect(spider.on_spider_closed, signal=signals.spider_closed)
        return spider

    def on_spider_closed(self, spider):
        self.remove_duplicates_from_file("parsed.txt")