from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from typing import Optional, List
from fastapi.responses import JSONResponse
from db import (
    articles_collection, 
    companies_collection, 
    media_reports_collection,
    ai_enriched_articles_collection,
    ai_enriching_input_collection
)
import subprocess
import os
from fastapi import Body

from crud import (
    # Original CRUD functions
    create_article, get_article, get_all_articles, get_companies_by_empresa, 
    update_article, delete_article, create_media_report, get_media_report,
    get_all_media_reports, update_media_report, delete_media_report,
    create_company, get_company, get_all_companies, update_company, 
    delete_company, search_all_collections, get_all_spider_urls, 
    create_spider_url, delete_spider_url,
    
    # New enriched article functions
    create_enriched_article, get_enriched_article, get_all_enriched_articles,
    update_enriched_article, delete_enriched_article, search_enriched_articles,

    create_ai_enriching_input,
    get_ai_enriching_input,
    get_all_ai_enriching_inputs,
    update_ai_enriching_input,
    delete_ai_enriching_input,
    search_ai_enriching_inputs
)

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ORIGINAL ENDPOINTS (UNCHANGED) ====================

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

@app.get("/companies/")
def get_companies_endpoint(empresa: Optional[str] = Query(None)):
    if empresa:
        companies = get_companies_by_empresa(empresa)
    else:
        companies = get_all_companies()
    for c in companies:
        c["_id"] = str(c["_id"])
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

# ==================== NEW ENRICHED ARTICLE ENDPOINTS ====================

@app.post("/enriched_articles/")
def create_enriched_article_endpoint(data: dict):
    """Create new AI-enriched article"""
    article_id = create_enriched_article(data)
    return {"inserted_id": article_id}

