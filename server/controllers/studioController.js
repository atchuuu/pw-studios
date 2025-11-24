const asyncHandler = require('express-async-handler');
const { Studio } = require('../models');

// @desc    Get all studios
// @route   GET /api/studios
// @access  Private
const getStudios = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const studios = await Studio.find({ ...keyword });
    res.json(studios);
});

// @desc    Get studio by ID
// @route   GET /api/studios/:id
// @access  Private
const getStudioById = asyncHandler(async (req, res) => {
    const studio = await Studio.findById(req.params.id);
    if (studio) {
        res.json(studio);
    } else {
        res.status(404);
        throw new Error('Studio not found');
    }
});

// @desc    Create a studio
// @route   POST /api/studios
// @access  Private/Admin
const createStudio = asyncHandler(async (req, res) => {
    const { name, location, address, capacity, facilities } = req.body;
    const studio = new Studio({
        name,
        location,
        address,
        capacity,
        facilities,
        admin: req.user._id,
        images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000'] // Placeholder
    });

    const createdStudio = await studio.save();
    res.status(201).json(createdStudio);
});

module.exports = { getStudios, getStudioById, createStudio };
