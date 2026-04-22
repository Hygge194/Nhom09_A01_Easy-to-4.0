const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
// quan li thong tin mentor
router.get('/', mentorController.getAllMentors);
router.get('/:id', mentorController.getMentorById);
router.put('/profile', verifyToken, upload.single('avatar'), mentorController.updateMentorProfile);
// quan li lich dat cua mentor
router.patch('/bookings/status', verifyToken, bookingController.updateBookingStatus);
router.patch('/bookings/complete/:bookingId', verifyToken, bookingController.completeBooking);
module.exports = router;
