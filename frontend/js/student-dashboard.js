// js/student-dashboard.js

async function loadStudentDashboard() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
            renderBookings(result.data);
            updateStats(result.data);
        } else {
            console.error("Lỗi:", result.message);
        }
    } catch (error) {
        console.error("Lỗi kết nối server");
    }
}

function renderBookings(bookings) {
    const listBody = document.getElementById('booking-list');
    if (bookings.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-gray-400">Bạn chưa đặt lịch học nào.</td></tr>`;
        return;
    }

    listBody.innerHTML = bookings.map(b => {
        // 1. Xử lý màu sắc cho trạng thái 
        let statusClass = "bg-gray-100 text-gray-600";
        let statusText = b.status;
        if (b.status === 'pending') { statusClass = "bg-yellow-100 text-yellow-700"; statusText = "Đang chờ"; }
        else if (b.status === 'confirmed') { statusClass = "bg-green-100 text-green-700"; statusText = "Đã xác nhận"; }
        else if (b.status === 'cancelled') { statusClass = "bg-red-100 text-red-700"; statusText = "Đã hủy"; }
        else if (b.status === 'completed') { statusClass = "bg-blue-100 text-blue-700"; statusText = "Đã xong"; }

        const contactBtn = b.status === 'confirmed' 
            ? `<button onclick="openContactModal('${b.mentor_name}', '${b.mentor_email}', '${b.mentor_avatar}')" 
                class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-blue-700 transition flex items-center shadow-md">
                <span class="mr-1">💬</span> LIÊN HỆ
               </button>` 
            : '';

        // 3. LOGIC NÚT ĐÁNH GIÁ 
        const reviewBtn = b.status === 'completed'
            ? `<button onclick="openReviewModal(${b.id}, ${b.mentor_id})" 
                class="bg-amber-400 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-amber-500 transition shadow-md">
                ⭐ ĐÁNH GIÁ
               </button>`
            : '';

        let bookTime = "---";
        if (b.booking_date) {
            const dateObj = new Date(b.booking_date);
            if (!isNaN(dateObj.getTime())) {
                bookTime = dateObj.toLocaleString('vi-VN', {
                    hour: '2-digit', minute: '2-digit',
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
            }
        }

        return `
            <tr class="hover:bg-gray-50 transition border-b border-gray-50">
                <td class="px-6 py-4 font-bold text-gray-800">${b.mentor_name}</td>
                <td class="px-6 py-4 uppercase text-xs font-semibold text-gray-500">${b.plan_type}</td>
                <td class="px-6 py-4 text-sm text-gray-800 font-bold">${bookTime}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusClass}">${statusText}</span>
                </td>
                <td class="px-6 py-4 flex gap-2 justify-end">
                    ${contactBtn}
                    ${reviewBtn}
                </td>
            </tr>
        `;
    }).join('');
}

function openContactModal(name, email, avatar) {
    document.getElementById('modal-mentor-name').innerText = name;
    document.getElementById('modal-mentor-email').innerText = email;
    document.getElementById('modal-mentor-avatar').src = `https://mentor-web-1.onrender.com${avatar}`;
    
    const modal = document.getElementById('contact-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text);
    alert("Đã sao chép địa chỉ Email!");
}
function updateStats(bookings) {
    document.getElementById('total-count').innerText = bookings.length;
    document.getElementById('pending-count').innerText = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('confirmed-count').innerText = bookings.filter(b => b.status === 'confirmed').length;
}
let selectedRating = 0;
let currentBookingId = null;
let currentMentorId = null;

// Gán sự kiện cho sao
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', (e) => {
        selectedRating = e.target.getAttribute('data-value');
        updateStars(selectedRating);
    });
});

function updateStars(rating) {
    document.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('text-amber-400', s.getAttribute('data-value') <= rating);
        s.classList.toggle('text-gray-300', s.getAttribute('data-value') > rating);
    });
}

async function submitReview() {
    if (selectedRating == 0) return alert("Vui lòng chọn số sao!");
    
    const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
            booking_id: currentBookingId,
            mentor_id: currentMentorId,
            rating: selectedRating,
            comment: document.getElementById('review-comment').value
        })
    });

    const result = await response.json();

    if (response.ok) {
        alert("Đã gửi đánh giá thành công!");
        location.reload();
    } else {
        alert("Lỗi: " + (result.message || "Không thể gửi đánh giá. Vui lòng thử lại."));
        console.error("Lỗi submit review:", result);
    }
}
function openReviewModal(bookingId, mentorId) {
    currentBookingId = bookingId;
    currentMentorId = mentorId;
    
    // Reset lại trạng thái modal trước khi hiện
    selectedRating = 0;
    updateStars(0);
    document.getElementById('review-comment').value = '';
    
    // Hiển thị modal (bỏ class hidden)
    document.getElementById('review-modal').classList.remove('hidden');
    document.getElementById('review-modal').classList.add('flex');
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
    document.getElementById('review-modal').classList.remove('flex');
}
loadStudentDashboard();