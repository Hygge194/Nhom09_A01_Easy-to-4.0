const db = require('../config/db');

const createReview = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { booking_id, rating, comment } = req.body;

        const [booking] = await db.query(
            "SELECT * FROM bookings WHERE id = ? AND student_id = ? AND status = 'completed'",
            [booking_id, studentId]
        );

        if (booking.length === 0) {
            return res.status(400).json({ 
                message: "Bạn chỉ có thể đánh giá những buổi học đã hoàn thành (completed)!" 
            });
        }

        const mentorId = booking[0].mentor_id;

        // Lưu đánh giá vào bảng reviews
        await db.query(
            'INSERT INTO reviews (booking_id, student_id, mentor_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [booking_id, studentId, mentorId, rating, comment]
        );

        const [avgResult] = await db.query(
            'SELECT AVG(rating) as average FROM reviews WHERE mentor_id = ?',
            [mentorId]
        );
        
        const newAvg = parseFloat(avgResult[0].average) || 0;

        await db.query('UPDATE mentors SET avg_rating = ? WHERE user_id = ?', [newAvg, mentorId]);

        res.status(201).json({ 
            message: "Cảm ơn bạn đã đánh giá!", 
            new_rating: newAvg.toFixed(1) 
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Bạn đã đánh giá buổi học này rồi!" });
        }
        console.error("Lỗi Review:", error);
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

const getReviewsByMentor = async (req, res) => {
    try {
        const { mentorId } = req.params;

        const [reviews] = await db.query(`
            SELECT 
                r.id, r.rating, r.comment, r.created_at, 
                u.full_name AS student_name
            FROM reviews r
            JOIN users u ON r.student_id = u.id
            WHERE r.mentor_id = ?
            ORDER BY r.created_at DESC
        `, [mentorId]);

        res.status(200).json({ 
            message: "Lấy danh sách đánh giá thành công",
            data: reviews 
        });

    } catch (error) {
        console.error("Lỗi Fetch Review:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tải đánh giá." });
    }
};

module.exports = { 
    createReview, 
    getReviewsByMentor 
};