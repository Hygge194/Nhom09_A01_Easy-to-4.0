const API_URL = 'https://mentor-web-1.onrender.com/api';

// 1. Hàm Đăng ký
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
    }
}
async function handleRegister() {
    const full_name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('register-btn');

    // Validate nhanh ở Frontend
    if (!full_name || !email || !password) {
        return alert("⚠️ Vui lòng điền đầy đủ thông tin!");
    }
    if (password.length < 6) {
        return alert("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
    }

    // Hiệu ứng Loading cho nút
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            alert("❌ " + result.message);
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert(" Lỗi kết nối máy chủ, vui lòng thử lại sau.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>ĐĂNG KÝ TÀI KHOẢN</span>';
    }
}
// 2. Hàm Đăng nhập
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Lưu token và thông tin user vào LocalStorage
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.full_name);
        }
        return data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
    }
}

// 3. Hàm Đăng xuất
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 4. Hàm kiểm tra đã đăng nhập chưa (Dùng để bảo vệ các trang dashboard)
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// 5. Hàm liên kết Google Calendar
async function linkGoogleCalendar() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("Bạn cần đăng nhập trước!");
    
    try {
        const res = await fetch(`${API_URL}/calendar/auth-url`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.authUrl) {
            window.location.href = data.authUrl;
        } else {
            alert(data.message || "Lỗi tạo đường dẫn liên kết Google.");
        }
    } catch (e) {
        console.error("Lỗi liên kết Google:", e);
        alert("Lỗi kết nối máy chủ khi liên kết Google.");
    }
}