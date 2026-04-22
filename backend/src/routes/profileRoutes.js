const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware'); 

// @route   GET api/profile
// @desc    Lấy hồ sơ người dùng
// @access  Private
router.get('/', verifyToken, getProfile);

// @route   PATCH api/profile
// @desc    Cập nhật hồ sơ người dùng
// @access  Private
router.patch('/', verifyToken, upload.single('avatar'), updateProfile);

module.exports = router;