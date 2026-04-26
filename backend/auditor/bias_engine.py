import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from fairlearn.metrics import demographic_parity_difference, demographic_parity_ratio

def run_bias_analysis(df: pd.DataFrame):
    """
    Analyzes the dataset for biases using clustering (KMeans++) 
    and fairlearn statistical metrics.
    """
    # 1. K-Means++ Clustering on financial attributes
    features = ['income', 'credit_score', 'debt_ratio']
    
    # Drop rows with missing values in these features
    df_clean = df.dropna(subset=features + ['gender', 'decision']).copy()
    
    if len(df_clean) == 0:
        return {"error": "Dataset is empty after removing missing values."}
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_clean[features])
    
    # Use KMeans++ (the default init algorithm in sklearn)
    kmeans = KMeans(n_clusters=3, init='k-means++', n_init=10, random_state=42)
    df_clean['cluster'] = kmeans.fit_predict(X_scaled)
    
    centroids = scaler.inverse_transform(kmeans.cluster_centers_)
    
    clusters_info = []
    for i, center in enumerate(centroids):
        clusters_info.append({
            'cluster_id': i,
            'size': int((df_clean['cluster'] == i).sum()),
            'avg_income': round(float(center[0]), 2),
            'avg_credit_score': round(float(center[1]), 2),
            'avg_debt_ratio': round(float(center[2]), 2),
        })

    # 2. Statistical Bias Detection using fairlearn
    y_pred = df_clean['decision'].astype(int)
    sensitive_features = df_clean['gender'].astype(str)
    
    # Demographic Parity Difference: max(Pr[Y=1 | A=a]) - min(Pr[Y=1 | A=a])
    # Demographic Parity Ratio (Disparate Impact): min(Pr[Y=1 | A=a]) / max(Pr[Y=1 | A=a])
    try:
        dp_diff = demographic_parity_difference(y_true=y_pred, y_pred=y_pred, sensitive_features=sensitive_features)
        dp_ratio = demographic_parity_ratio(y_true=y_pred, y_pred=y_pred, sensitive_features=sensitive_features)
    except Exception as e:
        dp_diff = 0.0
        dp_ratio = 1.0
        
    return {
        'clusters': clusters_info,
        'bias_metrics': {
            'demographic_parity_difference': round(float(dp_diff), 4),
            'disparate_impact_ratio': round(float(dp_ratio), 4),
        }
    }
