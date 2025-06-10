from dotenv import load_dotenv
import os
from pymongo import MongoClient, errors

# Load environment variables
load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except errors.ServerSelectionTimeoutError as err:
    print("Could not connect to MongoDB:", err)
    exit(1)

db = client['latam_news']
media_reports_collection = db['media_reports']
companies_collection = db['companies']
articles_collection = db['articles']

# Get unique company names from each collection
media_empresas = set(media_reports_collection.distinct("Empresa"))
company_names = set(companies_collection.distinct("Empresa protagonista (Nombre)"))
articles_empresas = set(articles_collection.distinct("Empresa"))

# Find companies present in all three collections
common_companies = media_empresas & company_names & articles_empresas

print("Companies present in all three collections:")
for company in sorted(common_companies):
    print(company)
