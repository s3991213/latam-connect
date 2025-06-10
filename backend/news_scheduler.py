import os
import json
import pandas as pd
from datetime import datetime
from news_ingest_service import validate_feeds, collect_entries, save_to_csv
from rss_config import CSV_OUTPUT_PATH

FEED_URLS_FILE = "submitted_feeds.json"
LOG_FILE = "scheduler_log.json"

def log_scheduler_activity(message):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "message": message
    }

    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            logs = json.load(f)

    logs.insert(0, log_entry)
    with open(LOG_FILE, "w") as f:
        json.dump(logs[:50], f, indent=2)

def load_urls_from_file():
    if os.path.exists(FEED_URLS_FILE):
        try:
            with open(FEED_URLS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Error loading feed URLs: {e}")
    return []

def scheduled_job():
    print("⏰ Running scheduled RSS fetch...")

    existing_links = set()
    if os.path.exists(CSV_OUTPUT_PATH):
        try:
            df_existing = pd.read_csv(CSV_OUTPUT_PATH)
            existing_links = set(df_existing['link'].dropna().unique())
            print(f"📄 Loaded {len(existing_links)} previously saved entries.")
        except Exception as e:
            print(f"⚠️ Failed to read existing CSV: {e}")

    feed_urls = load_urls_from_file()
    if not feed_urls:
        msg = "📭 No feed URLs found in submitted_feeds.json."
        print(msg)
        log_scheduler_activity(msg)
        return

    valid_feeds, log = validate_feeds(feed_urls)
    if not valid_feeds:
        msg = "⚠️ No valid feeds found during scheduled run."
        print(msg)
        log_scheduler_activity(msg)
        return

    entries = collect_entries(valid_feeds)
    new_entries = [entry for entry in entries if entry['link'] not in existing_links]
    msg = f"🆕 {len(new_entries)} new entries found."
    print(msg)

    if new_entries:
        save_to_csv(new_entries, filename=CSV_OUTPUT_PATH)
        log_scheduler_activity(f"✅ Fetched {len(new_entries)} new entries from {len(valid_feeds)} feeds.")
    else:
        log_scheduler_activity("📭 No new entries to save.")
