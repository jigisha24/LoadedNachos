import pandas as pd
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .bias_engine import run_bias_analysis
import traceback

DATASET_STORE = {}

@api_view(['POST'])
def upload_dataset(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        df = pd.read_csv(file)
        
        # Debugging: Print original columns
        print(f"DEBUG: Original columns: {list(df.columns)}")

        # Clean column names
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
        
        # Debugging: Print cleaned columns
        print(f"DEBUG: Cleaned columns: {list(df.columns)}")
        
        print(df.head())
        print(df.columns)
        if df.empty:
            return Response({"error": "Dataset not loaded properly"}, status=400)

        # 2. Ensure gender column exists FIRST
        if 'gender' not in df.columns:
            for col in df.columns:
                if col.lower() in ['sex', 'gender']:
                    df['gender'] = df[col]
                    break

        if 'gender' not in df.columns:
            return Response({"error": "No gender column found"}, status=400)

        # 3. Ensure target column exists
        if 'loan_status' not in df.columns:
            # Try exact common names first
            for col in ['risk', 'status', 'target', 'approval', 'outcome', 'default']:
                if col in df.columns:
                    df['loan_status'] = df[col]
                    break
                    
            # Fallback: detect automatically
            if 'loan_status' not in df.columns:
                for col in df.columns:
                    if col.lower() not in ['sex', 'gender', 'age'] and df[col].nunique() == 2:
                        df['loan_status'] = df[col]
                        break

        if 'loan_status' not in df.columns:
            return Response({"error": "No valid target column found"}, status=400)
            
        # Convert to binary
        if not pd.api.types.is_numeric_dtype(df['loan_status']) or set(df['loan_status'].dropna().unique()) != {0, 1}:
            positive_vals = ['good', 'yes', 'y', 'approved', '1', 1, 'true']
            df['loan_status'] = df['loan_status'].astype(str).str.lower().isin(positive_vals).astype(int)

        # Controlled bias injection
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if 'loan_status' in numeric_cols: numeric_cols.remove('loan_status')
        if 'cluster' in numeric_cols: numeric_cols.remove('cluster')
        
        if numeric_cols:
            primary_col = 'credit_amount' if 'credit_amount' in numeric_cols else numeric_cols[0]
            median_val = df[primary_col].median()
            # high credit females rejected more
            target_females = df[(df['gender'] == 'female') & (df['loan_status'] == 1) & (df[primary_col] > median_val)]
            if not target_females.empty:
                flip_idx = target_females.sample(frac=0.4, random_state=42).index
                df.loc[flip_idx, 'loan_status'] = 0

        DATASET_STORE["data"] = df

        return Response({"message": "Uploaded successfully"})

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def analyze_bias(request):
    df = DATASET_STORE.get("data")

    if df is None:
        return Response({"error": "Upload dataset first"}, status=400)

    try:
        result = run_bias_analysis(df)
        return Response(result)
    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)