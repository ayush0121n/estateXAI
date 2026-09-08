# EstateXAi 🏠✨
### AI-Driven Real Estate & PG/Hostel Platform

A full-stack MERN + Python ML web application for buying/renting properties and discovering PGs & Hostels, powered by a **Hybrid Recommendation Engine** and **Random Forest Price Prediction Microservice**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (configured in `backend/.env`)

### 1. ML Microservice Setup (Price Prediction)
```bash
cd backend/ml_service
pip install -r requirements.txt
python train_model.py
uvicorn app:app --port 8001 --reload
# Microservice runs on http://localhost:8001
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 3. Seed Database
```bash
cd backend
node scripts/seed.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Login Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | `admin@estatexai.com` | `Admin@123` |
| Owner | `owner@estatexai.com` | `Owner@123` |

## 🌟 Key Features

### 🏡 For Buyers & Tenants
- **AI Price Prediction Model**: Get accurate market value predictions based on historical property data and ML algorithms before you make an offer.
- **Smart Roommate Matcher (Tinder for Flatmates)**: Complete a lifestyle questionnaire (diet, smoking, sleep schedule) and instantly browse AI-matched compatible roommates.
- **AI Commute & Liveability Scorer**: Enter your workplace on any listing to instantly see the commute time (bike/auto/bus) and get an automated Liveability Score (0-100) based on distance and traffic.
- **Neighborhood Safety & Vibe Ratings**: Access community-driven ratings for safety, noise levels, and cleanliness for every neighborhood.
- **Advanced Filtering**: Search for properties and PGs using highly granular filters including rent, amenities, sharing type, and proximity to major institutions.
- **One-Click Comparison**: Save properties and compare them side-by-side on an interactive dashboard.
- **City-First Experience & Global State Synchronization**: Persistent global `userCity` state using local storage ensures users' preferred city synchronizes across Home, Properties, and PG feeds.
- **Role-Based Dashboard Overhaul**: Completely re-engineered dashboard with distinct views for tenants and property owners, including lead tracking, active listing performance, and saved items.
- **Intelligent Trust Score Engine**: Preliminary user Trust Score widget calculating reliability based on profile completeness (identity verification, work/college affiliation).
- **Enhanced Roommate Matching Algorithm**: Upgraded Flatmate Finder with advanced lifestyle metrics (WFH preferences, guest policies, noise tolerance) for higher accuracy compatibility scoring.
- **Digital Rental Toolkit (PDF Export)**: Professional `jsPDF`-powered Rental Agreement and Rent Receipt generators that export formatted, print-ready PDF documents dynamically populated with user data.
- **System Stability & Reliability**: Automated background health-check ping on the Node.js server preventing free-tier sleep during idle periods.

---

## 🤖 Modules Built (Report Section 2.5 Scope)

### Module 1: Property Recommendation Engine (Hybrid)
- **Content-Based Filtering**: Cosine similarity across property vectors (price, size, location, amenities, property type).
- **Collaborative Filtering**: Item-based similarity leveraging user interaction logs (`Interaction` model tracking views, favorites, inquiries). Cold-start users gracefully fall back to content-based scores.
- **Hybrid Scoring**: Weighted sum formula (`0.6 * ContentScore + 0.4 * CollaborativeScore`).

### Module 2: Price Prediction Module
- **Model**: Random Forest Regressor (`n_estimators=200`, `max_depth=20`) trained on 5,000 synthetic Pune real estate samples matching the schema.
- **Dataset Rationale**: Synthetic generation was chosen to strictly mirror our schema fields (BHK, sqft, furnishing, zone multipliers) based on Pune market stats (Wakad, Baner, KP, etc.).
- **Evaluation Metrics**:
  - **R² Score**: `0.8292` (82.92% variance explained)
  - **RMSE**: `₹8,363,232`
  - **MAE**: `₹2,632,019`
