const mongoose = require('mongoose');

const neighborhoodRatingSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        default: 'Pune'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    safetyScore: { type: Number, min: 1, max: 5, required: true },
    noiseLevel: { type: Number, min: 1, max: 5, required: true },
    cleanlinessScore: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 500, default: '' }
}, { timestamps: true });

// One rating per user per area
neighborhoodRatingSchema.index({ area: 1, user: 1 }, { unique: true });
neighborhoodRatingSchema.index({ area: 1, city: 1 });

module.exports = mongoose.model('NeighborhoodRating', neighborhoodRatingSchema);
