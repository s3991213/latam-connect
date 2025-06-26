# run_pipeline.py — Full automation controller for Sparsh's AI pipeline

import os
from validate_with_gpt import validate_main_output

# STEP 1 — Run local NER pipeline
print("\n🚀 STEP 1: Running local extraction using main.py...")
os.system("python main.py")

# STEP 2 — Validate output using OpenAI
print("\n🔎 STEP 2: Validating main_output.csv with GPT...")
is_valid = validate_main_output("main_output.csv")

# STEP 3 — If validation fails, run full fallback using GPT
if not is_valid:
    print("\n⚠️ Validation failed. Running GPT fallback with gpt_pipeline.py...")
    os.system("python gpt_pipeline.py")
    print("\n✅ GPT fallback complete. Output saved to mongo.")
else:
    print("\n✅ Validation passed! Local extraction is good. Final output sent to mongo.")