from sklearn.cluster import KMeans
import pandas as pd
import numpy as np

def run_bias_analysis(df):
    if df.empty:
        return {"error": "Dataset is empty"}

    # --- Global Bias ---
    results = {}
    groups = df['gender'].dropna().unique()
    male_rate, female_rate = 0.0, 0.0

    for group in groups:
        group_df = df[df['gender'] == group]
        if len(group_df) == 0:
            continue

        rate = (group_df['loan_status'] == 1).mean()
        results[group] = round(rate, 2)
        if str(group).lower() == 'male': male_rate = float(rate)
        if str(group).lower() == 'female': female_rate = float(rate)

    print("Final Results:", results)

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
        diff = abs(male_rate - female_rate) if 'male' in [str(k).lower() for k in results] and 'female' in [str(k).lower() for k in results] else 0.0
        
        bias_detected = max_rate > 0 and ((disparate_impact < 0.85) or (diff > 0.2))
        global_bias = {
            "acceptance_rates": results,
            "disparate_impact": round(float(disparate_impact), 2),
            "bias_detected": bool(bias_detected),
            "bias_score": round(float(max(0.0, diff * 100)), 1)
        }

    # --- Cluster Bias ---
    cluster_bias = []
    features = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'loan_status' in features: features.remove('loan_status')
    if 'cluster' in features: features.remove('cluster')
    
    if len(features) >= 1:
        X = df[features].fillna(df[features].mean())
        n_clusters = min(3, len(df))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df['cluster'] = kmeans.fit_predict(X)
        
        for cluster_id in sorted(df['cluster'].unique()):
            c_df = df[df['cluster'] == cluster_id]
            
            c_male_rate = 0.0
            c_female_rate = 0.0
            if 'gender' in c_df.columns:
                male_df = c_df[c_df['gender'] == 'male']
                if not male_df.empty: c_male_rate = (male_df['loan_status'] == 1).mean()
                    
                female_df = c_df[c_df['gender'] == 'female']
                if not female_df.empty: c_female_rate = (female_df['loan_status'] == 1).mean()
                    
            c_max_rate = max(c_male_rate, c_female_rate)
            di = min(c_male_rate, c_female_rate) / c_max_rate if c_max_rate > 0 else 0.0
            c_diff = abs(c_male_rate - c_female_rate)
            
            c_bias_detected = c_max_rate > 0 and ((di < 0.85) or (c_diff > 0.2))
                
            cluster_bias.append({
                "cluster_id": int(cluster_id),
                "male_acceptance_rate": round(float(c_male_rate), 2),
                "female_acceptance_rate": round(float(c_female_rate), 2),
                "bias_detected": bool(c_bias_detected),
                "bias_score": round(float(max(0.0, c_diff * 100)), 1)
            })

    return {
        "global_bias": global_bias,
        "cluster_bias": cluster_bias
    }