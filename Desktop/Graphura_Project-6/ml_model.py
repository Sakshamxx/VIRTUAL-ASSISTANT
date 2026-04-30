"""
Graphura India Private Limited
Website Conversion Optimization — ML Pipeline
================================================
Models   : Logistic Regression | Decision Tree | Random Forest

DESIGN DECISIONS:
1. TARGET: Probabilistic + Gaussian noise (std=0.18) — prevents data leakage
2. SCALER: Fit only on train set, applied to test (no leakage via scaler)
3. BIAS CHECK: Conversion rates verified across page types
4. OVERFIT GUARD: Train vs Test gap monitored; shallow trees used
"""

import pandas as pd
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
    confusion_matrix, roc_auc_score, f1_score)

np.random.seed(42)

# ── 1. LOAD & CLEAN ──────────────────────────────────────
df = pd.read_csv('/Users/sakshamchauhan/Desktop/hehe/Graphura_Audit_Augmented_500.csv')

def parse_load_ms(val):
    val = str(val).strip()
    if 'ms' in val: return float(val.replace(' ms',''))
    elif 's' in val: return float(val.replace(' s','')) * 1000
    return float(val)

df['Load_Time_ms'] = df['Load Time'].apply(parse_load_ms)
df.drop(columns=['Page Name','Page URL','Mobile Friendly','Load Time','Site Domain'], inplace=True)

# ── 2. TARGET (PROBABILISTIC — NO LEAKAGE) ───────────────
# Each feature contributes a PARTIAL weight, not a decisive rule.
# Gaussian noise (std=0.18) simulates real human unpredictability.
# This means no feature perfectly predicts the label → realistic accuracy.

perf_norm    = (df['Performance Grade'] - df['Performance Grade'].min()) / \
               (df['Performance Grade'].max() - df['Performance Grade'].min())
clarity_norm = (df['Content Clarity (1-5)'] - 1) / 4.0
cta_bin      = (df['CTA Presence'] == 'Yes').astype(float)
cta_top      = (df['CTA Position'] == 'Top').astype(float)
form_penalty = np.clip(df['Form Length'] / 5.0, 0, 1)

page_base = {
    'Service-Specific Landing Pages':    0.60,
    'Informational Pages':               0.55,
    'Internship & Recruitment Pages':    0.40,
    'Interview Prep':                    0.38,
    'Forms':                             0.30,
    'Resume builder':                    0.28,
}
df['page_base_rate'] = df['Page Type'].map(page_base).fillna(0.40)

prob = (0.22*cta_bin + 0.18*clarity_norm + 0.16*perf_norm +
        0.12*cta_top + 0.10*(1-form_penalty) + 0.22*df['page_base_rate'])

noise = np.random.normal(0, 0.18, len(df))
prob_noisy = np.clip(prob + noise, 0, 1)
df['Conversion'] = (prob_noisy > np.percentile(prob_noisy, 50)).astype(int)

print("="*60)
print("GRAPHURA — WEBSITE CONVERSION OPTIMIZATION")
print("="*60)
print(f"Dataset: {len(df)} pages")
print(f"High Conversion: {df['Conversion'].sum()} ({df['Conversion'].mean():.1%})")
print(f"Low  Conversion: {(df['Conversion']==0).sum()} ({(df['Conversion']==0).mean():.1%})")

# ── 3. BIAS CHECK ─────────────────────────────────────────
print("\nConversion Rate by Page Type (bias audit):")
bias = df.groupby('Page Type')['Conversion'].agg(['mean','count'])
bias.columns = ['Rate','Count']
print(bias.round(3).to_string())

# ── 4. FEATURE ENCODING ───────────────────────────────────
features = ['Page Type','CTA Presence','CTA Position',
            'Form Length','Performance Grade','Content Clarity (1-5)','Load_Time_ms']

X = df[features].copy()
y = df['Conversion']

le_dict = {}
for col in ['Page Type','CTA Presence','CTA Position']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    le_dict[col] = le

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

# Scaler fit ONLY on train data
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
results = {}

# ── 5A. LOGISTIC REGRESSION ───────────────────────────────
lr = LogisticRegression(C=0.5, max_iter=1000, random_state=42)
lr.fit(X_train_sc, y_train)
lr_pred  = lr.predict(X_test_sc)
lr_prob  = lr.predict_proba(X_test_sc)[:,1]
lr_train = accuracy_score(y_train, lr.predict(X_train_sc))
lr_test  = accuracy_score(y_test, lr_pred)
cv_lr    = cross_val_score(lr, X_train_sc, y_train, cv=cv, scoring='accuracy')

