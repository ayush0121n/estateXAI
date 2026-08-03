const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { getHybridRecommendations } = require('../utils/recommendationEngine');

// Smart Recommendation Engine
// @GET /api/recommendations/pgs - Recommend PGs using Hybrid Engine
router.get('/pgs', protect, async (req, res) => {
    try {
        const user = req.user;
        const pgs = await getHybridRecommendations(user, 'PG', 6);
        res.json({ success: true, pgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/recommendations/properties - Recommend properties using Hybrid Engine
router.get('/properties', protect, async (req, res) => {
    try {
        const user = req.user;
        const properties = await getHybridRecommendations(user, 'Property', 6);
        res.json({ success: true, properties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/recommendations/similar/:type/:id - Similar listings
router.get('/similar/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        let similar = [];

        if (type === 'property') {
            const prop = await Property.findById(id);
            if (prop) {
                similar = await Property.find({
                    _id: { $ne: id },
                    type: prop.type,
                    listingType: prop.listingType,
                    'location.city': prop.location.city,
                    isAvailable: true,
                    price: { $gte: prop.price * 0.7, $lte: prop.price * 1.3 }
                }).limit(4).populate('owner', 'name phone');
            }
        } else if (type === 'pg') {
            const pg = await PG.findById(id);
            if (pg) {
                similar = await PG.find({
                    _id: { $ne: id },
                    genderType: { $in: [pg.genderType, 'unisex'] },
                    'location.city': pg.location.city,
                    isAvailable: true,
                    rentPerMonth: { $gte: pg.rentPerMonth * 0.7, $lte: pg.rentPerMonth * 1.3 }
                }).limit(4).populate('owner', 'name phone');
            }
        }

        res.json({ success: true, similar });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
