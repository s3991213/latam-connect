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
import threading

# Load environment variables from .env file
load_dotenv()

PAGES_CRAWLED_PER_WEBSITE = 10
SPIDER_DURATION_HRS = 1/2
USE_AI_SECTION_FILTER = True  # set False to fully bypass AI if needed


BOILERPLATE_STRINGS = [
    "Your email address will not be published",
    "Required fields are marked",
    "Submit Comment",
    "Website",
    "Comment",
    "Your Name",
    "Your E-mail"
]

DOMAIN_CONTENT_XPATHS = {
    "techcrunch.com": '//div[contains(@class, "wp-block-post-content")]',
    "elpais.com": '//*[contains(@class, "articulo-cuerpo")]',
    "bloomberg.com": '//div[contains(@class, "body-copy-v2") or contains(@class, "article__body")]',
    "reuters.com": '//div[contains(@class, "article-body__content__17Yit")] | //div[contains(@class, "article-body__content")]',
    "bbc.com": '//div[contains(@class, "ssrcss-uf6wea-RichTextComponentWrapper")]',
    "nytimes.com": '//section[contains(@name, "articleBody")]',
    "cnn.com": '//div[contains(@class, "article__content")]',
    "theguardian.com": '//div[contains(@class, "article-body-commercial-selector")]',
    "forbes.com": '//div[contains(@class, "article-body")]',
    "latimes.com": '//div[contains(@class, "story-body")]',
    "infobae.com": '//div[contains(@class, "article-main-content")]',
    "clarin.com": '//div[contains(@class, "cuerpo_nota") or contains(@class, "body-nota")]',
    "eluniverso.com": '//div[contains(@class, "field-item even")]',
    "lanacion.com.ar": '//div[contains(@class, "article-body")]',
}


