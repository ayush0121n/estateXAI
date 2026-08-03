"""
train_model.py
==============
Synthetic Pune Real Estate Dataset Generator & Random Forest Price Prediction Model Trainer.

Dataset: Synthetic data generated to match EstateXAi schema (Pune, Maharashtra).
Choice Rationale: No publicly available Pune-specific dataset matches all schema fields
  (amenities, furnishing, bhk, property_type) at adequate scale. Synthetic generation
  lets us fully control feature distributions, ensuring the model generalizes to real
  listing data at inference time. We tune the distributions using known Pune market stats
  (avg 2BHK price ₹1.2Cr in Wakad, rental ₹18k/month etc. from 99acres/MagicBricks).

Evaluation Metrics (printed at end of training):
  - R² Score on held-out test set
  - Root Mean Square Error (RMSE)
  - Mean Absolute Error (MAE)

Model: Random Forest Regressor (ensemble of 200 decision trees)
Output: model.pkl saved in same directory
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import os
import json

np.random.seed(42)
N = 5000  # Number of synthetic data points

# ─── City Zones (Pune) with base price multipliers ────────────────────────────
zones = {
    'Koregaon Park': 1.8,
    'Wakad': 1.2,
    'Baner': 1.4,
    'Hadapsar': 0.9,
    'Kothrud': 1.3,
    'Aundh': 1.35,
    'Hinjewadi': 1.1,
    'Kharadi': 1.15,
    'Viman Nagar': 1.25,
    'Undri': 0.85,
    'Pisoli': 0.8,
    'Pimpri': 0.9,
}
zone_names = list(zones.keys())
zone_multipliers = list(zones.values())
zone_probs = [1/len(zone_names)] * len(zone_names)

# ─── Property Types ────────────────────────────────────────────────────────────
prop_types = ['apartment', 'villa', 'studio', 'house', 'plot', 'commercial']
prop_type_weights = [0.55, 0.10, 0.10, 0.12, 0.07, 0.06]

# ─── Listing Types ─────────────────────────────────────────────────────────────
listing_types = ['sale', 'rent']
listing_probs = [0.55, 0.45]

# ─── Furnishing ────────────────────────────────────────────────────────────────
furnishing_types = ['unfurnished', 'semi-furnished', 'fully-furnished']
furnishing_weights = [0.3, 0.45, 0.25]
furnishing_multipliers = {'unfurnished': 1.0, 'semi-furnished': 1.1, 'fully-furnished': 1.25}

# ─── Sample Generation ────────────────────────────────────────────────────────
records = []
for _ in range(N):
    zone_idx = np.random.choice(len(zone_names), p=zone_probs)
    zone = zone_names[zone_idx]
    zone_mult = zone_multipliers[zone_idx]

    prop_type = np.random.choice(prop_types, p=prop_type_weights)
    listing_type = np.random.choice(listing_types, p=listing_probs)
    furnishing = np.random.choice(furnishing_types, p=furnishing_weights)
    furn_mult = furnishing_multipliers[furnishing]

    # BHK based on property type
    if prop_type == 'studio':
        bhk = 1
    elif prop_type in ('commercial', 'plot'):
        bhk = 0
    else:
        bhk = np.random.choice([1, 2, 3, 4], p=[0.15, 0.45, 0.3, 0.1])

    # Area in sq ft
    if prop_type == 'plot':
        area = np.random.randint(600, 4000)
    elif prop_type == 'commercial':
        area = np.random.randint(300, 5000)
    elif prop_type == 'villa':
        area = int(np.random.normal(2500, 600))
        area = max(1200, min(area, 6000))
    else:
        base_area = 400 + bhk * 300
        area = int(np.random.normal(base_area, 200))
        area = max(250, min(area, 3500))

    # Age (years)
    age = np.random.randint(0, 30)
    age_factor = max(0.7, 1.0 - age * 0.01)

    # Amenities count (out of 10)
    amenities_count = np.random.randint(0, 11)
    amenity_mult = 1.0 + amenities_count * 0.02

    # Bathrooms
    bathrooms = max(1, bhk) if bhk > 0 else 1

    # Base price
    if listing_type == 'sale':
        # Sale: in lakhs
        if prop_type == 'studio':
            base = np.random.normal(35, 8)
        elif prop_type == 'plot':
            base = np.random.normal(50, 20)
        elif prop_type == 'commercial':
            base = np.random.normal(80, 30)
        elif prop_type == 'villa':
            base = np.random.normal(200, 60)
        else:
            base = 25 + bhk * 25 + np.random.normal(0, 10)
        
        price = base * zone_mult * furn_mult * age_factor * amenity_mult * (area / 1000 + 0.3)
        price = max(15, price)
        price = price * 100000  # Convert lakhs to INR
    else:
        # Rent: per month in INR
        if prop_type == 'studio':
            base = np.random.normal(12000, 2000)
        elif prop_type == 'commercial':
            base = np.random.normal(40000, 15000)
        elif prop_type == 'villa':
            base = np.random.normal(80000, 20000)
        else:
            base = 8000 + bhk * 5000 + np.random.normal(0, 2000)
        
        price = base * zone_mult * furn_mult * amenity_mult * (area / 1000 + 0.5)
        price = max(5000, price)

    price = round(price, -2)  # round to nearest 100

    records.append({
        'zone': zone,
        'prop_type': prop_type,
        'listing_type': listing_type,
        'furnishing': furnishing,
        'bhk': bhk,
        'area': area,
        'bathrooms': bathrooms,
        'age': age,
        'amenities_count': amenities_count,
        'price': price
    })

df = pd.DataFrame(records)
print(f"[OK] Synthetic dataset generated: {len(df)} records")
print(df.describe())

# ─── Feature Encoding ─────────────────────────────────────────────────────────
le_zone = LabelEncoder()
le_type = LabelEncoder()
le_listing = LabelEncoder()
le_furn = LabelEncoder()

df['zone_enc'] = le_zone.fit_transform(df['zone'])
df['prop_type_enc'] = le_type.fit_transform(df['prop_type'])
df['listing_type_enc'] = le_listing.fit_transform(df['listing_type'])
df['furnishing_enc'] = le_furn.fit_transform(df['furnishing'])

FEATURES = ['zone_enc', 'prop_type_enc', 'listing_type_enc', 'furnishing_enc',
            'bhk', 'area', 'bathrooms', 'age', 'amenities_count']
TARGET = 'price'

X = df[FEATURES]
y = df[TARGET]

# ─── Train/Test Split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("\nTraining on %d samples, testing on %d samples" % (len(X_train), len(X_test)))

# ─── Random Forest Model ──────────────────────────────────────────────────────
rf_model = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

print("\n[...] Training Random Forest Regressor (200 trees)...")
rf_model.fit(X_train, y_train)

# ─── Evaluation ───────────────────────────────────────────────────────────────
y_pred = rf_model.predict(X_test)

r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)

print("\n" + "="*60)
print("MODEL EVALUATION METRICS")
print("="*60)
print(f"  R2 Score            : {r2:.4f}")
print(f"  RMSE (INR)          : {rmse:,.0f}")
print(f"  MAE  (INR)          : {mae:,.0f}")
print("="*60)
print("\n  Dataset: Synthetic Pune Real Estate (5,000 samples)")
print("  Model:   Random Forest Regressor (n_estimators=200)")

# ─── Feature Importance ───────────────────────────────────────────────────────
importances = dict(zip(FEATURES, rf_model.feature_importances_))
print("\n  Feature Importances:")
for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
    print("    %-25s: %.4f" % (feat, imp))

# ─── Save Model + Encoders ────────────────────────────────────────────────────
os.makedirs(os.path.dirname(__file__), exist_ok=True)
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump({
    'model': rf_model,
    'le_zone': le_zone,
    'le_type': le_type,
    'le_listing': le_listing,
    'le_furn': le_furn,
    'features': FEATURES,
    'metrics': {'r2': r2, 'rmse': rmse, 'mae': mae}
}, model_path)

# Save zone list for the FastAPI app
zone_info = {
    'zones': zone_names,
    'prop_types': prop_types,
    'listing_types': listing_types,
    'furnishing_types': furnishing_types
}
with open(os.path.join(os.path.dirname(__file__), 'metadata.json'), 'w') as f:
    json.dump(zone_info, f, indent=2)

print("\n[OK] Model saved to: %s" % model_path)
print("[OK] Training complete!")
