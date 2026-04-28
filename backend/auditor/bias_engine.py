from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

def run_bias_analysis(df, schema):
    if df.empty:
        return {"error": "Dataset is empty"}
        
    features = schema.get("financial_features", [])
    target_col = schema.get("decision_target", "")
    sensitive_col = schema.get("sensitive_attribute", "")

    # Clean missing values for target and sensitive features
    if target_col not in df.columns or sensitive_col not in df.columns:
        return {"error": f"Required columns ({target_col}, {sensitive_col}) missing in dataframe."}

    df_clean = df.dropna(subset=[target_col, sensitive_col]).copy()

    # Ensure binary target
    if df_clean[target_col].nunique() > 2:
        df_clean[target_col] = (df_clean[target_col] > df_clean[target_col].median()).astype(int)
    else:
        if not pd.api.types.is_numeric_dtype(df_clean[target_col]):
            positive_vals = ['1', 'true', 'yes', 'approved', 'good', 'y']
            df_clean[target_col] = df_clean[target_col].astype(str).str.lower().isin(positive_vals).astype(int)

    groups = df_clean[sensitive_col].dropna().unique()

    # --- Cluster Bias ---
    cluster_bias = []
    
    # Use features identified by LLM
    valid_features = [f for f in features if f in df_clean.columns and pd.api.types.is_numeric_dtype(df_clean[f])]
    
    if len(valid_features) >= 1:
        X = df_clean[valid_features].fillna(df_clean[valid_features].mean())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        n_clusters = min(3, len(df_clean))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df_clean['cluster'] = kmeans.fit_predict(X_scaled)
        
        for cluster_id in sorted(df_clean['cluster'].unique()):
            c_df = df_clean[df_clean['cluster'] == cluster_id]
            c_results = {}
            
            cluster_features = {}
            for f in valid_features:
                cluster_features[f] = {
                    "min": round(float(c_df[f].min()), 2),
                    "max": round(float(c_df[f].max()), 2),
                    "mean": round(float(c_df[f].mean()), 2)
                }
            
            for group in groups:
                group_df = c_df[c_df[sensitive_col] == group]
                c_rate = (group_df[target_col] == 1).mean() if len(group_df) > 0 else 0.0
                c_results[str(group)] = round(float(c_rate), 2)
                
            c_rates = list(c_results.values())
            c_max_rate = max(c_rates) if c_rates else 0.0
            di = min(c_rates) / c_max_rate if c_max_rate > 0 else 0.0
            c_diff = c_max_rate - min(c_rates) if c_rates else 0.0
            
            c_bias_detected = c_max_rate > 0 and ((di < 0.85) or (c_diff > 0.2))
                
            cluster_bias.append({
                "cluster_id": int(cluster_id),
                "acceptance_rates": c_results,
                "bias_detected": bool(c_bias_detected),
                "bias_score": round(float(max(0.0, c_diff * 100)), 1),
                "features": cluster_features
            })

    # Determine if ANY cluster has bias detected
    any_cluster_biased = any(c["bias_detected"] for c in cluster_bias) if cluster_bias else False

    # --- Global Bias ---
    results = {}
    for group in groups:
        group_df = df_clean[df_clean[sensitive_col] == group]
        if len(group_df) == 0:
            continue
        rate = (group_df[target_col] == 1).mean()
        results[str(group)] = round(float(rate), 2)

    rates = list(results.values())
    if not rates:
        global_bias = {
            "acceptance_rates": results,
            "disparate_impact": 0.0,
            "bias_detected": False,
            "bias_score": 0.0
        }
    else:
        max_rate = max(rates)
        disparate_impact = 0.0 if max_rate == 0 else min(rates) / max_rate
        diff = max_rate - min(rates)
        
        # KEY CHANGE: Global bias is now dependent on cluster bias (eligible candidates)
        global_bias = {
            "acceptance_rates": results,
            "disparate_impact": round(float(disparate_impact), 2),
            "bias_detected": bool(any_cluster_biased),
            "bias_score": round(float(max(0.0, diff * 100)), 1)
        }

    return {
        "global_bias": global_bias,
        "cluster_bias": cluster_bias
    }