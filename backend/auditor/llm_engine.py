import json
from google import genai
from django.conf import settings

def _get_client():
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set. Please set it in your .env file.")
    return genai.Client(api_key=api_key)

def classify_headers(headers: list) -> dict:
    """
    Given a list of CSV headers, uses Gemini to classify them.
    """
    client = _get_client()
    prompt = f"""
You are a data pipeline assistant. Here are the columns of a dataset:
{headers}

Categorize them into a strict JSON object with exactly three keys:
{{
  "financial_features": ["col1", "col2", ...],
  "sensitive_attribute": "demographic_col",
  "decision_target": "outcome_col"
}}
Return ONLY valid JSON without markdown tags.
"""
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    text = response.text.strip()
    if text.startswith('```json'): text = text[7:]
    if text.startswith('```'): text = text[3:]
    if text.endswith('```'): text = text[:-3]
    return json.loads(text.strip())

def generate_analysis(global_bias: dict, cluster_bias: list) -> str:
    """
    Generates a plain-text summary of the bias findings.
    """
    client = _get_client()
    prompt = f"""
You are an AI fairness auditor. Write a 2-3 paragraph plain-text summary of the following bias analysis.
Do not use markdown formatting.

Global Bias: {json.dumps(global_bias)}
Cluster Bias: {json.dumps(cluster_bias)}

Explain systemic bias, identify the most biased cluster, and describe the disparate impact. Keep it professional.
"""
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text.strip()
