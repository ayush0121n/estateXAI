"""
train_model.py  —  EstateXAi Pan-India Price Prediction Model Trainer
======================================================================
Upgraded synthetic dataset: 200,000 samples across 6 major Indian cities.

Cities covered: Mumbai, Pune, Bangalore, Delhi NCR, Hyderabad, Chennai.

Model Evaluation Target: R² ≥ 0.88 on held-out 20% test split
Output: model.pkl
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
N = 200000  # 200,000 training samples

# ─── City Base Multipliers ─────────────────────────────────────────────────────
# Pune is baseline (1.0). Mumbai is significantly more expensive.
cities = {
    'Mumbai': 2.20,
    'Delhi NCR': 1.50,
    'Bangalore': 1.40,
    'Hyderabad': 1.10,
    'Chennai': 1.05,
    'Pune': 1.00
}

# ─── Zones per City with Local Multipliers ────────────────────────────────────
city_zones = {
    'Mumbai': {
        'South Mumbai': 2.50, 'Juhu': 2.20, 'Bandra': 2.00, 'Powai': 1.50,
        'Andheri': 1.40, 'Goregaon': 1.20, 'Malad': 1.10, 'Borivali': 1.00
    },
    'Delhi NCR': {
        'South Delhi': 2.00, 'Connaught Place': 2.20, 'Vasant Kunj': 1.80, 
        'Gurgaon': 1.60, 'Noida': 1.20, 'Dwarka': 1.10, 'Rohini': 0.90
    },
    'Bangalore': {
        'Indiranagar': 1.80, 'Koramangala': 1.70, 'Jayanagar': 1.50,
        'Whitefield': 1.30, 'HSR Layout': 1.40, 'Bellandur': 1.25, 
        'Marathahalli': 1.10, 'Electronic City': 0.90
    },
    'Hyderabad': {
        'Jubilee Hills': 2.00, 'Banjara Hills': 1.90, 'HITEC City': 1.60,
        'Madhapur': 1.50, 'Gachibowli': 1.40, 'Kondapur': 1.30, 'Kukatpally': 1.00
    },
    'Chennai': {
        'Adyar': 1.80, 'T Nagar': 1.70, 'Mylapore': 1.60, 'Anna Nagar': 1.50,
        'Thiruvanmiyur': 1.40, 'Velachery': 1.20, 'OMR': 1.00
    },
    'Pune': {
        'Koregaon Park': 1.90, 'Kalyani Nagar': 1.75, 'Viman Nagar': 1.50,
        'Baner': 1.40, 'Kothrud': 1.35, 'Balewadi': 1.30, 'Kharadi': 1.20,
        'Wakad': 1.20, 'Hinjewadi': 1.15, 'Magarpatta': 1.25
    }
}

# Flatten zones for encoding later
all_zones = []
for c, zs in city_zones.items():
    all_zones.extend(list(zs.keys()))

city_names = list(cities.keys())
city_probs = [0.25, 0.20, 0.20, 0.12, 0.10, 0.13]  # Weighted by real estate activity

# ─── Property Types ───────────────────────────────────────────────────────────
prop_types = ['apartment', 'villa', 'studio', 'house', 'plot', 'commercial']
prop_type_weights = [0.55, 0.08, 0.10, 0.12, 0.07, 0.08]

# ─── Listing Types ────────────────────────────────────────────────────────────
listing_types = ['sale', 'rent']
listing_probs = [0.55, 0.45]

# ─── Furnishing ───────────────────────────────────────────────────────────────
furnishing_types = ['unfurnished', 'semi-furnished', 'fully-furnished']
furnishing_weights = [0.25, 0.45, 0.30]
furnishing_multipliers = {'unfurnished': 1.0, 'semi-furnished': 1.12, 'fully-furnished': 1.28}

# ─── Floor Factor ─────────────────────────────────────────────────────────────
def floor_factor(floor, total_floors):
    if total_floors == 0:
        return 1.0
    ratio = floor / total_floors
    return 0.95 + ratio * 0.12

# ─── Metro Proximity ──────────────────────────────────────────────────────────
# Assume some zones in each city have metro access
metro_zones = {
    'Andheri', 'Goregaon', 'Malad', 'Borivali', 'South Delhi', 'Connaught Place',
    'Gurgaon', 'Noida', 'Dwarka', 'Indiranagar', 'Jayanagar', 'HITEC City', 
    'Madhapur', 'Anna Nagar', 'Baner', 'Hinjewadi'
}

# ─── Sample Generation ────────────────────────────────────────────────────────
records = []
for _ in range(N):
    city = np.random.choice(city_names, p=city_probs)
    city_mult = cities[city]
    
    zone = np.random.choice(list(city_zones[city].keys()))
    zone_mult = city_zones[city][zone]

    prop_type = np.random.choice(prop_types, p=prop_type_weights)
    listing_type = np.random.choice(listing_types, p=listing_probs)
    furnishing = np.random.choice(furnishing_types, p=furnishing_weights)
    furn_mult = furnishing_multipliers[furnishing]

    # BHK
    if prop_type == 'studio':
        bhk = 1
    elif prop_type in ('commercial', 'plot'):
        bhk = 0
    else:
        bhk = np.random.choice([1, 2, 3, 4, 5], p=[0.15, 0.45, 0.28, 0.09, 0.03])

    # Area in sq ft
    if prop_type == 'plot':
        area = int(np.random.uniform(600, 5000))
    elif prop_type == 'commercial':
        area = int(np.random.uniform(250, 6000))
    elif prop_type == 'villa':
        area = int(np.clip(np.random.normal(2800, 700), 1200, 8000))
    elif prop_type == 'studio':
        area = int(np.clip(np.random.normal(450, 100), 250, 700))
    else:
        base_area = 400 + bhk * 300
        area = int(np.clip(np.random.normal(base_area, 150), 300, 4000))

    # Age
    age = np.random.randint(0, 40)
    age_factor = max(0.65, 1.0 - age * 0.01)

    # Amenities (0-10 count)
    amenities_count = int(np.clip(np.random.normal(5, 3), 0, 10))
    amenity_mult = 1.0 + amenities_count * 0.03

    # Bathrooms
    bathrooms = max(1, min(bhk, 5)) if bhk > 0 else 1

    # Floor effect
    if prop_type in ('apartment', 'villa', 'studio', 'house'):
        total_floors = int(np.clip(np.random.normal(12, 8), 2, 50))
        floor = np.random.randint(0, total_floors + 1)
        fl_factor = floor_factor(floor, total_floors)
    else:
        fl_factor = 1.0
        floor = 0
        total_floors = 1

    # Metro proximity bonus (4%)
    metro_bonus = 1.04 if zone in metro_zones else 1.0

    # ─── Base price calculation ─────────────────────────────────────────────
    if listing_type == 'sale':
        if prop_type == 'studio':
            base_per_sqft = np.random.normal(6000, 800)
        elif prop_type == 'plot':
            base_per_sqft = np.random.normal(4000, 1000)
        elif prop_type == 'commercial':
            base_per_sqft = np.random.normal(8000, 1500)
        elif prop_type == 'villa':
            base_per_sqft = np.random.normal(7500, 800)
        else:
            base_psf = {1: 5500, 2: 6000, 3: 6500, 4: 7500, 5: 8500}
            base_per_sqft = np.random.normal(base_psf.get(bhk, 6000), 500)

        price = (base_per_sqft * area * city_mult * zone_mult * furn_mult *
                 age_factor * amenity_mult * fl_factor * metro_bonus)
        price = max(1500000, price)  # Min ₹15L

    else:  # rent
        if prop_type == 'studio':
            base_rent = np.random.normal(12000, 2000)
        elif prop_type == 'commercial':
            base_rent = np.random.normal(40000, 15000)
        elif prop_type == 'villa':
            base_rent = np.random.normal(80000, 20000)
        else:
            rent_base = {1: 10000, 2: 15000, 3: 22000, 4: 35000, 5: 50000}
            base_rent = np.random.normal(rent_base.get(bhk, 15000), 2000)

        price = (base_rent * city_mult * zone_mult * furn_mult * amenity_mult *
                 (area / 900 + 0.5) * metro_bonus)
        price = max(5000, price)

    price = round(price / 100) * 100  # round to nearest ₹100

    records.append({
        'city': city,
        'zone': zone,
        'prop_type': prop_type,
        'listing_type': listing_type,
        'furnishing': furnishing,
        'bhk': bhk,
        'area': area,
        'bathrooms': bathrooms,
        'age': age,
        'amenities_count': amenities_count,
        'floor': floor,
        'total_floors': total_floors,
        'has_metro': int(zone in metro_zones),
        'price': price
    })

df = pd.DataFrame(records)
print(f"[OK] Synthetic dataset generated: {len(df):,} records across {len(cities)} cities and {len(all_zones)} zones")

# ─── Feature Encoding ──────────────────────────────────────────────────────
le_city = LabelEncoder()
le_zone = LabelEncoder()
le_type = LabelEncoder()
le_listing = LabelEncoder()
le_furn = LabelEncoder()

df['city_enc'] = le_city.fit_transform(df['city'])
df['zone_enc'] = le_zone.fit_transform(df['zone'])
df['prop_type_enc'] = le_type.fit_transform(df['prop_type'])
df['listing_type_enc'] = le_listing.fit_transform(df['listing_type'])
df['furnishing_enc'] = le_furn.fit_transform(df['furnishing'])

FEATURES = [
    'city_enc', 'zone_enc', 'prop_type_enc', 'listing_type_enc', 'furnishing_enc',
    'bhk', 'area', 'bathrooms', 'age', 'amenities_count',
    'floor', 'total_floors', 'has_metro'
]
TARGET = 'price'

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

print("\n[...] Training Pan-India Gradient Boosting Regressor (Properties)...")
gb_model = GradientBoostingRegressor(
    n_estimators=800, max_depth=9, learning_rate=0.08,
    min_samples_split=6, min_samples_leaf=3, subsample=0.9, random_state=42
)
gb_model.fit(X_train, y_train)

y_pred_gb = gb_model.predict(X_test)

# --- Regression Metrics ---
r2_gb = r2_score(y_test, y_pred_gb)
rmse_gb = np.sqrt(mean_squared_error(y_test, y_pred_gb))
mae_gb = mean_absolute_error(y_test, y_pred_gb)
mape_gb = mean_absolute_percentage_error(y_test, y_pred_gb)

# --- Classification Metrics (Threshold > Median Price) ---
median_price = np.median(y)
y_test_binary = (y_test > median_price).astype(int)
y_pred_binary = (y_pred_gb > median_price).astype(int)
y_pred_proba = y_pred_gb / np.max(y_pred_gb)

acc_gb = accuracy_score(y_test_binary, y_pred_binary)
prec_gb = precision_score(y_test_binary, y_pred_binary)
rec_gb = recall_score(y_test_binary, y_pred_binary)
f1_gb = f1_score(y_test_binary, y_pred_binary)
auc_gb = roc_auc_score(y_test_binary, y_pred_proba)

# --- Tolerance Accuracy (±10%) ---
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
print("  MODEL EVALUATION METRICS (Properties Pan-India)")
print("="*65)
print("  --- Regression Metrics ---")
print("  R2 Score           : {:.4f}   (target >= 0.95)".format(r2_gb))
print("  RMSE               : Rs.{:,.0f}".format(rmse_gb))
print("  MAE                : Rs.{:,.0f}".format(mae_gb))
print("  MAPE               : {:.2f}%".format(mape_gb * 100))
print("\n  --- Classification Metrics (Threshold: Price > Rs.{:,.0f}) ---".format(median_price))
print("  Accuracy           : {:.4f}".format(acc_gb))
print("  Precision          : {:.4f}".format(prec_gb))
print("  Recall             : {:.4f}".format(rec_gb))
print("  F1 Score           : {:.4f}".format(f1_gb))
print("  ROC AUC            : {:.4f}".format(auc_gb))
print("\n  --- Practical Business Metrics ---")
print("  Tolerance Accuracy : {:.2f}% of predictions within ±10% of actual".format(tol_acc * 100))
print("="*65)

# ─── Save Bundle ───────────────────────────────────────────────────────────
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
bundle = {
    'model': gb_model,
    'rf_model': rf_model,
    'le_city': le_city,
    'le_zone': le_zone,
    'le_type': le_type,
    'le_listing': le_listing,
    'le_furn': le_furn,
    'features': FEATURES,
    'cities': city_names,
    'zones': all_zones,
    'city_zones': city_zones,
    'metrics': {
        'r2': r2_gb,
        'rmse': rmse_gb,
        'mae': mae_gb,
        'rf_r2': r2_rf,
        'n_samples': N
    }
}
joblib.dump(bundle, model_path, compress=3)
print(f"\n[OK] Pan-India Property Model saved to: {model_path}")

# Update metadata
meta_path = os.path.join(os.path.dirname(__file__), 'metadata.json')
with open(meta_path, 'w') as f:
    json.dump({
        'cities': city_names,
        'city_multipliers': cities,
        'city_zones': city_zones,
        'metro_zones': list(metro_zones),
        'prop_types': prop_types,
        'listing_types': listing_types,
        'furnishing_types': furnishing_types,
        'features': FEATURES,
        'n_training_samples': N,
        'model_version': '3.0'
    }, f, indent=2)
