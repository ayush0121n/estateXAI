const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Interaction = require('../models/Interaction');
const apicache = require('apicache');
const cache = apicache.middleware;

// @GET /api/pgs - Get all PGs with filters
router.get('/', async (req, res) => {
    try {
        const { genderType, city, minRent, maxRent, wifi, food, ac, sharingType, institution, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const query = { isAvailable: true };

        if (genderType) query.genderType = genderType;
        if (city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'all cities') {
            query['location.city'] = { $regex: city, $options: 'i' };
        }
        if (sharingType) query.sharingType = { $in: sharingType.split(',') };
        if (institution) query['location.nearbyInstitutions'] = { $regex: institution, $options: 'i' };
        if (wifi === 'true') query['amenities.wifi'] = true;
        if (food === 'true') query['amenities.food'] = true;
        if (ac === 'true') query['amenities.ac'] = true;
        if (minRent || maxRent) {
            query.rentPerMonth = {};
            if (minRent) query.rentPerMonth.$gte = Number(minRent);
            if (maxRent) query.rentPerMonth.$lte = Number(maxRent);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await PG.countDocuments(query);
        const pgs = await PG.find(query)
            .populate('owner', 'name phone email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), pgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/pgs/featured
router.get('/featured', cache('5 minutes'), async (req, res) => {
    try {
        const pgs = await PG.find({ isFeatured: true, isAvailable: true })
            .populate('owner', 'name phone email')
            .sort('-createdAt')
            .limit(8);
        res.json({ success: true, pgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/pgs/:id
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const pg = await PG.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('owner', 'name phone email avatar');
        
        if (!pg) return res.status(404).json({ success: false, message: 'PG not found.' });

        if (req.user) {
            await Interaction.create({
                user: req.user._id,
                itemId: pg._id,
                itemType: 'PG',
                interactionType: 'view',
                weight: 1
            });
        }

        res.json({ success: true, pg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/pgs
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        let data = { ...req.body, owner: req.user._id };
        
        // Handle both nested and flat location structures from form-data
        const address = data.location?.address || data['location.address'] || data['location[address]'];
        const city = data.location?.city || data['location.city'] || data['location[city]'] || 'Pune';
        const hasLat = data.location?.coordinates?.lat || data['location.coordinates.lat'];
        const hasLng = data.location?.coordinates?.lng || data['location.coordinates.lng'];

        // Auto-geocode location if not provided
        if (address && (!hasLat || !hasLng)) {
            try {
                const query = encodeURIComponent(`${address}, ${city}, India`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                    headers: { 'User-Agent': 'EstateXAi/1.0 (info@estatexai.com)' }
                });
                const geoData = await geoRes.json();
                
                // Initialize location object properly if it doesn't exist
                if (!data.location) data.location = {};
                if (!data.location.coordinates) data.location.coordinates = {};

                if (geoData && geoData.length > 0) {
                    data.location.coordinates.lat = parseFloat(geoData[0].lat);
                    data.location.coordinates.lng = parseFloat(geoData[0].lon);
                } else {
                    data.location.coordinates.lat = 18.5204;
                    data.location.coordinates.lng = 73.8567;
                }
            } catch (err) {
                console.error('Geocoding failed:', err.message);
            }
        }

        const pg = await PG.create(data);
        res.status(201).json({ success: true, pg });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @PUT /api/pgs/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const pg = await PG.findById(req.params.id);
        if (!pg) return res.status(404).json({ success: false, message: 'PG not found.' });
        if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        const updated = await PG.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, pg: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @DELETE /api/pgs/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const pg = await PG.findById(req.params.id);
        if (!pg) return res.status(404).json({ success: false, message: 'PG not found.' });
        if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        
        // Cascade Delete: Clean up Interactions, Inquiries, and User Saved lists
        const pgId = pg._id;
        const Interaction = require('../models/Interaction');
        await Interaction.deleteMany({ itemId: pgId, itemType: 'PG' });
        
        const Inquiry = require('../models/Inquiry');
        await Inquiry.deleteMany({ propertyId: pgId, propertyType: 'PG' });
        
        const User = require('../models/User');
        await User.updateMany(
            { savedPGs: pgId },
            { $pull: { savedPGs: pgId } }
        );

        await pg.deleteOne();
        res.json({ success: true, message: 'PG listing and related records deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/pgs/owner/listings
router.get('/owner/listings', protect, async (req, res) => {
    try {
        const pgs = await PG.find({ owner: req.user._id }).sort('-createdAt');
        res.json({ success: true, pgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
