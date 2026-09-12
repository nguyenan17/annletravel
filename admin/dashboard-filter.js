// ANNLETRAVEL - Dashboard 2.1
// Filters by period, tour and destination + previous-period comparison.

let dashboardRange = "6m";
let dashboardTourId = "ALL";
let dashboardDestination = "ALL";
let dashboardFilteredBookings = [];
let dashboardPreviousBookings = [];

const DASHBOARD_RANGES = {
    "7d": { label: "7 ngày", days: 7 },
    "30d": { label: "30 ngày", days: 30 },
    "6m": { label: "6 tháng", months: 6 },
    "1y": { label: "1 năm", months: 12 }
};

function dashboardDateStart(range = dashboardRange, end = new Date()) {
    const start = new Date(end);
    if (DASHBOARD_RANGES[range]?.days) start.setDate(start.getDate() - DASHBOARD_RANGES[range].days + 1);
    else start.setMonth(start.getMonth() - DASHBOARD_RANGES[range].months);
    start.setHours(0, 0, 0, 0);
    return start;
}

function dashboardDateEnd() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
}

function dashboardMatchesTour(tour) {
    if (dashboardTourId !== "ALL" && String(tour.id) !== String(dashboardTourId)) return false;
    if (dashboardDestination !== "ALL" && tour.destination !== dashboardDestination) return false;
    return true;
}

function dashboardMatchesBooking(booking) {
    const tour = tours.find(item => String(item.id) === String(booking.tour_id));
    return !!tour && dashboardMatchesTour(tour);
}

function getDashboardPeriodBookings() {
    const end = dashboardDateEnd();
    const start = dashboardDateStart();
    return bookings.filter(booking => {
        const date = new Date(booking.created_at);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end && dashboardMatchesBooking(booking);
    });
}

function getDashboardPreviousPeriodBookings() {
    const currentStart = dashboardDateStart();
    const end = new Date(currentStart.getTime() - 1);
    const start = dashboardDateStart(dashboardRange, end);
    return bookings.filter(booking => {
        const date = new Date(booking.created_at);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end && dashboardMatchesBooking(booking);
    });
}

function dashboardTourPrice(booking) {
    const tour = tours.find(item => String(item.id) === String(booking.tour_id));
    return Number(tour?.price || 0);
}

function dashboardRevenue(list) {
    return list.filter(item => ["PENDING", "CONFIRMED"].includes(item.status))
        .reduce((sum, item) => sum + dashboardTourPrice(item) * Number(item.people || 0), 0);
}

function dashboardCompare(current, previous) {
    if (previous === 0) return current === 0 ? { value: 0, text: "Không đổi" } : { value: 100, text: "Mới" };
    const value = Math.round(((current - previous) / Math.abs(previous)) * 100);
    return { value, text: `${value > 0 ? "+" : ""}${value}%` };
}

function dashboardComparisonMarkup(current, previous) {
    const result = dashboardCompare(Number(current) || 0, Number(previous) || 0);
    const cls = result.value > 0 ? "positive" : result.value < 0 ? "negative" : "neutral";
    return `<span class="comparison-badge ${cls}">${result.text}</span>`;
}

function ensureDashboard21Controls() {
    const title = document.querySelector(".page-title");
    if (!title || document.getElementById("dashboardFilters21")) return;

    const controls = document.createElement("div");
    controls.id = "dashboardFilters21";
    controls.className = "dashboard-filters-21";
    controls.innerHTML = `
        <label><span>Khoảng thời gian</span><select id="dashboardRangeFilter">
            <option value="7d">7 ngày</option><option value="30d">30 ngày</option><option value="6m" selected>6 tháng</option><option value="1y">1 năm</option>
        </select></label>
        <label><span>Tour</span><select id="dashboardTourFilter"><option value="ALL">Tất cả tour</option></select></label>
        <label><span>Điểm đến</span><select id="dashboardDestinationFilter"><option value="ALL">Tất cả điểm đến</option></select></label>
    `;
    title.appendChild(controls);

    document.getElementById("dashboardRangeFilter").addEventListener("change", event => {
        dashboardRange = event.target.value;
        refreshDashboard21();
    });
    document.getElementById("dashboardTourFilter").addEventListener("change", event => {
        dashboardTourId = event.target.value;
        refreshDashboard21();
    });
    document.getElementById("dashboardDestinationFilter").addEventListener("change", event => {
        dashboardDestination = event.target.value;
        refreshDashboard21();
    });
}

