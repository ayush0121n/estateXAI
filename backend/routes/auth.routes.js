const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken, protect } = require('../middleware/auth');

// @POST /api/auth/register
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });

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

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, institution, workplace } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, phone, institution, workplace }, { new: true, runValidators: true });
        res.json({ success: true, user });
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
