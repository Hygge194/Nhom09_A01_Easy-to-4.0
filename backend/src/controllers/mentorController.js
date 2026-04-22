const db = require('../config/db');
const fs = require('fs');
const path = require('path');
// ---  LẤY DANH SÁCH MENTOR (CÓ LỌC & PHÂN TRANG) ---
const getAllMentors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;      
        const limit = parseInt(req.query.limit) || 10;  
        const expertise = req.query.expertise;           
        const search = req.query.search;               

        // 2. Tính toán OFFSET
        const offset = (page - 1) * limit;

        let query = `
            SELECT u.id, u.full_name, u.avatar, m.bio, m.expertise, m.avg_rating 
            FROM users u 
            JOIN mentors m ON u.id = m.user_id
            WHERE 1=1
        `;
        const queryParams = [];

        if (search) {
            query += ` AND u.full_name LIKE ?`;
            queryParams.push(`%${search}%`);
        }

        // Nếu có yêu cầu lọc theo môn học
        if (expertise) {
            query += ` AND m.expertise = ?`;
            queryParams.push(expertise);
        }

        // 4. Thêm điều kiện Sắp xếp và Phân trang 
        query += ` ORDER BY m.avg_rating DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        // 5. Thực thi câu lệnh SQL
        const [mentors] = await db.query(query, queryParams);

        //  Đếm tổng số lượng Mentor thỏa mãn điều kiện để UI biết có bao nhiêu trang
        let countQuery = `SELECT COUNT(*) as totalItems FROM users u JOIN mentors m ON u.id = m.user_id WHERE 1=1`;
        const countParams = [];
        if (search) { countQuery += ` AND u.full_name LIKE ?`; countParams.push(`%${search}%`); }
        if (expertise) { countQuery += ` AND m.expertise = ?`; countParams.push(expertise); }
        
        const [totalResult] = await db.query(countQuery, countParams);
        const totalItems = totalResult[0].totalItems;
        const totalPages = Math.ceil(totalItems / limit);

        // 6. Trả kết quả về cho người dùng
        res.status(200).json({
            message: 'Lấy danh sách Mentor thành công!',
            pagination: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit
            },
            data: mentors
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};
// --- HÀM 2: LẤY CHI TIẾT 1 MENTOR ---
const getMentorById = async (req, res) => {
    try {
        const mentorId = req.params.id;

        // 1. Lấy thông tin cơ bản của Mentor
        const queryInfo = `
        SELECT u.id, u.full_name, u.email, u.avatar, m.bio, 
            (SELECT IFNULL(AVG(rating), 0) FROM reviews WHERE mentor_id = u.id) as avg_rating
        FROM users u 
        JOIN mentors m ON u.id = m.user_id
        WHERE u.id = ?
    `;
        const [mentors] = await db.query(queryInfo, [mentorId]);

        if (mentors.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy Mentor này!' });
        }

        // 2. Lấy danh sách các gói học (Plans)
        const [plans] = await db.query(
            'SELECT plan_type, price, description FROM plans WHERE mentor_id = ?', 
            [mentorId]
        );

        // 3. LẤY DANH SÁCH ĐÁNH GIÁ (REVIEWS) - Phần mới thêm
        const queryReviews = `
            SELECT r.rating, r.comment, r.created_at, u.full_name as student_name 
            FROM reviews r
            JOIN users u ON r.student_id = u.id
            WHERE r.mentor_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.query(queryReviews, [mentorId]);

        // 4. Trả về đầy đủ dữ liệu cho Frontend
        res.status(200).json({
            message: 'Lấy chi tiết Mentor thành công!',
            mentor: mentors[0],
            plans: plans,
            reviews: reviews // Gửi thêm mảng reviews về
        });

    } catch (error) {
        console.error('Lỗi khi lấy chi tiết Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Không lấy được thông báo." });
    }
};
module.exports = { getAllMentors, getMentorById, getMyNotifications };

const updateMentorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, expertise, bio } = req.body;
        
        // Xử lý file avatar nếu có (do multer truyền vào req.file)
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;

        // 1. Cập nhật thông tin chung trong bảng users
        let userQuery = 'UPDATE users SET full_name = ?';
        const userParams = [full_name];
        
        if (avatar) {
            userQuery += ', avatar = ?';
            userParams.push(avatar);
        }
        
        userQuery += ' WHERE id = ?';
        userParams.push(userId);
        
        await db.query(userQuery, userParams);

        // 2. Cập nhật thông tin chuyên môn trong bảng mentors
        await db.query(
            'UPDATE mentors SET expertise = ?, bio = ? WHERE user_id = ?',
            [expertise, bio, userId]
        );

        res.status(200).json({ message: 'Cập nhật hồ sơ thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = { getAllMentors, getMentorById, getMyNotifications, updateMentorProfile };