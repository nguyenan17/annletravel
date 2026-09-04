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
