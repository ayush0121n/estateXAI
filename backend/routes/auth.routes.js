const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken, protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @POST /api/auth/register
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, email, password, phone, role, institution, workplace } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

        const user = await User.create({ name, email, password, phone, role: role || 'user', institution, workplace });
        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, institution: user.institution }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/auth/login
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = signToken(user._id);
        res.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, institution: user.institution }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('savedProperties').populate('savedPGs');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Helper function to calculate trust score
const calculateTrustScore = (user) => {
    let score = 40; // Base score for registered users
    if (user.isPhoneVerified) score += 20;
    if (user.email) score += 10;
    if (user.institution || user.workplace) score += 15;
    if (user.avatar) score += 5;
    if (user.roommateProfile?.bio) score += 10;
    if (user.isIdVerified) score += 30; // High weight for Govt ID
    return Math.min(score, 100);
};

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, institution, workplace } = req.body;
        let user = await User.findById(req.user._id);
        
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.institution = institution !== undefined ? institution : user.institution;
        user.workplace = workplace !== undefined ? workplace : user.workplace;
        
        user.trustScore = calculateTrustScore(user);
        await user.save();
        
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/auth/verify-id
router.post('/verify-id', protect, async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        user.isIdVerified = true;
        user.trustScore = calculateTrustScore(user);
        await user.save();
        res.json({ success: true, user, message: 'Government ID verified successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/auth/verify-phone
router.post('/verify-phone', protect, async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        user.isPhoneVerified = true;
        user.trustScore = calculateTrustScore(user);
        await user.save();
        res.json({ success: true, user, message: 'Phone number verified successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/auth/save-property
router.post('/save-property/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const propId = req.params.id;
        const idx = user.savedProperties.indexOf(propId);
        if (idx > -1) {
            user.savedProperties.splice(idx, 1);
        } else {
            user.savedProperties.push(propId);
        }
        await user.save();
        res.json({ success: true, savedProperties: user.savedProperties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/auth/save-pg
router.post('/save-pg/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const pgId = req.params.id;
        const idx = user.savedPGs.indexOf(pgId);
        if (idx > -1) {
            user.savedPGs.splice(idx, 1);
        } else {
            user.savedPGs.push(pgId);
        }
        await user.save();
        res.json({ success: true, savedPGs: user.savedPGs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
