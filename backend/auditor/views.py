import pandas as pd
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .bias_engine import run_bias_analysis
from .llm_engine import classify_headers, generate_analysis
from .simulator import compute_fair_decision
import traceback

DATASET_STORE = {}

@api_view(['POST'])
def upload_dataset(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    # Clear previous data so failed uploads don't leave stale data
    DATASET_STORE.clear()

    try:
        df = pd.read_csv(file)
        
        # Clean column names
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
        
        if df.empty:
            return Response({"error": "Dataset not loaded properly"}, status=400)

        # Classify headers dynamically using Gemini LLM
        schema = classify_headers(df.columns.tolist())

        DATASET_STORE["data"] = df
        DATASET_STORE["schema"] = schema

        return Response({
            "message": "Uploaded successfully",
            "schema_detected": schema
        })

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def analyze_bias(request):
    df = DATASET_STORE.get("data")
    schema = DATASET_STORE.get("schema")

    if df is None or schema is None:
        return Response({"error": "Upload dataset first"}, status=400)

    try:
        # Use cached analysis to prevent redundant Gemini API calls
        if "analysis_result" in DATASET_STORE:
            return Response(DATASET_STORE["analysis_result"])

        result = run_bias_analysis(df, schema)
        
        # Generate plain text summary using Gemini LLM
        llm_analysis = generate_analysis(result["global_bias"], result["cluster_bias"])
        result["llm_analysis"] = llm_analysis
        
        # Cache the result
        DATASET_STORE["analysis_result"] = result
        
        return Response(result)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def simulate_fair(request):
    try:
        data = request.data
        income = float(data.get('income', 0))
        credit_score = float(data.get('credit_score', 0))
        debt_ratio = float(data.get('debt_ratio', 0))
        model_score = float(data.get('model_score', 0))

        # Use the mathematical heuristic approach
        result = compute_fair_decision(income, credit_score, debt_ratio, model_score, w_f=0.2)
        return Response(result)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)