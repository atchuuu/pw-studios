const express = require('express');
const router = express.Router();
const { getStudios, getStudioById, createStudio, updateStudio, getRecommendations, getStudioCities } = require('../controllers/studioController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStudios).post(protect, admin, createStudio);
router.get('/recommendations', protect, getRecommendations);
router.get('/cities', protect, getStudioCities);
router.route('/:id').get(protect, getStudioById).put(protect, admin, updateStudio);

module.exports = router;
