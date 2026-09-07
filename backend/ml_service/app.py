"""
app.py  —  EstateXAi Price Prediction FastAPI Microservice v3.0 (Pan-India)
===========================================================================
Serves two Gradient Boosting models:
1. Property Price Model
2. PG Rent Model

Endpoints:
- POST /predict (routes to property or pg based on 'category')
- GET /health
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import numpy as np
import os
import json

app = FastAPI(title="EstateXAi Price Prediction API v3.0", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Model Bundles ───────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
PROP_MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
PG_MODEL_PATH = os.path.join(BASE_DIR, 'pg_model.pkl')
META_PATH = os.path.join(BASE_DIR, 'metadata.json')

prop_bundle = None
pg_bundle = None
METADATA = {}

def load_models():
    global prop_bundle, pg_bundle, METADATA
    if os.path.exists(PROP_MODEL_PATH):
        prop_bundle = joblib.load(PROP_MODEL_PATH)
        print(f"[OK] Property Model loaded (R2: {prop_bundle['metrics']['r2']:.4f})")
    else:
        print("[WARN] Property Model not found.")

    if os.path.exists(PG_MODEL_PATH):
        pg_bundle = joblib.load(PG_MODEL_PATH)
        print(f"[OK] PG Model loaded (R2: {pg_bundle['metrics']['r2']:.4f})")
    else:
        print("[WARN] PG Model not found.")

    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            METADATA = json.load(f)

load_models()
METRO_ZONES = set(METADATA.get('metro_zones', []))

# ─── Request Schema ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    category: str = Field(default="property", description="property or pg")
    
    # Common / Property features
    city: str = Field(default="Pune", example="Mumbai")
    zone: Optional[str] = Field(default=None, example="Bandra")
    location: Optional[str] = Field(default=None, example="Bandra")
    prop_type: Optional[str] = Field(default="apartment", example="apartment")
    propertyType: Optional[str] = Field(default="apartment", example="apartment")
    listing_type: Optional[str] = Field(default="sale", example="sale")
    listingType: Optional[str] = Field(default="sale", example="sale")
    furnishing: str = Field(default="semi-furnished", example="semi-furnished")
    bhk: int = Field(default=2, ge=0, le=10, example=2)
    area: int = Field(default=1000, ge=100, le=20000, example=1200)
    bathrooms: int = Field(default=2, ge=1, le=10, example=2)
    age: int = Field(default=5, ge=0, le=100, example=5)
    amenities_count: int = Field(default=5, ge=0, le=20, example=5)
    floor: int = Field(default=3, ge=0, le=100, example=3)
    total_floors: int = Field(default=10, ge=1, le=150, example=10)

    # PG specific features
    sharing_type: int = Field(default=2, ge=1, le=10, example=2)
    gender_type: str = Field(default="unisex", example="male")
    has_food: int = Field(default=0, example=1)
    has_ac: int = Field(default=0, example=1)

# ─── Predict Endpoint ─────────────────────────────────────────────────────────
@app.post("/predict")
def predict_price(req: PredictRequest):
    if req.category == "pg":
        return predict_pg(req)
    else:
        return predict_property(req)

def predict_property(req: PredictRequest):
    if not prop_bundle:
        raise HTTPException(status_code=503, detail="Property model not loaded")

    try:
        model = prop_bundle['model']
        rf_model = prop_bundle.get('rf_model')
        le_city = prop_bundle['le_city']
        le_zone = prop_bundle['le_zone']
        le_type = prop_bundle['le_type']
        le_listing = prop_bundle['le_listing']
        le_furn = prop_bundle['le_furn']

        city_val = req.city
        zone_val = req.zone or req.location or 'Baner' # fallback
        prop_type_val = req.prop_type or req.propertyType or 'apartment'
        listing_type_val = req.listing_type or req.listingType or 'sale'
        
        # Validations and fallbacks
        if city_val not in le_city.classes_:
            city_val = 'Pune'
        
        # If zone is not found, fallback to a known zone in that city
        if zone_val not in le_zone.classes_:
            # naive fallback
            zone_val = prop_bundle['zones'][0] if prop_bundle.get('zones') else 'Baner'
            
        if prop_type_val not in le_type.classes_:
            prop_type_val = 'apartment'
        if listing_type_val not in le_listing.classes_:
            listing_type_val = 'sale'
        furn_val = req.furnishing if req.furnishing in le_furn.classes_ else 'semi-furnished'

        # Encodings
        city_enc = le_city.transform([city_val])[0]
        zone_enc = le_zone.transform([zone_val])[0]
        type_enc = le_type.transform([prop_type_val])[0]
        listing_enc = le_listing.transform([listing_type_val])[0]
        furn_enc = le_furn.transform([furn_val])[0]
        has_metro = int(zone_val in METRO_ZONES)

        X = np.array([[
            city_enc, zone_enc, type_enc, listing_enc, furn_enc,
            req.bhk, req.area, req.bathrooms, req.age,
            req.amenities_count, req.floor, req.total_floors, has_metro
        ]])

        predicted_price = model.predict(X)[0]

        # Confidence interval
        if rf_model is not None:
            try:
                tree_preds = np.array([tree.predict(X)[0] for tree in rf_model.estimators_])
                std_dev = np.std(tree_preds)
            except Exception:
                std_dev = predicted_price * 0.12
        else:
            std_dev = predicted_price * 0.12

        confidence_low = max(0, predicted_price - 1.28 * std_dev)
        confidence_high = predicted_price + 1.28 * std_dev

        def fmt(val):
            if listing_type_val == 'rent':
                return f"₹{val:,.0f}/month"
            lakhs = val / 100000
            if lakhs >= 100:
                return f"₹{lakhs / 100:.2f} Cr"
            return f"₹{lakhs:.2f} L"

        return {
            "success": True,
            "category": "property",
            "predicted_price": round(predicted_price, -2),
            "confidence_low": round(confidence_low, -2),
            "confidence_high": round(confidence_high, -2),
            "predicted_label": fmt(predicted_price),
            "range_label": f"{fmt(confidence_low)} – {fmt(confidence_high)}",
            "listing_type": listing_type_val,
            "model_r2": round(prop_bundle['metrics']['r2'], 4),
            "engine": "Property GradientBoosting v3.0 (Pan-India)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Property prediction error: {str(e)}")

def predict_pg(req: PredictRequest):
    if not pg_bundle:
        raise HTTPException(status_code=503, detail="PG model not loaded")
        
    try:
        model = pg_bundle['model']
        rf_model = pg_bundle.get('rf_model')
        le_city = pg_bundle['le_city']
        le_zone = pg_bundle['le_zone']
        le_gender = pg_bundle['le_gender']
        
        city_val = req.city
        zone_val = req.zone or req.location or 'Baner'
        gender_val = req.gender_type.lower()
        
        if city_val not in le_city.classes_:
            city_val = 'Pune'
            
        if zone_val not in le_zone.classes_:
            zone_val = le_zone.classes_[0]
            
        if gender_val not in le_gender.classes_:
            gender_val = 'unisex'
            
        city_enc = le_city.transform([city_val])[0]
        zone_enc = le_zone.transform([zone_val])[0]
        gender_enc = le_gender.transform([gender_val])[0]
        
        X = np.array([[
            city_enc, zone_enc, req.sharing_type, gender_enc,
            req.amenities_count, req.has_food, req.has_ac
        ]])
        
        predicted_price = model.predict(X)[0]
        
        # Confidence interval
        if rf_model is not None:
            try:
                tree_preds = np.array([tree.predict(X)[0] for tree in rf_model.estimators_])
                std_dev = np.std(tree_preds)
            except Exception:
                std_dev = predicted_price * 0.12
        else:
            std_dev = predicted_price * 0.12

        confidence_low = max(0, predicted_price - 1.28 * std_dev)
        confidence_high = predicted_price + 1.28 * std_dev
        
        def fmt(val):
            return f"₹{val:,.0f}/month"
            
        return {
            "success": True,
            "category": "pg",
            "predicted_price": round(predicted_price, -2),
            "confidence_low": round(confidence_low, -2),
            "confidence_high": round(confidence_high, -2),
            "predicted_label": fmt(predicted_price),
            "range_label": f"{fmt(confidence_low)} – {fmt(confidence_high)}",
            "listing_type": "rent",
            "model_r2": round(pg_bundle['metrics']['r2'], 4),
            "engine": "PG GradientBoosting v3.0 (Pan-India)"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PG prediction error: {str(e)}")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": METADATA.get('model_version', '3.0'),
        "property_model_loaded": prop_bundle is not None,
        "pg_model_loaded": pg_bundle is not None,
        "available_cities": METADATA.get('cities', [])
    }

@app.post("/reload")
def reload():
    load_models()
    return {"status": "Models reloaded"}
