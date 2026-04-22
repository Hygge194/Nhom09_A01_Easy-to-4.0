async function loadMentorData() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings/incoming`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok) {
            renderMentorBookings(result.data);
        } else {
            console.error(result.message);
        }
    } catch (error) {
        console.error("Lỗi kết nối server");
    }
}

function renderMentorBookings(bookings) {
    const listBody = document.getElementById('mentor-booking-list');
    let revenue = 0;

    if (!bookings || bookings.length === 0) {
        listBody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-gray-400">Chưa có yêu cầu đặt lịch nào.</td></tr>`;
        document.getElementById('total-revenue').innerText = '0đ';
        return;
    }

    listBody.innerHTML = bookings.map(b => {
        if(b.status === 'confirmed' || b.status === 'completed') {
            revenue += parseFloat(b.total_price || 0) * 0.9;
        }

        let time = "---";
        if (b.created_at) {
            const dateObj = new Date(b.created_at);
            if (!isNaN(dateObj.getTime())) {
                time = dateObj.toLocaleString('vi-VN', {
                    hour: '2-digit', minute: '2-digit',
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
            }
        }
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
        
        let actionHTML = '';
        if (b.status === 'pending') {
            actionHTML = `
                <button onclick="updateStatus('${b.id}', 'confirmed')" class="bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold mr-2 hover:bg-indigo-600 transition shadow-sm active:scale-95">Duyệt</button>
                <button onclick="updateStatus('${b.id}', 'cancelled')" class="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition active:scale-95">Từ chối</button>
            `;
        } else if (b.status === 'confirmed') {
            actionHTML = `
        <button onclick="updateStatus('${b.id}', 'completed')" 
            class="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition shadow-sm">
            Hoàn thành buổi học
        </button> `;
        } else if (b.status === 'cancelled') {
            actionHTML = `<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Đã từ chối</span>`;
        }else if (b.status === 'completed') {
            actionHTML = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"> Đã hoàn thành</span>`;
        }

        let contactHtml = `<div class="text-xs text-gray-500 mt-1">📧 ${b.student_email || 'Chưa có email'}</div>`;
        if ((b.status === 'confirmed' || b.status === 'completed') && b.student_phone) {
            contactHtml += `<div class="text-xs text-green-600 mt-1 font-semibold">📞 ${b.student_phone}</div>`;
        } else if (b.status === 'confirmed' || b.status === 'completed') {
            contactHtml += `<div class="text-xs text-gray-400 mt-1 italic">📞 Chưa cập nhật số ĐT</div>`;
        }

        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800">${b.student_name}</div>
                    ${contactHtml}
                </td>
                <td class="px-6 py-4">
                    <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">${b.plan_type}</span>
                    <div class="font-black text-gray-700 mt-1">${parseFloat(b.total_price || 0).toLocaleString()}đ</div>
                </td>
                <td class="px-6 py-4 text-sm font-black text-green-600">
                    +${(parseFloat(b.total_price || 0) * 0.9).toLocaleString()}đ
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 italic">${time}</td>
                <td class="px-6 py-4 text-sm text-gray-800 font-bold">${bookTime}</td>
                <td class="px-6 py-4 text-center">
                    ${actionHTML}
                </td>
            </tr>
        `;
    }).join('');

    // Cập nhật tổng thu nhập
    document.getElementById('total-revenue').innerText = revenue.toLocaleString() + 'đ';
}

async function updateStatus(bookingId, status) {
    const statusText = {
    confirmed: 'DUYỆT',
    cancelled: 'TỪ CHỐI',
    completed: 'HOÀN THÀNH'
    };

    if (!confirm(`Bạn có chắc chắn muốn ${statusText[status] || 'THỰC HIỆN'} yêu cầu này?`)) return;
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch(`${API_URL}/bookings/status`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookingId, status })
        });

        const result = await response.json();
        if (response.ok) {
            // Tải lại danh sách sau khi cập nhật thành công
            loadMentorData(); 
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Lỗi kết nối đến server.");
    }
}
let selectedRating = 0;
let currentBookingId = null;
let currentMentorId = null;

// 1. Mở Modal và gắn sự kiện cho sao
function openReviewModal(bookingId, mentorId) {
    currentBookingId = bookingId;
    currentMentorId = mentorId;
    selectedRating = 0; // Reset
    document.getElementById('review-comment').value = '';
    resetStars();

    const modal = document.getElementById('review-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// 2. Xử lý chọn sao trực quan
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', (e) => {
        selectedRating = e.target.getAttribute('data-value');
        updateStars(selectedRating);
    });
});

function updateStars(rating) {
    document.querySelectorAll('.star').forEach(s => {
        const val = s.getAttribute('data-value');
        s.classList.toggle('text-amber-400', val <= rating);
        s.classList.toggle('text-gray-300', val > rating);
    });
}

function resetStars() {
    document.querySelectorAll('.star').forEach(s => s.classList.replace('text-amber-400', 'text-gray-300'));
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
}

// 3. Gửi dữ liệu về API
async function submitReview() {
    if (selectedRating === 0) return alert("Vui lòng chọn số sao!");
    const comment = document.getElementById('review-comment').value;

    try {
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
                comment: comment
            })
        });

        if (response.ok) {
            alert("🌟 Cảm ơn bạn đã để lại đánh giá!");
            closeReviewModal();
            loadStudentDashboard(); // Load lại để ẩn nút Đánh giá
        }
    } catch (error) {
        alert("Lỗi khi gửi đánh giá.");
    }
}
loadMentorData();