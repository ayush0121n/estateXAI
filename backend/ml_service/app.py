"""
app.py  —  EstateXAi Price Prediction FastAPI Microservice
============================================================
Serves the trained Random Forest model for property price prediction.

Endpoint: POST /predict
  Body: { zone, prop_type, listing_type, furnishing, bhk, area, bathrooms, age, amenities_count }
  Returns: { predicted_price, confidence_low, confidence_high, range_label, model_r2 }

Run: uvicorn app:app --host 0.0.0.0 --port 8001 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os
import json

app = FastAPI(title="EstateXAi Price Prediction API", version="1.0.0")

# Allow requests from Node.js backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Model & Encoders ────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        "❌ model.pkl not found. Please run `python train_model.py` first!"
    )

bundle = joblib.load(MODEL_PATH)
model = bundle['model']
le_zone = bundle['le_zone']
le_type = bundle['le_type']
le_listing = bundle['le_listing']
le_furn = bundle['le_furn']
FEATURES = bundle['features']
METRICS = bundle.get('metrics', {})

with open(os.path.join(os.path.dirname(__file__), 'metadata.json')) as f:
    METADATA = json.load(f)

print(f"✅ Model loaded. R² = {METRICS.get('r2', 'N/A'):.4f}")

# ─── Request Schema ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    zone: str = Field(..., example="Baner")
    prop_type: str = Field(..., example="apartment")
    listing_type: str = Field(..., example="rent")
    furnishing: str = Field(default="semi-furnished", example="semi-furnished")
    bhk: int = Field(default=2, ge=0, le=10, example=2)
    area: int = Field(..., ge=100, le=20000, example=1200)
    bathrooms: int = Field(default=2, ge=1, le=10, example=2)
    age: int = Field(default=5, ge=0, le=100, example=5)
    amenities_count: int = Field(default=5, ge=0, le=10, example=5)

# ─── Predict Endpoint ─────────────────────────────────────────────────────────
@app.post("/predict")
def predict_price(req: PredictRequest):
    try:
        # Encode categoricals
        if req.zone not in le_zone.classes_:
            # Fall back to closest zone or use 'Baner' as default
            zone_enc = le_zone.transform(['Baner'])[0]
        else:
            zone_enc = le_zone.transform([req.zone])[0]

        if req.prop_type not in le_type.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown prop_type: {req.prop_type}. Valid: {list(le_type.classes_)}")
        if req.listing_type not in le_listing.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown listing_type: {req.listing_type}. Valid: {list(le_listing.classes_)}")
        if req.furnishing not in le_furn.classes_:
            raise HTTPException(status_code=422, detail=f"Unknown furnishing: {req.furnishing}. Valid: {list(le_furn.classes_)}")

        type_enc = le_type.transform([req.prop_type])[0]
        listing_enc = le_listing.transform([req.listing_type])[0]
        furn_enc = le_furn.transform([req.furnishing])[0]

        X = np.array([[
            zone_enc, type_enc, listing_enc, furn_enc,
            req.bhk, req.area, req.bathrooms, req.age, req.amenities_count
        ]])

        # Predict with all individual trees to compute confidence interval
        tree_predictions = np.array([tree.predict(X)[0] for tree in model.estimators_])
        predicted_price = np.mean(tree_predictions)
        std_dev = np.std(tree_predictions)

        # 80% confidence interval (±1.28 std dev)
        confidence_low = max(0, predicted_price - 1.28 * std_dev)
        confidence_high = predicted_price + 1.28 * std_dev

        def fmt(val):
            if req.listing_type == 'rent':
                return f"₹{val:,.0f}/month"
            # Convert to lakhs for sale
            lakhs = val / 100000
            if lakhs >= 100:
                crores = lakhs / 100
                return f"₹{crores:.2f} Cr"
            return f"₹{lakhs:.2f} L"

        return {
            "success": True,
            "predicted_price": round(predicted_price, -2),
            "confidence_low": round(confidence_low, -2),
            "confidence_high": round(confidence_high, -2),
            "predicted_label": fmt(predicted_price),
            "range_label": f"{fmt(confidence_low)} – {fmt(confidence_high)}",
            "listing_type": req.listing_type,
            "model_r2": round(METRICS.get('r2', 0), 4),
            "dataset_note": "Trained on 5,000 synthetic Pune market samples (see train_model.py)"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_r2": round(METRICS.get('r2', 0), 4),
        "model_rmse": round(METRICS.get('rmse', 0), 2),
        "available_zones": METADATA.get('zones', []),
        "available_prop_types": METADATA.get('prop_types', []),
    }

@app.get("/")
def root():
    return {"message": "EstateXAi Price Prediction Microservice. POST /predict for predictions, GET /health for status."}
