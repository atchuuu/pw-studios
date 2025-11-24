const express = require('express');
const router = express.Router();
const { getStudios, getStudioById, createStudio } = require('../controllers/studioController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStudios).post(protect, admin, createStudio);
router.route('/:id').get(protect, getStudioById);

module.exports = router;
