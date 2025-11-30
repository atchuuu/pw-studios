const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, getStudioBookings, cancelBooking } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking).get(protect, getAllBookings);
router.route('/my').get(protect, getMyBookings);
router.route('/studio/:studioId').get(protect, getStudioBookings);
router.route('/:id/cancel').put(protect, cancelBooking);

module.exports = router;