function populateDashboard21Filters() {
    const tourSelect = document.getElementById("dashboardTourFilter");
    const destinationSelect = document.getElementById("dashboardDestinationFilter");
    if (!tourSelect || !destinationSelect) return;

    const previousTour = dashboardTourId;
    const previousDestination = dashboardDestination;
    const destinations = [...new Set(tours.map(tour => tour.destination).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "vi"));

    tourSelect.innerHTML = `<option value="ALL">Tất cả tour</option>` + tours.map(tour =>
        `<option value="${escapeDashboardHtml(String(tour.id))}">${escapeDashboardHtml(tour.name || tour.destination || tour.id)}</option>`
    ).join("");
    destinationSelect.innerHTML = `<option value="ALL">Tất cả điểm đến</option>` + destinations.map(destination =>
        `<option value="${escapeDashboardHtml(destination)}">${escapeDashboardHtml(destination)}</option>`
    ).join("");

    tourSelect.value = tours.some(t => String(t.id) === String(previousTour)) ? previousTour : "ALL";
    destinationSelect.value = destinations.includes(previousDestination) ? previousDestination : "ALL";
}

function escapeDashboardHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function updateDashboard21KPIs() {
    dashboardFilteredBookings = getDashboardPeriodBookings();
    dashboardPreviousBookings = getDashboardPreviousPeriodBookings();

    const currentActive = dashboardFilteredBookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.status));
    const previousActive = dashboardPreviousBookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.status));
    const currentGuests = currentActive.reduce((sum, b) => sum + Number(b.people || 0), 0);
    const previousGuests = previousActive.reduce((sum, b) => sum + Number(b.people || 0), 0);
    const currentRevenue = dashboardRevenue(dashboardFilteredBookings);
    const previousRevenue = dashboardRevenue(dashboardPreviousBookings);

    const setNumeric = (id, current, previous, formatter = value => value) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.innerHTML = `${formatter(current)}${dashboardComparisonMarkup(current, previous)}`;
    };

    setNumeric("totalBookings", dashboardFilteredBookings.length, dashboardPreviousBookings.length);
    setNumeric("activeGuests", currentGuests, previousGuests);
    setNumeric("expectedRevenue", currentRevenue, previousRevenue, formatVND);
    setNumeric("pendingBookings", dashboardFilteredBookings.filter(b => b.status === "PENDING").length, dashboardPreviousBookings.filter(b => b.status === "PENDING").length);
    setNumeric("confirmedBookings", dashboardFilteredBookings.filter(b => b.status === "CONFIRMED").length, dashboardPreviousBookings.filter(b => b.status === "CONFIRMED").length);
    setNumeric("cancelledBookings", dashboardFilteredBookings.filter(b => b.status === "CANCELLED").length, dashboardPreviousBookings.filter(b => b.status === "CANCELLED").length);

    const filteredTours = tours.filter(dashboardMatchesTour);
    const capacity = filteredTours.reduce((sum, t) => sum + Number(t.capacity ?? t.seats ?? 0), 0);
    const remaining = filteredTours.reduce((sum, t) => sum + Number(t.seats || 0), 0);
    const reservedSnapshot = Math.max(0, capacity - remaining);
    const occupancy = capacity > 0 ? Math.round((reservedSnapshot / capacity) * 100) : 0;

    const totalCapacityEl = document.getElementById("totalCapacity");
    const remainingEl = document.getElementById("remainingSeats");
    const occupancyEl = document.getElementById("occupancyRate");
    if (totalCapacityEl) totalCapacityEl.textContent = capacity;
    if (remainingEl) remainingEl.textContent = remaining;
    if (occupancyEl) occupancyEl.textContent = `${occupancy}%`;

    const rangeLabel = DASHBOARD_RANGES[dashboardRange]?.label || "6 tháng";
    const description = document.querySelector(".page-title p");
    if (description) description.textContent = `Đang xem ${rangeLabel.toLowerCase()} • ${dashboardFilteredBookings.length} đơn phù hợp bộ lọc`;
}

