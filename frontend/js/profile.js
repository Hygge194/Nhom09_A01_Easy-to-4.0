const API_URL = 'https://mentor-web-1.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    loadProfileData();

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleUpdateProfile);
    }
});

async function loadProfileData() {
    const token = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Không thể tải hồ sơ');
        }

        const result = await response.json();
        renderProfileForm(result.data);

    } catch (error) {
        console.error("Lỗi tải hồ sơ:", error);
        alert(error.message);
    }
}

function renderProfileForm(profile) {
    // Các trường chung
    document.getElementById('profile-fullname').value = profile.full_name || '';
    document.getElementById('profile-email').value = profile.email || '';
    document.getElementById('profile-phone').value = profile.phone || '';
    document.getElementById('profile-avatar-preview').src = profile.avatar ? `${API_URL.replace('/api', '')}${profile.avatar}` : 'https://via.placeholder.com/150';

    // [FIX] An toàn: Chỉ gán giá trị nếu tìm thấy thẻ HTML, tránh lỗi crash giao diện
    const constraintsEl = document.getElementById('profile-scheduling-constraints');
    if (constraintsEl) {
        constraintsEl.value = profile.scheduling_constraints || '';
    }
    // Các trường dành riêng cho Mentor
    const mentorFields = document.getElementById('mentor-specific-fields');
    if (profile.role === 'mentor') {
        mentorFields.classList.remove('hidden');
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('profile-expertise').value = profile.expertise || '';
        // Lưu ý: Việc render các gói 'plans' sẽ phức tạp hơn, có thể cần tạo các input động.
        // Đây là ví dụ đơn giản. Bạn có thể lưu trữ thông tin plans trong một input ẩn dưới dạng JSON.
    } else {
        mentorFields.classList.add('hidden');
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    const form = event.target;
    const formData = new FormData(form);

    // Ví dụ về cách thêm dữ liệu plans (dạng JSON string) vào FormData
    // const plansData = [ { plan_type: 'begin', price: '150000', description: '...' } ];
    // formData.append('plans', JSON.stringify(plansData));

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Đang lưu...';

    try {
        const response = await fetch(`${API_URL}/mentors/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Cập nhật thất bại');

        alert('Cập nhật hồ sơ thành công!');
        loadProfileData(); // Tải lại dữ liệu để hiển thị thay đổi
    } catch (error) {
        console.error("Lỗi cập nhật hồ sơ:", error);
        alert(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Lưu thay đổi';
    }
}