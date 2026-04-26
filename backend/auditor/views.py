from django.shortcuts import render

# Create your views here.
import json
import pandas as pd
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .bias_engine import run_bias_analysis
from .simulator import compute_fair_decision

# ---------- simple in-memory store ----------
_STORE = {}

# ─────────────────────────────────────────────
# POST /api/upload/
# Body: multipart/form-data  { file: <csv> }
# ─────────────────────────────────────────────
@api_view(['POST'])
def upload_dataset(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)

    try:
        df = pd.read_csv(file)
    except Exception as e:
        return Response({'error': f'Could not parse CSV: {e}'}, status=400)

    # Validate required columns
    required = {'income', 'credit_score', 'debt_ratio', 'gender', 'decision'}
    missing = required - set(df.columns)
    if missing:
        return Response({'error': f'Missing columns: {missing}'}, status=400)

    _STORE['df'] = df

    return Response({
        'message': 'Dataset uploaded successfully',
        'rows': len(df),
        'columns': list(df.columns),
        'preview': df.head(5).to_dict(orient='records'),
    })


# ─────────────────────────────────────────────
# GET /api/analyze/
# ─────────────────────────────────────────────
@api_view(['GET'])
def analyze_dataset(request):
    df = _STORE.get('df')
    if df is None:
        return Response({'error': 'No dataset loaded. Upload first.'}, status=400)

    try:
        result = run_bias_analysis(df)
        _STORE['analysis'] = result          # cache for simulation step
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ─────────────────────────────────────────────
# POST /api/simulate/
# Body: { income, credit_score, debt_ratio,
#         gender, model_score (0–1) }
# ─────────────────────────────────────────────
@api_view(['POST'])
def simulate_fair(request):
    data = request.data

    required = ['income', 'credit_score', 'debt_ratio', 'model_score']
    missing = [f for f in required if f not in data]
    if missing:
        return Response({'error': f'Missing fields: {missing}'}, status=400)

    try:
        result = compute_fair_decision(
            income=float(data['income']),
            credit_score=float(data['credit_score']),
            debt_ratio=float(data['debt_ratio']),
            model_score=float(data['model_score']),
        )
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)