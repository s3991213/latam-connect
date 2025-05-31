from flask import Flask, request, render_template, jsonify
from news_ingest_service import validate_feeds, collect_entries, save_to_csv
from rss_config import CSV_OUTPUT_PATH
from news_scheduler import scheduled_job
from apscheduler.schedulers.background import BackgroundScheduler
import os
import json
import pandas as pd

app = Flask(__name__)
FEED_FILE = "submitted_feeds.json"
LOG_FILE = "scheduler_log.json"

def append_unique_urls(new_urls):
    if os.path.exists(FEED_FILE):
        with open(FEED_FILE, "r") as f:
            existing_urls = set(json.load(f))
    else:
        existing_urls = set()

    combined = existing_urls.union(set(new_urls))

    with open(FEED_FILE, "w") as f:
        json.dump(sorted(list(combined)), f, indent=2)

    return list(combined)

@app.route('/')
def index():
    log_data = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            log_data = json.load(f)
    return render_template("index.html", logs=log_data)

@app.route('/check_feeds', methods=['GET'])
def check_feeds():
    url_param = request.args.get('urls')
    if not url_param:
        return render_template('results.html', valid_feeds=[], log=["⚠️ No URLs provided."], entries=[], updates={})

    base_urls = [url.strip() for url in url_param.replace('\n', ',').split(',') if url.strip()]
    append_unique_urls(base_urls)
    valid_feeds, log = validate_feeds(base_urls)

    existing_links = set()
    if os.path.exists(CSV_OUTPUT_PATH):
        df_existing = pd.read_csv(CSV_OUTPUT_PATH)
        existing_links = set(df_existing['link'].dropna().unique())

    all_entries = collect_entries(valid_feeds)

    new_entries = []
    updates_per_feed = {}
    for entry in all_entries:
        if entry['link'] not in existing_links:
            new_entries.append(entry)
            src = entry['source']
            updates_per_feed[src] = updates_per_feed.get(src, 0) + 1

    if new_entries:
        save_to_csv(new_entries, filename=CSV_OUTPUT_PATH)
        log.append(f"💾 {len(new_entries)} entries collected and saved to CSV.")
    else:
        log.append("📭 No new entries to save.")

    return render_template(
        'results.html',
        valid_feeds=valid_feeds,
        log=log,
        entries=new_entries,
        updates=updates_per_feed
    )


scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_job, 'interval', minutes=1/2)
scheduler.start()
print("🚀 Background scheduler started with Flask app")

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
