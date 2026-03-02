const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/addresses', protect, addAddress);
router.route('/addresses').post(protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;
