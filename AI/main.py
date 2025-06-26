import re
import html
import ftfy
import pandas as pd
import spacy
from transformers import pipeline
import requests

BACKEND_API_URL = "http://127.0.0.1:8000/ai_enriching_inputs"
BULK_API_URL = "http://127.0.0.1:8000/enriched_articles/bulk/"

print("✅ Libraries imported successfully.")

# Load models
nlp = spacy.load("en_core_web_md")
transformer_ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)
print("✅ Models loaded (spaCy + transformer NER).")

# === Clean text ===
def clean_text(text):
    text = ftfy.fix_text(str(text))         # Fix encoding issues
    text = html.unescape(text)
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s$]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# === NER function for a given article ===
def extract_entities(text):
    doc = nlp(text)
    spacy_orgs = {ent.text for ent in doc.ents if ent.label_ == "ORG"}
    spacy_people = {ent.text for ent in doc.ents if ent.label_ == "PERSON"}
    spacy_gpes = {ent.text for ent in doc.ents if ent.label_ == "GPE"}

    transformer_entities = transformer_ner(text)
    transformer_orgs = {ent["word"] for ent in transformer_entities if ent["entity_group"] == "ORG"}
    transformer_people = {ent["word"] for ent in transformer_entities if ent["entity_group"] == "PER"}
    transformer_locs = {ent["word"] for ent in transformer_entities if ent["entity_group"] == "LOC"}

    return {
        "spacy_orgs": spacy_orgs,
        "spacy_people": spacy_people,
        "spacy_locs": spacy_gpes,
        "hf_orgs": transformer_orgs,
        "hf_people": transformer_people,
        "hf_locs": transformer_locs
    }

# === Load data from backend API ===
try:
    response = requests.get(BACKEND_API_URL)
    response.raise_for_status()
    data_from_api = response.json()
    df = pd.DataFrame(data_from_api)

    if '_id' in df.columns:
        df = df.drop(columns=['_id'])

    print(f"✅ Loaded {len(df)} articles from backend API for NER extraction.")
    print("First 5 rows of data:")
    print(df.head())

except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection Error: Could not connect to the backend API at {BACKEND_API_URL}. Is your FastAPI server running? Error: {e}")
    df = pd.DataFrame()  # Empty DataFrame to avoid further errors
except requests.exceptions.Timeout:
    print(f"❌ Timeout Error: The request to {BACKEND_API_URL} timed out.")
    df = pd.DataFrame()
except requests.exceptions.HTTPError as e:
    print(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
    df = pd.DataFrame()
except requests.exceptions.RequestException as e:
    print(f"❌ An error occurred during the API request: {e}")
    df = pd.DataFrame()
except ValueError as e:
    print(f"❌ Error decoding JSON response from API: {e}. Response content: {response.text}")
    df = pd.DataFrame()
except Exception as e:
    print(f"❌ An unexpected error occurred: {e}")
    df = pd.DataFrame()

if df.empty:
    print("⚠️ No data to process. Exiting.")
    exit()

# === Batch process all articles ===
all_outputs = []

for idx, row in df.iterrows():
    print(f"🔄 Processing article {idx + 1}/{len(df)}")

    # Combine and clean text
    combined = clean_text(f"{row['Title']} {row['Description']}")

    # NER
    ents = extract_entities(combined)

    # Top guesses
    company = next(iter(ents["spacy_orgs"].union(ents["hf_orgs"])), "")
    ceo = next(iter(ents["spacy_people"].union(ents["hf_people"])), "")
    location = next(iter(ents["spacy_locs"].union(ents["hf_locs"])), "")

    # Final structure
    output = {
        "title": row["Title"],
        "description": row["Description"],
        "company": company,
        "ceo": ceo,
        "category": "Others",
        "insights": [],
        "investment_location": location,
        "sentiment": "Neutral",
        "relevance_score": "3"
    }

    all_outputs.append(output)

# === Send all outputs to FastAPI bulk endpoint ===
if all_outputs:
    try:
        response = requests.post(BULK_API_URL, json=all_outputs)
        response.raise_for_status()
        print(f"\n✅ Bulk upload successful! Server response: {response.json()}")
    except Exception as e:
        print(f"\n❌ Bulk upload failed: {e}")
else:
    print("\n⚠️ No outputs to send.")
