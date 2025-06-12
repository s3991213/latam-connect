from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from typing import Optional, List
from fastapi.responses import JSONResponse
from db import articles_collection, companies_collection, media_reports_collection
import subprocess
import os
from fastapi import Body

from crud import (
    create_article, get_article, get_all_articles, get_companies_by_empresa, update_article, delete_article,
    create_media_report, get_media_report, get_all_media_reports, update_media_report, delete_media_report,
    create_company, get_company, get_all_companies, update_company, delete_company, search_all_collections,get_all_spider_urls, create_spider_url, delete_spider_url
)

app = FastAPI()

# Allow requests from frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] to allow all (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- Articles Endpoints -----------
@app.post("/articles/")
def create_article_endpoint(data: dict):
    article_id = create_article(data)
    return {"inserted_id": article_id}

@app.get("/articles/{article_id}")
def get_article_endpoint(article_id: str):
    article = get_article(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article["_id"] = str(article["_id"])
    return article

@app.get("/articles/")
def get_all_articles_endpoint():
    articles = get_all_articles()
    for a in articles:
        a["_id"] = str(a["_id"])
    return articles

@app.put("/articles/{article_id}")
def update_article_endpoint(article_id: str, data: dict):
    updated = update_article(article_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Article not found or not updated")
    return {"updated": updated}

@app.delete("/articles/{article_id}")
def delete_article_endpoint(article_id: str):
    deleted = delete_article(article_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Article not found or not deleted")
    return {"deleted": deleted}

# ----------- Media Reports Endpoints -----------
@app.post("/media_reports/")
def create_media_report_endpoint(data: dict):
    report_id = create_media_report(data)
    return {"inserted_id": report_id}

@app.get("/media_reports/{report_id}")
def get_media_report_endpoint(report_id: str):
    report = get_media_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Media report not found")
    report["_id"] = str(report["_id"])
    return report

@app.get("/media_reports/")
def get_media_reports(empresa: Optional[str] = Query(None)):
    if empresa:
        results = list(media_reports_collection.find({"Empresa": empresa}))
    else:
        results = list(media_reports_collection.find())
    for r in results:
        r["_id"] = str(r["_id"])
    return results


@app.put("/media_reports/{report_id}")
def update_media_report_endpoint(report_id: str, data: dict):
    updated = update_media_report(report_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Media report not found or not updated")
    return {"updated": updated}

@app.delete("/media_reports/{report_id}")
def delete_media_report_endpoint(report_id: str):
    deleted = delete_media_report(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Media report not found or not deleted")
    return {"deleted": deleted}

# ----------- Companies Endpoints -----------
@app.post("/companies/")
def create_company_endpoint(data: dict):
    company_id = create_company(data)
    return {"inserted_id": company_id}

@app.get("/companies/{company_id}")
def get_company_endpoint(company_id: str):
    company = get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company["_id"] = str(company["_id"])
    return company

# @app.get("/companies/")
# def get_all_companies_endpoint():
#     companies = get_all_companies()
#     for c in companies:
#         c["_id"] = str(c["_id"])
#     return companies

@app.get("/companies/")
def get_companies_endpoint(empresa: Optional[str] = Query(None)):
    if empresa:
        companies = get_companies_by_empresa(empresa)
    else:
        companies = get_all_companies()
    for c in companies:
        c["_id"] = str(c["_id"])
    print(f"Queried companies for empresa='{empresa}': {companies}")
    return companies

@app.put("/companies/{company_id}")
def update_company_endpoint(company_id: str, data: dict):
    updated = update_company(company_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Company not found or not updated")
    return {"updated": updated}

@app.delete("/companies/{company_id}")
def delete_company_endpoint(company_id: str):
    deleted = delete_company(company_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found or not deleted")
    return {"deleted": deleted}


@app.get("/search_websites/")
def search_websites_endpoint(
    keyword: str = Query(..., description="Keyword to search for"),
    date_from: str = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(None, description="End date (YYYY-MM-DD)")
):
    results = search_all_collections(keyword, date_from, date_to)
    return JSONResponse(content=results)

@app.get("/website_links/")
def get_website_links():
    # Collect unique URLs from all collections
    article_links = set(
        a.get("URL") for a in articles_collection.find({"URL": {"$exists": True, "$ne": ""}}, {"URL": 1})
    )
    company_links = set(
        c.get("URL de la fuente original") for c in companies_collection.find({"URL de la fuente original": {"$exists": True, "$ne": ""}}, {"URL de la fuente original": 1})
    )
    media_links = set(
        m.get("URL") for m in media_reports_collection.find({"URL": {"$exists": True, "$ne": ""}}, {"URL": 1})
    )
    all_links = list(article_links | company_links | media_links)
    all_links = [link for link in all_links if link]  # Remove None/empty
    return all_links



# --- News Company Profiles Endpoints ---

@app.get("/news_company_profiles/")
def get_news_company_profiles(
    category: Optional[List[str]] = Query(None),
    country: Optional[List[str]] = Query(None)
):
    """
    Get all news company profiles, or filter by one or more categories and/or countries.
    """
    from crud import get_news_company_profiles
    results = get_news_company_profiles(category=category, country=country)
    for r in results:
        r["_id"] = str(r["_id"])
    return results

@app.get("/news_company_profiles/all")
def get_all_news_company_profiles():
    """
    Get all news company profiles (no filters).
    """
    from crud import get_all_news_company_profiles
    results = get_all_news_company_profiles()
    for r in results:
        r["_id"] = str(r["_id"])
    return results


@app.post("/run_spider/")
def run_spider(
    keywords: Optional[List[str]] = Query(None),
    urls: Optional[List[str]] = Query(None),
    frequency: Optional[str] = Query("immediate")
):
    """
    Trigger the Scrapy spider with optional keywords, URLs, and frequency.
    Outputs results to output.csv, then runs enrich_articles.py.
    """

    # ====== Dynamic path detection ======

    # Find backend dir
    BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
    # Go up to project root (latam-connect/)
    PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
    # Scrapy project is at latam-connect/lcscraper
    SCRAPY_PROJECT_DIR = os.path.join(PROJECT_ROOT, "lcscraper")
    # Enrichment script is at lcscraper/enrich_articles.py
    ENRICH_SCRIPT_PATH = os.path.join(SCRAPY_PROJECT_DIR, "enrich_articles.py")

    # Full path to scrapy binary
    SCRAPY_PATH = "/home/dog/miniconda3/bin/scrapy"  # Run `which scrapy` to confirm this path

    # ====== Debug print ======
    print(f"SCRAPY_PROJECT_DIR={SCRAPY_PROJECT_DIR}")
    print(f"SCRAPY_PATH={SCRAPY_PATH}")
    print(f"ENRICH_SCRIPT_PATH={ENRICH_SCRIPT_PATH}")

    # ====== Build Scrapy command ======
    command = [SCRAPY_PATH, "crawl", "news_spider"]

    if keywords:
        command += ["-a", f"keywords={','.join(keywords)}"]
    if urls:
        command += ["-a", f"urls={','.join(urls)}"]

    # Add CSV output
    command += ["-o", "output.csv"]

    print(f"Running command: {' '.join(command)} in {SCRAPY_PROJECT_DIR}")
    print(f"Frequency: {frequency}")

    # ====== Run Scrapy subprocess ======
    try:
        print("Calling subprocess.run() for Scrapy...")
        result = subprocess.run(
            command,
            cwd=SCRAPY_PROJECT_DIR,
            capture_output=True,
            text=True,
            check=True
        )
        print("Subprocess finished.")
        print("stdout:", result.stdout)
        print("stderr:", result.stderr)
        status = "Spider run completed successfully"

        # ====== Run enrichment script ======
        print("Running enrich_articles.py...")
        enrich_result = subprocess.run(
            ["python3", ENRICH_SCRIPT_PATH],
            cwd=SCRAPY_PROJECT_DIR,
            capture_output=True,
            text=True,
            check=True
        )
        print("Enrichment finished.")
        print("stdout:", enrich_result.stdout)
        print("stderr:", enrich_result.stderr)

    except subprocess.CalledProcessError as e:
        print("Subprocess finished with error.")
        print("stdout:", e.stdout)
        print("stderr:", e.stderr)
        result = e
        status = "Spider run failed"
        enrich_result = None  # no enrichment if spider failed

    # ====== Return result ======
    return {
        "status": status,
        "command": " ".join(command),
        "stdout": result.stdout if hasattr(result, 'stdout') else "",
        "stderr": result.stderr if hasattr(result, 'stderr') else "",
        "frequency": frequency,
        "enrich_stdout": enrich_result.stdout if enrich_result else "",
        "enrich_stderr": enrich_result.stderr if enrich_result else ""
    }


# GET all spider URLs
@app.get("/spider_urls")
def get_spider_urls_endpoint():
    return get_all_spider_urls()

# POST add new spider URL
@app.post("/spider_urls")
def create_spider_url_endpoint(url: str):
    inserted_id = create_spider_url(url)
    return {"inserted_id": inserted_id}

# DELETE spider URL
@app.delete("/spider_urls/{url_id}")
def delete_spider_url_endpoint(url_id: str):
    deleted = delete_spider_url(url_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="URL not found or not deleted")
    return {"deleted": url_id}
