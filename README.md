# EstateXAi 🏠✨
### AI-Driven Real Estate & PG/Hostel Platform

A full-stack MERN web application for buying/renting properties and discovering PGs & Hostels, built with an AI-powered smart recommendation engine.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (already configured)

### 1. Backend Setup

```bash
cd backend
npm install
# .env is already configured with your MongoDB URI
npm run dev
# Server runs on http://localhost:5000
```

### 2. Seed the Database

```bash
cd backend
node scripts/seed.js
```

This creates:
- **Admin account**: `admin@estatexai.com` / `Admin@123`
- **Owner account**: `owner@estatexai.com` / `Owner@123`
- 6 sample Properties
- 5 sample PGs / Hostels

### 3. Frontend Setup

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
| Admin | admin@estatexai.com | Admin@123 |
| Owner | owner@estatexai.com | Owner@123 |

---

## 📁 Project Structure

```
estateXAI/
├── backend/
│   ├── models/          # User, Property, PG, Inquiry models
│   ├── routes/          # Auth, Property, PG, Inquiry, AI Recommendation, Admin
│   ├── middleware/       # JWT Auth middleware
│   ├── scripts/         # Seed script
│   ├── server.js        # Express server entry
│   └── .env             # Environment variables
│
└── frontend/
    └── src/
        ├── components/  # Navbar, Footer, ListingCard, ProtectedRoute
        ├── context/     # AuthContext (global state)
        ├── pages/       # Home, Properties, PGs, Detail pages, Auth, Dashboard
        └── utils/       # Axios API instance
```

---

## 🧠 AI Recommendation Engine

Located at `/api/recommendations/pgs`, it:
- Reads the logged-in user's `institution` or `workplace`
- Queries PGs with matching `nearbyInstitutions`
- Returns sorted results by rating

Set your institution during **Register** or **Profile** to get personalized PG suggestions!

---

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/properties` | List all properties (with filters) |
| GET | `/api/pgs` | List all PGs (with filters) |
| POST | `/api/properties` | Create property (owner/admin) |
| POST | `/api/pgs` | Create PG (owner/admin) |
| POST | `/api/inquiries` | Send inquiry |
| GET | `/api/recommendations/pgs` | AI PG recommendations |
| GET | `/api/admin/stats` | Admin statistics |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Framer Motion |
| Styling | Vanilla CSS (Glassmorphism + Dark Theme) |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth | JWT (7-day tokens) |
| Build Tool | Vite 7 |
| AI Engine | Custom proximity + keyword matching |

---

## 🏆 MCA Mini-Project — EstateXAi
Developed using **Google Antigravity** agentic coding for SBUP, Pune (2025-2026)
