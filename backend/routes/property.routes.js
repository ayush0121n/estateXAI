const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Interaction = require('../models/Interaction');
const { upload, getImageUrls } = require('../middleware/upload');

// @GET /api/properties - Get all properties with filters
router.get('/', async (req, res) => {
    try {
        const { type, listingType, city, minPrice, maxPrice, bhk, amenities, furnishing, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const query = { isAvailable: true };

        if (type) query.type = type;
        if (listingType) query.listingType = listingType;
        if (city) query['location.city'] = { $regex: city, $options: 'i' };
        if (bhk) query.bhk = Number(bhk);
        if (furnishing) query.furnishing = furnishing;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (amenities) {
            const amenArr = amenities.split(',');
            query.amenities = { $all: amenArr };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Property.countDocuments(query);
        const properties = await Property.find(query)
            .populate('owner', 'name phone email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), properties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/properties/featured
router.get('/featured', async (req, res) => {
    try {
        const properties = await Property.find({ isFeatured: true, isAvailable: true })
            .populate('owner', 'name phone email')
            .sort('-createdAt')
            .limit(8);
        res.json({ success: true, properties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/properties/:id
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('owner', 'name phone email avatar');
        
        if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

        if (req.user) {
            await Interaction.create({
                user: req.user._id,
                itemId: property._id,
                itemType: 'Property',
                interactionType: 'view',
                weight: 1
            });
        }

        res.json({ success: true, property });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/properties - Create property with image upload
// Status defaults to 'pending' for new listings requiring admin approval
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), async (req, res) => {
    try {
        const imageUrls = getImageUrls(req);
        const data = { ...req.body, owner: req.user._id };
        if (imageUrls.length > 0) data.images = imageUrls;
        // Admin-created properties are auto-approved; owner listings go to pending
        if (req.user.role !== 'admin') data.status = 'pending';

        const property = await Property.create(data);

        // Notify admin via socket if new listing pending
        if (data.status === 'pending') {
            const app = req.app;
            if (app.emitNotification) {
                app.emitNotification('admin', 'new_listing_pending', {
                    message: 'New property listing awaiting approval',
                    propertyId: property._id,
                    title: property.title
                });
            }
        }

        res.status(201).json({ success: true, property });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @POST /api/properties/:id/images - Upload additional images
router.post('/:id/images', protect, upload.array('images', 10), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        const imageUrls = getImageUrls(req);
        property.images = [...(property.images || []), ...imageUrls];
        await property.save();
        res.json({ success: true, images: property.images });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @PATCH /api/properties/:id/approve - Admin approves/rejects a listing
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, adminNote } = req.body; // status: 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
        }
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status, adminNote: adminNote || '' },
            { new: true }
        ).populate('owner', 'name email');

        if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

        // Notify the owner
        const app = req.app;
        if (app.emitNotification && property.owner) {
            app.emitNotification(property.owner._id.toString(), 'listing_status_update', {
                message: `Your property "${property.title}" has been ${status}.`,
                propertyId: property._id,
                status
            });
        }

        res.json({ success: true, property });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});


// @PUT /api/properties/:id - Update property
router.put('/:id', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, property: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @DELETE /api/properties/:id - Delete property
router.delete('/:id', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }
        
        // Cascade Delete: Clean up Interactions, Inquiries, and User Saved lists
        const propId = property._id;
        await Interaction.deleteMany({ itemId: propId, itemType: 'Property' });
        
        const Inquiry = require('../models/Inquiry');
        await Inquiry.deleteMany({ propertyId: propId, propertyType: 'Property' });
        
        const User = require('../models/User');
        await User.updateMany(
            { savedProperties: propId },
            { $pull: { savedProperties: propId } }
        );

        await property.deleteOne();
        res.json({ success: true, message: 'Property and related records deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/properties/owner/listings - Owner's listings
router.get('/owner/listings', protect, async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
        res.json({ success: true, properties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
