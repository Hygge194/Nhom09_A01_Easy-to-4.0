const db = require('../config/db');
const crypto = require('crypto');
const qs = require('qs');
const { sortObject, formatDateToVNPayString } = require('../utils/vnpay');

// 1. TẠO URL THANH TOÁN
const createPaymentUrl = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy booking' });
        }
        const booking = bookings[0];

        // Validate booking state
        if (booking.payment_status !== 'unpaid') {
            return res.status(400).json({ message: 'Booking này đã được thanh toán hoặc thất bại' });
        }

        // Kiểm tra hết hạn
        const now = new Date();
        if (booking.expires_at && now > new Date(booking.expires_at)) {
            await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
            return res.status(400).json({ message: 'Booking đã hết hạn thanh toán' });
        }

        // Lấy thông tin env (Sử dụng config VNPay từ env)
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        const date = new Date();
        const createDate = formatDateToVNPayString(date);
        
        const expireDateObj = new Date(date.getTime() + 10 * 60000); // Tồn tại 10 phút
        const expireDate = formatDateToVNPayString(expireDateObj);

        const amount = booking.total_price * 100; // VNPay nhân 100
        const orderInfo = `Thanh toan lich mentor booking ${booking.id}`;
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = booking.id;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Amount'] = amount;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;

        vnp_Params = sortObject(vnp_Params);

        // Ký dữ liệu
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tạo URL thanh toán' });
    }
};

// 2. CALLBACK RETURN CHO FE
const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASH_SECRET;

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const responseCode = vnp_Params['vnp_ResponseCode'];
            if (responseCode === '00') {
                res.status(200).json({ message: 'Thanh toán VNPay thành công!' });
            } else {
                res.status(400).json({ message: 'Giao dịch thất bại / Bị hủy' });
            }
        } else {
            res.status(400).json({ message: 'Checksum không hợp lệ' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. IPN WEBHOOK CHO SERVER
const vnpayIpn = async (req, res) => {
    let connection;
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASH_SECRET;

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash !== signed) {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum fail' });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = vnp_Params['vnp_Amount'] / 100;

        // Xử lý Transaction cập nhật trạng thái
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Lock row để tránh Race Condition (FOR UPDATE)
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? FOR UPDATE', [orderId]);
        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
        
        const booking = bookings[0];

        // Idempotency: Bỏ qua nếu đã paid
        if (booking.payment_status === 'paid') {
            await connection.rollback();
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Kiểm tra số tiền
        if (booking.total_price != amount) { // sử dụng != vì so sánh float đôi khi có sai số nhỏ hoặc kiểu dữ liệu
            await connection.rollback();
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        // Cập nhật kết quả thanh toán
        if (rspCode === '00') {
            await connection.query(
                `UPDATE bookings SET status = 'confirmed', payment_status = 'paid', transaction_id = ? WHERE id = ?`,
                [vnp_Params['vnp_TransactionNo'], orderId]
            );
        } else {
            await connection.query(
                `UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE id = ?`,
                [orderId]
            );
        }

        await connection.commit();
        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknow error' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn,
    vnpayIpn
};
