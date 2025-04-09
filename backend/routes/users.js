const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { validateUser, validate } = require('../middleware/validation');
const { getAllUsers, getUserDetails, addUser, getDashboardStats, getStoreOwners } = require('../controllers/userController');

// Get all users (admin only)
router.get('/', auth, checkRole(['admin']), getAllUsers);

// Get store owners (admin only)
router.get('/store-owners', auth, checkRole(['admin']), getStoreOwners);

// Get user details (admin only)
router.get('/:id', auth, checkRole(['admin']), getUserDetails);

// Add new user (admin only)
router.post('/', auth, checkRole(['admin']), validateUser, validate, addUser);

// Get dashboard stats (admin only)
router.get('/stats/dashboard', auth, checkRole(['admin']), getDashboardStats);

module.exports = router; 