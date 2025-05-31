from dotenv import load_dotenv
import os
import time
from pymongo import MongoClient, errors
import requests

# Load environment variables
load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except errors.ServerSelectionTimeoutError as err:
    print("Could not connect to MongoDB:", err)
    exit(1)

db = client['latam_news']

# Access collections
media_reports_collection = db['media_reports']
companies_collection = db['companies']

# Fetch company names from companies collection
company_names = [
    doc["Empresa protagonista (Nombre)"]
    for doc in companies_collection.find({}, {"Empresa protagonista (Nombre)": 1, "_id": 0})
]

def find_company(full_text, companies):
    for company in companies:
        if company.lower() in full_text.lower():
            return company
    return None

def gemini_extract_company(full_text, company_list):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    prompt = (
        "Given the following news article, select the most probable company from this list:\n"
        f"{company_list}\n"
        "If none match, reply ONLY with 'NONE'.\n\n"
        f"Article:\n{full_text}\n"
        "Company:"
    )
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    params = {"key": GEMINI_API_KEY}
    response = requests.post(url, headers=headers, params=params, json=data)
    if response.status_code == 200:
        result = response.json()
        try:
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text.upper() == "NONE":
                return None
            for company in company_list:
                if company.lower() in text.lower():
                    return company
            return None
        except Exception:
            return None
    else:
        print(f"Gemini API error: {response.status_code} {response.text}")
        return None

# Settings for rate limiting
MAX_API_CALLS = 100  # To avoid hitting daily quota
SECONDS_BETWEEN_CALLS = 5  # 15 RPM = 1 call every 4 seconds; use 5 to be safe

api_calls = 0

for doc in media_reports_collection.find({"Empresa": ""}):
    full_text = doc.get("Full Text", "")
    if not full_text:
        continue

    # 1. Try direct match
    company = find_company(full_text, company_names)
    if company:
        media_reports_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {
                "Empresa": company,
                "DetectionMethod": "direct"
            }}
        )
        print(f"Updated Empresa for document {doc['_id']} to {company} (direct match)")
        continue

    # 2. Fallback to Gemini API if under limit
    if api_calls >= MAX_API_CALLS:
        print("Reached maximum Gemini API calls for this run. Stopping.")
        break

    company = gemini_extract_company(full_text, company_names)
    api_calls += 1
    if company:
        media_reports_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {
                "Empresa": company,
                "DetectionMethod": "gemini"
            }}
        )
        print(f"Updated Empresa for document {doc['_id']} to {company} (Gemini)")
    else:
        print(f"No company found for document {doc['_id']} (Gemini)")

    # Sleep to avoid exceeding RPM
    time.sleep(SECONDS_BETWEEN_CALLS)
