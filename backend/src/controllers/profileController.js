const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// GET /api/profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const [userRows] = await db.query('SELECT id, full_name, email, phone, avatar, role, scheduling_constraints FROM users WHERE id = ?', [userId]);

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const userProfile = userRows[0];

        if (role === 'mentor') {
            const [mentorRows] = await db.query('SELECT bio, expertise FROM mentors WHERE user_id = ?', [userId]);
            if (mentorRows.length > 0) {
                userProfile.bio = mentorRows[0].bio;
                userProfile.expertise = mentorRows[0].expertise;
            }

            const [plans] = await db.query('SELECT plan_type, price, description FROM plans WHERE mentor_id = ?', [userId]);
            userProfile.plans = plans;
        }

        res.status(200).json({ message: 'Lấy thông tin hồ sơ thành công.', data: userProfile });

    } catch (error) {
        console.error('Lỗi khi lấy hồ sơ:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// PATCH /api/profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        // Các trường cho bảng 'users' (chung cho cả hai)
        const { full_name, scheduling_constraints, phone } = req.body;
        // Các trường cho bảng 'mentors'
        const { bio, expertise } = req.body;
        // Các trường cho bảng 'plans' (dành cho mentor, gửi lên dưới dạng chuỗi JSON)
        const { plans } = req.body;

        // --- Cập nhật bảng 'users' ---
        const userUpdateFields = {};
        if (full_name) userUpdateFields.full_name = full_name;
        if (scheduling_constraints) userUpdateFields.scheduling_constraints = scheduling_constraints;
        if (phone !== undefined) userUpdateFields.phone = phone;

        // Xử lý upload avatar
        if (req.file) {
            const avatarUrl = `/uploads/${req.file.filename}`;
            userUpdateFields.avatar = avatarUrl;
            
            // Tùy chọn: Xóa file avatar cũ để tiết kiệm dung lượng
            const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
            const oldAvatar = userRows[0]?.avatar;
            if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
                const oldAvatarPath = path.join(__dirname, '..', '..', 'uploads', path.basename(oldAvatar));
                fs.unlink(oldAvatarPath, (err) => {
                    if (err) console.error("Lỗi xóa avatar cũ:", err);
                });
            }
        }

        if (Object.keys(userUpdateFields).length > 0) {
            await db.query('UPDATE users SET ? WHERE id = ?', [userUpdateFields, userId]);
        }

        // --- Cập nhật bảng 'mentors' và 'plans' (chỉ dành cho mentor) ---
        if (role === 'mentor') {
            const mentorUpdateFields = {};
            if (bio) mentorUpdateFields.bio = bio;
            if (expertise) mentorUpdateFields.expertise = expertise;

            if (Object.keys(mentorUpdateFields).length > 0) {
                await db.query('UPDATE mentors SET ? WHERE user_id = ?', [mentorUpdateFields, userId]);
            }
            
            // Cập nhật bảng 'plans'
            if (plans) {
                const parsedPlans = JSON.parse(plans);
                if(Array.isArray(parsedPlans)) {
                    const connection = await db.getConnection();
                    await connection.beginTransaction();
                    try {
                        for (const plan of parsedPlans) {
                            await connection.query(
                                'UPDATE plans SET price = ?, description = ? WHERE mentor_id = ? AND plan_type = ?',
                                [plan.price, plan.description, userId, plan.plan_type]
                            );
                        }
                        await connection.commit();
                    } catch (planError) {
                        await connection.rollback();
                        throw planError;
                    } finally {
                        connection.release();
                    }
                }
            }
        }

        res.status(200).json({ message: 'Cập nhật hồ sơ thành công.' });

    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

module.exports = { getProfile, updateProfile };