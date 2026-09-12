const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');
const Inquiry = require('../models/Inquiry');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [users, properties, pgs, inquiries] = await Promise.all([
            User.countDocuments(),
            Property.countDocuments(),
            PG.countDocuments(),
            Inquiry.countDocuments()
        ]);
        const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
        const recentProperties = await Property.find().sort('-createdAt').limit(5).populate('owner', 'name');
        res.json({ success: true, stats: { users, properties, pgs, inquiries }, recentUsers, recentProperties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/admin/inquiries - List all inquiries with details
router.get('/inquiries', async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
            .populate('user', 'name email phone avatar')
            .populate('owner', 'name email phone')
            .populate('property', 'title location price')
            .populate('pg', 'name location rentPerMonth')
            .sort('-createdAt')
            .limit(50);
        res.json({ success: true, inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @PUT /api/admin/properties/:id/feature
router.put('/properties/:id/feature', async (req, res) => {
    try {
        const prop = await Property.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
        res.json({ success: true, property: prop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @PUT /api/admin/pgs/:id/feature
router.put('/pgs/:id/feature', async (req, res) => {
    try {
        const pg = await PG.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
        res.json({ success: true, pg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/admin/seed - Seed demo data
router.post('/seed', async (req, res) => {
    try {
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) return res.status(400).json({ success: false, message: 'No admin user found.' });

        const ownerId = adminUser._id;

        const properties = [
            { title: '3BHK Luxury Apartment', description: 'Spacious 3BHK flat with modern amenities in Kothrud.', type: 'apartment', listingType: 'sale', price: 8500000, area: 1350, bhk: 3, bathrooms: 2, location: { address: 'Kothrud, Pune', city: 'Pune', pincode: '411038', coordinates: { lat: 18.5074, lng: 73.8077 } }, amenities: ['parking', 'gym', 'security', 'elevator'], owner: ownerId, isFeatured: true, furnishing: 'semi-furnished' },
            { title: '2BHK Modern Flat', description: 'Beautiful 2BHK flat for rent near Hinjewadi IT Park.', type: 'apartment', listingType: 'rent', price: 22000, area: 950, bhk: 2, bathrooms: 2, location: { address: 'Hinjewadi Phase 1, Pune', city: 'Pune', pincode: '411057', coordinates: { lat: 18.5912, lng: 73.7389 } }, amenities: ['parking', 'security', 'wifi'], owner: ownerId, isFeatured: true, furnishing: 'fully-furnished' },
            { title: '1BHK Studio Apartment', description: 'Cozy studio near Viman Nagar, perfect for professionals.', type: 'studio', listingType: 'rent', price: 14000, area: 450, bhk: 1, bathrooms: 1, location: { address: 'Viman Nagar, Pune', city: 'Pune', pincode: '411014', coordinates: { lat: 18.5679, lng: 73.9143 } }, amenities: ['security', 'wifi'], owner: ownerId, furnishing: 'fully-furnished' },
            { title: '4BHK Villa in Baner', description: 'Premium 4BHK villa with private garden and pool.', type: 'villa', listingType: 'sale', price: 18500000, area: 2800, bhk: 4, bathrooms: 4, location: { address: 'Baner Road, Pune', city: 'Pune', pincode: '411045', coordinates: { lat: 18.5590, lng: 73.7868 } }, amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'clubhouse'], owner: ownerId, isFeatured: true, furnishing: 'fully-furnished' },
            { title: '2BHK Apartment in Wakad', description: 'Ready-to-move 2BHK in gated society near Mumbai Highway.', type: 'apartment', listingType: 'sale', price: 6200000, area: 1050, bhk: 2, bathrooms: 2, location: { address: 'Wakad, Pune', city: 'Pune', pincode: '411057', coordinates: { lat: 18.5983, lng: 73.7611 } }, amenities: ['parking', 'gym', 'security', 'elevator', 'power_backup'], owner: ownerId, furnishing: 'semi-furnished' },
            { title: 'Commercial Space in Shivajinagar', description: '1200 sqft commercial office space in prime location.', type: 'commercial', listingType: 'rent', price: 55000, area: 1200, location: { address: 'Shivajinagar, Pune', city: 'Pune', pincode: '411005', coordinates: { lat: 18.5308, lng: 73.8474 } }, amenities: ['parking', 'elevator', 'security', 'power_backup'], owner: ownerId }
        ];

        const pgs = [
            { name: 'Green Valley Boys PG', description: 'Comfortable PG for boys near SPPU University with all amenities.', type: 'pg', genderType: 'male', rentPerMonth: 8500, securityDeposit: 17000, sharingType: ['single', 'double'], location: { address: 'Aundh, Pune', city: 'Pune', pincode: '411007', nearbyInstitutions: ['SPPU University', 'MIT College'], coordinates: { lat: 18.5589, lng: 73.8088 } }, amenities: { wifi: true, food: true, ac: false, laundry: true, parking: false, housekeeping: true, cctv: true, hotWater: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 30, availableRooms: 8, owner: ownerId, isFeatured: true, rating: 4.2, reviewCount: 47 },
            { name: 'Sunrise Girls Hostel', description: 'Safe & secure girls hostel near MIT and Symbiosis.', type: 'hostel', genderType: 'female', rentPerMonth: 9000, securityDeposit: 18000, sharingType: ['double', 'triple'], location: { address: 'Viman Nagar, Pune', city: 'Pune', pincode: '411014', nearbyInstitutions: ['Symbiosis Institute', 'NIBM'], coordinates: { lat: 18.5679, lng: 73.9143 } }, amenities: { wifi: true, food: true, ac: true, laundry: true, cctv: true, housekeeping: true, hotWater: true, studyRoom: true }, meals: { breakfast: true, lunch: true, dinner: true }, totalRooms: 25, availableRooms: 5, owner: ownerId, isFeatured: true, rating: 4.5, reviewCount: 89 },
            { name: 'Urban Co-Living Space', description: 'Modern co-living for working professionals in Hinjewadi IT Hub.', type: 'coliving', genderType: 'unisex', rentPerMonth: 12000, securityDeposit: 24000, sharingType: ['single', 'double'], location: { address: 'Hinjewadi Phase 2, Pune', city: 'Pune', pincode: '411057', nearbyInstitutions: ['Infosys', 'TCS', 'Wipro Campus'], coordinates: { lat: 18.5912, lng: 73.7389 } }, amenities: { wifi: true, food: false, ac: true, laundry: true, gym: true, parking: true, cctv: true, tv: true, refrigerator: true, hotWater: true }, meals: { breakfast: false, lunch: false, dinner: false }, totalRooms: 40, availableRooms: 12, owner: ownerId, isFeatured: true, rating: 4.3, reviewCount: 63 },
            { name: 'Scholar\'s Den PG', description: 'Budget-friendly PG for students near Fergusson College and Deccan.', type: 'pg', genderType: 'male', rentPerMonth: 6500, securityDeposit: 13000, sharingType: ['double', 'triple', 'quad'], location: { address: 'Deccan Gymkhana, Pune', city: 'Pune', pincode: '411004', nearbyInstitutions: ['Fergusson College', 'BVDU', 'Deccan College'], coordinates: { lat: 18.5136, lng: 73.8389 } }, amenities: { wifi: true, food: true, ac: false, laundry: false, cctv: true, hotWater: true, studyRoom: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 20, availableRooms: 6, owner: ownerId, rating: 3.9, reviewCount: 34 },
            { name: 'Lotus Girls PG', description: 'Premium girls PG with all facilities near Koregaon Park.', type: 'pg', genderType: 'female', rentPerMonth: 11000, securityDeposit: 22000, sharingType: ['single', 'double'], location: { address: 'Koregaon Park, Pune', city: 'Pune', pincode: '411001', nearbyInstitutions: ['IIIT Pune', 'Army Institute'], coordinates: { lat: 18.5362, lng: 73.8938 } }, amenities: { wifi: true, food: true, ac: true, laundry: true, gym: false, cctv: true, hotWater: true, housekeeping: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 18, availableRooms: 3, owner: ownerId, isFeatured: true, rating: 4.6, reviewCount: 71 }
        ];

        await Property.insertMany(properties);
        await PG.insertMany(pgs);

        res.json({ success: true, message: `Seeded ${properties.length} properties and ${pgs.length} PGs.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @POST /api/admin/seed-moderation - Ensure moderation queue is populated with pending listings
router.post('/seed-moderation', async (req, res) => {
    try {
        const ownerUser = await User.findOne({ role: 'owner' }) || await User.findOne({ role: 'admin' });
        if (!ownerUser) return res.status(400).json({ success: false, message: 'No user found' });

        const pendingListings = [
            {
                title: '3BHK Penthouse with Skyline View in Kothrud',
                description: 'Newly listed modern penthouse in Kothrud, Pune. Top floor with private terrace garden, Italian marble flooring, and smart home automation.',
                type: 'apartment',
                listingType: 'sale',
                price: 14500000,
                area: 2100,
                bhk: 3,
                bathrooms: 3,
                location: { address: 'Ideal Colony, Paud Road, Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', coordinates: { lat: 18.5074, lng: 73.8077 } },
                amenities: ['parking', 'gym', 'pool', 'elevator', 'security', 'clubhouse', 'power_backup'],
                furnishing: 'fully-furnished',
                bachelorFriendly: true,
                zeroBrokerage: true,
                petFriendly: true,
                verified: false,
                status: 'pending',
                walkabilityScore: 88,
                connectivityScore: 85,
                owner: ownerUser._id,
                images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80']
            },
            {
                title: '2BHK Spacious Sunlit Flat near Manyata Tech Park',
                description: 'Brand new 2BHK rental apartment in Nagavara, Bangalore. Just 5 minutes from Manyata Tech Park gate 2. Modular kitchen, covered car parking.',
                type: 'apartment',
                listingType: 'rent',
                price: 28000,
                deposit: 84000,
                area: 1150,
                bhk: 2,
                bathrooms: 2,
                location: { address: 'Outer Ring Road, Near Manyata Tech Park', city: 'Bangalore', state: 'Karnataka', pincode: '560045', coordinates: { lat: 13.0458, lng: 77.6200 } },
                amenities: ['parking', 'security', 'wifi', 'elevator', 'power_backup'],
                furnishing: 'semi-furnished',
                bachelorFriendly: true,
                zeroBrokerage: false,
                petFriendly: false,
                verified: false,
                status: 'pending',
                walkabilityScore: 92,
                connectivityScore: 89,
                owner: ownerUser._id,
                images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80']
            },
            {
                title: 'Luxury 4BHK Sea View Villa in Candolim',
                description: 'Exclusive private Portuguese villa in Candolim, Goa with private plunge pool, lawn, and direct beach access.',
                type: 'villa',
                listingType: 'sale',
                price: 32500000,
                area: 3400,
                bhk: 4,
                bathrooms: 4,
                location: { address: 'Camotim Vaddo, Candolim Beach Road', city: 'Goa', state: 'Goa', pincode: '403515', coordinates: { lat: 15.5175, lng: 73.7634 } },
                amenities: ['parking', 'pool', 'garden', 'security', 'power_backup'],
                furnishing: 'fully-furnished',
                bachelorFriendly: true,
                zeroBrokerage: true,
                petFriendly: true,
                verified: false,
                status: 'pending',
                walkabilityScore: 84,
                connectivityScore: 78,
                owner: ownerUser._id,
                images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80']
            },
            {
                title: '1BHK Studio Apartment near Cyber City',
                description: 'Furnished compact studio flat in DLF Phase 2, Gurgaon (Delhi NCR). 3 minutes walking to Cyber City Rapid Metro.',
                type: 'studio',
                listingType: 'rent',
                price: 24000,
                deposit: 48000,
                area: 550,
                bhk: 1,
                bathrooms: 1,
                location: { address: 'DLF Phase 2, Near Sikanderpur Metro', city: 'Delhi NCR', state: 'Haryana', pincode: '122002', coordinates: { lat: 28.4817, lng: 77.0878 } },
                amenities: ['parking', 'security', 'wifi', 'power_backup', 'elevator'],
                furnishing: 'fully-furnished',
                bachelorFriendly: true,
                zeroBrokerage: true,
                petFriendly: true,
                verified: false,
                status: 'pending',
                walkabilityScore: 94,
                connectivityScore: 96,
                owner: ownerUser._id,
                images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80']
            }
        ];

        const inserted = await Property.insertMany(pendingListings);
        const properties = await Property.find({ status: 'pending' }).populate('owner', 'name email phone').sort('-createdAt');
        res.json({ success: true, message: `Added ${inserted.length} pending moderation listings.`, properties, count: properties.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
// @GET /api/admin/analytics - Advanced analytics for charts
router.get('/analytics', async (req, res) => {
    try {
        // Listings over time (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const listingsOverTime = await Property.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // User growth over time
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Most viewed properties
        const mostViewed = await Property.find().sort('-views').limit(5).select('title views price location type');

        // Most favorited properties (by favorites count on users)
        const mostFavorited = await Property.find().sort('-favoriteCount').limit(5).select('title favoriteCount price location type');

        // Pending approval queue count
        const pendingCount = await Property.countDocuments({ status: 'pending' });

        // Property type breakdown
        const typeBreakdown = await Property.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            analytics: {
                listingsOverTime,
                userGrowth,
                mostViewed,
                mostFavorited,
                pendingCount,
                typeBreakdown
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Content Moderation Queue ────────────────────────────────────────────────
// @GET /api/admin/moderation - Get pending/flagged listings
router.get('/moderation', async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        
        const properties = await Property.find({ status })
            .populate('owner', 'name email phone')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));
        
        const total = await Property.countDocuments({ status });
        
        res.json({ success: true, properties, total, page: Number(page) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── System Configuration ────────────────────────────────────────────────────
// Simple in-memory config store (persisted via DB in a real app)
let systemConfig = {
    featuredListingLimit: 10,
    requireVerificationBeforePublish: true,
    maxImagesPerListing: 10,
    allowGuestSearch: true,
    maintenanceMode: false
};

// @GET /api/admin/config
router.get('/config', (req, res) => {
    res.json({ success: true, config: systemConfig });
});

// @PUT /api/admin/config
router.put('/config', (req, res) => {
    const allowed = ['featuredListingLimit', 'requireVerificationBeforePublish', 'maxImagesPerListing', 'allowGuestSearch', 'maintenanceMode'];
    allowed.forEach(k => { if (req.body[k] !== undefined) systemConfig[k] = req.body[k]; });
    res.json({ success: true, config: systemConfig });
});

module.exports = router;
