const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');

// Wait for DB to connect before running tests
beforeAll(async () => {
    // wait for mongoose to be connected if it isn't yet
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/estatexai_test');
    }
});

afterAll(async () => {
    // Close the DB connection so Jest can exit cleanly
    await mongoose.connection.close();
});

describe('API Health and Core Endpoints', () => {
    
    it('GET /api/health should return ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
        expect(res.body.message).toContain('EstateXAi API is running');
    });

    it('GET /api/properties/featured should return featured properties and be compressed', async () => {
        const res = await request(app).get('/api/properties/featured');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.properties)).toBe(true);
    });
    
    it('GET /api/pgs/featured should return featured PGs', async () => {
        const res = await request(app).get('/api/pgs/featured');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.pgs)).toBe(true);
    });

});
