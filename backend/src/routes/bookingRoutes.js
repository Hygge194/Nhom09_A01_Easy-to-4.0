const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Tạo đặt lịch mới
router.post('/', verifyToken, bookingController.createBooking);

// 2. Học viên xem lịch sử 
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);

// 3. Mentor xem danh sách học viên đăng ký
router.get('/incoming', verifyToken, bookingController.getIncomingBookings);

// 4. Cập nhật trạng thái 
router.patch('/status', verifyToken, bookingController.updateBookingStatus);

// 5. Giải pháp AI Suggest
router.post('/ai-suggest', verifyToken, bookingController.aiSuggest);

module.exports = router;