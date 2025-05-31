import feedparser
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
import re
from concurrent.futures import ThreadPoolExecutor

from rss_config import BASE_URLS, RSS_SUFFIX, CSV_OUTPUT_PATH

# -------- Base URLs to Test -------- #

base_urls = BASE_URLS

# -------- HTML Cleaning -------- #

def clean_html(raw_html):
    soup = BeautifulSoup(raw_html, 'html.parser')
    text = soup.get_text()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# -------- Feed Validation -------- #

def validate_feeds(base_urls):
    valid_feeds = []
    log = []

    def check_feed(url):
        rss_url = url.rstrip('/') + "/feed/"
        feed = feedparser.parse(rss_url)
        if not feed.bozo and feed.entries:
            msg = f"✅ Valid feed found: {rss_url} ({len(feed.entries)} entries)"
            return rss_url, msg
        else:
            msg = f"❌ Not a valid RSS feed: {rss_url}"
            return None, msg

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(check_feed, base_urls)

    for feed_url, msg in results:
        log.append(msg)
        if feed_url:
            valid_feeds.append(feed_url)

    return valid_feeds, log


# -------- Feed Collection -------- #

def collect_entries(feed_urls):
    all_entries = []

    def process_feed(url):
        entries = []
        feed = feedparser.parse(url)
        for entry in feed.entries:  #  feed.entries[:10] limit to 10 entries per feed (optional)
            raw_description = entry.content[0].value if "content" in entry else entry.get("summary", "")
            description = clean_html(raw_description)

            entries.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "description": description,
                "source": feed.feed.get("title", ""),
            })
        return entries

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(process_feed, feed_urls)

    for feed_entries in results:
        all_entries.extend(feed_entries)

    return all_entries

def save_to_csv(entries, filename="rss_feed_data.csv"):
    df = pd.DataFrame(entries)
    df["fetched_at"] = datetime.now().isoformat()
    df.to_csv(filename, index=False)
    print(f"\n💾 Saved {len(df)} entries to {filename}")

# -------- Main -------- #

if __name__ == "__main__":
    valid_rss_feeds = validate_feeds(base_urls)

    if not valid_rss_feeds:
        print("🚫 No valid feeds found. Exiting.")
    else:
        entries = collect_entries(valid_rss_feeds)
        save_to_csv(entries, filename=CSV_OUTPUT_PATH)
