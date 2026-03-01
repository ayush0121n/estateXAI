const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// Smart Recommendation Engine
// @GET /api/recommendations/pgs - Recommend PGs based on institution/workplace
router.get('/pgs', protect, async (req, res) => {
    try {
        const user = req.user;
        const keyword = user.institution || user.workplace || 'Pune';

        // Find PGs near the user's institution
        const pgs = await PG.find({
            isAvailable: true,
            $or: [
                { 'location.nearbyInstitutions': { $regex: keyword, $options: 'i' } },
                { 'location.address': { $regex: keyword, $options: 'i' } },
                { 'location.city': { $regex: 'Pune', $options: 'i' } }
            ]
        })
            .populate('owner', 'name phone')
            .limit(6)
            .sort('-rating');

        res.json({ success: true, keyword, pgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/recommendations/properties - Recommend properties based on user history
router.get('/properties', protect, async (req, res) => {
    try {
        // Get featured + newly listed properties as recommendations
        const properties = await Property.find({
            isAvailable: true,
            $or: [{ isFeatured: true }, { 'location.city': 'Pune' }]
        })
            .populate('owner', 'name phone')
            .limit(6)
            .sort('-views -createdAt');

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
