const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    budget: {
        type: String, // e.g. "cheap", "moderate", "luxury"
        required: true,
    },
    days: {
        type: Number,
        required: true,
    },
    interests: {
        type: [String],
        default: [],
    },
    itinerary: {
        type: Object,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
