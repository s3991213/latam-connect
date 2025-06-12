# LATAM News Insights Platform

An end-to-end news aggregation, enrichment, and insights platform focused on LATAM startups, VC, AI, and innovation news.

## Architecture

Sources (RSS feeds, news sites) -> Scrapy Spider -> Enriched with Gemini AI + NLP -> MongoDB Atlas -> FastAPI API -> React Dashboard

## Project Structure

latam-connect/
├── backend/                      -> FastAPI app + MongoDB
│   ├── main.py                   -> API endpoints
│   ├── db.py                     -> MongoDB connection
│   ├── crud.py                   -> Business logic layer
│   ├── requirements.txt          -> Backend Python dependencies
├── lcscraper/                    -> Scrapy spider + enrichment pipeline
│   ├── spiders/news_spider.py    -> News spider
│   ├── enrich_articles.py        -> Enrichment pipeline (Gemini, NLP, Mongo upload)
│   ├── requirements.txt          -> Lcscraper Python dependencies
├── frontend/                     -> React app (Vite, Tailwind)
│   ├── src/pages/Settings.tsx    -> Spider runner + URL manager page
│   ├── package.json              -> React dependencies
└── README.md                     -> Project documentation

## Features

* Multi-source scraping: Gathers news from various startup, VC, fintech, and AI sources.
* Named Entity Recognition (NER): Extracts company names.
* Gemini AI Integration: Enables CEO lookup.
* Sentiment Analysis: Determines the sentiment of news articles.
* Category & Country Classification: Categorizes news and identifies countries.
* News Company Profiles Collection: Stores deduplicated company profiles based on `site_url`.
* React Settings Page: Provides a UI to run the spider and manage URLs.
* CSV Upload API: Safely upserts enriched articles with no duplicates.
* Modular Pipeline: Spider, Enrichment, and API components are separate but connected.

## Setup

### Prerequisites

* Python 3.11+ (tested with Python 3.13)
* Conda or venv recommended
* Node.js 18+
* MongoDB Atlas cluster (URI in .env)
* Gemini API key

### Backend Setup

cd backend
conda create -n latam_news python=3.13
conda activate latam_news
pip install -r requirements.txt

Create a .env file in the `backend/` directory:

MONGO_URI=mongodb+srv://<username>:<password>@....mongodb.net/latam_news
GEMINI_API_KEY=your-gemini-api-key

Run the API server:

uvicorn main:app --reload

### Lcscraper Setup (Scrapy spider + Enrichment pipeline)

cd lcscraper
conda create -n lcscraper_env python=3.13
conda activate lcscraper_env
pip install -r requirements.txt

Run these once after installing:

python -m spacy download en_core_web_sm
python -m nltk.downloader punkt

Run spider manually (optional):

scrapy crawl news_spider -a urls=https://latamlist.com/category/startups/,https://feedough.com/startups/ -o output.csv

Run the enrichment pipeline (uploads to MongoDB directly):

python enrich_articles.py

### Frontend Setup (React)

cd frontend
npm install
npm run dev

The frontend will be accessible at: http://localhost:5173

## APIs

| Endpoint | Method | Description |
| :----------------------------- | :----- | :--------------------------------------------------------- |
| /run_spider | POST | Trigger spider with selected URLs & keywords |
| /spider_urls | GET | List current Spider URLs (from DB) |
| /spider_urls | POST | Add new Spider URL |
| /spider_urls/{id} | DELETE| Delete Spider URL |
| /articles/ | GET | List all articles |
| /companies/ | GET | List all companies |
| /media_reports/ | GET | List all media reports |
| /news_company_profiles/ | GET | List enriched News Company Profiles |
| /upload_enriched_articles | POST | Upload CSV of enriched articles (upsert by site_url) |

## `requirements.txt`

### `backend/requirements.txt`

fastapi
uvicorn
pymongo
python-dotenv
pandas

### `lcscraper/requirements.txt`

scrapy
google-generativeai
pandas
spacy
textblob
nltk
python-dotenv
w3lib
requests

## How to Run Typical Workflow

1.  Add Spider URLs in the Settings page.
2.  Click "Run Now" -> The spider runs -> `Scrapy output.csv` is generated -> The enrichment pipeline runs automatically -> MongoDB is updated.
3.  Enriched articles are uploaded to the `news_company_profiles` collection, deduplicated by `site_url`.
4.  The Settings page or API can query profiles, and the frontend can display enriched insights.

## Notes

* Deduplication Key: `site_url` ensures no duplicate articles during upsert.
* React Settings page: Manages Spider URLs and persists them in the `spider_urls` collection in MongoDB.
* Scrapy + Enrich: Fully modular and can be run via API or manually.
* Enrichment Pipeline: Utilizes Gemini AI for CEO lookup and NLP for categories, country, and sentiment analysis.

---