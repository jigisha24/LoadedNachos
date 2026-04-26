def compute_fair_decision(income, credit_score, debt_ratio, model_score, w_f=0.2):
    """
    Adjusts the original model score by factoring in the financial 'need' of the applicant.
    
    w_f (Fairness Weight): 
    Controls how heavily the 'need' factor influences the final score.
    A higher w_f strongly boosts the score for individuals with lower income/credit.
    """
    # 1. Normalize income (assuming ~150,000 range for normalization, cap at 1)
    norm_income = min(income / 150000.0, 1.0)
    
    # 2. Normalize credit score (FICO range 300 to 850)
    norm_credit = max(0.0, min((credit_score - 300) / (850 - 300), 1.0))
    
    # 3. Calculate Privilege vs. Need
    # Privilege is high when income and credit are high.
    privilege_score = (norm_income + norm_credit) / 2.0
    
    # Need is the inverse of privilege. 
    # A poorer user with low credit has a higher need.
    need_factor = 1.0 - privilege_score
    
    # 4. Apply Fairness Adjustment
    # The poorer/more marginalized the user, the higher the need_factor.
    # w_f scales this need, bridging the gap for marginalized users.
    adjusted_score = model_score + (w_f * need_factor)
    
    # Ensure score doesn't exceed 1.0
    adjusted_score = min(adjusted_score, 1.0)
    
    # 5. Threshold logic (assume 0.6 is the approval cutoff)
    new_decision = 1 if adjusted_score >= 0.6 else 0
    
    return {
        'original_score': float(model_score),
        'adjusted_score': round(float(adjusted_score), 4),
        'need_factor': round(float(need_factor), 4),
        'w_f_applied': float(w_f),
        'decision': new_decision,
        'explanation': (
            f"The original score was {model_score}. Based on a need factor of {round(need_factor, 2)} "
            f"(lower income/credit implies higher need), we applied a fairness weight (w_f) of {w_f}. "
            f"This resulted in an adjusted score of {round(adjusted_score, 2)}."
        )
    }
