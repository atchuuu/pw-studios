const express = require('express');
const passport = require('passport');
const router = express.Router();
const { authUser, registerUser, googleAuthCallback, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', (req, res, next) => {
    const state = req.query.callback ? JSON.stringify({ callback: req.query.callback }) : undefined;
    passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next);
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=Invalid Email. Use only @pw.live and @physicswallah.org domains`, session: false }),
    googleAuthCallback
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
