const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ── Token-based Google OAuth ───────────────────────────────────
// The frontend sends the Google ID token (credential) here.
// We verify it server-side and return a JWT.
router.post('/google', authController.googleSignIn);

module.exports = router;
