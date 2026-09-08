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
        const fields = ['isLookingForRoommate', 'gender', 'diet', 'smoking', 'sleepSchedule', 'profession',
            'preferredArea', 'city', 'budgetMin', 'budgetMax', 'bio', 'age', 'timeline', 'cleanliness',
            'cooking', 'pets', 'contactNumber', 'guestsPolicy', 'wfhPreference', 'noiseTolerance'];
        const profileUpdate = {};
        fields.forEach(f => {
            if (req.body[f] !== undefined) {
                const val = ['budgetMin', 'budgetMax', 'age'].includes(f) ? Number(req.body[f]) || 0 : req.body[f];
                profileUpdate[`roommateProfile.${f}`] = val;
            }
        });

        const user = await User.findByIdAndUpdate(req.user._id, profileUpdate, { new: true, runValidators: true });
        res.json({ success: true, roommateProfile: user.roommateProfile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @GET /api/user/roommates/public - Get public roommate profiles for non-logged-in users
router.get('/roommates/public', async (req, res) => {
    try {
        const candidates = await User.find({ 'roommateProfile.isLookingForRoommate': true })
            .select('name avatar roommateProfile createdAt isPhoneVerified')
            .sort('-createdAt')
            .limit(50);
        const matches = candidates.map(c => ({ user: c, compatibilityScore: Math.floor(Math.random() * (95 - 60) + 60) }));
        res.json({ success: true, matches });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/user/roommates/match - Get ranked roommate matches
router.get('/roommates/match', protect, async (req, res) => {
    try {
        const me = await User.findById(req.user._id);
        if (!me.roommateProfile?.isLookingForRoommate) {
            return res.status(400).json({ success: false, message: 'Please enable your roommate profile first.' });
        }

        // Build filter - prioritize same city if set
        const filter = {
            _id: { $ne: req.user._id },
            'roommateProfile.isLookingForRoommate': true
        };
        // Don't hard-filter by city; we'll boost city matches in scoring

        const candidates = await User.find(filter)
            .select('name avatar roommateProfile createdAt isPhoneVerified')
            .limit(200);

        // Enhanced compatibility scoring algorithm
        const scored = candidates.map(c => {
            let score = 0;
            const p = me.roommateProfile;
            const cp = c.roommateProfile;

            // City match bonus (15 pts)
            if (p.city && cp.city && p.city.toLowerCase() === cp.city.toLowerCase()) score += 15;
            else if (!p.city || !cp.city) score += 5; // no penalty if city not set

            // Diet (20%)
            if (p.diet === 'any' || cp.diet === 'any' || p.diet === cp.diet) score += 20;
            else score += 3;

            // Sleep schedule (15%)
            if (p.sleepSchedule === 'flexible' || cp.sleepSchedule === 'flexible' || p.sleepSchedule === cp.sleepSchedule) score += 15;

            // Smoking (15%)
            if (p.smoking === cp.smoking) score += 15;
            else if ((p.smoking === 'outside-only' && cp.smoking === 'no') || (p.smoking === 'no' && cp.smoking === 'outside-only')) score += 6;

            // Cleanliness (10%)
            if (p.cleanliness === cp.cleanliness) score += 10;
            else if ((p.cleanliness === 'moderate') || (cp.cleanliness === 'moderate')) score += 5;

            // Profession (5%)
            if (p.profession === 'any' || cp.profession === 'any' || p.profession === cp.profession) score += 5;

            // Gender preference (5%)
            if (p.gender === 'any' || cp.gender === 'any' || p.gender === cp.gender) score += 5;

            // Budget overlap (10%)
            const budgetOverlap = Math.min(p.budgetMax, cp.budgetMax) - Math.max(p.budgetMin, cp.budgetMin);
            if (budgetOverlap >= 0) score += 10;
            else if (budgetOverlap > -3000) score += 4;

            // Guests policy (3%)
            if (p.guestsPolicy === 'flexible' || cp.guestsPolicy === 'flexible' || p.guestsPolicy === cp.guestsPolicy) score += 3;

            // Noise tolerance (2%)
            if (p.noiseTolerance === cp.noiseTolerance) score += 2;
            else if (p.noiseTolerance === 'moderate' || cp.noiseTolerance === 'moderate') score += 1;

            return { user: c, compatibilityScore: Math.min(Math.round(score), 100) };
        });

        // Sort by score descending, return top 30
        scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        res.json({ success: true, matches: scored.slice(0, 30) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
