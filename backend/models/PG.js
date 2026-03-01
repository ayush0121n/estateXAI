const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'PG name is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pg', 'hostel', 'coliving'],
        default: 'pg'
    },
    genderType: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: true
    },
    rentPerMonth: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    sharingType: [{
        type: String,
        enum: ['single', 'double', 'triple', 'quad']
    }],
    location: {
        address: { type: String, required: true },
        city: { type: String, default: 'Pune' },
        state: { type: String, default: 'Maharashtra' },
        pincode: { type: String },
        nearbyInstitutions: [{ type: String }],
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    amenities: {
        wifi: { type: Boolean, default: false },
        food: { type: Boolean, default: false },
        ac: { type: Boolean, default: false },
        laundry: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        housekeeping: { type: Boolean, default: false },
        gym: { type: Boolean, default: false },
        studyRoom: { type: Boolean, default: false },
        cctv: { type: Boolean, default: false },
        powerBackup: { type: Boolean, default: false },
        hotWater: { type: Boolean, default: true },
        refrigerator: { type: Boolean, default: false },
        tv: { type: Boolean, default: false }
    },
    meals: {
        breakfast: { type: Boolean, default: false },
        lunch: { type: Boolean, default: false },
        dinner: { type: Boolean, default: false }
    },
    rules: {
        curfewTime: { type: String, default: '' },
        guestsAllowed: { type: Boolean, default: false },
        smokingAllowed: { type: Boolean, default: false },
        petsAllowed: { type: Boolean, default: false }
    },
    totalRooms: { type: Number, default: 1 },
    availableRooms: { type: Number, default: 1 },
    images: [{ type: String }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
}, { timestamps: true });

pgSchema.index({ 'location.city': 1, genderType: 1, rentPerMonth: 1 });
pgSchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('PG', pgSchema);
