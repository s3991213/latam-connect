
# LatamConnect AI News Intelligence Pipeline

This project is an AI-powered pipeline that extracts structured business insights from news articles using both rule-based NLP (spaCy, HuggingFace) and OpenAI GPT fallback. It ensures high-quality outputs with automated validation and correction.

---

## 🧠 Features

- Extracts companies, CEOs, sentiment, relevance, and key insights
- NLP pipeline with spaCy + transformers (local)
- GPT fallback if local extraction is invalid
- Final output matches exact client schema
- Output options: main_output.csv or gpt_output.csv
- Supports `.env` key management and easy setup

---

## 📁 Folder Structure

```
AI/
├── main.py
├── gpt_pipeline.py
├── validate_with_gpt.py
├── run_pipeline.py
├── ner_dev.ipynb (reference)
├── requirements.txt
├── .env (you create this)
├── data_LatamConnect.csv
├── main_output.csv
├── gpt_output.csv
└── README.md
```

---

## 🔧 Setup Instructions

### 1. Create virtual environment (optional but recommended)
```bash
python -m venv venv
source venv/bin/activate     # or venv\Scripts\activate for Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your OpenAI API Key
Create a `.env` file inside the folder with this line:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 Run the Pipeline

```bash
python run_pipeline.py
```

This script will:
1. Run `main.py` for spaCy+HuggingFace NER
2. Validate results using GPT via `validate_with_gpt.py`
3. If any row fails → Re-run everything using `gpt_pipeline.py`

---

## 📦 Output Format

| title | description | company | ceo | category | investment_location | sentiment | relevance_score | insights |
|-------|-------------|---------|-----|----------|----------------------|-----------|------------------|----------|

✅ Final output is saved as `main_output.csv` or `gpt_output.csv`

---

## 📬 Questions?

Reach out to the development team if you have trouble running the system or need help with deployment.
