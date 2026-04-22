# 🎓 Mentor Platform

**Mentor Platform** là một nền tảng web kết nối trực tiếp giữa Học viên (Mentee) và những Người hướng dẫn (Mentor) giàu kinh nghiệm. Dự án cung cấp giải pháp toàn diện từ việc tìm kiếm Mentor, phân tích lịch rảnh thông minh bằng AI, đến đặt lịch, thanh toán trực tuyến và tự động tạo phòng họp qua Google Meet.

## Tính năng nổi bật

### Dành cho Sinh viên (Student)
- **Tìm kiếm & Xem hồ sơ:** Dễ dàng tìm kiếm Mentor theo tên, kỹ năng hoặc môn học.
- **Gợi ý lịch học bằng AI (Google Gemini):** Tự động phân tích lịch rảnh của cả 2 bên và gợi ý thời gian học tối ưu nhất.
- **Đặt lịch & Thanh toán:** Hỗ trợ nhiều gói học (Beginner, Plus, Premium) và thanh toán an toàn qua cổng **VNPay**.
- **Liên kết Google Calendar:** Tự động nhận thư mời và link **Google Meet** ngay khi Mentor xác nhận lịch.
- **Đánh giá (Review):** Để lại số sao và nhận xét chi tiết sau mỗi buổi học.

### Dành cho Mentor
- **Quản lý Hồ sơ chuyên môn:** Cập nhật tiểu sử, kỹ năng, kinh nghiệm và tùy chỉnh giá các gói dạy.
- **Đồng bộ Lịch cá nhân:** Liên kết Google Calendar để tránh trùng lịch và tự động tạo phòng họp.
- **Quản lý Yêu cầu Đặt lịch:** Duyệt, từ chối hoặc hoàn thành các buổi học ngay trên Dashboard.
- **Thống kê Thu nhập:** Theo dõi tổng doanh thu dựa trên các buổi học đã được hoàn thành.

---

## Công nghệ sử dụng

### Frontend
- Giao diện: **HTML5, CSS3, Vanilla JavaScript**.
- Styling: Sử dụng **Tailwind CSS** cho giao diện hiện đại, tối giản và hiển thị tốt trên mọi thiết bị (Responsive).

### Backend
- Framework: **Node.js, Express.js**.
- Database: **MySQL** (Sử dụng thư viện `mysql2`).
- Xác thực & Bảo mật: **JWT (JSON Web Token)** và mã hóa mật khẩu với **bcryptjs**.
- Tải file: **Multer** (cho upload avatar, ảnh hồ sơ).
- Tích hợp bên thứ 3 (3rd-party APIs):
  - **Google Gemini AI 1.5 Pro:** Xử lý và phân tích dữ liệu lịch trình phức tạp.
  - **Google APIs (OAuth2 & Calendar/Meet):** Cấp quyền và tạo sự kiện họp trực tuyến tự động.
  - **VNPay:** Cổng thanh toán nội địa.

---

## Cấu trúc thư mục

```text
mentor-platform/
│
├── backend/                  # Mã nguồn server backend (API)
│   ├── src/
│   │   ├── config/           # Cấu hình kết nối Database (MySQL)
│   │   ├── controllers/      # Chứa logic xử lý của từng API
│   │   ├── routes/           # Định tuyến API (auth, mentors, bookings, reviews)
│   │   └── ...
│   ├── uploads/              # Thư mục lưu trữ file ảnh upload
│   ├── .env                  # Chứa biến môi trường cho Backend
│   ├── index.js              # File khởi chạy Server Express
│   └── package.json          # Thư viện & Dependencies Backend
│
├── frontend/                 # Mã nguồn giao diện chính
│   ├── assets/               # Hình ảnh, tài nguyên tĩnh
│   ├── css/                  # Thư mục CSS
│   ├── js/                   # Thư mục JavaScript tương tác tĩnh
│   ├── index.html            # Trang chủ
│   ├── login.html            # Trang đăng nhập
│   └── ...                   # Các trang HTML khác
│
└── README.md                 # Tài liệu dự án
```

---

## Hướng dẫn Cài đặt & Chạy dự án

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản >= 16.x
- **MySQL**: Đã cài đặt MySQL Server và đang chạy.

### 2. Thiết lập Backend

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   Tạo file `.env` trong thư mục `backend` và cấu hình toàn bộ các biến sau:
   ```env
   PORT=5000
   
   # Database MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mentor_db

   # Security
   JWT_SECRET=chuoi-bi-mat-cua-ban

   # Google API (Dành cho Calendar & Meet)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth-callback

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # VNPay Configuration
   VNP_TMN_CODE=your_vnp_tmn_code
   VNP_HASH_SECRET=your_vnp_hash_secret
   VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNP_RETURN_URL=http://localhost:5500/dashboard-student.html
   ```
   *(Lưu ý: Sau khi tạo Database rỗng, bạn hãy chạy lệnh `node seed.js` để hệ thống tự động khởi tạo bảng và nạp dữ liệu mẫu)*

4. Khởi chạy Server:
   ```bash
   npm run dev
   ```

### 3. Thiết lập Frontend

1. Đi vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Dự án Frontend gồm các file HTML, CSS và JS thuần. Bạn có thể mở trực tiếp file `index.html` trên trình duyệt.
   Tuy nhiên, để gọi API không bị lỗi CORS hoặc đường dẫn tĩnh, bạn hãy dùng **Live Server** trên VS Code hoặc một file server tĩnh:
   - Dùng extension **Live Server** trên VSCode bằng cách click chuột phải vào file `index.html` và chọn *Open with Live Server*.
   - Hoặc cài đặt gói `serve` toàn cục:
     ```bash
     npm install -g serve
     serve .
     ```

---

## Các API Endpoints chính (Tham khảo)

Toàn bộ các API được điều hướng bắt đầu bằng `/api/`.

- **Xác thực (Auth)** `[/api/auth]`
  - Đăng ký, đăng nhập tài khoản.
- **Mentor** `[/api/mentors]`
  - Lấy danh sách mentor, chi tiết mentor, tạo hoặc cập nhật hồ sơ mentor.
- **Đặt lịch (Booking)** `[/api/bookings]`
  - Tạo booking mới, lấy danh sách đặt lịch theo user/mentor, cập nhật trạng thái đặt lịch.
- **Đánh giá (Reviews)** `[/api/reviews]`
  - Thêm đánh giá mới, lấy đánh giá của một mentor.
- **Thanh toán (Payments)** `[/api/payments]`
  - Tạo URL thanh toán VNPay, xử lý IPN và Return URL.
- **Google Calendar** `[/api/calendar]`
  - Ủy quyền OAuth2 và đồng bộ lịch.

---

> Phát triển và hoàn thiện nền tảng web nhằm mang lại trải nghiệm tiện lợi và dễ dàng nhất cho việc kết nối giữa sinh viên và mentor!
