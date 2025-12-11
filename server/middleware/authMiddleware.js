const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Strict Super Admin
const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as super admin' });
    }
};

// Staff Access (Super, Studio Admin, Faculty Coordinator)
const staffAccess = (req, res, next) => {
    if (req.user && ['super_admin', 'studio_admin', 'faculty_coordinator'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
};

// Legacy Admin (Super + Studio Admin) - Keeping for potential other usages, strictly defined in previous code
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'studio_admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin, superAdmin, staffAccess };
