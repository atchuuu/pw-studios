const asyncHandler = require('express-async-handler');
const { Booking } = require('../models');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { studioId, startTime, endTime } = req.body;

    // Check for conflicts
    const conflict = await Booking.findOne({
        studio: studioId,
        status: 'confirmed',
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
        ],
    });

    if (conflict) {
        res.status(400);
        throw new Error('Studio already booked for this time slot');
    }

    const booking = new Booking({
        user: req.user._id,
        studio: studioId,
        startTime,
        endTime,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('studio');
    res.json(bookings);
});

module.exports = { createBooking, getMyBookings };
