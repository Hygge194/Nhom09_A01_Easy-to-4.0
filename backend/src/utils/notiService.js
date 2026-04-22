const db = require('../config/db');

const sendNoti = async (receiverId, message, senderId = null) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [receiverId, message]
        );
        console.log(`🔔 Thông báo đã được gửi tới User ${receiverId}`);
    } catch (error) {
        console.error("❌ Lỗi lưu thông báo:", error);
    }
};

module.exports = { sendNoti };