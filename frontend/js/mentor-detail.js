document.addEventListener('DOMContentLoaded', () => {
    fetchMentorDetail();
});

// PHẦN 1: XỬ LÝ THÔNG TIN CHI TIẾT MENTOR

async function fetchMentorDetail() {
    const container = document.getElementById('mentor-detail-container');
    
    // Lấy ID từ URL (VD: mentor-detail.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const mentorId = urlParams.get('id');

    if (!mentorId) {
        container.innerHTML = `<p class="text-red-500 font-medium text-center text-lg">⚠️ Không tìm thấy mã Mentor trong URL!</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mentors/${mentorId}`);
        const result = await response.json();

        const mentor = result.data || result; 

        if (mentor && mentor.full_name) {
            renderMentorDetail(mentor, container);
            
            fetchReviews(mentorId);
            
        } else {
            container.innerHTML = `<p class="text-slate-500 text-center text-lg">Không thể tải thông tin Mentor. Người này có thể đã bị xóa hoặc ẩn.</p>`;
        }

    } catch (error) {
        console.error("❌ Lỗi thực thi:", error);
        container.innerHTML = `<p class="text-red-500 text-center text-lg">Lỗi kết nối đến máy chủ!</p>`;
    }
}

function renderMentorDetail(mentor, container) {
    container.classList.remove('flex', 'items-center', 'justify-center');
    
    container.innerHTML = `
        <div class="flex flex-col gap-10">
            <div class="flex flex-col md:flex-row gap-8 items-start border-b border-slate-100 pb-8">
                <div class="flex-shrink-0 mx-auto md:mx-0 text-center">
                    <img src="https://mentor-web-1.onrender.com${mentor.avatar}" 
                        class="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-md mb-4"
                        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=1e3a8a&color=fff&size=150'">
                    <div class="flex items-center justify-center gap-2 text-amber-500 font-bold text-lg">
                        ⭐ ${parseFloat(mentor.avg_rating || 0).toFixed(1)}
                    </div>
                </div>

                <div class="flex-grow">
                    <h1 class="text-3xl font-bold text-blue-900 mb-2">${mentor.full_name}</h1>
                    <span class="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                        ${mentor.expertise}
                    </span>
                    <h2 class="text-lg font-bold text-slate-800 mb-2 font-serif">Tiểu sử & Chuyên môn</h2>
                    <p class="text-slate-600 leading-relaxed text-justify mb-4">
                        ${mentor.bio || 'Giảng viên này chưa cập nhật tiểu sử chi tiết.'}
                    </p>
                    <p class="text-slate-500 text-sm">✉ ${mentor.email || 'Đang cập nhật...'}</p>
                </div>
            </div>
    `;
    // Tiếp nối chuỗi innerHTML ở Bước 1
    container.innerHTML += `
        <div id="pricing-section">
            <h2 class="text-2xl font-bold text-slate-800 mb-6 font-serif">🗓️ Đặt lịch học nhanh</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-shadow bg-white flex flex-col">
                    <h3 class="text-green-600 font-bold text-xl mb-2">Beginner</h3>
                    <div class="text-2xl font-bold mb-4">150.000đ</div>
                    <p class="text-sm text-slate-500 mb-4 italic">Phù hợp cho người mới bắt đầu</p>
                    <ul class="text-sm text-slate-600 space-y-2 mb-6 flex-grow">
                        <li>✅ Học full nội dung</li>
                        <li>✅ Truy cập tài liệu</li>
                        <li>❌ Review bài chi tiết</li>
                    </ul>
                    <button class="w-full py-3 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-green-500 hover:text-white transition-all">Chọn gói</button>
                </div>

                <div class="border-2 border-blue-500 p-6 rounded-2xl shadow-md bg-blue-50 flex flex-col relative">
                    <span class="absolute -top-3 right-6 bg-blue-500 text-white px-3 py-1 text-xs rounded-full">Recommended</span>
                    <h3 class="text-blue-600 font-bold text-xl mb-2">Plus</h3>
                    <div class="text-2xl font-bold mb-4">250.000đ</div>
                    <ul class="text-sm text-slate-600 space-y-2 mb-6 flex-grow">
                        <li>✅ Toàn bộ Beginner</li>
                        <li>✅ Mentor review bài tập</li>
                        <li>✅ 1 buổi call Q&A</li>
                    </ul>
                    <button class="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md">Chọn gói</button>
                </div>

                <div class="border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-shadow bg-white flex flex-col">
                    <h3 class="text-purple-600 font-bold text-xl mb-2">Premium</h3>
                    <div class="text-2xl font-bold mb-4">400.000đ</div>
                    <ul class="text-sm text-slate-600 space-y-2 mb-6 flex-grow">
                        <li>✅ Toàn bộ Plus</li>
                        <li>✅ Mentor kèm 1-1</li>
                        <li>✅ Support ưu tiên</li>
                    </ul>
                    <button class="w-full py-3 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-purple-600 hover:text-white transition-all">Chọn gói</button>
                </div>
            </div>
        </div>
    </div> `;
}

// ==========================================
// PHẦN 2: XỬ LÝ ĐÁNH GIÁ (REVIEWS)
// ==========================================

async function fetchReviews(mentorId) {
    const container = document.getElementById('reviews-list');
    if (!container) return; 

    try {
        const response = await fetch(`${API_URL}/reviews/mentor/${mentorId}`);
        const result = await response.json();
        const reviews = result.data || result;

        if (Array.isArray(reviews) && reviews.length > 0) {
            renderReviews(reviews, container);
        } else {
            container.innerHTML = `
                <div class="text-center p-6 bg-slate-50 rounded-lg border border-slate-100">
                    <p class="text-slate-500 italic">Chưa có đánh giá nào cho giảng viên này. Bạn hãy là người đầu tiên nhé!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("❌ Lỗi tải đánh giá:", error);
        container.innerHTML = `<p class="text-red-500 text-sm">Không thể tải danh sách đánh giá lúc này.</p>`;
    }
}

function renderReviews(reviews, container) {
    container.innerHTML = reviews.map(review => {
        const stars = '⭐'.repeat(Math.floor(review.rating));
        const dateObj = new Date(review.created_at);
        const formattedDate = dateObj.toLocaleDateString('vi-VN');

        return `
            <div class="bg-white p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold font-serif uppercase">
                            ${review.student_name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${review.student_name}</h4>
                            <p class="text-xs text-slate-400 font-medium">${formattedDate}</p>
                        </div>
                    </div>
                    <div class="text-amber-500 text-sm tracking-widest">${stars}</div>
                </div>
                
                <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic border-l-4 border-blue-200 pl-3 ml-2">
                    "${review.comment}"
                </p>
            </div>
        `;
    }).join('');
}