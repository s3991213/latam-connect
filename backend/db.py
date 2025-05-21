from dotenv import load_dotenv
import os
from pymongo import MongoClient,errors

# MongoDB connection string
load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except errors.ServerSelectionTimeoutError as err:
    print("Could not connect to MongoDB:", err)

client = MongoClient(MONGO_URI)
db = client['latam_news']

# Access collections
articles_collection = db['articles']
media_reports_collection = db['media_reports']
companies_collection = db['companies']
