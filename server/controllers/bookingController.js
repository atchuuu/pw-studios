const asyncHandler = require('express-async-handler');
const { Booking } = require('../models');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { studioId, studioUnit, startTime } = req.body;

    if (!studioUnit) {
        res.status(400);
        throw new Error('Studio Unit is required');
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 50 * 60000); // 50 minutes later

    // Validate Slot Time (Must be on the hour, between 06:00 and 21:00)
    const hour = start.getHours();
    const minutes = start.getMinutes();

    if (minutes !== 0 || hour < 6 || hour > 20) {
        res.status(400);
        throw new Error('Invalid slot time. Slots are hourly from 06:00 to 20:00.');
    }

    // Check for conflicts
    const conflict = await Booking.findOne({
        studio: studioId,
        studioUnit: studioUnit,
        status: 'confirmed',
        $and: [
            { startTime: { $lt: end } },
            { endTime: { $gt: start } }
        ]
    });

    if (conflict) {
        res.status(400);
        throw new Error('This Studio Unit is already booked for this time slot');
    }

    const booking = new Booking({
        user: req.user._id,
        studio: studioId,
        studioUnit: studioUnit,
        startTime: start,
        endTime: end,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
});

// @desc    Get bookings for a specific studio (for availability)
// @route   GET /api/bookings/studio/:studioId
// @access  Private
const getStudioBookings = asyncHandler(async (req, res) => {
    const { date, studioUnit } = req.query;
    const query = { studio: req.params.studioId, status: 'confirmed' };

    if (studioUnit) {
        query.studioUnit = studioUnit;
    }

    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.startTime = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query).select('startTime endTime studioUnit');
    res.json(bookings);
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('studio');
    res.json(bookings);
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
    const { user, location, date } = req.query;

    let query = {};

    // Filter by User (Name or Email)
    if (user) {
        const users = await require('../models/User').find({
            $or: [
                { name: { $regex: user, $options: 'i' } },
                { email: { $regex: user, $options: 'i' } }
            ]
        }).select('_id');
        const userIds = users.map(u => u._id);
        query.user = { $in: userIds };
    }

    // Filter by Studio (Name or Location)
    if (location) {
        const studios = await require('../models/Studio').find({
            $or: [
                { name: { $regex: location, $options: 'i' } },
                { location: { $regex: location, $options: 'i' } },
                { address: { $regex: location, $options: 'i' } }
            ]
        }).select('_id');
        const studioIds = studios.map(s => s._id);
        query.studio = { $in: studioIds };
    }

    // Filter by Date
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.startTime = {
            $gte: startDate,
            $lt: endDate
        };
    }

    const bookings = await Booking.find(query)
        .populate('user', 'name email')
        .populate('studio', 'name location')
        .sort({ startTime: -1 }); // Sort by newest first

    res.json(bookings);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('studio');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check permissions
    // 1. Super Admin can cancel any booking
    // 2. Studio Admin can cancel bookings for their studio
    // 3. User can cancel their own booking

    const isSuperAdmin = req.user.role === 'super_admin';
    const isStudioAdmin = req.user.role === 'studio_admin' && booking.studio.admin.toString() === req.user._id.toString();
    const isBookingOwner = booking.user.toString() === req.user._id.toString();

    if (isSuperAdmin || isStudioAdmin || isBookingOwner) {
        booking.status = 'cancelled';
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } else {
        res.status(401);
        throw new Error('Not authorized to cancel this booking');
    }
});

module.exports = { createBooking, getMyBookings, getAllBookings, getStudioBookings, cancelBooking };
