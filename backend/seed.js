const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function runSeeder() {
    try {
        console.log("--- Bắt đầu khởi tạo dữ liệu Mentor Platform ---");

        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['notifications', 'reviews', 'bookings', 'plans', 'mentors', 'users'];
        for (let table of tables) {
            await db.query(`TRUNCATE TABLE ${table}`);
        }
        console.log("=> Đã xóa sạch dữ liệu cũ.");

        const hashedPass = await bcrypt.hash('123456', 10);

const userData = [
    ['Nguyễn Hoàng Nam', 'nam@student.com', hashedPass, 'student', '0901000001'],
    ['Lê Thị Tú', 'tu@student.com', hashedPass, 'student', '0901000002'],
    ['Trần Thanh', 'thanh@student.com', hashedPass, 'student', '0901000003'],
    ['Phạm Anh', 'anh@student.com', hashedPass, 'student', '0901000004'],
    ['Vũ Linh', 'linh@student.com', hashedPass, 'student', '0901000005'],

    ['Trần Đức Huy', 'huy.tran@gmail.com', hashedPass, 'mentor', '0902000002'],
    ['Lê Hoàng Phúc', 'phuc.le@gmail.com', hashedPass, 'mentor', '0902000003'],
    ['Phạm Gia Bảo', 'bao.pham@gmail.com', hashedPass, 'mentor', '0902000004'],
    ['Võ Thanh Tùng', 'tung.vo@gmail.com', hashedPass, 'mentor', '0902000005'],
    ['Đặng Quốc Khánh', 'khanh.dang@gmail.com', hashedPass, 'mentor', '0902000006'],
    ['Bùi Anh Tuấn', 'tuan.bui@gmail.com', hashedPass, 'mentor', '0902000007'],
    ['Phan Minh Trí', 'tri.phan@gmail.com', hashedPass, 'mentor', '0902000008'],
    ['Ngô Thành Đạt', 'dat.ngo@gmail.com', hashedPass, 'mentor', '0902000009'],
    ['Huỳnh Gia Hưng', 'hung.huynh@gmail.com', hashedPass, 'mentor', '0902000010'],
    ['Đỗ Minh Khang', 'khang.do@gmail.com', hashedPass, 'mentor', '0902000011'],
    ['Trương Nhật Nam', 'nam.truong@gmail.com', hashedPass, 'mentor', '0902000012'],
    ['Lý Hoàng Long', 'long.ly@gmail.com', hashedPass, 'mentor', '0902000013'],
    ['Mai Thanh Phong', 'phong.mai@gmail.com', hashedPass, 'mentor', '0902000014'],
    ['Nguyễn Hải Đăng', 'dang.nguyen@gmail.com', hashedPass, 'mentor', '0902000015'],
    ['Trần Quang Vinh', 'vinh.tran@gmail.com', hashedPass, 'mentor', '0902000016'],
    ['Lê Tuấn Kiệt', 'kiet.le@gmail.com', hashedPass, 'mentor', '0902000017'],
    ['Phạm Công Thành', 'thanh.pham@gmail.com', hashedPass, 'mentor', '0902000018'],
    ['Vũ Đức Thịnh', 'thinh.vu@gmail.com', hashedPass, 'mentor', '0902000019'],
    ['Hoàng Minh Tài', 'tai.hoang@gmail.com', hashedPass, 'mentor', '0902000020']
];
        const [userResult] = await db.query('INSERT INTO users (full_name, email, password, role, phone) VALUES ?', [userData]);
        const firstMentorId = userResult.insertId + 5; // ID bắt đầu của mentor đầu tiên

        // 4. Nạp Mentors (Chi tiết profile)
const mentorData = [
    [firstMentorId, 'Sinh viên xuất sắc GPA 3.9, chuyên ôn thi cuối kỳ', 'Giải tích 1', 0],
    [firstMentorId + 1, 'Trợ giảng môn Toán cao cấp, nhiều kinh nghiệm hỗ trợ sinh viên', 'Giải tích 2', 0],
    [firstMentorId + 2, 'Top đầu lớp Toán tin, giải thích dễ hiểu', 'Đại số tuyến tính', 0],
    [firstMentorId + 3, 'Giảng viên trẻ khoa Toán, dạy logic và dễ tiếp thu', 'Xác suất thống kê', 0],
    [firstMentorId + 4, 'Sinh viên Vật lý kỹ thuật, mạnh về bài tập', 'Vật lý đại cương 1 (Cơ học)', 0],
    [firstMentorId + 5, 'Trợ giảng Vật lý, chuyên chữa bài tập khó', 'Vật lý đại cương 2 (Điện - Từ)', 0],
    [firstMentorId + 6, 'Sinh viên IT chuyên ngành AI, nền tảng toán tốt', 'Toán rời rạc', 0],
    [firstMentorId + 7, 'Sinh viên năm 4 CNTT, chuyên ôn thi', 'Cấu trúc dữ liệu & Giải thuật', 0],
    [firstMentorId + 8, 'Giảng viên lập trình, dạy từ cơ bản đến nâng cao', 'Nhập môn lập trình (C/C++)', 0],
    [firstMentorId + 9, 'Developer part-time, nhiều ví dụ thực tế', 'Lập trình hướng đối tượng (OOP)', 0],
    [firstMentorId + 10, 'Sinh viên hệ thống thông tin, mạnh SQL', 'Cơ sở dữ liệu', 0],
    [firstMentorId + 11, 'Sinh viên mạng máy tính, hiểu rõ mô hình OSI', 'Mạng máy tính', 0],
    [firstMentorId + 12, 'Trợ giảng hệ điều hành, dạy dễ hiểu', 'Hệ điều hành', 0],
    [firstMentorId + 13, 'Sinh viên an toàn thông tin', 'An toàn thông tin cơ bản', 0],
    [firstMentorId + 14, 'Sinh viên ngành IoT', 'Hệ thống nhúng', 0],
    [firstMentorId + 15, 'Sinh viên kỹ thuật phần mềm', 'Công nghệ phần mềm', 0],
    [firstMentorId + 16, 'Sinh viên kinh tế', 'Kinh tế vi mô', 0],
    [firstMentorId + 17, 'Sinh viên tài chính', 'Kinh tế vĩ mô', 0],
    [firstMentorId + 18, 'IELTS 7.5+, hỗ trợ đọc tài liệu IT', 'Tiếng Anh chuyên ngành IT', 0],
    [firstMentorId + 19, 'Sinh viên marketing, dễ hiểu', 'Marketing căn bản', 0]
];

        await db.query('INSERT INTO mentors (user_id, bio, expertise, avg_rating) VALUES ?', [mentorData]);


        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("✅ Hệ thống đã sẵn sàng với dữ liệu mẫu đầy đủ!");
        process.exit();

    } catch (err) {
        console.error("❌ Lỗi Seeder:", err);
        process.exit(1);
    }
}

runSeeder();