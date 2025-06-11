import os
import pandas as pd
import spacy
from textblob import TextBlob
import re
import requests
import nltk
from nltk.tokenize import word_tokenize
from dotenv import load_dotenv
import google.generativeai as genai
import time

nltk.download('punkt')

# Load .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY is None:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Load Spacy English model
nlp = spacy.load("en_core_web_sm")

# Category keywords
category_keywords = {
    "FinTech": ["fintech", "payments", "bank", "financial", "money", "crypto", "blockchain"],
    "AI": ["artificial", "intelligence", "ai", "machine", "learning", "deep", "chatbot", "generative", "llm"],
    "Education": ["education", "edtech", "learning", "school", "university", "student", "training"],
    "Healthcare": ["health", "healthcare", "medical", "doctor", "hospital", "biotech"],
    "Government": ["government", "public", "policy", "regulation", "minister", "govtech"],
    "Finance": ["finance", "investment", "vc", "venture", "capital", "stock", "fund", "ipo"]
}

countries = ["Argentina", "Chile", "Spain", "Mexico", "Colombia"]

# Load CSV
df = pd.read_csv("output.csv")

# Helper: clean resumen
def clean_resumen(text):
    if not isinstance(text, str):
        return ""
    paragraphs = text.split('\n')
    seen = set()
    cleaned = []
    for p in paragraphs:
        p_strip = p.strip()
        if p_strip and p_strip not in seen:
            cleaned.append(p_strip)
            seen.add(p_strip)
    return ' '.join(cleaned)

# Step 1: Collect unique company names
print("Extracting company names...")
company_names_set = set()

for summary in df["Resumen"]:
    if not isinstance(summary, str) or summary.strip() == "":
        continue
    summary = clean_resumen(summary)
    doc = nlp(summary)
    found = False
    for ent in doc.ents:
        if ent.label_ in {"ORG", "COMPANY"}:
            company_names_set.add(ent.text.strip())
            found = True
            break
    if not found:
        # fallback heuristic
        matches = re.findall(r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\b', summary)
        if matches:
            company_names_set.add(matches[0])

company_names_list = sorted(list(company_names_set))
print(f"Found {len(company_names_list)} unique company names.")

# Step 2: Batch Gemini lookup
def batch(iterable, n=10):
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]

company_ceo_dict = {}

print("Starting Gemini CEO lookup in batches...")
for idx, company_batch in enumerate(batch(company_names_list, n=10)):
    prompt = """You are an expert researcher. For each of the following companies, give the CURRENT CEO name ONLY.
If not known, reply "Unknown".

Format your response exactly like this:
Company Name: CEO Name

Companies:
""" + "\n".join(f"{i+1}. {name}" for i, name in enumerate(company_batch))

    try:
        response = model.generate_content(prompt)
        text = response.text

        # Parse response
        matches = re.findall(r"^(.*?)\s*:\s*(.*?)$", text, re.MULTILINE)
        for company, ceo in matches:
            company = company.strip()
            ceo = ceo.strip()
            if not ceo or ceo.lower() in {"unknown", "n/a", "none"}:
                ceo = "None"
            company_ceo_dict[company] = ceo

        print(f"Batch {idx+1} done.")

        time.sleep(2)

    except Exception as e:
        print(f"Gemini API error on batch {idx+1}: {e}")

# Step 3: Process rows
def process_row(row):
    try:
        url = row["URL"]
        title = row["Título"]
        summary = row["Resumen"]

        # Drop rows with missing Resumen
        if not isinstance(summary, str) or summary.strip() == "":
            return None

        summary = clean_resumen(summary)

        # Sentiment analysis
        polarity = TextBlob(summary).sentiment.polarity
        if polarity > 0.1:
            sentiment = "positive"
        elif polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # NER to find company name
        company_name = "None"
        doc = nlp(summary)
        found = False
        for ent in doc.ents:
            if ent.label_ in {"ORG", "COMPANY"}:
                company_name = ent.text.strip()
                found = True
                break
        if not found:
            matches = re.findall(r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\b', summary)
            if matches:
                company_name = matches[0]

        # CEO lookup
        ceo_name = company_ceo_dict.get(company_name, "None")

        # Category classifier
        category = "None"
        summary_lower = summary.lower()
        summary_tokens = word_tokenize(summary_lower)
        for label, keywords in category_keywords.items():
            if any(keyword in summary_tokens for keyword in keywords):
                category = label
                break

        # Country classifier
        country = "None"
        for c in countries:
            if c.lower() in summary_lower:
                country = c
                break

        return {
            "news_title": title,
            "company_name": company_name,
            "ceo": ceo_name,
            "summary": summary,
            "site_url": url,
            "category": category,
            "country": country,
            "sent_analysis": str({"label": sentiment, "score": round(polarity, 3)})
        }

    except Exception as e:
        print(f"Error processing row {row.name}: {e}")
        return None

# Process all rows
results = []
for idx, row in df.iterrows():
    enriched = process_row(row)
    if enriched:
        results.append(enriched)

# Save to CSV
output_csv = "enriched_articles_final.csv"
df_out = pd.DataFrame(results)
df_out.to_csv(output_csv, index=False, encoding="utf-8-sig")

print(f"Saved {len(results)} enriched articles to {output_csv}")
