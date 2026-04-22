# Mentor Platform

Mentor Platform là một nền tảng web ứng dụng kết nối giữa các sinh viên và những người hướng dẫn (Mentor) giàu kinh nghiệm. Dự án giúp sinh viên dễ dàng tìm kiếm, đặt lịch hẹn và nhận được sự tư vấn, hỗ trợ từ các Mentor.

## Tính năng nổi bật

### Dành cho Sinh viên (Student)
- **Tìm kiếm Mentor:** Xem danh sách Mentor, xem hồ sơ chi tiết và lĩnh vực chuyên môn của họ.
- **Đặt lịch hẹn (Booking):** Lên lịch hẹn với Mentor theo thời gian rảnh.
- **Đánh giá & Nhận xét:** Để lại đánh giá cho Mentor sau khi hoàn thành buổi hướng dẫn.
- **Quản lý tài khoản:** Xem lịch sử đặt hẹn thông qua Dashboard.

### Dành cho Mentor
- **Quản lý Hồ sơ:** Hiển thị thông tin cá nhân, kỹ năng.
- **Quản lý Lịch hẹn:** Theo dõi các yêu cầu đặt lịch từ sinh viên.
- **Xem đánh giá:** Xem các nhận xét từ sinh viên để cải thiện chất lượng hỗ trợ.

---

## Công nghệ sử dụng

### Frontend
- Giao diện thuần tĩnh: **HTML5, CSS3, Vanilla JavaScript**.
- Hỗ trợ đầy đủ các trang: `index.html` (Trang chủ), `login.html`, `register.html`, `mentors.html`, danh sách & chi tiết Mentor, Dashboard sinh viên và Mentor.

### Backend
- Framework: **Node.js, Express.js**.
- Xác thực & Bảo mật: **JWT (JSON Web Token), bcryptjs**.
- Tải file: **Multer** (cho upload avatar, ảnh hồ sơ).
- Cơ sở dữ liệu:
  - **MySQL:** Lưu trữ dữ liệu chính (người dùng, hồ sơ, đặt lịch, đánh giá). Sử dụng `mysql2`.
  - **ClickHouse:** (Tùy chọn) Lưu trữ log hoặc phân tích dữ liệu quy mô lớn (`@clickhouse/client`).

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
   Mở hoặc tạo file `.env` trong thư mục `backend` và điền các thông tin kết nối DB (Ví dụ mẫu):
   ```env
   PORT=5000

   # Database MySQL Configuration (Thêm cấu hình phù hợp với máy của bạn)
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mentor_db
   JWT_SECRET=
   *(Lưu ý: Bạn cần tạo database MySQL có tên giống trong file `.env` và import schema nếu có trước khi chạy)*

4. Khởi chạy Server:
   Dành cho môi trường phát triển (sẽ tự tải lại server khi code thay đổi):
   ```bash
   npm run dev
   ```
   *Terminal sẽ hiện thông báo: "🚀 Server Backend đang chạy tại cổng http://localhost:5000"*

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

---

> Phát triển và hoàn thiện nền tảng web nhằm mang lại trải nghiệm tiện lợi và dễ dàng nhất cho việc kết nối giữa sinh viên và mentor!
