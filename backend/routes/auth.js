const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateUser, validate } = require('../middleware/validation');
const { register, login, updatePassword } = require('../controllers/authController');

// Register a new user
router.post('/register', validateUser, validate, register);

// Login
router.post('/login', login);

// Update password
router.put('/change-password', auth, updatePassword);

module.exports = router; 