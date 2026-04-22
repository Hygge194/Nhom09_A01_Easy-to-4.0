// ============================================================
//  MENTOR MODULE  —  mentors.js
//  Requires: mentors.css  (linked in HTML <head>)
//  Variables & function names UNCHANGED: fetchMentors, renderMentors
// ============================================================

let allMentors = []; // Store mentors globally for filtering
let currentPage = 1;
let totalPages = 1;
let currentSearch = '';

async function fetchMentors(page = 1, append = false) {
    const container = document.getElementById('mentor-list');

    if (!container) {
        console.error("❌ Không tìm thấy thẻ có id='mentor-list' trong HTML!");
        return;
    }

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        if (currentSearch) params.append('search', currentSearch);

        const response = await fetch(`${API_URL}/mentors?${params}`);
        const result = await response.json();

        if (append) {
            allMentors = [...allMentors, ...result.data];
        } else {
            allMentors = result.data;
        }

        totalPages = result.pagination.totalPages;
        currentPage = page;

        if (Array.isArray(allMentors) && allMentors.length > 0) {
            renderMentors(allMentors);
        } else {
            container.innerHTML = `
                <div class="mc-state mc-state--empty">
                    <div class="mc-state__icon">👤</div>
                    <p class="mc-state__text">Chưa có thông tin giảng viên.</p>
                </div>`;
        }

        updateLoadMoreButton();

    } catch (error) {
        console.error("❌ Lỗi thực thi:", error);
        container.innerHTML = `
            <div class="mc-state mc-state--error">
                <div class="mc-state__icon">⚠️</div>
                <p class="mc-state__text">Lỗi kết nối đến máy chủ API!</p>
            </div>`;
    }
}


/* ── renderMentors — UNCHANGED signature ────────────────── */
function renderMentors(mentors) {
    const container = document.getElementById('mentor-list');

    container.className = '';

    container.innerHTML = mentors.map((mentor, i) => `
        <div class="mc" style="animation-delay:${i * 60}ms">
            <div class="mc__band"></div>
            <div class="mc__corner"></div>

            <div class="mc__body">
                <div class="mc__head">
                    <div class="mc__avatar-wrap">
                        <img
                            src="https://mentor-web-1.onrender.com${mentor.avatar}"
                            class="mc__avatar"
                            alt="${mentor.full_name}"
                            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=1e6fdc&color=fff&bold=true'"
                        >
                        <span class="mc__dot"></span>
                    </div>

                    <div class="mc__meta">
                        <h3 class="mc__name">${mentor.full_name}</h3>
                        <span class="mc__badge">${mentor.expertise || 'Chuyên gia'}</span>
                    </div>
                </div>

                <p class="mc__bio">
                    ${mentor.bio || 'Chưa có thông tin tiểu sử chi tiết về giảng viên này.'}
                </p>

                <div class="mc__footer">
                    <div class="mc__rating">
                        <span class="mc__star">⭐</span>
                        <span class="mc__score">${mentor.avg_rating ? parseFloat(mentor.avg_rating).toFixed(1) : '0.0'}</span>
                    </div>

                    <a href="mentor-detail.html?id=${mentor.id}" class="mc__btn">
                        Xem hồ sơ
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}


// ── Load More functionality ─────────────────────────────────
function updateLoadMoreButton() {
    let button = document.getElementById('load-more-btn');
    if (!button) {
        const container = document.getElementById('mentor-list').parentNode;
        button = document.createElement('button');
        button.id = 'load-more-btn';
        button.className = 'mt-8 mx-auto block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md';
        button.innerText = 'Tải thêm giảng viên';
        button.onclick = loadMore;
        container.appendChild(button);
    }
    if (currentPage >= totalPages) {
        button.style.display = 'none';
    } else {
        button.style.display = 'block';
    }
}

function loadMore() {
    fetchMentors(currentPage + 1, true);
}


// ── Kích hoạt hàm ──────────────────────────────────────────
fetchMentors();

// ── Search functionality ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            currentSearch = searchTerm;
            currentPage = 1; // Reset to first page on search
            
            if (!searchTerm) {
                fetchMentors(1, false);
                return;
            }

            // For search, we fetch with search param, but since it's client-side filter now, wait
            // Actually, since API supports search, but for simplicity, keep client-side
            const filteredMentors = allMentors.filter(mentor => {
                const nameMatch = mentor.full_name?.toLowerCase().includes(searchTerm);
                const expertiseMatch = mentor.expertise?.toLowerCase().includes(searchTerm);
                const bioMatch = mentor.bio?.toLowerCase().includes(searchTerm);
                
                return nameMatch || expertiseMatch || bioMatch;
            });

            const container = document.getElementById('mentor-list');
            if (filteredMentors.length > 0) {
                renderMentors(filteredMentors);
                updateLoadMoreButton(); // Hide load more during search
            } else {
                container.innerHTML = `
                    <div class="col-span-full shadow-sm bg-white rounded-xl p-10 text-center border border-gray-100 mt-4">
                        <div class="text-gray-300 mb-4 inline-block">
                            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
                        <p class="text-gray-500">Không có giảng viên hoặc khóa học nào phù hợp với từ khóa "${e.target.value}".</p>
                        <button onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'))" class="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition inline-flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Quay lại danh sách
                        </button>
                    </div>`;
                updateLoadMoreButton(); // Hide
            }
        });
    }
});