- **Serving**: FastAPI microservice on port 8001 proxied via Node.js `/api/predict-price`. Returns predicted price + 80% confidence interval.
- **Frontend**: Interactive "Estimate Price with AI" widget with Recharts Comparative Market Analysis chart.

### Module 3: Location Intelligence
- **Interactive Map**: OpenStreetMap / Leaflet integration with custom map pins for properties and POIs.
- **Neighborhood Analysis**: Nearby schools, hospitals, transport hubs, and shopping centres.
- **Scores**: Walkability Index & Connectivity Score calculated dynamically from POI density/proximity.
- **Future Development**: Admin-editable future infrastructure placeholder panel.

### Module 4: User Management & Real-Time Alerts
- User preferences (budget range, preferred property types, cities).
- Saved searches & persistent favorites.
- Socket.IO integration for real-time in-app alerts on listing status changes and new inquiries.

### Module 5: Property Management
- Image upload using `multer` with `Cloudinary` storage (falls back to local disk if Cloudinary keys aren't set).
- **Auto-Geocoding**: Silently intercepts user-submitted addresses and calls OpenStreetMap Nominatim API to generate exact Latitude/Longitude coordinates for all new properties/PGs.
- Admin approval workflow: `draft` → `pending` → `approved` → `live`.
- Side-by-side Property Comparison tool (`/compare`) for comparing up to 3 properties.

### Module 6: Admin Dashboard
- Recharts analytics: Listings created over time, property type breakdown, and most-viewed/favorited listings.
- Moderation queue: One-click approval/rejection of pending properties.
- System Configuration toggles (require verification, guest search, maintenance mode).

### Module 7: Advanced Search & Filtering
- Multi-filter search: keyword query, location, city, price range, BHK, and listing type.
- Sorting options: Relevance, Price (Asc/Desc), Newest, and Popularity.

### Module 8: Backend & Database Polish
- MongoDB indexing on compound queries (`location.city`, `price`, `status`, `isFeatured`).
- Swagger/OpenAPI documentation served at `/api/docs`.
- Rate limiting using `express-rate-limit` on public endpoints.

---

## ⚙️ Complete API Endpoints Table

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/properties` | List properties with multi-filters & pagination | No |
| GET | `/api/properties/:id` | Get property detail (logs view interaction) | Optional |
| POST | `/api/properties` | Create property (supports image upload) | Owner / Admin |
| PATCH | `/api/properties/:id/approve` | Approve or reject listing | Admin |
| GET | `/api/pgs` | List PGs with filters | No |
| GET | `/api/recommendations/pgs` | Hybrid PG recommendations | User |
| GET | `/api/recommendations/properties` | Hybrid Property recommendations | User |
| POST | `/api/predict-price` | AI Price Prediction (proxy to FastAPI) | No |
| GET | `/api/search` | Unified search across properties & PGs | No |
| GET | `/api/user/profile` | Get profile, saved items, & preferences | User |
| PUT | `/api/user/profile` | Update profile & preferences | User |
| POST | `/api/user/favorites/property/:id` | Toggle property favorite | User |
| GET | `/api/admin/analytics` | Admin analytics & charts data | Admin |
| GET | `/api/admin/moderation` | Moderation queue | Admin |
| GET | `/api/admin/config` | Get system config | Admin |
| PUT | `/api/admin/config` | Update system config | Admin |
| GET | `/api/docs` | Swagger OpenAPI documentation | No |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v7, Framer Motion, Recharts, Leaflet |
| Styling | Vanilla CSS (Glassmorphism + Dark Theme) |
| Backend | Node.js, Express 4, Socket.IO, Multer, Swagger UI |
| ML Microservice | Python 3.13, FastAPI, Uvicorn, Scikit-Learn, Pandas, Joblib |
| Database | MongoDB Atlas + Mongoose 9 |
| Auth | JWT (7-day tokens) |
| Storage | Cloudinary / Local Disk fallback |

---
