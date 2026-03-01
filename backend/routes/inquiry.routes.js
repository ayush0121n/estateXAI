const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const PG = require('../models/PG');
const { protect } = require('../middleware/auth');

// @POST /api/inquiries - Create inquiry
router.post('/', protect, async (req, res) => {
    try {
        const { propertyType, propertyId, message, phone } = req.body;
        let owner;
        let data = { user: req.user._id, propertyType, message, phone };

        if (propertyType === 'property') {
            const prop = await Property.findById(propertyId);
            if (!prop) return res.status(404).json({ success: false, message: 'Property not found.' });
            owner = prop.owner;
            data.property = propertyId;
            await Property.findByIdAndUpdate(propertyId, { $inc: { inquiryCount: 1 } });
        } else {
            const pg = await PG.findById(propertyId);
            if (!pg) return res.status(404).json({ success: false, message: 'PG not found.' });
            owner = pg.owner;
            data.pg = propertyId;
        }

        data.owner = owner;
        const inquiry = await Inquiry.create(data);
        res.status(201).json({ success: true, inquiry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/inquiries/my - User's own inquiries
router.get('/my', protect, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ user: req.user._id })
            .populate('property', 'title location price images')
            .populate('pg', 'name location rentPerMonth images')
            .sort('-createdAt');
        res.json({ success: true, inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/inquiries/received - Owner's received inquiries
router.get('/received', protect, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ owner: req.user._id })
            .populate('user', 'name email phone')
            .populate('property', 'title location price')
            .populate('pg', 'name location rentPerMonth')
            .sort('-createdAt');
        res.json({ success: true, inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @PUT /api/inquiries/:id/respond
router.put('/:id/respond', protect, async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
        if (inquiry.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        inquiry.ownerResponse = req.body.response;
        inquiry.status = 'responded';
        await inquiry.save();
        res.json({ success: true, inquiry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
