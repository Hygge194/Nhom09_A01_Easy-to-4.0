const { google } = require('googleapis');
const db = require('../config/db');

const getOAuth2Client = (req) => {
    let redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri && req) {
        const host = req.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        redirectUri = `${protocol}://${host}/api/calendar/oauth-callback`;
    }
    
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri || 'http://localhost:12082/api/calendar/oauth-callback'
    );
};

// Mảng quyền yêu cầu khi liên kết
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly', // Đọc lịch rảnh
    'https://www.googleapis.com/auth/calendar.events',    // Tạo sự kiện & Meet
    'openid', 'email', 'profile'
];

/**
 * Endpoint điều hướng người dùng tới trang Đăng nhập Google
 */
const getAuthUrl = (req, res) => {
    try {
        const userId = req.user.id; 
        const oauth2Client = getOAuth2Client(req);
        
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline', 
            prompt: 'consent',     
            scope: SCOPES,
            state: userId.toString() 
        });
        res.status(200).json({ authUrl: url });
    } catch (e) {
        console.error("Lỗi Google Auth URL:", e);
        res.status(500).json({ message: "Không tạo được đường dẫn liên kết" });
    }
};

const oauthCallback = async (req, res) => {
    try {
        const { code, state } = req.query; 
        if (!code || !state) {
            return res.status(400).send("Thiếu tham số xác thực từ Google.");
        }

        const userId = parseInt(state, 10);
        const oauth2Client = getOAuth2Client(req);

        const { tokens } = await oauth2Client.getToken(code);
        
        // Cập nhật Token vào Database
        let updateQuery = 'UPDATE users SET google_access_token = ?';
        let queryParams = [tokens.access_token];

        if (tokens.refresh_token) {
            updateQuery += ', google_refresh_token = ?';
            queryParams.push(tokens.refresh_token);
        }
        
        updateQuery += ' WHERE id = ?';
        queryParams.push(userId);

        await db.query(updateQuery, queryParams);

        // Thành công -> Chuyển hướng người dùng về trang giao diện với cờ success
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mentor-web-1.onrender.com' 
            : 'http://localhost:5500';
        
        res.send(`<script>
            alert("Đã kết nối Google Calendar thành công! Hệ thống sẽ chuyển hướng bạn đến Lịch xem ngay.");
            window.location.href = "https://calendar.google.com/calendar/u/0/r?pli=1";
        </script>`);
        
    } catch (error) {
        console.error("Lỗi callback:", error);
        res.status(500).send("Lỗi khi kết nối Google. Kênh token có thể không hợp lệ.");
    }
};

module.exports = { getAuthUrl, oauthCallback, getOAuth2Client };
