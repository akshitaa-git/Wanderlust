const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ── Google OAuth ──────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`, session: false }),
    (req, res) => {
        // Issue a JWT exactly like login does
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const user = { name: req.user.name, email: req.user.email, _id: req.user._id, avatar: req.user.avatar };
        // Redirect to frontend with token in URL — frontend will read it and store in localStorage
        const params = new URLSearchParams({ token, user: JSON.stringify(user) });
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params}`);
    }
);

module.exports = router;
