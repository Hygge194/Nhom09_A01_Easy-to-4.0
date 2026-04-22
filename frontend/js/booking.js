const urlParams = new URLSearchParams(window.location.search); 
const mentorId = urlParams.get('id');

// Định nghĩa bảng giá cố định ngay tại Frontend để hiển thị cho nhanh
const FIXED_PRICES = {
    'begin': 150000,
    'plus': 250000,
    'premium': 400000
};

async function loadMentorDetail() {
    const container = document.getElementById('mentor-detail');
    if (!mentorId) {
        container.innerHTML = `<p class="text-red-500 text-center">ID Mentor không hợp lệ.</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mentors/${mentorId}`);
        const result = await response.json();
        const mentor = result.mentor;
        const reviews = result.reviews || [];

        if (!mentor) {
            container.innerHTML = `<p class="text-red-500 text-center">Không tìm thấy Mentor.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="md:flex gap-10">
                <div class="md:w-1/3 text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <img src="https://mentor-web-1.onrender.com${mentor.avatar}" 
                         class="w-40 h-40 rounded-full object-cover mx-auto shadow-md border-4 border-white ring-4 ring-blue-50" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}'">
                    <h1 class="text-2xl font-black mt-4 text-gray-800">${mentor.full_name}</h1>
                    <div class="flex justify-center items-center mt-2 space-x-1">
                        <span class="text-yellow-400 text-xl">★</span>
                        <span class="font-bold text-gray-700">${parseFloat(mentor.avg_rating || 0).toFixed(1)}</span>
                    </div>
                    <p class="text-blue-600 font-medium text-sm mt-1">${mentor.expertise || 'Chuyên gia'}</p>
                </div>
                
                <div class="md:w-2/3">
                    <div class="bg-slate-50 p-8 rounded-3xl shadow-xl text-slate-800 mb-8 border border-slate-200">
                        <h4 class="font-bold text-xl mb-6 flex items-center text-slate-800">
                            <span class="mr-2">📅</span> Đặt lịch học nhanh
                        </h4>
                        <div class="space-y-5">
                            <div>
                                <label class="block text-sm font-medium mb-4 text-slate-600">Chọn gói học phù hợp với bạn:</label>
                                
                                <!-- Plan Cards -->
                                <div class="space-y-3">
                                    <!-- Beginner Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="begin" name="plan_type" value="begin" class="hidden peer" checked>
                                        <label for="begin" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-400 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-green-600 font-bold text-lg">🟢 Beginner – 150k</span>
                                                    <span class="text-sm text-gray-500 ml-2">(Phù hợp cho người mới bắt đầu)</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">150.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Học full nội dung khóa học<br>
                                                Truy cập tài liệu + video<br>
                                                Hỏi đáp qua chat (phản hồi chậm)<br>
                                                Không có review bài chi tiết<br>
                                            </div>
                                        </label>
                                    </div>

                                    <!-- Plus Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="plus" name="plan_type" value="plus" class="hidden peer">
                                        <label for="plus" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-blue-600 font-bold text-lg">🔵 Plus – 250k</span>
                                                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold ml-2">⭐ Recommended</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">250.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Bao gồm toàn bộ Beginner<br>
                                                Mentor review bài tập / project cơ bản<br>
                                                Hỏi đáp ưu tiên hơn<br>
                                                Có lộ trình học rõ ràng<br>
                                                1 buổi call ngắn (Q&A / giải đáp)<br>
                                            </div>
                                        </label>
                                    </div>

                                    <!-- Premium Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="premium" name="plan_type" value="premium" class="hidden peer">
                                        <label for="premium" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-purple-600 font-bold text-lg">🟣 Premium – 400k</span>
                                                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold ml-2">🔥 Best value</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">400.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Bao gồm toàn bộ Plus<br>
                                                Mentor kèm 1-1 (nhiều buổi hoặc theo tuần)<br>
                                                Review project chi tiết + sửa trực tiếp<br>
                                                Định hướng CV / career / mock interview<br>
                                                Support nhanh (priority)<br>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div id="price-summary" class="text-3xl font-black text-center py-2 bg-slate-100 rounded-xl text-slate-800">
                                150.000đ
                            </div>

                            <div class="mt-4 mb-4">
                                <label for="booking_date" class="block text-sm font-medium mb-2 text-slate-600">Chọn thời gian học (Dự kiến):</label>
                                <input type="datetime-local" id="booking_date" class="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 transition-all text-slate-700 bg-white" required>
                            </div>

                            <button onclick="handleBooking()" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg active:scale-95 mb-3">
                                XÁC NHẬN ĐẶT LỊCH (Thủ công)
                            </button>
                            <button onclick="requestAiSuggest()" id="ai-suggest-btn" class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-black hover:opacity-90 transition shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                🤖 Tự Động Phân Tích Lịch Trống (Gợi ý AI)
                            </button>

                            <!-- AI Slots Container -->
                            <div id="ai-slots-container" class="mt-4 space-y-3 hidden">
                                <h4 class="font-bold text-sm text-indigo-700">🤖 AI Gợi Y & Phân Tích:</h4>
                                <div id="ai-slots-list" class="space-y-2"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10">
                        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <span class="mr-2 text-2xl">💬</span> Đánh giá từ học viên (${reviews.length})
                        </h3>
                        <div id="reviews-list" class="space-y-4">
                            ${reviews.length > 0 ? reviews.map(r => `
                                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                ${r.student_name ? r.student_name.charAt(0) : 'H'}
                                            </div>
                                            <span class="font-bold text-gray-800">${r.student_name || 'Học viên'}</span>
                                        </div>
                                        <span class="text-yellow-400 font-bold">★ ${r.rating}</span>
                                    </div>
                                    <p class="text-gray-600 text-sm italic">"${r.comment}"</p>
                                </div>
                            `).join('') : '<p class="text-gray-400 italic">Chưa có đánh giá nào.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupPriceListener();

    } catch (error) {
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối Server.</p>`;
    }
}

