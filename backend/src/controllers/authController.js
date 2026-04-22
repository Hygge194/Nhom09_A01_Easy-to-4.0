const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcryptjs'); 

const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult] = await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'student']
        );

        res.status(201).json({ 
            message: 'Đăng ký tài khoản Student thành công!',
            userId: userResult.insertId
        });

    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Nhập đủ email và mật khẩu nhé!' });
        }

        // Tìm người dùng bằng email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email không tồn tại!' });
        }
        const user = users[0];

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key', 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(' Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}

module.exports = { register, login };