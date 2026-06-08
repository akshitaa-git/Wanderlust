const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: false, // Optional — Google users won't have a password
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows null for non-Google users
    },
    avatar: {
        type: String, // Profile picture from Google
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
