#The following script seraches for some keywords in our csv file and shows which relevant keywords were found in each article.

#I got the csv file through a python script for scraping data from a few websites which include data about latin america and startups and ...

import pandas as pd
import re
import spacy

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# Load your CSV
df = pd.read_csv("rss_articles.csv")

# Define preprocessing function
def preprocess_text(text):
    if pd.isnull(text):
        return ""
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    doc = nlp(text.lower().strip())
    tokens = [
        token.lemma_ for token in doc
        if token.is_alpha and not token.is_stop and not token.is_punct
    ]
    return " ".join(tokens)

# Apply preprocessing
df['clean_title'] = df['title'].apply(preprocess_text)
df['clean_description'] = df['description'].apply(preprocess_text)

# Define your keywords
keywords = [
    "startup", "startups", "brazil", "funding", "spain", "latin america", "investment", "tech", "entrepreneur"
]

# Function to find which keywords match
def matched_keywords(text):
    found = [kw for kw in keywords if kw in text]
    return found

# Combine title and description for keyword matching
df['combined_text'] = df['clean_title'] + " " + df['clean_description']
df['matched_keywords'] = df['combined_text'].apply(matched_keywords)

# Filter only articles with at least one relevant keyword
df['is_relevant'] = df['matched_keywords'].apply(lambda x: len(x) > 0)
relevant_df = df[df['is_relevant']].copy()

# Keep only useful columns
output = relevant_df[['title', 'description', 'url', 'published_date', 'source', 'matched_keywords']]

# Save to CSV
output.to_csv("relevant_articles_with_keywords.csv", index=False)

# Preview result
print("✅ Relevant articles found:", len(output))
print(output[['title', 'matched_keywords']].head())