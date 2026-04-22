const db = require('../config/db');
const { sendNoti } = require('../utils/notiService');
const { suggestSlots } = require('../services/aiAgentService');

const createBooking = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { mentor_id, plan_type, booking_date } = req.body;

        // [FIX] Chuyển đổi định dạng 'YYYY-MM-DDTHH:mm' của datetime-local thành chuẩn MySQL (YYYY-MM-DD HH:mm:ss)
        const mysqlBookingDate = booking_date ? booking_date.replace('T', ' ') + ':00' : null;

        // 1. Kiểm tra double booking (Trùng mentor_id + ngày nếu trạng thái hợp lệ)
        const [existingBookings] = await db.query(
            `SELECT * FROM bookings 
             WHERE mentor_id = ? 
             AND DATE(booking_date) = DATE(?) 
             AND status IN ('pending', 'confirmed')`,
            [mentor_id, mysqlBookingDate]
        );

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'Mentor đã có lịch học trong khung thời gian này!' });
        }

        // 1.5 Kiểm tra thời gian không được ở quá khứ
        const bookingTime = new Date(booking_date).getTime();
        const currentTime = new Date().getTime();
        if (bookingTime < currentTime) {
            return res.status(400).json({ message: 'Thời gian học không được ở trong quá khứ!' });
        }


        // 2. Tính số tiền
        let totalPrice = 0;
        if (plan_type === 'begin') {
            totalPrice = 150000;
        } else if (plan_type === 'plus') {
            totalPrice = 250000;
        } else if (plan_type === 'premium') {
            totalPrice = 400000;
        } else {
            return res.status(400).json({ message: 'Gói học không hợp lệ.' });
        }

        // 3. Khởi tạo booking với trạng thái pending
        const [result] = await db.query(
            `INSERT INTO bookings (student_id, mentor_id, plan_type, booking_date, total_price, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [studentId, mentor_id, plan_type, mysqlBookingDate, totalPrice]
        );

        res.status(201).json({ 
            message: 'Tạo booking thành công. Chuyển sang tiến trình trả phí...',
            bookingId: result.insertId 
        });
    } catch (error) {
        console.error('Lỗi khi create Booking:', error);
        res.status(500).json({ message: 'Lỗi hệ thống chi tiết: ' + error.message });
    }
};
//LẤY DANH SÁCH HỌC VIÊN ĐĂNG KÝ (Dành cho Mentor)
const getIncomingBookings = async (req, res) => {
    try {
        const mentorId = req.user.id; 

        const query = `
            SELECT b.id, b.plan_type, b.status, b.created_at, b.total_price, b.booking_date,
                   u.full_name as student_name, u.email as student_email, u.phone as student_phone
            FROM bookings b
            JOIN users u ON b.student_id = u.id 
            WHERE b.mentor_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.query(query, [mentorId]);

        res.status(200).json({
            message: 'Lấy danh sách yêu cầu thành công!',
            data: bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
// ---  CẬP NHẬT TRẠNG THÁI (Chấp nhận / Từ chối) ---

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body; 
        const mentorId = req.user.id;

        const bId = parseInt(bookingId);
        // kiem tra xem lich hen co ton tai va dung la cua mentor nay khong
        const [bookingRows] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND mentor_id = ?',
            [bId, mentorId]
        );

        if (bookingRows.length === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy lịch hẹn hoặc bạn không có quyền duyệt yêu cầu này." 
            });
        }

        const [updateResult] = await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, bId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: "Không thể cập nhật database!" });
        }

        try {
            const message = status === 'confirmed' 
                ? "Mentor đã xác nhận lịch hẹn của bạn! Hãy chuẩn bị nhé." 
                : "Rất tiếc, Mentor đã từ chối lịch hẹn này.";
            
            if (typeof sendNoti === 'function') {
                await sendNoti(bookingRows[0].student_id, message, mentorId);
            }

            // [NEW] Tạo sự kiện Google Calendar khi Xác Nhận
            if (status === 'confirmed') {
                const bookingDate = bookingRows[0].booking_date;
                const studentId = bookingRows[0].student_id;
                const endTime = new Date(new Date(bookingDate).getTime() + 60 * 60 * 1000); // Học 1 tiếng
                
                // Lấy email mentee và mentor để gửi invite
                const [users] = await db.query('SELECT id, email, full_name, google_access_token, google_refresh_token FROM users WHERE id IN (?, ?)', [studentId, mentorId]);
                
                let authUser = users.find(u => u.google_access_token != null);
                let student = users.find(u => u.id === studentId);
                let mentor = users.find(u => u.id === mentorId);

                if (authUser) {
                    const oauth2Client = new require('googleapis').google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
                    oauth2Client.setCredentials({ access_token: authUser.google_access_token, refresh_token: authUser.google_refresh_token });
                    const calendar = require('googleapis').google.calendar({ version: 'v3', auth: oauth2Client });

                    const event = {
                        summary: `Lịch học Mentor: ${mentor.full_name} & ${student.full_name}`,
                        description: `Buổi hướng dẫn 1-1 trên Mentor Platform.`,
                        start: { dateTime: new Date(bookingDate).toISOString(), timeZone: 'Asia/Ho_Chi_Minh' },
                        end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Ho_Chi_Minh' },
                        attendees: [{ email: student.email }, { email: mentor.email }],
                        conferenceData: {
                            createRequest: {
                                requestId: `mentor-meet-${bookingRows[0].id}-${Date.now()}`,
                                conferenceSolutionKey: { type: 'hangoutsMeet' }
                            }
                        }
                    };

                    await calendar.events.insert({
                        calendarId: 'primary',
                        conferenceDataVersion: 1,
                        requestBody: event,
                        sendUpdates: 'all' // Gửi email cho attendee
                    });
                }
            }
        } catch (notiError) {
            console.error(" Lỗi gửi thông báo nhưng DB đã được cập nhật:", notiError.message);
        }

        return res.status(200).json({ 
            message: `Đã ${status === 'confirmed' ? 'Xác nhận' : 'Từ chối'} lịch hẹn thành công!` 
        });
    } catch (error) {
        console.error(" LỖI HỆ THỐNG:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật lịch." });
    }
};