@app.get("/enriched_articles/{article_id}")
def get_enriched_article_endpoint(article_id: str):
    """Get single enriched article by ID"""
    article = get_enriched_article(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Enriched article not found")
    article["_id"] = str(article["_id"])
    return article

@app.get("/enriched_articles/")
def get_all_enriched_articles_endpoint(
    company: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    """Get filtered enriched articles"""
    articles = list(get_all_enriched_articles(
        company=company,
        sentiment=sentiment,
        category=category
    )[:limit])
    for a in articles:
        a["_id"] = str(a["_id"])
    return articles

@app.put("/enriched_articles/{article_id}")
def update_enriched_article_endpoint(article_id: str, data: dict):
    """Update enriched article"""
    updated = update_enriched_article(article_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Enriched article not found or not updated")
    return {"updated": updated}

@app.delete("/enriched_articles/{article_id}")
def delete_enriched_article_endpoint(article_id: str):
    """Delete enriched article"""
    deleted = delete_enriched_article(article_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Enriched article not found or not deleted")
    return {"deleted": deleted}

@app.post("/enriched_articles/bulk/")
def bulk_create_enriched_articles_endpoint(data: List[dict] = Body(...)):
    inserted = 0
    skipped = 0
    for article in data:
        # Check for duplicates based on title and description
        existing = ai_enriched_articles_collection.find_one({
            "title": article.get("title"),
            "description": article.get("description")
        })
        if existing:
            skipped += 1
            continue
        ai_enriched_articles_collection.insert_one(article)
        inserted += 1
    return {
        "inserted": inserted,
        "skipped_duplicates": skipped,
        "total_received": len(data)
    }

# ==================== UPDATED GLOBAL ENDPOINTS ====================

@app.get("/search_websites/")
def search_websites_endpoint(
    keyword: str = Query(..., description="Keyword to search for"),
    date_from: str = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """Search across all collections including enriched articles"""
    standard_results = search_all_collections(keyword, date_from, date_to)
    enriched_results = search_enriched_articles(keyword, date_from, date_to)
    return JSONResponse(content=standard_results + enriched_results)

@app.get("/website_links/")
def get_website_links():
    """Get unique URLs from all collections"""
    article_links = set(a.get("URL") for a in articles_collection.find({"URL": {"$exists": True, "$ne": ""}}, {"URL": 1}))
    company_links = set(c.get("URL de la fuente original") for c in companies_collection.find({"URL de la fuente original": {"$exists": True, "$ne": ""}}, {"URL de la fuente original": 1}))
    media_links = set(m.get("URL") for m in media_reports_collection.find({"URL": {"$exists": True, "$ne": ""}}, {"URL": 1}))
    enriched_links = set(e.get("site_url") for e in ai_enriched_articles_collection.find({"site_url": {"$exists": True, "$ne": ""}}, {"site_url": 1}))
    
    return [link for link in (article_links | company_links | media_links | enriched_links) if link]

# ==================== EXISTING ENDPOINTS (UNCHANGED) ====================

@app.get("/news_company_profiles/")
def get_news_company_profiles(
    category: Optional[List[str]] = Query(None),
    country: Optional[List[str]] = Query(None)
):
    from crud import get_news_company_profiles
    results = get_news_company_profiles(category=category, country=country)
    for r in results:
        r["_id"] = str(r["_id"])
    return results

@app.get("/news_company_profiles/all")
def get_all_news_company_profiles():
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
    BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
    SCRAPY_PROJECT_DIR = os.path.join(PROJECT_ROOT, "lcscraper")
    ENRICH_SCRIPT_PATH = os.path.join(SCRAPY_PROJECT_DIR, "enrich_articles.py")
    SCRAPY_PATH = "/home/dog/miniconda3/bin/scrapy"

    command = [SCRAPY_PATH, "crawl", "news_spider"]
    if keywords: command += ["-a", f"keywords={','.join(keywords)}"]
    if urls: command += ["-a", f"urls={','.join(urls)}"]
    command += ["-o", "output.csv"]

    try:
        result = subprocess.run(
            command,
            cwd=SCRAPY_PROJECT_DIR,
            capture_output=True,
            text=True,
            check=True
        )
        enrich_result = subprocess.run(
            ["python3", ENRICH_SCRIPT_PATH],
            cwd=SCRAPY_PROJECT_DIR,
            capture_output=True,
            text=True,
            check=True
        )
        status = "success"
    except subprocess.CalledProcessError as e:
        result = e
        enrich_result = None
        status = "failed"

    return {
        "status": status,
        "command": " ".join(command),
        "stdout": result.stdout if hasattr(result, 'stdout') else "",
        "stderr": result.stderr if hasattr(result, 'stderr') else "",
        "frequency": frequency,
        "enrich_stdout": enrich_result.stdout if enrich_result else "",
        "enrich_stderr": enrich_result.stderr if enrich_result else "",
        "output_collection": "ai_enriched_articles"
    }

@app.get("/spider_urls")
def get_spider_urls_endpoint():
    return get_all_spider_urls()

@app.post("/spider_urls")
def create_spider_url_endpoint(url: str):
    inserted_id = create_spider_url(url)
    return {"inserted_id": inserted_id}

@app.delete("/spider_urls/{url_id}")
def delete_spider_url_endpoint(url_id: str):
    deleted = delete_spider_url(url_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="URL not found or not deleted")
    return {"deleted": url_id}


# ---------- AI Enriching Input Endpoints ----------
@app.post("/ai_enriching_inputs", status_code=201)
async def create_ai_enriching_input_endpoint(data: dict = Body(...)):
    try:
        inserted_id = create_ai_enriching_input(data)
        return {"message": "Record created successfully", "id": str(inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create record: {e}")

@app.get("/ai_enriching_inputs")
async def get_all_ai_enriching_inputs_endpoint(keyword: Optional[str] = None):
    if keyword:
        records = search_ai_enriching_inputs(keyword)
    else:
        records = get_all_ai_enriching_inputs()
    # Inline conversion for each record
    for rec in records:
        rec['id'] = str(rec['_id'])
        del rec['_id']
    return records

@app.get("/ai_enriching_inputs/{record_id}")
async def get_ai_enriching_input_endpoint(record_id: str):
    record = get_ai_enriching_input(record_id)
    if record:
        record['id'] = str(record['_id'])
        del record['_id']
        return record
    raise HTTPException(status_code=404, detail="Record not found")

@app.put("/ai_enriching_inputs/{record_id}")
async def update_ai_enriching_input_endpoint(record_id: str, data: dict = Body(...)):
    modified_count = update_ai_enriching_input(record_id, data)
    if modified_count:
        return {"message": "Record updated successfully", "modified_count": modified_count}
    raise HTTPException(status_code=404, detail="Record not found or no changes made")

@app.delete("/ai_enriching_inputs/{record_id}")
async def delete_ai_enriching_input_endpoint(record_id: str):
    deleted_count = delete_ai_enriching_input(record_id)
    if deleted_count:
        return {"message": "Record deleted successfully", "deleted_count": deleted_count}
    raise HTTPException(status_code=404, detail="Record not found")