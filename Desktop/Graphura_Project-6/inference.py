"""
Graphura India Private Limited
Website Conversion Optimization — Inference Script
===================================================
Usage: python inference.py
Loads all 3 models and predicts on sample pages.
No manual encoding or scaling needed — all baked in.
"""

import pickle
import pandas as pd

# ── Sample input data (replace with your actual page data) ────────────────────
sample_data = pd.DataFrame({
    'Page Type':             ['Service-Specific Landing Pages', 'Forms', 'Resume builder',
                              'Informational Pages', 'Interview Prep'],
    'CTA Presence':          ['Yes', 'No', 'Yes', 'Yes', 'No'],
    'CTA Position':          ['Top', 'Bottom', 'Middle', 'Top', 'Bottom'],
    'Form Length':           [2, 8, 5, 3, 6],
    'Performance Grade':     [85, 45, 60, 78, 55],
    'Content Clarity (1-5)': [4, 2, 3, 5, 2],
    'Load_Time_ms':          [1200.0, 4500.0, 3000.0, 900.0, 3800.0],
})

print("="*60)
print("  GRAPHURA — CONVERSION PREDICTION")
print("="*60)
print("\nInput Pages:")
print(sample_data.to_string(index=False))
print()

# ── Load & predict with all 3 models ──────────────────────────────────────────
models = {
    "Logistic Regression": "Logistic_Regression.pkl",
    "Decision Tree":        "Decision_Tree.pkl",
    "Random Forest":        "Random_Forest.pkl",
}

results = {}
for model_name, fname in models.items():
    with open(fname, 'rb') as f:
        model = pickle.load(f)

    preds = model.predict(sample_data)
    proba = model.predict_proba(sample_data)[:, 1]   # probability of High Conversion
    results[model_name] = {'preds': preds, 'proba': proba}

    print(f"── {model_name} ──")
    for i, (pred, prob) in enumerate(zip(preds, proba)):
        label = "High Conv ✅" if pred == 1 else "Low Conv  ❌"
        print(f"  Page {i+1}: {label}  (confidence: {prob:.2%})")
    print()

# ── Ensemble vote (majority across 3 models) ──────────────────────────────────
import numpy as np
votes = np.array([results[m]['preds'] for m in models]).T   # shape (n_pages, 3)
ensemble = (votes.sum(axis=1) >= 2).astype(int)             # majority vote

print("── Ensemble Vote (majority of 3 models) ──")
for i, pred in enumerate(ensemble):
    label = "High Conv ✅" if pred == 1 else "Low Conv  ❌"
    print(f"  Page {i+1}: {label}")

print("\n" + "="*60)
print("  Done. Replace sample_data rows with your actual pages.")
print("="*60)