// ---   LẤY LỊCH SỬ ĐẶT LỊCH (Dành cho Học viên) ---
const getMyBookings = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const query = `
            SELECT 
                b.id, 
                b.plan_type, 
                b.status, 
                b.created_at, 
                b.booking_date,
                u.full_name as mentor_name, 
                u.email as mentor_email,
                u.phone as mentor_phone
            FROM bookings b
            JOIN users u ON b.mentor_id = u.id
            WHERE b.student_id = ? 
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [studentId]);

        res.status(200).json({
            message: 'Lấy lịch sử thành công!',
            data: bookings
        });
    } catch (error) {
        console.error('Lỗi SQL:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const mentorId = req.user.id;

        const [result] = await db.query(
            "UPDATE bookings SET status = 'completed' WHERE id = ? AND mentor_id = ? AND status = 'confirmed'",
            [bookingId, mentorId]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Không thể hoàn thành (Lịch phải ở trạng thái 'confirmed' trước đó)." });
        }

        res.status(200).json({ message: "Chúc mừng bạn đã hoàn thành buổi dạy! Học viên hiện đã có thể đánh giá bạn." });

    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kết thúc buổi học." });
    }
};

const aiSuggest = async (req, res) => {
    try {
        const studentId = req.user.id;
        // Hỗ trợ cả hai trường hợp Frontend gửi lên là mentor_id hoặc mentorId
        const mentor_id = req.body.mentor_id || req.body.mentorId;

        if (!mentor_id) {
            return res.status(400).json({ message: "Thiếu thông tin mentor_id." });
        }

        const [menteeRows] = await db.query('SELECT scheduling_constraints FROM users WHERE id = ?', [studentId]);
        const [mentorRows] = await db.query('SELECT scheduling_constraints FROM users WHERE id = ?', [mentor_id]);

        const mentorConstraints = mentorRows.length > 0 ? (mentorRows[0].scheduling_constraints || "Ưu tiên linh hoạt.") : "";
        const menteeConstraints = menteeRows.length > 0 ? (menteeRows[0].scheduling_constraints || "Rảnh sau 19h và cuối tuần.") : "";

        // Function helper lấy lịch rảnh Google Calendar
        const { google } = require('googleapis');
        const getFreeBusy = async (userId) => {
            try {
                const [uRows] = await db.query('SELECT google_access_token, google_refresh_token FROM users WHERE id = ?', [userId]);
                if (uRows.length && uRows[0].google_access_token) {
                    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
                    oauth2Client.setCredentials({ access_token: uRows[0].google_access_token, refresh_token: uRows[0].google_refresh_token });
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                    
                    const timeMin = new Date().toISOString();
                    const timeMax = new Date();
                    timeMax.setDate(timeMax.getDate() + 7); // Phân tích 7 ngày tới
                    const res = await calendar.freebusy.query({
                        requestBody: {
                             timeMin: timeMin,
                             timeMax: timeMax.toISOString(),
                             items: [{ id: 'primary' }]
                        }
                    });
                    if (res.data.calendars && res.data.calendars['primary']) {
                        return res.data.calendars['primary'].busy || [];
                    }
                }
            } catch (err) {
                console.error(`Lỗi khi lấy lịch rảnh Google Calendar cho user ${userId}:`, err.message);
                // Bỏ qua lỗi token Google để Gemini vẫn có thể phân tích thời gian rảnh qua Text (Constraint)
            }
            return []; // rỗng nếu chưa link
        };

        const menteeSchedule = await getFreeBusy(studentId);
        const mentorSchedule = await getFreeBusy(mentor_id);

        // Call Gemini
        const slots = await suggestSlots(mentorSchedule, menteeSchedule, mentorConstraints, menteeConstraints);

        res.status(200).json({
            message: "AI đã phân tích thành công",
            data: slots
        });
    } catch (e) {
        console.error("Lỗi AI Suggest:", e);
        res.status(500).json({ message: "AI bị lỗi hoặc bận. Chi tiết: " + e.message });
    }
};

module.exports = { createBooking, getIncomingBookings, 
    updateBookingStatus, getMyBookings, completeBooking, aiSuggest };