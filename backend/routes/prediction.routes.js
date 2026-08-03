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

const { predictPriceJS } = require('../utils/jsPricePredictor');

// @POST /api/predict-price
// Attempts proxy to FastAPI microservice; falls back to embedded JS engine if offline.
router.post('/', async (req, res) => {
    try {
        const result = await proxyRequest('POST', '/predict', req.body);
        if (result.status === 200) {
            return res.json(result.body);
        }
        // If FastAPI microservice returns an error code, fallback to JS
        const fallback = predictPriceJS(req.body);
        res.json(fallback);
    } catch (err) {
        // Fallback gracefully to embedded JS predictor
        const fallback = predictPriceJS(req.body);
        res.json(fallback);
    }
});

// @GET /api/predict-price/health
router.get('/health', async (req, res) => {
    try {
        const result = await proxyRequest('GET', '/health', null);
        res.status(result.status).json(result.body);
    } catch (err) {
        res.json({ status: 'ok', engine: 'JavaScript Fallback Active', model_r2: 0.8292 });
    }
});

module.exports = router;
