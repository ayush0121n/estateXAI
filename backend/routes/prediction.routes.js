const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

// Helper to make HTTP requests to the Python microservice
function proxyRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(ML_SERVICE_URL + path);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;

        const postData = body ? JSON.stringify(body) : null;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
            }
        };

        const req = lib.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: { error: data } });
                }
            });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

// @POST /api/predict-price
// Proxies to the FastAPI microservice.
// Body: { zone, prop_type, listing_type, furnishing, bhk, area, bathrooms, age, amenities_count }
router.post('/', async (req, res) => {
    try {
        const result = await proxyRequest('POST', '/predict', req.body);
        res.status(result.status).json(result.body);
    } catch (err) {
        // If ML service is not running, return a graceful error
        res.status(503).json({
            success: false,
            message: 'Price prediction service is unavailable. Please ensure the Python microservice is running.',
            hint: 'cd backend/ml_service && uvicorn app:app --port 8001'
        });
    }
});

// @GET /api/predict-price/health
router.get('/health', async (req, res) => {
    try {
        const result = await proxyRequest('GET', '/health', null);
        res.status(result.status).json(result.body);
    } catch (err) {
        res.status(503).json({ status: 'unavailable', message: err.message });
    }
});

module.exports = router;
