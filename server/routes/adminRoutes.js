const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, updateUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and require admin access
router.use(protect);
router.use(admin);

router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .delete(deleteUser)
    .put(updateUser);

module.exports = router;
