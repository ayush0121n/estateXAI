const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['apartment', 'villa', 'studio', 'house', 'plot', 'commercial'],
        required: true
    },
    listingType: {
        type: String,
        enum: ['sale', 'rent'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    area: {
        type: Number, // in sq ft
        required: true
    },
    bhk: {
        type: Number,
        default: 1
    },
    bathrooms: {
        type: Number,
        default: 1
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, default: 'Pune' },
        state: { type: String, default: 'Maharashtra' },
        pincode: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    amenities: [{
        type: String,
        enum: ['parking', 'gym', 'pool', 'security', 'elevator', 'power_backup', 'garden', 'clubhouse', 'wifi', 'ac']
    }],
    images: [{ type: String }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    furnishing: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished'
    },
    facing: {
        type: String,
        enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'],
        default: 'east'
    },
    floor: { type: Number, default: 1 },
    totalFloors: { type: Number, default: 1 },
    yearBuilt: { type: Number },
    views: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    // Approval workflow: draft → pending → approved → live
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'approved' // Legacy: existing listings are approved by default
    },
    adminNote: { type: String, default: '' },
    // Location intelligence
    nearbyPOIs: [{
        name: { type: String },
        type: { type: String, enum: ['school', 'hospital', 'transport', 'shopping', 'park', 'other'] },
        distanceKm: { type: Number },
        lat: { type: Number },
        lng: { type: Number }
    }],
    walkabilityScore: { type: Number, default: 0, min: 0, max: 100 },
    connectivityScore: { type: Number, default: 0, min: 0, max: 100 },
    futureDevelopment: { type: String, default: '' },
    // Comparative market analysis
    priceTrend: [{
        month: { type: String }, // e.g. "Jan 2025"
        avgPrice: { type: Number }
    }]
}, { timestamps: true });

propertySchema.index({ 'location.city': 1, listingType: 1, type: 1, price: 1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);
