const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, updateUser } = require('../controllers/adminController');
const { protect, admin, superAdmin, staffAccess } = require('../middleware/authMiddleware');

// Base protection for all admin routes
router.use(protect);

// GET /users: Read access for Super Admin, Studio Admin, Faculty Coordinator
router.route('/users')
    .get(staffAccess, getAllUsers)
    .post(superAdmin, createUser); // Write access strictly Super Admin

// User Management: Write access strictly Super Admin
router.route('/users/:id')
    .delete(superAdmin, deleteUser)
    .put(superAdmin, updateUser);

module.exports = router;
