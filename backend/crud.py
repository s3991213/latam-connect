from db import articles_collection, media_reports_collection, companies_collection, news_company_profiles_collection
from bson.objectid import ObjectId
import re

# ---------- Articles CRUD ----------
def create_article(data):
    """Insert a new article."""
    result = articles_collection.insert_one(data)
    return str(result.inserted_id)

def get_article(article_id):
    """Get a single article by ID."""
    return articles_collection.find_one({"_id": ObjectId(article_id)})

def get_all_articles():
    """Get all articles."""
    return list(articles_collection.find())

def update_article(article_id, data):
    """Update an article by ID."""
    result = articles_collection.update_one({"_id": ObjectId(article_id)}, {"$set": data})
    return result.modified_count

def delete_article(article_id):
    """Delete an article by ID."""
    result = articles_collection.delete_one({"_id": ObjectId(article_id)})
    return result.deleted_count

# ---------- Media Reports CRUD ----------
def create_media_report(data):
    """Insert a new media report."""
    result = media_reports_collection.insert_one(data)
    return str(result.inserted_id)

def get_media_report(report_id):
    """Get a single media report by ID."""
    return media_reports_collection.find_one({"_id": ObjectId(report_id)})

def get_all_media_reports():
    """Get all media reports."""
    return list(media_reports_collection.find())

def update_media_report(report_id, data):
    """Update a media report by ID."""
    result = media_reports_collection.update_one({"_id": ObjectId(report_id)}, {"$set": data})
    return result.modified_count

def delete_media_report(report_id):
    """Delete a media report by ID."""
    result = media_reports_collection.delete_one({"_id": ObjectId(report_id)})
    return result.deleted_count

# ---------- Companies CRUD ----------
def create_company(data):
    """Insert a new company."""
    result = companies_collection.insert_one(data)
    return str(result.inserted_id)

def get_company(company_id):
    """Get a single company by ID."""
    return companies_collection.find_one({"_id": ObjectId(company_id)})

def get_all_companies():
    """Get all companies."""
    return list(companies_collection.find())

def get_companies_by_empresa(empresa: str):
    """Get companies matching the given company name."""
    return list(companies_collection.find({"Empresa protagonista (Nombre)": empresa}))


def update_company(company_id, data):
    """Update a company by ID."""
    result = companies_collection.update_one({"_id": ObjectId(company_id)}, {"$set": data})
    return result.modified_count

def delete_company(company_id):
    """Delete a company by ID."""
    result = companies_collection.delete_one({"_id": ObjectId(company_id)})
    return result.deleted_count


def search_all_collections(keyword, date_from=None, date_to=None):
    """Search articles, companies, and media_reports for the keyword and optional date range."""
    results = []
    regex = re.compile(re.escape(keyword), re.IGNORECASE)

    # --- ARTICLES ---
    # article_fields = [
    #     "Título", "Descripción en una frase", "Resumen", "Nombres de personas",
    #     "Puesto", "Empresa", "Instituciones nombradas", "Categoría", "URL"
    # ]

    article_fields = ["Título", "Resumen", "Descripción en una frase"]


    article_query = {"$or": [{field: regex} for field in article_fields]}
    if date_from and date_to:
        article_query["Fecha Publicación"] = {"$gte": date_from, "$lte": date_to}
    articles = list(articles_collection.find(article_query))
    for a in articles:
        a["_id"] = str(a["_id"])
        a["collection"] = "articles"
        results.append(a)

    # --- COMPANIES ---
    # company_fields = [
    #     "Empresa protagonista (Nombre)", "Titulo", "Descripción breve", "Resumen",
    #     "Founder 1", "Founder 2", "Founder 3", "Other Founders", "Categoría/Sector",
    #     "Player 1", "Player 2", "Player 3", "Other Player", "Ubicación"
    # ]

    company_fields = ["Empresa protagonista (Nombre)", "Titulo", "Descripción breve"]


    company_query = {"$or": [{field: regex} for field in company_fields]}
    if date_from and date_to:
        company_query["Fecha de publicación"] = {"$gte": date_from, "$lte": date_to}
    companies = list(companies_collection.find(company_query))
    for c in companies:
        c["_id"] = str(c["_id"])
        c["collection"] = "companies"
        results.append(c)

    # --- MEDIA REPORTS ---
    # media_fields = [
    #     "Source", "Pais Fuente", "Tema Principal", "Sector", "Title", "Full Text", "URL"
    # ]

    media_fields = ["Title", "Full Text", "Tema Principal"]

    media_query = {"$or": [{field: regex} for field in media_fields]}
    if date_from and date_to:
        media_query["Fecha Publicación"] = {"$gte": date_from, "$lte": date_to}
    media_reports = list(media_reports_collection.find(media_query))
    for m in media_reports:
        m["_id"] = str(m["_id"])
        m["collection"] = "media_reports"
        results.append(m)

    return results



# ===========================================CLEANED TABLES STUFF ==================================================#

def get_all_news_company_profiles():
    """Return all documents from news_company_profiles collection."""
    return list(news_company_profiles_collection.find())

def get_news_company_profiles(category=None, country=None):
    """Return filtered documents from news_company_profiles collection."""
    query = {}
    if category:
        # If category is a list, use $in; if string, convert to list
        query["category"] = {"$in": category if isinstance(category, list) else [category]}
    if country:
        # If country is a list, use $in; if string, convert to list
        query["country"] = {"$in": country if isinstance(country, list) else [country]}
    return list(news_company_profiles_collection.find(query))
