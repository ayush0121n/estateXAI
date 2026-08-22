const express = require('express');
const router = express.Router();
const NeighborhoodRating = require('../models/NeighborhoodRating');
const { protect } = require('../middleware/auth');

// @POST /api/neighborhood/rate - Submit or update a rating (logged in users only)
router.post('/rate', protect, async (req, res) => {
    try {
        const { area, city = 'Pune', safetyScore, noiseLevel, cleanlinessScore, review } = req.body;
        if (!area || !safetyScore || !noiseLevel || !cleanlinessScore) {
            return res.status(400).json({ success: false, message: 'area, safetyScore, noiseLevel and cleanlinessScore are required.' });
        }

        const rating = await NeighborhoodRating.findOneAndUpdate(
            { area: area.trim(), user: req.user._id },
            { area: area.trim(), city, user: req.user._id, safetyScore, noiseLevel, cleanlinessScore, review },
            { upsert: true, new: true, runValidators: true }
        );
        res.json({ success: true, message: 'Rating submitted!', rating });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/neighborhood/:area - Get aggregated stats for an area
router.get('/:area', async (req, res) => {
    try {
        const area = req.params.area;
        const ratings = await NeighborhoodRating.find({ area: { $regex: area, $options: 'i' } })
            .populate('user', 'name avatar')
            .sort('-createdAt')
            .limit(20);

        if (ratings.length === 0) {
            return res.json({ success: true, area, stats: null, reviews: [] });
        }

        const count = ratings.length;
        const stats = {
            totalRatings: count,
            avgSafety: (ratings.reduce((s, r) => s + r.safetyScore, 0) / count).toFixed(1),
            avgNoise: (ratings.reduce((s, r) => s + r.noiseLevel, 0) / count).toFixed(1),
            avgCleanliness: (ratings.reduce((s, r) => s + r.cleanlinessScore, 0) / count).toFixed(1),
        };
        // Overall vibe score: safety weighted highest
        stats.overallScore = ((parseFloat(stats.avgSafety) * 0.5 + parseFloat(stats.avgCleanliness) * 0.3 + (5 - parseFloat(stats.avgNoise)) * 0.2)).toFixed(1);

        res.json({ success: true, area, stats, reviews: ratings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
