import os
import pandas as pd
import spacy
from textblob import TextBlob
import re
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
model = genai.GenerativeModel('gemini-1.5-flash')  # Updated to newer model

# Load Spacy English model
nlp = spacy.load("en_core_web_sm")

# Enhanced category keywords
category_keywords = {
    "FinTech": ["fintech", "payment", "bank", "financial", "money", "crypto", "blockchain", "investment"],
    "AI": ["ai", "artificial intelligence", "machine learning", "deep learning", "llm", "generative ai"],
    "Tech": ["tech", "technology", "software", "hardware", "device", "app", "application"],
    "Healthcare": ["health", "medical", "hospital", "biotech", "pharma", "healthcare"],
    "Business": ["business", "startup", "enterprise", "market", "economic"]
}

countries = ["Argentina", "Brazil", "Chile", "Colombia", "Mexico", "Spain", "Peru"]

def clean_description(text):
    """Clean and deduplicate description text"""
    if not isinstance(text, str):
        return ""
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    seen = set()
    return ' '.join([p for p in paragraphs if not (p in seen or seen.add(p))])

def detect_category(text):
    """Enhanced category detection with word boundaries"""
    text_lower = text.lower()
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if re.search(rf'\b{re.escape(keyword)}\b', text_lower):
                return category
    return "Other"

def detect_country(text):
    """Country detection with word boundaries"""
    text_lower = text.lower()
    for country in countries:
        if re.search(rf'\b{re.escape(country.lower())}\b', text_lower):
            return country
    return "Global"

def analyze_sentiment(text):
    """Sentiment analysis with enhanced thresholds"""
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    
    if polarity > 0.2:
        return "Positive"
    elif polarity < -0.2:
        return "Negative"
    else:
        return "Neutral"

def process_article(row):
    """Process each article to extract required information"""
    try:
        title = row["Title"] if "Title" in row else row["Título"]
        url = row["Link"] if "Link" in row else row["URL"]
        description = clean_description(row["Description"] if "Description" in row else row["Resumen"])
        
        if not description:
            return None

        # Detect category and country
        category = detect_category(description)
        country = detect_country(description)
        
        # Optional: Add sentiment analysis if needed
        sentiment = analyze_sentiment(description)
        
        return {
            "Title": title,
            "Link": url,
            "Description": description,
            "Category": category,
            "Location": country,
            # "Sentiment": sentiment  # Uncomment if needed
        }
        
    except Exception as e:
        print(f"Error processing article: {e}")
        return None

def main():
    # Load input CSV
    df = pd.read_csv("output.csv")
    
    # Process all articles
    results = []
    for _, row in df.iterrows():
        processed = process_article(row)
        if processed:
            results.append(processed)
    
    # Save to CSV
    output_df = pd.DataFrame(results)
    output_csv = "enriched_articles_final.csv"
    output_df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"Successfully processed {len(results)} articles. Saved to {output_csv}")

if __name__ == "__main__":
    main()