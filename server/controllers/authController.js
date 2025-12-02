const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    if (user) {
        const token = generateToken(user._id);
        let redirectUrl;

        if (req.query.state) {
            try {
                const state = JSON.parse(req.query.state);
                if (state.callback) {
                    redirectUrl = `${state.callback}/login?token=${token}`;
                }
            } catch (e) {
                console.error('Failed to parse state', e);
            }
        }

        if (!redirectUrl) {
            const protocol = req.protocol;
            const host = req.get('host');
            // Replace backend port (5001) with frontend port (5173)
            const clientHost = host.replace('5001', '5173');
            redirectUrl = `${protocol}://${clientHost}/login?token=${token}`;
        }

        res.redirect(redirectUrl);
    } else {
        res.redirect('/login?error=Authentication failed');
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            // token is already on client
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.profilePicture !== undefined) {
            user.profilePicture = req.body.profilePicture;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { googleAuthCallback, getMe, updateProfile };
