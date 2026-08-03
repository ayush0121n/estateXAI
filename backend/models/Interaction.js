const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType'
    },
    itemType: {
        type: String,
        required: true,
        enum: ['Property', 'PG']
    },
    interactionType: {
        type: String,
        enum: ['view', 'favorite', 'inquiry'],
        required: true
    },
    weight: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

// Ensure we don't duplicate interactions too much, or we can just aggregate them later.
// A compound index for querying interactions of a specific user for a specific item
interactionSchema.index({ user: 1, itemId: 1, interactionType: 1 });
interactionSchema.index({ user: 1, itemType: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);
