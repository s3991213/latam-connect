from db import articles_collection, media_reports_collection, companies_collection
from bson.objectid import ObjectId

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

def update_company(company_id, data):
    """Update a company by ID."""
    result = companies_collection.update_one({"_id": ObjectId(company_id)}, {"$set": data})
    return result.modified_count

def delete_company(company_id):
    """Delete a company by ID."""
    result = companies_collection.delete_one({"_id": ObjectId(company_id)})
    return result.deleted_count
