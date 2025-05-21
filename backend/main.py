from fastapi import FastAPI, HTTPException
from crud import (
    create_article, get_article, get_all_articles, update_article, delete_article,
    create_media_report, get_media_report, get_all_media_reports, update_media_report, delete_media_report,
    create_company, get_company, get_all_companies, update_company, delete_company
)

app = FastAPI()

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
def get_all_media_reports_endpoint():
    reports = get_all_media_reports()
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports

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
def get_all_companies_endpoint():
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
