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

function dashboardMatchesBooking(booking) {
    if (dashboardTourId !== "ALL" && String(booking.tour_id) !== String(dashboardTourId)) return false;
    if (dashboardDestination !== "ALL") {
        const tour = tours.find(item => String(item.id) === String(booking.tour_id));
        if ((tour?.destination || "") !== dashboardDestination) return false;
    }
    return true;
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
    const end = dashboardDateStart();
    end.setMilliseconds(-1);
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

function dashboardComparisonMarkup(current, previous, suffix = "") {
    const result = dashboardCompare(current, previous);
    const cls = result.value > 0 ? "positive" : result.value < 0 ? "negative" : "neutral";
    return `<span class="comparison-badge ${cls}">${result.text}${suffix ? ` ${suffix}` : ""}</span>`;
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
    const destinations = [...new Set(tours.map(tour => tour.destination).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));

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

    const set = (id, value, previous, suffix = "") => {
        const element = document.getElementById(id);
        if (!element) return;
        element.innerHTML = `${value}${dashboardComparisonMarkup(Number(value) || 0, previous, suffix)}`;
    };

    set("totalBookings", dashboardFilteredBookings.length, dashboardPreviousBookings.length);
    set("activeGuests", currentGuests, previousGuests);
    set("expectedRevenue", formatVND(currentRevenue), previousRevenue);

    const pending = dashboardFilteredBookings.filter(b => b.status === "PENDING").length;
    const confirmed = dashboardFilteredBookings.filter(b => b.status === "CONFIRMED").length;
    const cancelled = dashboardFilteredBookings.filter(b => b.status === "CANCELLED").length;
    set("pendingBookings", pending, dashboardPreviousBookings.filter(b => b.status === "PENDING").length);
    set("confirmedBookings", confirmed, dashboardPreviousBookings.filter(b => b.status === "CONFIRMED").length);
    set("cancelledBookings", cancelled, dashboardPreviousBookings.filter(b => b.status === "CANCELLED").length);

    const selectedTours = dashboardTourId === "ALL" ? tours : tours.filter(t => String(t.id) === String(dashboardTourId));
    const filteredTours = dashboardDestination === "ALL" ? selectedTours : selectedTours.filter(t => t.destination === dashboardDestination);
    const capacity = filteredTours.reduce((sum, t) => sum + Number(t.capacity ?? t.seats ?? 0), 0);
    const reserved = currentActive.reduce((sum, b) => sum + Number(b.people || 0), 0);
    const remaining = Math.max(0, capacity - reserved);
    const occupancy = capacity > 0 ? Math.round((reserved / capacity) * 100) : 0;
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

function refreshDashboard21() {
    ensureDashboard21Controls();
    populateDashboard21Filters();
    updateDashboard21KPIs();
    if (typeof window.renderDashboard21Charts === "function") window.renderDashboard21Charts();
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
