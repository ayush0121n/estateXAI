const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');
const Interaction = require('../models/Interaction');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('savedProperties', 'title price location type images')
            .populate('savedPGs', 'name rentPerMonth location genderType images');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile and preferences
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'avatar', 'institution', 'workplace', 'preferences', 'savedSearches'];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/favorites/property/{id}:
 *   post:
 *     summary: Toggle property favorite
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.post('/favorites/property/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const propId = req.params.id;
        const idx = user.savedProperties.indexOf(propId);
        
        if (idx === -1) {
            user.savedProperties.push(propId);
            await Interaction.create({ user: user._id, itemId: propId, itemType: 'Property', interactionType: 'favorite', weight: 3 });
            await user.save();
            res.json({ success: true, action: 'added', message: 'Added to favorites' });
        } else {
            user.savedProperties.splice(idx, 1);
            await user.save();
            res.json({ success: true, action: 'removed', message: 'Removed from favorites' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/favorites/pg/{id}:
 *   post:
 *     summary: Toggle PG favorite
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.post('/favorites/pg/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const pgId = req.params.id;
        const idx = user.savedPGs.indexOf(pgId);
        
        if (idx === -1) {
            user.savedPGs.push(pgId);
            await Interaction.create({ user: user._id, itemId: pgId, itemType: 'PG', interactionType: 'favorite', weight: 3 });
            await user.save();
            res.json({ success: true, action: 'added', message: 'Added to favorites' });
        } else {
            user.savedPGs.splice(idx, 1);
            await user.save();
            res.json({ success: true, action: 'removed', message: 'Removed from favorites' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/searches:
 *   post:
 *     summary: Save a search
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.post('/searches', protect, async (req, res) => {
    try {
        const { name, filters } = req.body;
        const user = await User.findById(req.user._id);
        
        user.savedSearches = user.savedSearches || [];
        user.savedSearches.unshift({ name, filters, createdAt: new Date() });
        // Keep only last 10 searches
        if (user.savedSearches.length > 10) user.savedSearches = user.savedSearches.slice(0, 10);
        await user.save();
        
        res.json({ success: true, savedSearches: user.savedSearches });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/searches:
 *   get:
 *     summary: Get saved searches
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.get('/searches', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('savedSearches');
        res.json({ success: true, savedSearches: user.savedSearches || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/user/history:
 *   get:
 *     summary: Get user interaction history (views, favorites, inquiries)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 */
router.get('/history', protect, async (req, res) => {
    try {
        const history = await Interaction.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(50);
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @PUT /api/user/roommate-profile - Create or update roommate profile
router.put('/roommate-profile', protect, async (req, res) => {
    try {
        const { isLookingForRoommate, gender, diet, smoking, sleepSchedule, profession, preferredArea, budgetMin, budgetMax, bio, age } = req.body;
        const profileUpdate = {};
        if (isLookingForRoommate !== undefined) profileUpdate['roommateProfile.isLookingForRoommate'] = isLookingForRoommate;
        if (gender) profileUpdate['roommateProfile.gender'] = gender;
        if (diet) profileUpdate['roommateProfile.diet'] = diet;
        if (smoking) profileUpdate['roommateProfile.smoking'] = smoking;
        if (sleepSchedule) profileUpdate['roommateProfile.sleepSchedule'] = sleepSchedule;
        if (profession) profileUpdate['roommateProfile.profession'] = profession;
        if (preferredArea !== undefined) profileUpdate['roommateProfile.preferredArea'] = preferredArea;
        if (budgetMin !== undefined) profileUpdate['roommateProfile.budgetMin'] = budgetMin;
        if (budgetMax !== undefined) profileUpdate['roommateProfile.budgetMax'] = budgetMax;
        if (bio !== undefined) profileUpdate['roommateProfile.bio'] = bio;
        if (age !== undefined) profileUpdate['roommateProfile.age'] = age;

        const user = await User.findByIdAndUpdate(req.user._id, profileUpdate, { new: true, runValidators: true });
        res.json({ success: true, roommateProfile: user.roommateProfile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @GET /api/user/roommates/match - Get ranked roommate matches
router.get('/roommates/match', protect, async (req, res) => {
    try {
        const me = await User.findById(req.user._id);
        if (!me.roommateProfile?.isLookingForRoommate) {
            return res.status(400).json({ success: false, message: 'Please enable your roommate profile first.' });
        }

        // Fetch all active seekers except self
        const candidates = await User.find({
            _id: { $ne: req.user._id },
            'roommateProfile.isLookingForRoommate': true
        }).select('name avatar roommateProfile createdAt');

        // Compatibility scoring algorithm
        const scored = candidates.map(c => {
            let score = 0;
            const p = me.roommateProfile;
            const cp = c.roommateProfile;

            // Diet (25%)
            if (p.diet === 'any' || cp.diet === 'any' || p.diet === cp.diet) score += 25;
            else score += 5;

            // Sleep schedule (20%)
            if (p.sleepSchedule === 'flexible' || cp.sleepSchedule === 'flexible' || p.sleepSchedule === cp.sleepSchedule) score += 20;

            // Smoking (20%)
            if (p.smoking === cp.smoking) score += 20;
            else if ((p.smoking === 'outside-only' && cp.smoking === 'no') || (p.smoking === 'no' && cp.smoking === 'outside-only')) score += 8;

            // Profession (15%)
            if (p.profession === 'any' || cp.profession === 'any' || p.profession === cp.profession) score += 15;

            // Gender preference (10%)
            if (p.gender === 'any' || cp.gender === 'any' || p.gender === cp.gender) score += 10;

            // Budget overlap (10%)
            const budgetOverlap = Math.min(p.budgetMax, cp.budgetMax) - Math.max(p.budgetMin, cp.budgetMin);
            if (budgetOverlap >= 0) score += 10;
            else if (budgetOverlap > -3000) score += 4;

            return { user: c, compatibilityScore: Math.min(score, 100) };
        });

        // Sort by score descending, return top 20
        scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        res.json({ success: true, matches: scored.slice(0, 20) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

