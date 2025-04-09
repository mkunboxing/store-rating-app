const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateRating, validate } = require('../middleware/validation');
const { submitOrUpdateRating, getStoreRatings } = require('../controllers/ratingController');

// Submit or update a rating
router.post('/:storeId', auth, validateRating, validate, submitOrUpdateRating);

// Get ratings for a store
router.get('/store/:storeId', auth, getStoreRatings);

module.exports = router; 