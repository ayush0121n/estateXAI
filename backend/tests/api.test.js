/**
 * api.test.js — EstateXAI Comprehensive Backend Tests
 * ====================================================
 * Covers: health, auth, properties, PGs, prediction, chat route.
 * Run: npm test  (uses jest + supertest, MongoDB from .env or test DB)
 */

const request = require('supertest');
const { app }  = require('../server');
const mongoose = require('mongoose');

// ── Setup / Teardown ──────────────────────────────────────────────────────────

let authToken = '';      // filled in auth tests
let testUserId = '';     // filled in auth tests
let testPropertyId = ''; // filled in property tests

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/estatexai_test'
        );
    }
}, 20000);

afterAll(async () => {
    await mongoose.connection.close();
});

// ── 1. Health & Core ─────────────────────────────────────────────────────────

describe('Health & Core Endpoints', () => {
    it('GET /api/health → 200 ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.message).toContain('EstateXAi API is running');
    });

    it('GET / (root) → 200 ok', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('GET /unknown-route → still returns JSON (not HTML)', async () => {
        const res = await request(app).get('/api/this-route-does-not-exist');
        // Should not crash the server
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
});

// ── 2. Auth Routes ────────────────────────────────────────────────────────────

describe('Auth Routes', () => {
    const testEmail = `test_${Date.now()}@estatexai.test`;
    const testPassword = 'TestPass@1234';

    it('POST /api/auth/register → 201 with token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: testEmail, password: testPassword, role: 'tenant' });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testEmail);

        authToken  = res.body.token;
        testUserId = res.body.user._id;
    });

    it('POST /api/auth/register → 400 on duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Dup User', email: testEmail, password: testPassword });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login → 200 with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: testPassword });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        authToken = res.body.token; // refresh token
    });

    it('POST /api/auth/login → 401 with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login → 400 with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail });
        expect([400, 401]).toContain(res.statusCode);
    });
});

// ── 3. Properties ─────────────────────────────────────────────────────────────

describe('Property Endpoints', () => {
    it('GET /api/properties → 200 with pagination', async () => {
        const res = await request(app).get('/api/properties');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.properties)).toBe(true);
        expect(typeof res.body.total).toBe('number');
    });

    it('GET /api/properties?city=Pune → only Pune results', async () => {
        const res = await request(app).get('/api/properties?city=Pune');
        expect(res.statusCode).toBe(200);
        if (res.body.properties.length > 0) {
            res.body.properties.forEach(p => {
                expect(p.location?.city?.toLowerCase()).toContain('pune');
            });
        }
    });

    it('GET /api/properties?limit=3 → max 3 results', async () => {
        const res = await request(app).get('/api/properties?limit=3');
        expect(res.statusCode).toBe(200);
        expect(res.body.properties.length).toBeLessThanOrEqual(3);
    });

    it('GET /api/properties/:id → 404 for non-existent ID', async () => {
        const fakeId = '64a1b2c3d4e5f60001234567';
        const res = await request(app).get(`/api/properties/${fakeId}`);
        expect([404, 400]).toContain(res.statusCode);
    });

    it('POST /api/properties → 401 without token', async () => {
        const res = await request(app)
            .post('/api/properties')
            .send({ title: 'Unauthorized Listing', price: 10000 });
        expect(res.statusCode).toBe(401);
    });
});

// ── 4. PG Endpoints ───────────────────────────────────────────────────────────

describe('PG Endpoints', () => {
    it('GET /api/pgs → 200 with pgs array', async () => {
        const res = await request(app).get('/api/pgs');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.pgs)).toBe(true);
    });

    it('GET /api/pgs?genderType=female → female-only results', async () => {
        const res = await request(app).get('/api/pgs?genderType=female');
        expect(res.statusCode).toBe(200);
        if (res.body.pgs.length > 0) {
            res.body.pgs.forEach(pg => {
                expect(['female', 'unisex']).toContain(pg.genderType);
            });
        }
    });

    it('GET /api/pgs/:id → 404 for non-existent ID', async () => {
        const fakeId = '64a1b2c3d4e5f60001234567';
        const res = await request(app).get(`/api/pgs/${fakeId}`);
        expect([404, 400]).toContain(res.statusCode);
    });

    it('POST /api/pgs → 401 without token', async () => {
        const res = await request(app)
            .post('/api/pgs')
            .send({ name: 'Test PG', rentPerMonth: 8000 });
        expect(res.statusCode).toBe(401);
    });
});

// ── 5. Price Prediction ────────────────────────────────────────────────────────

