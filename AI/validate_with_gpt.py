

import pandas as pd
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

def validate_row(row):
    prompt = f"""
You are a validation assistant. Based on the article and extracted output below, decide whether the extracted data looks accurate and complete.

Reply ONLY with: VALID or INVALID.

---

ARTICLE:
Title: {row['title']}
Description: {row['description']}

---

EXTRACTED OUTPUT:
Company: {row['company']}
CEO: {row['ceo']}
Category: {row['category']}
Investment Location: {row['investment_location']}
Sentiment: {row['sentiment']}
Relevance Score: {row['relevance_score']}
Insights: {row['insights']}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        reply = response.choices[0].message.content.strip().upper()
        return reply
    except Exception as e:
        print(f"❌ OpenAI error: {e}")
        return "INVALID"  # fail-safe if GPT errors out

def validate_main_output(file_path="main_output.csv"):
    df = pd.read_csv(file_path)
    for idx, row in df.iterrows():
        print(f"🔍 Validating row {idx+1}/{len(df)}: {row['title'][:40]}...")
        result = validate_row(row)

        if result != "VALID":
            print(f"❌ GPT flagged row {idx} as INVALID — stopping validation.")
            return False

        print(f"✅ Row {idx+1}: VALID")

    print("✅ All rows passed OpenAI validation.")
    return True