function dashboardTrendBuckets() {
    const end = dashboardDateEnd();
    const start = dashboardDateStart();
    const buckets = [];
    const days = Math.ceil((end - start) / 86400000);

    if (days <= 31) {
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const d = new Date(date);
            buckets.push({ key: d.toISOString().slice(0, 10), label: `${d.getDate()}/${d.getMonth() + 1}` });
        }
    } else {
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);
        while (cursor <= last) {
            buckets.push({ key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`, label: `T${cursor.getMonth() + 1}/${cursor.getFullYear()}` });
            cursor.setMonth(cursor.getMonth() + 1);
        }
    }
    return buckets;
}

function renderDashboard21Charts() {
    if (typeof Chart === "undefined") return;

    const filtered = dashboardFilteredBookings;
    const pending = filtered.filter(b => b.status === "PENDING").length;
    const confirmed = filtered.filter(b => b.status === "CONFIRMED").length;
    const cancelled = filtered.filter(b => b.status === "CANCELLED").length;

    if (typeof bookingStatusChartInstance !== "undefined" && bookingStatusChartInstance) {
        bookingStatusChartInstance.data.datasets[0].data = [pending, confirmed, cancelled];
        bookingStatusChartInstance.update();
    }

    const filteredTours = tours.filter(dashboardMatchesTour);
    if (typeof tourCapacityChartInstance !== "undefined" && tourCapacityChartInstance) {
        tourCapacityChartInstance.data.labels = filteredTours.map(t => t.name || t.destination || t.id);
        tourCapacityChartInstance.data.datasets[0].data = filteredTours.map(t => Number(t.capacity ?? t.seats ?? 0));
        tourCapacityChartInstance.data.datasets[1].data = filteredTours.map(t => Number(t.seats || 0));
        tourCapacityChartInstance.update();
    }

    const buckets = dashboardTrendBuckets();
    const useDaily = buckets.length <= 31;
    const getBucketKey = booking => {
        const date = new Date(booking.created_at);
        if (Number.isNaN(date.getTime())) return null;
        return useDaily ? date.toISOString().slice(0, 10) : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    };

    const counts = buckets.map(bucket => filtered.filter(b => getBucketKey(b) === bucket.key).length);
    const revenue = buckets.map(bucket => filtered.reduce((sum, b) =>
        getBucketKey(b) === bucket.key && ["PENDING", "CONFIRMED"].includes(b.status)
            ? sum + dashboardTourPrice(b) * Number(b.people || 0) : sum, 0));

    if (typeof monthlyBookingsChartInstance !== "undefined" && monthlyBookingsChartInstance) {
        monthlyBookingsChartInstance.data.labels = buckets.map(b => b.label);
        monthlyBookingsChartInstance.data.datasets[0].data = counts;
        monthlyBookingsChartInstance.update();
    }
    if (typeof monthlyRevenueChartInstance !== "undefined" && monthlyRevenueChartInstance) {
        monthlyRevenueChartInstance.data.labels = buckets.map(b => b.label);
        monthlyRevenueChartInstance.data.datasets[0].data = revenue;
        monthlyRevenueChartInstance.update();
    }

    const chartDescription = document.querySelector("#advancedChartsSection .chart-header p");
    if (chartDescription) chartDescription.textContent = `${DASHBOARD_RANGES[dashboardRange].label} • ${dashboardFilteredBookings.length} đơn`;
}

function refreshDashboard21() {
    ensureDashboard21Controls();
    populateDashboard21Filters();
    updateDashboard21KPIs();
    renderDashboard21Charts();
    if (typeof window.renderAdvancedDashboardCharts === "function") window.renderAdvancedDashboardCharts();
}

(function injectDashboard21Styles() {
    const style = document.createElement("style");
    style.textContent = `
        .page-title { align-items: flex-end; gap: 20px; flex-wrap: wrap; }
        .dashboard-filters-21 { display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto; align-items: flex-end; }
        .dashboard-filters-21 label { display: flex; flex-direction: column; gap: 5px; min-width: 145px; }
        .dashboard-filters-21 label span { font-size: 11px; color: #66727d; font-weight: 600; }
        .dashboard-filters-21 select { height: 38px; padding: 0 32px 0 11px; border: 1px solid #d9e2e8; border-radius: 8px; background: white; color: #17212b; }
        .comparison-badge { display: inline-flex; margin-left: 8px; padding: 3px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; vertical-align: middle; }
        .comparison-badge.positive { color: #087443; background: #dcfce7; }
        .comparison-badge.negative { color: #b42318; background: #fee4e2; }
        .comparison-badge.neutral { color: #66727d; background: #eef2f5; }
        .overview-card strong .comparison-badge { font-size: 10px; }
        @media (max-width: 900px) { .dashboard-filters-21 { margin-left: 0; width: 100%; } .dashboard-filters-21 label { flex: 1; min-width: 130px; } }
    `;
    document.head.appendChild(style);
})();

window.renderDashboard21 = refreshDashboard21;

const previousRenderDashboardStats21 = window.renderDashboardStats;
window.renderDashboardStats = function () {
    if (typeof previousRenderDashboardStats21 === "function") previousRenderDashboardStats21();
    refreshDashboard21();
};

const previousShowDashboard21 = window.showDashboard;
if (typeof previousShowDashboard21 === "function") {
    window.showDashboard = async function () {
        await previousShowDashboard21();
        refreshDashboard21();
    };
}

// =========================================================
// BLOG - embedded inside the main admin dashboard
// =========================================================
let embeddedBlogLoaded = false;
let embeddedBlogPosts = [];
let embeddedBlogDestinations = [];
let embeddedBlogEditingId = null;

const BLOG_SECTION_ID = "adminSectionBlog";

function blogEsc(value) {
    return String(value ?? "").replace(/[&<>\"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    }[char]));
}

function embeddedBlogHtml() {
    return `
    <section id="${BLOG_SECTION_ID}" class="admin-content-section hidden">
        <div class="blog-admin-wrap">
            <div id="blogListView">
                <div class="page-title">
                    <div><h1>Blog / Kinh nghiệm du lịch</h1><p>Viết nội dung SEO và liên kết bài viết với điểm đến.</p></div>
                    <button id="blogNewPostButton" class="primary-button">+ Bài viết mới</button>
                </div>
                <div class="tour-section">
                    <div class="blog-admin-toolbar"><strong id="blogPostCount">0 bài viết</strong><button id="blogRefreshButton" class="refresh-button">↻ Làm mới</button></div>
                    <div class="table-wrapper"><table class="blog-admin-table"><thead><tr><th>Bài viết</th><th>Chuyên mục</th><th>Điểm đến</th><th>Trạng thái</th><th>Cập nhật</th><th>Thao tác</th></tr></thead><tbody id="blogPostTableBody"></tbody></table></div>
                </div>
            </div>
            <div id="blogEditorView" class="blog-admin-hidden">
                <div class="page-title"><div><h1 id="blogEditorTitle">Bài viết mới</h1><p>Tối ưu tiêu đề, mô tả và nội dung trước khi xuất bản.</p></div><button id="blogBackButton" class="refresh-button">← Danh sách</button></div>
                <form id="blogPostForm"><input type="hidden" id="blogPostId">
                    <div class="blog-form-grid">
                        <div class="blog-form-main">
                            <div class="blog-form-group"><label>Tiêu đề *</label><input id="blogTitle" required></div>
                            <div class="blog-form-group"><label>Slug *</label><input id="blogSlug" required><span class="blog-hint">Ví dụ: kinh-nghiem-du-lich-han-quoc-tu-tuc</span></div>
                            <div class="blog-form-group"><label>Mô tả ngắn</label><textarea id="blogExcerpt"></textarea></div>
                            <div class="blog-form-group"><label>Nội dung HTML *</label><textarea id="blogContent" class="blog-content-editor" required></textarea><span class="blog-hint">Có thể dùng h2, p, ul, li, strong, a và img.</span></div>
                        </div>
                        <div class="blog-form-side">
                            <div class="blog-form-group"><label>Chuyên mục</label><input id="blogCategory" value="Kinh nghiệm du lịch"></div>
                            <div class="blog-form-group"><label>Điểm đến liên quan</label><select id="blogDestination"><option value="">Không gắn điểm đến</option></select></div>
                            <div class="blog-form-group"><label>Ảnh cover URL</label><input id="blogCoverImage" placeholder="https://..."><div id="blogCoverPreview" class="blog-cover-preview"></div></div>
                            <div class="blog-form-group"><label>SEO title</label><input id="blogSeoTitle"></div>
                            <div class="blog-form-group"><label>SEO description</label><textarea id="blogSeoDescription" rows="4"></textarea></div>
                            <label class="checkbox-label"><input type="checkbox" id="blogPublished"> Xuất bản ngay</label>
                        </div>
                    </div>
                    <div class="modal-actions" style="margin-top:22px"><button type="button" id="blogCancelEdit" class="cancel-button">Hủy</button><button type="submit" class="primary-button">Lưu bài viết</button></div>
                </form>
            </div>
        </div>
    </section>`;
}

function ensureEmbeddedBlogStyles() {
    if (document.getElementById("embeddedBlogStyles")) return;
    const style = document.createElement("style");
    style.id = "embeddedBlogStyles";
    style.textContent = `
        .blog-admin-wrap{max-width:1250px;margin:0 auto}.blog-admin-toolbar{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:22px}.blog-admin-table{width:100%;border-collapse:collapse}.blog-admin-table th,.blog-admin-table td{padding:13px 12px;border-bottom:1px solid #e7edf0;text-align:left;vertical-align:top}.blog-admin-table th{font-size:12px;text-transform:uppercase;color:#71808a}.blog-admin-title{font-weight:800;color:#173544}.blog-admin-slug{font-size:12px;color:#81909a}.blog-status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.blog-status.on{background:#e8f7ef;color:#16764a}.blog-status.off{background:#f3f4f5;color:#6c777d}.blog-actions{display:flex;gap:7px;flex-wrap:wrap}.blog-form-grid{display:grid;grid-template-columns:2fr 1fr;gap:18px}.blog-form-main,.blog-form-side{display:flex;flex-direction:column;gap:14px}.blog-form-group{display:flex;flex-direction:column;gap:7px}.blog-form-group label{font-size:13px;font-weight:700;color:#40525b}.blog-form-group input,.blog-form-group textarea,.blog-form-group select{width:100%;box-sizing:border-box;border:1px solid #d8e1e5;border-radius:9px;padding:11px 12px;font:inherit;background:#fff}.blog-form-group textarea{min-height:110px;resize:vertical}.blog-content-editor{min-height:360px!important;font-family:monospace;line-height:1.6}.blog-cover-preview{height:180px;border-radius:12px;background:#eef3f5 center/cover no-repeat;border:1px solid #dce5e9}.blog-hint{font-size:12px;color:#81909a;line-height:1.5}.blog-admin-hidden{display:none!important}@media(max-width:800px){.blog-form-grid{grid-template-columns:1fr}.blog-admin-table{font-size:13px}.blog-admin-table th:nth-child(3),.blog-admin-table td:nth-child(3){display:none}}
    `;
    document.head.appendChild(style);
}

async function ensureEmbeddedBlogSection() {
    let section = document.getElementById(BLOG_SECTION_ID);
    if (!section) {
        ensureEmbeddedBlogStyles();
        document.querySelector(".dashboard-container")?.insertAdjacentHTML("beforeend", embeddedBlogHtml());
        section = document.getElementById(BLOG_SECTION_ID);
        bindEmbeddedBlogEvents();
    }
    if (!embeddedBlogLoaded) {
        embeddedBlogLoaded = true;
        await loadEmbeddedBlogDestinations();
        await loadEmbeddedBlogPosts();
    }
    return section;
}

function setAdminSectionVisible(sectionName) {
    const sectionMap = { dashboard:"adminSectionDashboard", tours:"adminSectionTours", bookings:"adminSectionBookings", destinations:"adminSectionDestinations", services:"adminSectionServices", blog:BLOG_SECTION_ID };
    const targetId = sectionMap[sectionName] || sectionMap.dashboard;
    document.querySelectorAll(".admin-content-section").forEach(section => section.classList.toggle("hidden", section.id !== targetId));
    document.querySelectorAll(".admin-nav-link").forEach(link => link.classList.toggle("active", link.dataset.section === sectionName));
    history.replaceState(null, "", `#${sectionName}`);
    window.scrollTo({top:0,behavior:"smooth"});
}

async function openEmbeddedBlog() {
    await ensureEmbeddedBlogSection();
    setAdminSectionVisible("blog");
}

function bindEmbeddedBlogEvents() {
    document.getElementById("blogNewPostButton")?.addEventListener("click", () => openEmbeddedBlogEditor());
    document.getElementById("blogBackButton")?.addEventListener("click", closeEmbeddedBlogEditor);
    document.getElementById("blogCancelEdit")?.addEventListener("click", closeEmbeddedBlogEditor);
    document.getElementById("blogRefreshButton")?.addEventListener("click", loadEmbeddedBlogPosts);
    document.getElementById("blogCoverImage")?.addEventListener("input", updateEmbeddedBlogPreview);
    document.getElementById("blogTitle")?.addEventListener("blur", () => {
        if (!document.getElementById("blogSlug").value.trim()) document.getElementById("blogSlug").value = embeddedBlogSlugify(document.getElementById("blogTitle").value);
        if (!document.getElementById("blogSeoTitle").value.trim()) document.getElementById("blogSeoTitle").value = document.getElementById("blogTitle").value + " | ANNLETRAVEL";
    });
    document.getElementById("blogPostForm")?.addEventListener("submit", saveEmbeddedBlogPost);
}

async function loadEmbeddedBlogDestinations() {
    const {data,error} = await supabaseClient.from("destinations").select("name,slug").order("sort_order",{ascending:true});
    if (error) { console.error("Blog destinations:",error); return; }
    embeddedBlogDestinations=data||[];
    const select=document.getElementById("blogDestination");
    if(select) select.innerHTML='<option value="">Không gắn điểm đến</option>'+embeddedBlogDestinations.map(d=>`<option value="${blogEsc(d.name)}">${blogEsc(d.name)}</option>`).join("");
}

async function loadEmbeddedBlogPosts() {
    const body=document.getElementById("blogPostTableBody");
    if(body) body.innerHTML='<tr><td colspan="6">Đang tải...</td></tr>';
    const {data,error}=await supabaseClient.from("blog_posts").select("*").order("created_at",{ascending:false});
    if(error){if(body)body.innerHTML=`<tr><td colspan="6">Không tải được bài viết: ${blogEsc(error.message)}</td></tr>`;console.error(error);return;}
    embeddedBlogPosts=data||[];
    const count=document.getElementById("blogPostCount");if(count)count.textContent=`${embeddedBlogPosts.length} bài viết`;
    renderEmbeddedBlogPosts();
}

function renderEmbeddedBlogPosts(){
    const body=document.getElementById("blogPostTableBody");if(!body)return;
    body.innerHTML=embeddedBlogPosts.length?embeddedBlogPosts.map(p=>`<tr><td><div class="blog-admin-title">${blogEsc(p.title)}</div><div class="blog-admin-slug">${blogEsc(p.slug)}</div></td><td>${blogEsc(p.category||"-")}</td><td>${blogEsc(p.destination||"-")}</td><td><span class="blog-status ${p.published?'on':'off'}">${p.published?'Đã xuất bản':'Bản nháp'}</span></td><td>${p.updated_at?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short'}).format(new Date(p.updated_at)):'-'}</td><td><div class="blog-actions"><button class="edit-button" data-blog-edit="${p.id}">Sửa</button><button class="delete-button" data-blog-delete="${p.id}">Xóa</button></div></td></tr>`).join(""):`<tr><td colspan="6">Chưa có bài viết.</td></tr>`;
    body.querySelectorAll("[data-blog-edit]").forEach(btn=>btn.addEventListener("click",()=>openEmbeddedBlogEditor(embeddedBlogPosts.find(p=>String(p.id)===String(btn.dataset.blogEdit)))));
    body.querySelectorAll("[data-blog-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteEmbeddedBlogPost(btn.dataset.blogDelete)));
}

function embeddedBlogSlugify(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}
function resetEmbeddedBlogForm(){embeddedBlogEditingId=null;document.getElementById("blogPostForm")?.reset();document.getElementById("blogPostId").value="";document.getElementById("blogCategory").value="Kinh nghiệm du lịch";document.getElementById("blogDestination").value="";document.getElementById("blogCoverPreview").style.backgroundImage="";document.getElementById("blogEditorTitle").textContent="Bài viết mới";}
function openEmbeddedBlogEditor(post=null){document.getElementById("blogListView").classList.add("blog-admin-hidden");document.getElementById("blogEditorView").classList.remove("blog-admin-hidden");resetEmbeddedBlogForm();if(post){embeddedBlogEditingId=post.id;document.getElementById("blogEditorTitle").textContent="Sửa bài viết";document.getElementById("blogPostId").value=post.id;document.getElementById("blogTitle").value=post.title||"";document.getElementById("blogSlug").value=post.slug||"";document.getElementById("blogExcerpt").value=post.excerpt||"";document.getElementById("blogContent").value=post.content||"";document.getElementById("blogCategory").value=post.category||"Kinh nghiệm du lịch";document.getElementById("blogDestination").value=post.destination||"";document.getElementById("blogCoverImage").value=post.cover_image||"";document.getElementById("blogSeoTitle").value=post.seo_title||"";document.getElementById("blogSeoDescription").value=post.seo_description||"";document.getElementById("blogPublished").checked=!!post.published;updateEmbeddedBlogPreview();}}
function closeEmbeddedBlogEditor(){document.getElementById("blogEditorView")?.classList.add("blog-admin-hidden");document.getElementById("blogListView")?.classList.remove("blog-admin-hidden");}
function updateEmbeddedBlogPreview(){const url=document.getElementById("blogCoverImage")?.value.trim();const preview=document.getElementById("blogCoverPreview");if(preview)preview.style.backgroundImage=url?`url("${url.replace(/"/g,"")}")`:"";}
async function deleteEmbeddedBlogPost(id){const post=embeddedBlogPosts.find(p=>String(p.id)===String(id));if(!post||!confirm(`Xóa bài viết "${post.title}"?`))return;const {error}=await supabaseClient.from("blog_posts").delete().eq("id",id);if(error){alert("Không thể xóa: "+error.message);return;}await loadEmbeddedBlogPosts();}
async function saveEmbeddedBlogPost(event){event.preventDefault();const title=document.getElementById("blogTitle").value.trim(),slug=embeddedBlogSlugify(document.getElementById("blogSlug").value.trim());const payload={title,slug,excerpt:document.getElementById("blogExcerpt").value.trim(),content:document.getElementById("blogContent").value,cover_image:document.getElementById("blogCoverImage").value.trim()||null,seo_title:document.getElementById("blogSeoTitle").value.trim()||null,seo_description:document.getElementById("blogSeoDescription").value.trim()||null,category:document.getElementById("blogCategory").value.trim()||"Kinh nghiệm du lịch",destination:document.getElementById("blogDestination").value||null,published:document.getElementById("blogPublished").checked,published_at:document.getElementById("blogPublished").checked?new Date().toISOString():null,updated_at:new Date().toISOString()};if(!title||!slug||!payload.content){alert("Vui lòng nhập tiêu đề, slug và nội dung.");return;}let result;if(embeddedBlogEditingId)result=await supabaseClient.from("blog_posts").update(payload).eq("id",embeddedBlogEditingId);else result=await supabaseClient.from("blog_posts").insert(payload);if(result.error){alert("Không thể lưu bài viết:\n"+result.error.message);return;}alert("Đã lưu bài viết.");closeEmbeddedBlogEditor();await loadEmbeddedBlogPosts();}

(function initEmbeddedBlogNavigation(){
    document.addEventListener("click", event => {
        const link=event.target.closest('a.admin-nav-link[href="blog.html"]');
        if(!link)return;
        event.preventDefault();
        openEmbeddedBlog();
    });
    if(window.location.hash==="#blog") setTimeout(openEmbeddedBlog,0);
})();
