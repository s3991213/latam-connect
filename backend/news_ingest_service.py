import feedparser
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
import re

# -------- Base URLs to Test -------- #

base_urls = [
    "https://contxto.com/en/",
    "https://latamlist.com/",
    "https://www.hyperlatam.com/tag/meet-the-startups/",
    "https://nearshoreamericas.com/",
    "https://latam.500.co/latam-companies",
    "https://www.startupblink.com/startups"
]

# -------- HTML Cleaning -------- #

def clean_html(raw_html):
    soup = BeautifulSoup(raw_html, 'html.parser')
    text = soup.get_text()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# -------- Feed Validation -------- #

def validate_feeds(base_urls):
    valid_feeds = []

    print("🔍 Checking for valid RSS feeds...")
    for url in base_urls:
        rss_url = url.rstrip('/') + "/feed/"
        feed = feedparser.parse(rss_url)

        if not feed.bozo and feed.entries:
            print(f"✅ Valid feed found: {rss_url} ({len(feed.entries)} entries)")
            valid_feeds.append(rss_url)
        else:
            print(f"❌ Not a valid RSS feed: {rss_url}")
    
    return valid_feeds

# -------- Feed Collection -------- #

def collect_entries(feed_urls):
    all_entries = []

    for url in feed_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            raw_description = entry.content[0].value if "content" in entry else entry.get("summary", "")
            description = clean_html(raw_description)

            all_entries.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "description": description,
                "source": feed.feed.get("title", ""),
            })

    return all_entries

def save_to_csv(entries, filename="rss_feed_data.csv"):
    df = pd.DataFrame(entries)
    df["fetched_at"] = datetime.utcnow().isoformat()
    df.to_csv(filename, index=False)
    print(f"\n💾 Saved {len(df)} entries to {filename}")

# -------- Main -------- #

if __name__ == "__main__":
    valid_rss_feeds = validate_feeds(base_urls)

    if not valid_rss_feeds:
        print("🚫 No valid feeds found. Exiting.")
    else:
        entries = collect_entries(valid_rss_feeds)
        save_to_csv(entries)
