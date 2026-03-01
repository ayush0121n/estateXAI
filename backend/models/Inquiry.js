const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyType: {
        type: String,
        enum: ['property', 'pg'],
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    pg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PG'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending'
    },
    ownerResponse: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
