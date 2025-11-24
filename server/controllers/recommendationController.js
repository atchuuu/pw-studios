const asyncHandler = require('express-async-handler');
const { Studio } = require('../models');

// @desc    Get studio recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    // Mock logic: return random studios as "recommended"
    const studios = await Studio.find({});
    const recommended = studios.sort(() => 0.5 - Math.random()).slice(0, 3);
    res.json(recommended);
});

module.exports = { getRecommendations };