function setupPriceListener() {
    const priceSummary = document.getElementById('price-summary');
    const planRadios = document.querySelectorAll('input[name="plan_type"]');

    planRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                const price = FIXED_PRICES[radio.value];
                priceSummary.innerText = `${price.toLocaleString()}đ`;
            }
        });
    });
}

async function handleBooking() {
    const planType = document.querySelector('input[name="plan_type"]:checked').value;
    const bookingDate = document.getElementById('booking_date').value;
    const token = localStorage.getItem('accessToken');

    if (!bookingDate) {
        alert("Vui lòng chọn thời gian học dự kiến!");
        return;
    }

    const selectedTime = new Date(bookingDate).getTime();
    const currentTime = new Date().getTime();
    if (selectedTime < currentTime) {
        alert("Thời gian học không được chọn ở trong quá khứ!");
        return;
    }

    if (!token) {
        alert("Vui lòng đăng nhập để đặt lịch!");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mentor_id: mentorId,
                plan_type: planType,
                booking_date: bookingDate
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Đặt lịch thành công! Đang chờ Mentor xác nhận.");
            window.location.href = 'dashboard-student.html';
        } else {
            alert("Lỗi: " + result.message);
        } 
    } catch (error) {
        alert("Không thể kết nối đến server.");
    }
}

async function requestAiSuggest() {
    const aiBtn = document.getElementById('ai-suggest-btn');
    const container = document.getElementById('ai-slots-container');
    const list = document.getElementById('ai-slots-list');
    const token = localStorage.getItem('accessToken');
    if(!token) {
        alert("Bạn cần đăng nhập để AI phân tích lịch!");
        return;
    }

    aiBtn.innerText = " Đang phân tích lịch trình...";
    aiBtn.disabled = true;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const mentorId = urlParams.get('id');

        const res = await fetch(`${API_URL}/bookings/ai-suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ mentor_id: mentorId })
        });
        const data = await res.json();
        
        if(res.ok) {
            container.classList.remove('hidden');
            let slotsHtml = '';
            data.data.forEach((slot, index) => {
                const dateObj = new Date(slot.startTime);
                const displayTime = dateObj.toLocaleString('vi-VN');
                slotsHtml += `
                    <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition" 
                        onclick="selectAiSlot('${slot.startTime}')">
                        <div class="font-black text-indigo-700 mb-1">Lựa chọn ${index + 1}: ${displayTime}</div>
                        <div class="text-xs text-slate-600 italic">⭐ ${slot.reason}</div>
                    </div>
                `;
            });
            list.innerHTML = slotsHtml;
            aiBtn.innerText = "🤖 Cập nhật lại Gợi Ý (AI)";
        } else {
            alert(data.message);
            aiBtn.innerText = "🤖 AI Bị Lỗi (Thử lại)";
        }
    } catch(err) {
        console.error(err);
        aiBtn.innerText = "🤖 AI Bị Lỗi (Thử lại)";
    }
    aiBtn.disabled = false;
}

function selectAiSlot(isoString) {
    // Chuyển ISODate thành format html datetime-local YYYY-MM-DDTHH:mm
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
    document.getElementById('booking_date').value = localISOTime;
    alert("Đã tự động điền giờ theo gợi ý AI! Bạn có thể bấm Xác Nhận Đặt Lịch ngay.");
}

loadMentorDetail();