const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Khuyến khích chèn thêm middleware auth ở đường dẫn gốc nếu cần
router.post('/create/:bookingId', paymentController.createPaymentUrl);
router.get('/return', paymentController.vnpayReturn);
router.get('/ipn', paymentController.vnpayIpn);

module.exports = router;
