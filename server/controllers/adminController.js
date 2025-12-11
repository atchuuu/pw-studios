const asyncHandler = require('express-async-handler');
const { User, Studio } = require('../models');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
const getAllUsers = asyncHandler(async (req, res) => {
    let query = {};

    // RBAC: Strict filtering for non-super admins
    if (req.user.role !== 'super_admin') {
        const myStudioIds = req.user.assignedStudios || [];

        query = {
            // 1. Only show specific roles (Studio Admin & Faculty Coordinator)
            role: { $in: ['studio_admin', 'faculty_coordinator'] },
            // 2. Only show users who are assigned to at least one of MY studios
            assignedStudios: { $in: myStudioIds }
        };
    }

    const users = await User.find(query).select('-password').populate('assignedStudios', 'name studioCode');
    res.json(users);
});

// @desc    Create a new user (Faculty/Admin)
// @route   POST /api/admin/users
// @access  Private/SuperAdmin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, location, assignedStudios } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role, location, assignedStudios });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            assignedStudios: user.assignedStudios
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/SuperAdmin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.location = req.body.location || user.location;
        if (req.body.assignedStudios) {
            user.assignedStudios = req.body.assignedStudios;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        // re-populate for response
        await updatedUser.populate('assignedStudios', 'name studioCode');

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            assignedStudios: updatedUser.assignedStudios,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { getAllUsers, createUser, deleteUser, updateUser };