class NewsSpider(scrapy.Spider):
    name = "news_spider"
    custom_settings = {
        'CLOSESPIDER_TIMEOUT': SPIDER_DURATION_HRS * 60 * 60,
        'HTTPERROR_ALLOW_ALL': True,
        'LOG_LEVEL': 'INFO'
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

        self.gemini_requests_today = 0
        self.gemini_request_times = deque()
        self.gemini_day = datetime.utcnow().date()

        self.visited_links = set()

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

    def extract_section_titles(self, response):
        sections = response.xpath('//section | //div')
        titles_and_sections = []
        for section in sections:
            section_title = section.xpath('.//h1/text() | .//h2/text() | .//h3/text()').get()
            if section_title:
                titles_and_sections.append((section_title, section))
        return titles_and_sections

    def classify_sections_with_ai(self, titles_and_sections):
        selected_indices = []

        if titles_and_sections and self.can_make_gemini_request():
            def call_gemini():
                nonlocal selected_indices
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

            thread = threading.Thread(target=call_gemini)
            thread.start()
            thread.join(timeout=15)
            if thread.is_alive():
                self.logger.warning("Gemini API call timeout. Skipping.")
                thread.join()

        return selected_indices
    
    def is_hub_page(self, url):
    # Define what looks like a "hub" page 
        if url.endswith("/latest/") or "/tag/" in url or "/category/" in url or url.endswith("/newsletters/") or "/news/" in url:
            return True
        return False


    def is_article_link(self, href):
        if (
            "twitter.com" in href or
            "linkedin.com" in href or
            "tiktok.com" in href or
            "youtube.com" in href
        ):
            return False
        if href.startswith("mailto:") or href.startswith("tel:"):
            return False
        IMAGE_EXTENSIONS = (
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', '.ico', '.mng', '.pct', '.psd', '.ai', '.drw', '.dxf', '.eps', '.ps', '.cdr'
        )
        if href.lower().endswith(IMAGE_EXTENSIONS):
            return False
        # Improved blacklist
        if re.search(r'/category/|/tag/|/section/|/author/|/video/|/page/|/events?(/|$)|/storyline(/|$)|/about(/|$)', href):
            return False
        path = urlparse(href).path
        if path in ('/', ''):
            return False
        if len(path.strip("/").split("/")) < 1:
            return False
        return True

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
            if next_page_url and next_page_url.startswith(('http', '/')) and not next_page_url.startswith(('mailto:', 'tel:')):
                return urljoin(response.url, next_page_url)

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

    def get_section_links(self, response):
        all_links = response.xpath('//a/@href').getall()

        section_links = []
        for link in all_links:
            if not link:
                continue
            abs_link = urljoin(response.url, link)

            # Filter only category and tag pages
            if re.search(r'/category/|/tag/', abs_link):
                # Filter out common junk
                if re.search(r'/feed/|/about/|/contact/|/privacy/|/terms/', abs_link):
                    continue
                # Avoid pagination pages
                if re.search(r'/page/\d+/', abs_link):
                    continue
                section_links.append(abs_link)

        # Remove duplicates and limit to N section links per page (optional)
        section_links = list(sorted(set(section_links)))

        # Optional: limit number of sections followed per page to avoid infinite loops
        MAX_SECTIONS_PER_PAGE = 5
        if len(section_links) > MAX_SECTIONS_PER_PAGE:
            section_links = section_links[:MAX_SECTIONS_PER_PAGE]
            self.logger.info(f"Limiting to first {MAX_SECTIONS_PER_PAGE} section links on this page.")

        return section_links

    def parse(self, response):
        self.logger.info(f"Scanning Page: {response.url}")

        # Hub page detection → force pure article link extraction if so
        if self.is_hub_page(response.url):
            self.logger.info("Detected Hub Page → Extracting article links only (skipping section logic).")
            article_links = response.css('a::attr(href)').getall()
            found_articles = set()

            for link in article_links:
                full_link = response.urljoin(link)
                if self.is_article_link(full_link) and full_link not in self.visited_links:
                    self.visited_links.add(full_link)
                    found_articles.add(full_link)

            self.logger.info(f"Hub Page → Found {len(found_articles)} article links.")

            for url in found_articles:
                yield response.follow(url, callback=self.parse_article)

            # No section pagination / recursion for hub pages → STOP here
            return

        # Normal parsing logic (non-hub page)
        is_category_or_tag_page = (
            "/category/" in response.url or "/tag/" in response.url
        )

        titles_and_sections = self.extract_section_titles(response)

        selected_indices = []

        if USE_AI_SECTION_FILTER and not is_category_or_tag_page:
            selected_indices = self.classify_sections_with_ai(titles_and_sections)
            self.logger.info(f"AI selected sections: {selected_indices} out of {len(titles_and_sections)} sections.")
            if not selected_indices:
                selected_indices = list(range(len(titles_and_sections)))
                self.logger.info("AI failed or quota exceeded → fallback: Using ALL sections.")
        else:
            selected_indices = list(range(len(titles_and_sections)))
            if not is_category_or_tag_page:
                self.logger.info(f"Bypassing AI → Using ALL {len(selected_indices)} sections.")
            else:
                self.logger.info("Category/Tag page → Using ALL sections.")

        found_articles = set()
        for idx in selected_indices:
            section = titles_and_sections[idx][1]
            found_articles |= self.extract_article_links(section, response.url)

        self.logger.info(f"Found {len(found_articles)} article links on this page.")

        for url in found_articles:
            yield response.follow(url, callback=self.parse_article)

        # Pagination handling
        current_page = response.meta.get('current_page', 1)
        max_pages = PAGES_CRAWLED_PER_WEBSITE

        if current_page < max_pages:
            next_page_url = self.get_next_page_url(response, current_page=current_page, max_pages=max_pages)
            if next_page_url:
                self.logger.info(f"Following pagination to: {next_page_url} (page {current_page + 1} of {max_pages})")
                yield response.follow(
                    next_page_url,
                    callback=self.parse,
                    meta={'current_page': current_page + 1}
                )
        else:
            self.logger.info(f"✅ Crawled {max_pages} pages for {response.url}. Moving on to next link.")

        # Recursively visit section links
        for section_url in self.get_section_links(response):
            yield response.follow(section_url, callback=self.parse)


    def parse_article(self, response):
        try:
            title = response.xpath('//h1/text()').get()
            if not title:
                title = response.xpath('//article//h1/text()').get()

            summary = response.xpath('//meta[@name="description"]/@content').get()

            domain = urlparse(response.url).netloc
            content_xpath = DOMAIN_CONTENT_XPATHS.get(domain, 
                '//div[contains(@class, "wp-block-post-content")]'
            )

            self.logger.info(f"Using content XPath for {domain}: {content_xpath}")

            content_container = response.xpath(content_xpath)

            # Fallback if no content found
            if not content_container or not content_container.xpath('.//p').get():
                self.logger.warning(f"No content found with {content_xpath} — trying fallback to <article>//p")
                content_container = response.xpath('//article')

            content = ""
            description = ""
            seen = set()
            cleaned_paragraphs = []

            paragraphs = content_container.xpath(
                './/p[not(ancestor::form) and not(ancestor::aside) and not(ancestor::footer)]//text()'
            ).getall()

            for p in paragraphs:
                p_strip = p.strip()
                if p_strip and p_strip not in seen and not any(bp in p_strip for bp in BOILERPLATE_STRINGS):
                    cleaned_paragraphs.append(p_strip)
                    seen.add(p_strip)

            content = " ".join(cleaned_paragraphs)

            # Descripción: first paragraph if available, fallback to meta description
            if cleaned_paragraphs:
                description = cleaned_paragraphs[0]
            elif summary:
                description = summary.strip()
            else:
                description = ""

            # Date extraction
            date_str = response.xpath('//time/@datetime').get()
            formatted_date = ""
            if date_str:
                try:
                    article_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
                    formatted_date = article_date.strftime("%Y-%m-%d")
                except Exception:
                    formatted_date = date_str
            if not formatted_date or formatted_date == date_str:
                alt_date_str = response.xpath('//li[contains(@class, "meta-date")]/text()').get()
                if alt_date_str:
                    try:
                        article_date = datetime.strptime(alt_date_str.strip(), "%B %d, %Y")
                        formatted_date = article_date.strftime("%Y-%m-%d")
                    except Exception:
                        formatted_date = alt_date_str.strip()

            yield {
                "URL": response.url,
                "Título": title.strip() if title else "",
                "Descripción en una frase": description,
                "Resumen": content,
                "Fecha": formatted_date
            }

        except Exception as e:
            self.logger.error(f"Failed parsing article {response.url}: {e}")

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
        crawler.signals.connect(spider.on_spider_error, signal=signals.spider_error)
        return spider

    def on_spider_closed(self, spider):
        self.remove_duplicates_from_file("parsed.txt")

    def on_spider_error(self, failure, response, spider):
        self.logger.error(f"Spider error on {response.url}: {failure.value}")
