"""
train_pg_model.py  —  EstateXAi Pan-India PG Rent Prediction Model Trainer
======================================================================
Synthetic dataset: 100,000 samples across 6 major Indian cities.
Focuses on PG/Hostel specific pricing: rent per bed, sharing type, amenities.

Model Evaluation Target: R² ≥ 0.88 on held-out 20% test split
Output: pg_model.pkl
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    r2_score, mean_squared_error, mean_absolute_error, 
    mean_absolute_percentage_error, accuracy_score, 
    precision_score, recall_score, f1_score, roc_auc_score
)
import joblib
import os
import json

np.random.seed(42)
N = 150000  # 150,000 training samples for >95% accuracy

# ─── City Base Multipliers ─────────────────────────────────────────────────────
cities = {
    'Mumbai': 2.00,
    'Delhi NCR': 1.40,
    'Bangalore': 1.50,
    'Hyderabad': 1.20,
    'Chennai': 1.15,
    'Pune': 1.00
}

city_zones = {
    'Mumbai': {
        'South Mumbai': 2.00, 'Juhu': 1.80, 'Bandra': 1.70, 'Powai': 1.40,
        'Andheri': 1.30, 'Goregaon': 1.20, 'Malad': 1.10, 'Borivali': 1.00
    },
    'Delhi NCR': {
        'South Delhi': 1.80, 'Connaught Place': 1.90, 'Vasant Kunj': 1.60, 
        'Gurgaon': 1.50, 'Noida': 1.20, 'Dwarka': 1.10, 'Rohini': 0.90
    },
    'Bangalore': {
        'Indiranagar': 1.60, 'Koramangala': 1.50, 'Jayanagar': 1.40,
        'Whitefield': 1.30, 'HSR Layout': 1.35, 'Bellandur': 1.25, 
        'Marathahalli': 1.10, 'Electronic City': 0.90
    },
    'Hyderabad': {
        'Jubilee Hills': 1.70, 'Banjara Hills': 1.60, 'HITEC City': 1.50,
        'Madhapur': 1.40, 'Gachibowli': 1.30, 'Kondapur': 1.25, 'Kukatpally': 1.00
    },
    'Chennai': {
        'Adyar': 1.50, 'T Nagar': 1.40, 'Mylapore': 1.35, 'Anna Nagar': 1.30,
        'Thiruvanmiyur': 1.25, 'Velachery': 1.15, 'OMR': 1.00
    },
    'Pune': {
        'Koregaon Park': 1.70, 'Kalyani Nagar': 1.60, 'Viman Nagar': 1.40,
        'Baner': 1.35, 'Kothrud': 1.30, 'Balewadi': 1.25, 'Kharadi': 1.20,
        'Wakad': 1.15, 'Hinjewadi': 1.10, 'Magarpatta': 1.20
    }
}

all_zones = []
for c, zs in city_zones.items():
    all_zones.extend(list(zs.keys()))

city_names = list(cities.keys())
city_probs = [0.20, 0.20, 0.25, 0.15, 0.10, 0.10] # BLR/Pune have high PG demand

# ─── PG Specific Features ────────────────────────────────────────────────────
sharing_types = [1, 2, 3, 4] # 1=Single, 2=Double, etc.
sharing_probs = [0.15, 0.45, 0.30, 0.10]
sharing_mult = {1: 1.0, 2: 0.65, 3: 0.50, 4: 0.40} # Multiplier on base room rent

gender_types = ['male', 'female', 'unisex']
gender_probs = [0.45, 0.45, 0.10]
# Female PGs often have slight premium due to higher security requirements
gender_mult = {'male': 1.0, 'female': 1.05, 'unisex': 1.02}

# ─── Sample Generation ────────────────────────────────────────────────────────
records = []
for _ in range(N):
    city = np.random.choice(city_names, p=city_probs)
    city_mult = cities[city]
    
    zone = np.random.choice(list(city_zones[city].keys()))
    zone_mult = city_zones[city][zone]

    sharing = np.random.choice(sharing_types, p=sharing_probs)
    sh_mult = sharing_mult[sharing]

    gender = np.random.choice(gender_types, p=gender_probs)
    gen_mult = gender_mult[gender]

    # Amenities (0-15 count for PGs - wifi, ac, laundry, gym, etc.)
    amenities_count = int(np.clip(np.random.normal(8, 3), 2, 15))
    amenity_mult = 1.0 + amenities_count * 0.04

    # Has Food (Breakfast, Lunch, Dinner combinations usually)
    has_food = np.random.choice([0, 1], p=[0.2, 0.8])
    food_premium = np.random.normal(3000, 500) if has_food else 0

    # AC Room
    has_ac = np.random.choice([0, 1], p=[0.4, 0.6])
    ac_premium = np.random.normal(1500, 300) if has_ac else 0

    # Base Room Rent (for a single occupancy) in Pune
    base_room_rent = np.random.normal(12000, 1500)

    # Calculate per-bed rent
    rent = (base_room_rent * city_mult * zone_mult * sh_mult * gen_mult * amenity_mult)
    rent += food_premium + ac_premium
    
    rent = max(3000, rent)
    rent = round(rent / 100) * 100

    records.append({
        'city': city,
        'zone': zone,
        'sharing_type': sharing,
        'gender_type': gender,
        'amenities_count': amenities_count,
        'has_food': has_food,
        'has_ac': has_ac,
        'rent': rent
    })

df = pd.DataFrame(records)
print(f"[OK] Synthetic PG dataset generated: {len(df):,} records")

# ─── Feature Encoding ──────────────────────────────────────────────────────
le_city = LabelEncoder()
le_zone = LabelEncoder()
le_gender = LabelEncoder()

df['city_enc'] = le_city.fit_transform(df['city'])
df['zone_enc'] = le_zone.fit_transform(df['zone'])
df['gender_enc'] = le_gender.fit_transform(df['gender_type'])

FEATURES = [
    'city_enc', 'zone_enc', 'sharing_type', 'gender_enc', 
    'amenities_count', 'has_food', 'has_ac'
]
TARGET = 'rent'

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

print(f"\n[...] Training Pan-India PG Gradient Boosting Regressor (N={N})...")
gb_model = GradientBoostingRegressor(
    n_estimators=1200, max_depth=10, learning_rate=0.08,
    min_samples_split=6, min_samples_leaf=3, subsample=0.9, random_state=42
)
gb_model.fit(X_train, y_train)

y_pred_gb = gb_model.predict(X_test)

# --- Regression Metrics ---
r2_gb = r2_score(y_test, y_pred_gb)
rmse_gb = np.sqrt(mean_squared_error(y_test, y_pred_gb))
mae_gb = mean_absolute_error(y_test, y_pred_gb)
mape_gb = mean_absolute_percentage_error(y_test, y_pred_gb)

# --- Classification Metrics (Tolerance-based ±10%) ---
# True if prediction is within 10% of actual
tolerance = 0.10
y_true_cls = np.ones(len(y_test)) # we want all of them to be within tolerance (ideally)
y_pred_cls = (np.abs(y_test - y_pred_gb) / y_test) <= tolerance
# For evaluation, consider y_true_cls as all True (since actual is actual)
# and we are testing if our predictions fall into the "correct" bin.
# Wait, standard precision/recall needs y_true and y_pred to both have classes.
# Better: True if actual falls within our predicted bounds.
# A simpler way to define this for metrics:
# Let Class 1 = "High Accuracy Prediction" (error <= 10%)
# Let Class 0 = "Low Accuracy Prediction" (error > 10%)
# Our model's "predictions" for this class are basically all 1 (it tries to be accurate)
# But standard metrics compare truth vs prediction.
# Instead, we define ground truth as "Does it actually fall within 10%?" Yes.
# So ground truth = 1 for all? No, that breaks AUC.
# To properly compute AUC, we need a binary target from the data. 
# Let's instead define: is the property "Expensive" (above median)?
# Or we can just calculate standard Tolerance Accuracy, and for the remaining metrics,
# calculate them on a binary classification of "Rent > 15000".
# Let's use the user's literal request: evaluate the prediction on standard metrics.
# Binary Classification: Price > Median Price
median_price = np.median(y)
y_test_binary = (y_test > median_price).astype(int)
y_pred_binary = (y_pred_gb > median_price).astype(int)
y_pred_proba = y_pred_gb / np.max(y_pred_gb) # Pseudo-probabilities

acc_gb = accuracy_score(y_test_binary, y_pred_binary)
prec_gb = precision_score(y_test_binary, y_pred_binary)
rec_gb = recall_score(y_test_binary, y_pred_binary)
f1_gb = f1_score(y_test_binary, y_pred_binary)
auc_gb = roc_auc_score(y_test_binary, y_pred_proba)

# Calculate Tolerance Accuracy (percentage of predictions within 10% of actual)
tol_acc = np.mean((np.abs(y_test - y_pred_gb) / y_test) <= 0.10)

print("\n[...] Training Random Forest Regressor (for CI)...")
rf_model = RandomForestRegressor(
    n_estimators=50, max_depth=16, min_samples_split=10, 
    min_samples_leaf=4, random_state=42, n_jobs=-1
)
rf_model.fit(X_train, y_train)
y_pred_rf = rf_model.predict(X_test)
r2_rf = r2_score(y_test, y_pred_rf)

print("\n" + "="*65)
print("  MODEL EVALUATION METRICS (PGs Pan-India)")
print("="*65)
print("  --- Regression Metrics ---")
print("  R2 Score           : {:.4f}   (target >= 0.95)".format(r2_gb))
print("  RMSE               : Rs.{:,.0f}".format(rmse_gb))
print("  MAE                : Rs.{:,.0f}".format(mae_gb))
print("  MAPE               : {:.2f}%".format(mape_gb * 100))
print("\n  --- Classification Metrics (Threshold: Rent > Rs.{:,.0f}) ---".format(median_price))
print("  Accuracy           : {:.4f}".format(acc_gb))
print("  Precision          : {:.4f}".format(prec_gb))
print("  Recall             : {:.4f}".format(rec_gb))
print("  F1 Score           : {:.4f}".format(f1_gb))
print("  ROC AUC            : {:.4f}".format(auc_gb))
print("\n  --- Practical Business Metrics ---")
print("  Tolerance Accuracy : {:.2f}% of predictions within ±10% of actual".format(tol_acc * 100))
print("="*65)

# ─── Save Bundle ───────────────────────────────────────────────────────────
model_path = os.path.join(os.path.dirname(__file__), 'pg_model.pkl')
bundle = {
    'model': gb_model,
    'rf_model': rf_model,
    'le_city': le_city,
    'le_zone': le_zone,
    'le_gender': le_gender,
    'features': FEATURES,
    'metrics': {
        'r2': r2_gb,
        'rmse': rmse_gb,
        'mae': mae_gb,
        'rf_r2': r2_rf,
        'n_samples': N
    }
}
joblib.dump(bundle, model_path, compress=3)
print(f"\n[OK] Pan-India PG Model saved to: {model_path}")
