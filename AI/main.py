import re
import html
import ftfy
import pandas as pd
import spacy
from transformers import pipeline

import requests

BACKEND_API_URL = "http://127.0.0.1:8000/ai_enriching_inputs"

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

# # === Load data and test one article ===
# df = pd.read_csv("data_LatamConnect.csv", encoding="ISO-8859-1")
# print(f"✅ Loaded {len(df)} articles.")

try:
    response = requests.get(BACKEND_API_URL)
    response.raise_for_status()
    data_from_api = response.json()
    df = pd.DataFrame(data_from_api)

    if '_id' in df.columns:
        df = df.drop(columns=['_id'])

    print(f"✅ Loaded {len(df)} articles from backend API for GPT extraction.")
    print("First 5 rows of data:")
    print(df.head())

except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection Error: Could not connect to the backend API at {BACKEND_API_URL}. Is your FastAPI server running? Error: {e}")
except requests.exceptions.Timeout:
    print(f"❌ Timeout Error: The request to {BACKEND_API_URL} timed out.")
except requests.exceptions.HTTPError as e:
    print(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
except requests.exceptions.RequestException as e:
    print(f"❌ An error occurred during the API request: {e}")
except ValueError as e:
    print(f"❌ Error decoding JSON response from API: {e}. Response content: {response.text}")
except Exception as e:
    print(f"❌ An unexpected error occurred: {e}")

sample = df.iloc[1]
combined_text = clean_text(f"{sample['Title']} {sample['Description']}")
print("\n🧼 Cleaned Article Text:\n", combined_text)

entities = extract_entities(combined_text)

print("\n🧠 spaCy Results:")
print("Organizations:", entities["spacy_orgs"])
print("People:", entities["spacy_people"])
print("Locations:", entities["spacy_locs"])

print("\n🤖 HuggingFace Results:")
print("Organizations:", entities["hf_orgs"])
print("People:", entities["hf_people"])
print("Locations:", entities["hf_locs"])

# STEP 6: Merge + extract best guesses for output

# Get top guesses (safe fallback to "")
company = next(iter(entities["spacy_orgs"].union(entities["hf_orgs"])), "")
ceo = next(iter(entities["spacy_people"].union(entities["hf_people"])), "")
location = next(iter(entities["spacy_locs"].union(entities["hf_locs"])), "")

# Final output structure
structured_output = {
    "company": company,
    "ceo": ceo,
    "category": "Others",            # will add classifier later
    "insights": [],                  # placeholder, for GPT or logic later
    "investment_location": location,
    "sentiment": "Neutral",          # placeholder
    "relevance_score": "3"           # default score
}

print("\n📦 Final Structured Output:")
print(structured_output)


# STEP 7: Batch process all articles

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

# Save to CSV
final_df = pd.DataFrame(all_outputs)
final_df.to_csv("main_output.csv", index=False)
print("✅ All results saved to main_output.csv")