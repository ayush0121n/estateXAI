# EstateXAI 🏠✨
### AI-Driven Real Estate, Co-Living & PG/Hostel Intelligence Platform

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://estate-xai.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://estatexai.onrender.com)
[![Test Suite](https://img.shields.io/badge/Tests-34%2F34%20Passing-brightgreen)](https://github.com/ayush0121n/estateXAI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live Demo URL:** [https://estate-xai.vercel.app/](https://estate-xai.vercel.app/)  
**Backend API URL:** [https://estatexai.onrender.com](https://estatexai.onrender.com)  
**API Documentation (Swagger):** [https://estatexai.onrender.com/api/docs](https://estatexai.onrender.com/api/docs)

EstateXAI is a full-stack, enterprise-grade real estate ecosystem built with the MERN stack + Python Scikit-Learn microservice. It bridges buyers, tenants, flatmates, and property owners with cutting-edge artificial intelligence: a hybrid recommendation engine, automated price prediction regressor, an interactive 8-domain real-world AI Assistant chatbot, dynamic auto-geocoding, and a complete digital rental toolkit.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+ (tested on Node v20/v22)
- Python 3.10+ (for FastAPI ML microservice)
- MongoDB Atlas cluster or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/ayush0121n/estateXAI.git
cd estateXAI
```

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure .env contains MONGO_URI, JWT_SECRET, PORT=5000
npm run dev
# Server runs on http://localhost:5000
```

### 3. ML Microservice Setup (Optional / Standalone)
> **Note:** The backend contains a high-accuracy, pure-JavaScript Random Forest inference fallback (`utils/jsPricePredictor.js`) with an R² of 0.83 so the platform operates fully even when the Python microservice is offline!
```bash
cd backend/ml_service
pip install -r requirements.txt
python train_model.py
uvicorn app:app --port 8001 --reload
# Microservice runs on http://localhost:8001
```

### 4. Seed Database (Demo Properties, PGs, Reviews, Users)
```bash
cd backend
node scripts/seed.js
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions & Capabilities |
|------|-------|----------|----------------------------|
| **Admin** | `admin@estatexai.com` | `Admin@123` | Full platform moderation, approving/rejecting listings, live platform analytics, feature flags |
| **Owner** | `owner@estatexai.com` | `Owner@123` | Listing creation, image uploads, lead inquiry tracking, property performance |
| **Tenant** | `tenant@estatexai.com` | `Tenant@123` | Roommate matching questionnaire, favorites, saved comparisons, rental toolkit |

---

## 🌟 Flagship Features

### 1. 🤖 EstateXAI Assistant — Problem-Solving AI Chatbot
A real-time intelligent assistant accessible across the entire application via a floating widget and dedicated showcase:
- **Price Fairness & Offer Advice:** Analyzes user bids against historical local data and gives negotiation leverage strategies.
- **Hidden Cost Estimation:** Computes stamp duty, registration fees, GST, maintenance deposits, and brokerage.
- **Lease & Legal Clarity:** Explains standard lease clauses, security deposit refund terms, lock-in periods, and tenant rights.
- **Location & Commute Scoring:** Evaluates connectivity to IT corridors (Hinjawadi, Magarpatta, Kharadi, Cyber City) with commute modes.
- **Roommate Conflict Solver:** Actionable mediation frameworks for chore schedules, late utility payments, and guest policies.
- **Deposit Recovery Strategies:** Formatted legal notice templates and step-by-step procedures for claiming withheld deposits.
- **Smart Property Recommendations:** Natural-language search parsing budgets, cities, BHKs, and sharing preferences.
- **Maintenance & Dispute Resolution:** Guidance on landlord vs. tenant repair obligations.

### 2. 📑 Digital Rental Toolkit & Lifecycle Suite
- **Interactive Agreement Generator:** Generates legally structured 11-month residential lease agreements dynamically populated with tenant/landlord details.
- **Multi-Period Rent Receipts:** Automated rent receipt generation complete with revenue stamp formatting, transaction IDs, and PAN fields for HRA tax exemptions.
- **Client-Side PDF Export:** Instant high-resolution print and download powered by `jsPDF`.

### 3. 🎯 Hybrid Recommendation Engine
- **Content-Based Filtering:** Vector similarity calculations measuring cosine distance across BHK, pricing, zone metrics, furnishing, and amenities.
- **Collaborative Filtering:** Real-time user interaction graph tracking clicks, bookmarks, detail views, and inquiries.
- **Hybrid Scoring Formula:** Weighted synthesis ($0.6 \times \text{Content} + 0.4 \times \text{Collaborative}$) with intelligent cold-start fallback.

### 4. 📈 Real Estate Price Prediction & CMA
- **Model:** Random Forest Regressor ($n=200$, $\text{max\_depth}=20$) achieving **82.92% $R^2$ accuracy**.
- **Interactive Dashboard:** Recharts Comparative Market Analysis (CMA) graph displaying predicted price, 80% confidence interval, and comparable nearby properties.
- **Resilient Dual-Engine:** Automatic fallback to embedded JS inference engine if Python microservice is sleeping.

### 5. 🗺️ Location Intelligence & Auto-Geocoding
- **Silent Nominatim Geocoding:** Automatically translates textual listing addresses into high-precision Latitude/Longitude coordinates upon creation.
- **Interactive Leaflet Maps:** Custom map pins, radius filters, POI density indicators, Walkability Score, and direct Google Street View deep links.

### 6. 🤝 Roommate Compatibility Matcher
- **Lifestyle Alignment:** Matches users by daily schedule, food habits, smoking/drinking preferences, cleanliness, and work-from-home styles.
- **Direct WhatsApp & Email Connect:** Instant encrypted outreach to compatible flatmates.

---

## ⚙️ REST API Architecture & Endpoints

### Authentication & Profiles
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register new user account with role selection | Public |
| `POST` | `/api/auth/login` | Authenticate user and issue 7-day JWT token | Public |
| `GET` | `/api/user/profile` | Retrieve user profile, preferences, and saved items | Authenticated |
| `PUT` | `/api/user/profile` | Update user lifestyle questionnaire and bio | Authenticated |

### Listings & Search
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/properties` | Filtered property listings with pagination & sorting | Public |
| `GET` | `/api/properties/:id` | Property detail view (logs user interaction) | Public |
| `POST` | `/api/properties` | Create property listing with auto-geocoding & image upload | Owner / Admin |
| `PATCH` | `/api/properties/:id/approve`| Admin review & moderation workflow | Admin |
| `GET` | `/api/pgs` | Filtered PG / Co-living listings with sharing filters | Public |
| `GET` | `/api/search` | Unified global full-text search across all inventories | Public |

### AI, Chatbot & Recommendations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/chat` | EstateXAI Assistant 8-domain real-world AI reasoning | Public |
| `POST` | `/api/predict-price` | AI Price Prediction Regressor (FastAPI + JS fallback) | Public |
| `GET` | `/api/recommendations/properties`| Hybrid personalized property recommendations | Authenticated |
| `GET` | `/api/recommendations/pgs` | Hybrid personalized PG recommendations | Authenticated |

### Admin & Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/admin/analytics` | Platform metrics, listing distribution, traffic trends | Admin |
| `GET` | `/api/admin/moderation` | Moderation backlog for pending listings | Admin |
| `GET` | `/api/docs` | Interactive Swagger / OpenAPI documentation UI | Public |

---

## 🧪 Automated Testing & Quality Assurance

EstateXAI includes an extensive end-to-end integration test suite powered by Jest and Supertest with an isolated in-memory/test MongoDB instance.

```bash
cd backend
npm test
```

```
PASS tests/api.test.js (10.428 s)
  Authentication Endpoints
    ✓ POST /api/auth/register should create a user and return token (321 ms)
    ✓ POST /api/auth/login should authenticate valid user (189 ms)
    ✓ POST /api/auth/login should reject invalid credentials (142 ms)
  Property Endpoints
    ✓ GET /api/properties should return listing array (85 ms)
    ✓ POST /api/properties should create listing when authenticated (212 ms)
    ✓ GET /api/properties/:id should return single listing (98 ms)
  AI Chatbot Endpoints
    ✓ POST /api/chat should provide fairness, legal, and negotiation guidance (115 ms)
  Price Prediction Endpoints
    ✓ POST /api/predict-price should return predicted price and confidence interval (145 ms)
  ...
  Test Suites: 1 passed, 1 total
  Tests:       34 passed, 34 total
  Snapshots:   0 total
  Time:        10.65 s
```

---

## 🎨 Tech Stack Matrix

| Domain | Technology / Library | Purpose & Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Blazing fast client bundle with hot module replacement |
| **Routing & Navigation** | React Router DOM v7 | Dynamic nested routes, protected role layouts |
| **UI & Styling** | Vanilla CSS + Glassmorphism | Bespoke design system with responsive cards and dark mode |
| **Animation** | Framer Motion | Fluid micro-interactions, modal popups, floating widgets |
| **Data Visualization** | Recharts | Comparative Market Analysis (CMA) and admin dashboards |
| **Mapping Engine** | Leaflet + OpenStreetMap | Interactive geospatial discovery with POI pins |
| **PDF Generation** | jsPDF | Client-side dynamic export for leases and rent receipts |
| **Backend Framework** | Node.js + Express 4 | High-performance asynchronous REST API |
| **Database & ODM** | MongoDB Atlas + Mongoose 9 | Scalable document data store with compound indexing |
| **Authentication** | JWT + bcryptjs | Secure stateless token authentication and password hashing |
| **Documentation** | Swagger UI + swagger-jsdoc | OpenAPI 3.0 interactive API documentation |
| **ML Microservice** | Python 3.10+ / FastAPI | Scikit-Learn Random Forest Regressor with 82.9% R² score |
| **Testing** | Jest + Supertest | 34 automated unit and integration tests |
| **Deployments** | Vercel (Front) & Render (Back)| High-availability automated CI/CD continuous deployment |

---

## 📄 Comprehensive Project Reports

The repository includes the complete, university-formatted project documentation generated automatically with all system architecture diagrams, database schemas, screenshots, and evaluation tables:
- **Microsoft Word Document:** [`estateXAI_Project_Report.docx`](./estateXAI_Project_Report.docx) (12 MB)
- **Adobe PDF Document:** [`estateXAI_Project_Report.pdf`](./estateXAI_Project_Report.pdf) (3.1 MB)

---

## 👥 Authors & Acknowledgements
- **Lead Developer:** Ayush Nandwana ([@ayush0121n](https://github.com/ayush0121n))
- **Project Repository:** [https://github.com/ayush0121n/estateXAI](https://github.com/ayush0121n/estateXAI)

Licensed under the [MIT License](./LICENSE).
