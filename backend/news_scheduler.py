from apscheduler.schedulers.background import BackgroundScheduler
from news_ingest_service import validate_feeds, collect_entries, save_to_csv
from rss_config import BASE_URLS, FETCH_INTERVAL_HOURS,FETCH_INTERVAL_MINUTES, CSV_OUTPUT_PATH
import time

def scheduled_job():
    print("⏰ Running scheduled RSS fetch...")
    valid_feeds = validate_feeds(BASE_URLS)

    if valid_feeds:
        entries = collect_entries(valid_feeds)
        save_to_csv(entries, filename=CSV_OUTPUT_PATH)
    else:
        print("⚠️ No valid feeds found during scheduled run.")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_job, 'interval', minutes=FETCH_INTERVAL_MINUTES)
    scheduler.start()
    print(f"🚀 Scheduler started. Fetching every {FETCH_INTERVAL_MINUTES} minute(s).")

    try:
        while True:
            time.sleep(5)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        print("🛑 Scheduler shut down.")

if __name__ == "__main__":
    start_scheduler()
