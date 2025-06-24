# gpt_pipeline.py — Final GPT fallback extractor (based on ner_dev.ipynb)

import pandas as pd
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load OpenAI key
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# Define GPT extraction function (from ner_dev)
def extract_with_gpt(article):
    print(f"🔍 GPT extracting for: {article['Title'][:60]}")

    prompt = f"""
You are an AI assistant that extracts structured business insights from news articles.

From the following article, extract the following information as valid JSON.

If any field is not explicitly stated, infer it using your general knowledge about the company. Never leave fields empty.

Format:
{{
    "company": "...",
    "ceo": "...",
    "category": "AI / Education / Finance / Healthcare / IT / Others",
    "key_insight": [
        "bullet 1",
        "bullet 2",
        "bullet 3"
    ],
    "investment_location": "...",
    "sentiment": "Positive / Negative / Neutral",
    "relevance_score": "Rate from 1 to 5 stars"
}}

Title: {article['Title']}
Description: {article['Description']}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"raw_output": content, "error": "JSON parsing failed"}

    except Exception as e:
        return {"error": str(e)}

# Load your article dataset
df = pd.read_csv("data_LatamConnect.csv", encoding="ISO-8859-1")
print(f"✅ Loaded {len(df)} articles for GPT extraction.")

# Store all results
all_outputs = []

for i, row in df.iterrows():
    print(f"\n🔁 Article {i+1}/{len(df)}")
    result = extract_with_gpt({
        "Title": row["Title"],
        "Description": row["Description"]
    })

    # Combine key_insight to one string column
    if isinstance(result.get("key_insight"), list):
        insights = "• " + "\n• ".join(result["key_insight"])
    else:
        insights = result.get("key_insight", "")

    # Append structured row
    all_outputs.append({
        "title": row["Title"],
        "description": row["Description"],
        "company": result.get("company", ""),
        "ceo": result.get("ceo", ""),
        "category": result.get("category", ""),
        "investment_location": result.get("investment_location", ""),
        "sentiment": result.get("sentiment", ""),
        "relevance_score": result.get("relevance_score", ""),
        "insights": insights
    })

# Save final output to CSV (match required column order)
output_df = pd.DataFrame(all_outputs)
output_df.to_csv("gpt_output.csv", index=False)
print("\n✅ Saved to gpt_output.csv (fully GPT-enriched and clean).")