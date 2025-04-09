const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { getAllStores, addStore, getOwnerStores, getStoreDetails } = require('../controllers/storeController');

// Get all stores (with filters and ratings)
router.get('/', auth, getAllStores);

// Add new store (admin only)
router.post('/', auth, checkRole(['admin']), addStore);

// Get all stores for logged-in store owner
router.get('/my-stores', auth, checkRole(['store_owner']), getOwnerStores);

// Get specific store details for store owner
router.get('/my-stores/:storeId', auth, checkRole(['store_owner']), getStoreDetails);

module.exports = router; 