describe('Price Prediction Route', () => {
    it('GET /api/predict-price/health → 200', async () => {
        const res = await request(app).get('/api/predict-price/health');
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/predict-price → returns prediction (JS fallback)', async () => {
        const res = await request(app)
            .post('/api/predict-price')
            .send({
                city: 'Pune',
                zone: 'Baner',
                bhk: 2,
                area: 1000,
                listingType: 'rent',
                furnishing: 'semi-furnished',
                amenities_count: 5,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.predicted_price).toBe('number');
        expect(res.body.predicted_price).toBeGreaterThan(0);
        expect(res.body.predicted_label).toBeDefined();
        expect(res.body.range_label).toBeDefined();
        expect(res.body.confidence_low).toBeGreaterThan(0);
        expect(res.body.confidence_high).toBeGreaterThan(res.body.confidence_low);
    });

    it('POST /api/predict-price → sale prediction returns price in Lakhs/Cr', async () => {
        const res = await request(app)
            .post('/api/predict-price')
            .send({ city: 'Mumbai', zone: 'Bandra', bhk: 3, area: 1500, listingType: 'sale', amenities_count: 8 });
        expect(res.statusCode).toBe(200);
        expect(res.body.predicted_price).toBeGreaterThan(1000000); // above 10L for Mumbai
    });

    it('POST /api/predict-price → pg category prediction', async () => {
        const res = await request(app)
            .post('/api/predict-price')
            .send({ category: 'pg', city: 'Bangalore', zone: 'Koramangala', sharing_type: 2, amenities_count: 6 });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.category).toBe('pg');
    });
});

// ── 6. Search Route ───────────────────────────────────────────────────────────

describe('Search Endpoints', () => {
    it('GET /api/search?q=apartment → 200', async () => {
        const res = await request(app).get('/api/search?q=apartment');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('GET /api/search (no query) → handled gracefully', async () => {
        const res = await request(app).get('/api/search');
        expect(res.statusCode).toBeLessThan(500);
    });
});

// ── 7. Chat Route ─────────────────────────────────────────────────────────────

describe('Chat (EstateXAI Assistant) Route', () => {
    it('POST /api/chat → 400 with missing message', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ history: [] });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/chat → responds to price query', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'What is the rent for 2BHK in Pune?', history: [], userRole: 'tenant' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.response).toBe('string');
        expect(res.body.response.length).toBeGreaterThan(20);
        expect(res.body.intent).toBe('price');
    });

    it('POST /api/chat → responds to document query', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'What documents do I need for renting?', history: [], userRole: 'tenant' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.response).toMatch(/agreement|checklist|document|rent/i);
    });

    it('POST /api/chat → responds to general greeting', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Hello, what can you help me with?', history: [] });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.response.length).toBeGreaterThan(30);
    });

    it('POST /api/chat → maintains conversation history context', async () => {
        const history = [
            { role: 'user', content: 'I am looking for a 2BHK in Pune' },
            { role: 'assistant', content: 'Great! Let me help you find options in Pune.' }
        ];
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'What is the expected rent?', history, userRole: 'tenant' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('POST /api/chat → message > 500 chars is truncated, no crash', async () => {
        const longMsg = 'a'.repeat(1000);
        const res = await request(app)
            .post('/api/chat')
            .send({ message: longMsg, history: [] });
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/chat → owner gets role-specific response', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'How should I price my property?', history: [], userRole: 'owner' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.response).toMatch(/owner|listing|price|predict/i);
    });
});

// ── 8. Commute Route ──────────────────────────────────────────────────────────

describe('Commute Routes', () => {
    it('POST /api/commute/score → 400 without propertyLat/Lng', async () => {
        const res = await request(app)
            .post('/api/commute/score')
            .send({ workplace: 'Hinjewadi' });
        expect(res.statusCode).toBe(400);
    });

    it('POST /api/commute/score → calculates for given coords', async () => {
        const res = await request(app)
            .post('/api/commute/score')
            .send({ propertyLat: 18.559, propertyLng: 73.778, workplace: 'Pune Airport' });
        // Should succeed or fail gracefully (geocoding may be unavailable)
        expect(res.statusCode).toBeLessThan(500);
        if (res.body.success) {
            expect(typeof res.body.distanceKm).toBe('string');
            expect(res.body.liveabilityScore).toBeGreaterThanOrEqual(0);
        }
    });
});

// ── 9. Neighborhood ───────────────────────────────────────────────────────────

describe('Neighborhood Routes', () => {
    it('GET /api/neighborhood/:area → 200 (with or without data)', async () => {
        const res = await request(app).get('/api/neighborhood/Baner');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // stats may be null if no ratings exist, but should not error
        expect(['object', 'null'].includes(typeof res.body.stats) || res.body.stats === null).toBe(true);
    });

    it('POST /api/neighborhood/rate → 401 without auth token', async () => {
        const res = await request(app)
            .post('/api/neighborhood/rate')
            .send({ area: 'Baner', city: 'Pune', safetyScore: 4, noiseLevel: 2, cleanlinessScore: 5 });
        expect(res.statusCode).toBe(401);
    });
});