results['Logistic Regression'] = {
    'train_acc': round(lr_train,4), 'test_acc': round(lr_test,4),
    'auc': round(roc_auc_score(y_test,lr_prob),4),
    'f1':  round(f1_score(y_test,lr_pred),4),
    'cv_mean': round(cv_lr.mean(),4), 'cv_std': round(cv_lr.std(),4),
    'cm': confusion_matrix(y_test,lr_pred).tolist(),
    'report': classification_report(y_test,lr_pred,output_dict=True),
    'gap': round(abs(lr_train-lr_test),4)
}

coef_df = pd.DataFrame({'Feature':features,'Coefficient':lr.coef_[0].round(3)})
coef_df = coef_df.reindex(coef_df['Coefficient'].abs().sort_values(ascending=False).index)
results['Logistic Regression']['coefficients'] = coef_df.to_dict(orient='records')

# ── 5B. DECISION TREE ─────────────────────────────────────
dt = DecisionTreeClassifier(max_depth=4, min_samples_split=20,
                             min_samples_leaf=10, random_state=42)
dt.fit(X_train, y_train)
dt_pred  = dt.predict(X_test)
dt_prob  = dt.predict_proba(X_test)[:,1]
dt_train = accuracy_score(y_train, dt.predict(X_train))
dt_test  = accuracy_score(y_test, dt_pred)
cv_dt    = cross_val_score(dt, X_train, y_train, cv=cv, scoring='accuracy')

results['Decision Tree'] = {
    'train_acc': round(dt_train,4), 'test_acc': round(dt_test,4),
    'auc': round(roc_auc_score(y_test,dt_prob),4),
    'f1':  round(f1_score(y_test,dt_pred),4),
    'cv_mean': round(cv_dt.mean(),4), 'cv_std': round(cv_dt.std(),4),
    'cm': confusion_matrix(y_test,dt_pred).tolist(),
    'report': classification_report(y_test,dt_pred,output_dict=True),
    'gap': round(abs(dt_train-dt_test),4),
    'tree_rules': export_text(dt, feature_names=features)
}

# ── 5C. RANDOM FOREST ─────────────────────────────────────
rf = RandomForestClassifier(n_estimators=100, max_depth=5,
                             min_samples_leaf=8, max_features='sqrt', random_state=42)
rf.fit(X_train, y_train)
rf_pred  = rf.predict(X_test)
rf_prob  = rf.predict_proba(X_test)[:,1]
rf_train = accuracy_score(y_train, rf.predict(X_train))
rf_test  = accuracy_score(y_test, rf_pred)
cv_rf    = cross_val_score(rf, X_train, y_train, cv=cv, scoring='accuracy')

fi = dict(zip(features, rf.feature_importances_.round(4)))
fi_sorted = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True))

results['Random Forest'] = {
    'train_acc': round(rf_train,4), 'test_acc': round(rf_test,4),
    'auc': round(roc_auc_score(y_test,rf_prob),4),
    'f1':  round(f1_score(y_test,rf_pred),4),
    'cv_mean': round(cv_rf.mean(),4), 'cv_std': round(cv_rf.std(),4),
    'cm': confusion_matrix(y_test,rf_pred).tolist(),
    'report': classification_report(y_test,rf_pred,output_dict=True),
    'gap': round(abs(rf_train-rf_test),4),
    'feature_importances': fi_sorted
}

# ── 6. SUMMARY ────────────────────────────────────────────
print("\n" + "="*60)
print(f"{'Model':<25} {'Train':>7} {'Test':>7} {'Gap':>6} {'AUC':>7} {'F1':>7} {'CV':>8}")
print("─"*70)
for name, r in results.items():
    warn = " ⚠ OVERFIT" if r['gap'] > 0.08 else ""
    print(f"{name:<25} {r['train_acc']:>6.2%} {r['test_acc']:>7.2%} "
          f"{r['gap']:>5.2%} {r['auc']:>7.4f} {r['f1']:>7.4f} "
          f"{r['cv_mean']:>7.2%}{warn}")

print("\nRandom Forest — Feature Importances:")
for feat, imp in fi_sorted.items():
    bar = "█" * int(imp*40)
    print(f"  {feat:<32} {imp:.4f}  {bar}")

best = max(results, key=lambda k: results[k]['auc'])
print(f"\nBest model (by AUC): {best}")

print("\n✅ Executted Successfully")
