"""
app.py  —  EstateXAi Price Prediction FastAPI Microservice v2.0
================================================================
Uses a Gradient Boosting primary model + Random Forest for confidence intervals.
Dataset: 15,000 synthetic Pune samples across 25 localities.

Endpoint: POST /predict
  Body: { zone, prop_type, listing_type, furnishing, bhk, area, bathrooms, age, amenities_count, floor?, total_floors? }
  Returns: { success, predicted_price, confidence_low, confidence_high, predicted_label, range_label, model_r2, engine }

Run: uvicorn app:app --host 0.0.0.0 --port 8001 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import numpy as np
import os
import json

app = FastAPI(title="EstateXAi Price Prediction API v2.0", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Model Bundle ────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("model.pkl not found. Run `python train_model.py` first!")

bundle = joblib.load(MODEL_PATH)
model = bundle['model']                         # GradientBoosting (primary)
rf_model = bundle.get('rf_model')              # RandomForest (confidence intervals)
le_zone = bundle['le_zone']
le_type = bundle['le_type']
le_listing = bundle['le_listing']
le_furn = bundle['le_furn']
FEATURES = bundle['features']
METRICS = bundle.get('metrics', {})

META_PATH = os.path.join(os.path.dirname(__file__), 'metadata.json')
with open(META_PATH) as f:
    METADATA = json.load(f)

METRO_ZONES = set(METADATA.get('metro_zones', []))
print(f"[OK] Model v2.0 loaded. R2 = {METRICS.get('r2', 'N/A'):.4f} | {METRICS.get('n_samples', 0):,} training samples")

# ─── Request Schema ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    # Accept both old format (zone) and new format (location)
    zone: Optional[str] = Field(default=None, example="Baner")
    location: Optional[str] = Field(default=None, example="Baner")
    prop_type: Optional[str] = Field(default=None, example="apartment")
    propertyType: Optional[str] = Field(default=None, example="apartment")
    listing_type: Optional[str] = Field(default=None, example="rent")
    listingType: Optional[str] = Field(default=None, example="rent")
    furnishing: str = Field(default="semi-furnished", example="semi-furnished")
    bhk: int = Field(default=2, ge=0, le=10, example=2)
    area: int = Field(default=1000, ge=100, le=20000, example=1200)
    bathrooms: int = Field(default=2, ge=1, le=10, example=2)
    age: int = Field(default=5, ge=0, le=100, example=5)
    amenities_count: int = Field(default=5, ge=0, le=10, example=5)
    floor: int = Field(default=3, ge=0, le=60, example=3)
    total_floors: int = Field(default=10, ge=1, le=60, example=10)

# ─── Predict Endpoint ─────────────────────────────────────────────────────────
@app.post("/predict")
def predict_price(req: PredictRequest):
    try:
        # Handle field aliases (frontend sends location/propertyType/listingType)
        zone_val = req.zone or req.location or 'Baner'
        prop_type_val = req.prop_type or req.propertyType or 'apartment'
        listing_type_val = req.listing_type or req.listingType or 'sale'

        # Normalize known aliases
        if zone_val == 'Hadapsar':
            zone_val = 'Magarpatta'
        if prop_type_val in ('studio',):
            pass  # already fine
        if listing_type_val not in ['sale', 'rent']:
            listing_type_val = 'sale'

        # Encode zone (fallback to Baner if unknown)
        if zone_val not in le_zone.classes_:
            zone_enc = le_zone.transform(['Baner'])[0]
        else:
            zone_enc = le_zone.transform([zone_val])[0]

        if prop_type_val not in le_type.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown prop_type: {prop_type_val}. Valid: {list(le_type.classes_)}")
        if listing_type_val not in le_listing.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown listing_type: {listing_type_val}. Valid: {list(le_listing.classes_)}")
        if req.furnishing not in le_furn.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown furnishing: {req.furnishing}. Valid: {list(le_furn.classes_)}")

        type_enc = le_type.transform([prop_type_val])[0]
        listing_enc = le_listing.transform([listing_type_val])[0]
        furn_enc = le_furn.transform([req.furnishing])[0]
        has_metro = int(zone_val in METRO_ZONES)

        X = np.array([[
            zone_enc, type_enc, listing_enc, furn_enc,
            req.bhk, req.area, req.bathrooms, req.age,
            req.amenities_count, req.floor, req.total_floors, has_metro
        ]])

        # ── Primary prediction (Gradient Boosting) ────────────────────────
        predicted_price = model.predict(X)[0]

        # ── Confidence interval via Random Forest tree variance ───────────
        if rf_model is not None:
            # Check if RF was trained with same features
            try:
                tree_preds = np.array([tree.predict(X)[0] for tree in rf_model.estimators_])
                std_dev = np.std(tree_preds)
            except Exception:
                std_dev = predicted_price * 0.10
        else:
            # Fallback: use 10% as std_dev
            std_dev = predicted_price * 0.10

        # 80% confidence interval (±1.28σ)
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
            "predicted_price": round(predicted_price, -2),
            "confidence_low": round(confidence_low, -2),
            "confidence_high": round(confidence_high, -2),
            "predicted_label": fmt(predicted_price),
            "range_label": f"{fmt(confidence_low)} – {fmt(confidence_high)}",
            "listing_type": listing_type_val,
            "model_r2": round(METRICS.get('r2', 0), 4),
            "n_training_samples": METRICS.get('n_samples', 100000),
            "engine": "GradientBoosting v2.0 (100k samples, 25 zones)",
            "dataset_note": "Trained on 100,000 synthetic Pune market samples across 25 localities"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": "2.0",
        "engine": "GradientBoosting",
        "model_r2": round(METRICS.get('r2', 0), 4),
        "model_rmse": round(METRICS.get('rmse', 0), 2),
        "n_training_samples": METRICS.get('n_samples', 15000),
        "available_zones": METADATA.get('zones', []),
        "available_prop_types": METADATA.get('prop_types', []),
    }


@app.get("/")
def root():
    return {
        "message": "EstateXAi Price Prediction Microservice v2.0",
        "endpoints": {
            "POST /predict": "Predict property price",
            "GET /health": "Service health and model metadata"
        }
    }
