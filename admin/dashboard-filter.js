// ANNLETRAVEL - Dashboard 2.0 date filters
// Filters booking KPIs and trend charts by 7 days / 30 days / 6 months / 1 year.

let dashboardRange = "6m";
let dashboardFilteredBookings = [];
let dashboardTrendBookingsChartInstance = null;
let dashboardTrendRevenueChartInstance = null;

const DASHBOARD_RANGE_LABELS = {
    "7d": "7 ngày",
    "30d": "30 ngày",
    "6m": "6 tháng",
    "1y": "1 năm"
};

function getDashboardRangeStart() {
    const now = new Date();
    const start = new Date(now);

    if (dashboardRange === "7d") {
        start.setDate(start.getDate() - 6);
    } else if (dashboardRange === "30d") {
        start.setDate(start.getDate() - 29);
    } else if (dashboardRange === "1y") {
        start.setFullYear(start.getFullYear() - 1);
    } else {
        start.setMonth(start.getMonth() - 5);
    }

    start.setHours(0, 0, 0, 0);
    return start;
}

function getDashboardFilteredBookings() {
    if (!Array.isArray(bookings)) return [];

    const start = getDashboardRangeStart();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return bookings.filter(booking => {
        const date = new Date(booking.created_at);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });
}

function formatDashboardRange() {
    return DASHBOARD_RANGE_LABELS[dashboardRange] || DASHBOARD_RANGE_LABELS["6m"];
}

function ensureDashboardFilter() {
    const title = document.querySelector(".page-title");
    if (!title || document.getElementById("dashboardRangeFilter")) return;

    const filter = document.createElement("div");
    filter.className = "dashboard-filter-wrap";
    filter.innerHTML = `
        <label for="dashboardRangeFilter">Khoảng thời gian</label>
        <select id="dashboardRangeFilter" aria-label="Khoảng thời gian dashboard">
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="6m" selected>6 tháng</option>
            <option value="1y">1 năm</option>
        </select>
    `;

    const actions = title.querySelector("button")?.parentElement;
    if (actions) {
        actions.classList.add("dashboard-title-actions");
        actions.prepend(filter);
    } else {
        title.appendChild(filter);
    }

    document.getElementById("dashboardRangeFilter").addEventListener("change", event => {
        dashboardRange = event.target.value;
        renderDashboardStats();
        if (typeof renderAdvancedDashboardCharts === "function") {
            renderAdvancedDashboardCharts();
        }
    });
}

function getDashboardPrice(booking) {
    const tour = tours.find(item => String(item.id) === String(booking.tour_id));
    return Number(tour?.price || 0);
}

function renderDashboardStatsV2() {
    if (!Array.isArray(tours) || !Array.isArray(bookings)) return;

    ensureDashboardFilter();
    dashboardFilteredBookings = getDashboardFilteredBookings();

    const activeBookings = dashboardFilteredBookings.filter(booking =>
        ["PENDING", "CONFIRMED"].includes(booking.status)
    );
    const pendingBookings = dashboardFilteredBookings.filter(booking => booking.status === "PENDING");
    const confirmedBookings = dashboardFilteredBookings.filter(booking => booking.status === "CONFIRMED");
    const cancelledBookings = dashboardFilteredBookings.filter(booking => booking.status === "CANCELLED");

    const totalCapacity = tours.reduce(
        (sum, tour) => sum + Number(tour.capacity ?? tour.seats ?? 0), 0
    );
    const remainingSeats = tours.reduce(
        (sum, tour) => sum + Number(tour.seats || 0),
        0
    );
    const reservedSeats = activeBookings.reduce(
        (sum, booking) => sum + Number(booking.people || 0),
        0
    );
    const expectedRevenue = activeBookings.reduce(
        (sum, booking) => sum + getDashboardPrice(booking) * Number(booking.people || 0),
        0
    );

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText("totalTours", tours.length);
    setText("monthlyTours", getCurrentMonthTourCount());
    setText("totalCapacity", totalCapacity);
    setText("remainingSeats", remainingSeats);
    setText("reservedSeats", reservedSeats);
    setText("totalBookings", dashboardFilteredBookings.length);
    setText("pendingBookings", pendingBookings.length);
    setText("confirmedBookings", confirmedBookings.length);
    setText("cancelledBookings", cancelledBookings.length);
    setText("activeGuests", reservedSeats);
    setText("expectedRevenue", formatVND(expectedRevenue));

    const occupancyRate = totalCapacity > 0
        ? Math.round((reservedSeats / totalCapacity) * 100)
        : 0;
    setText("occupancyRate", `${occupancyRate}%`);

    renderBookingStatusChart(pendingBookings.length, confirmedBookings.length, cancelledBookings.length);
    renderTourCapacityChart();
    renderDashboardTrendCharts();
}

function getDashboardBuckets() {
    const result = [];
    const now = new Date();

    if (dashboardRange === "7d" || dashboardRange === "30d") {
        const days = dashboardRange === "7d" ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);
            result.push({
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
                label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
            });
        }
    } else {
        const months = dashboardRange === "1y" ? 12 : 6;
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
                label: `T${date.getMonth() + 1}/${date.getFullYear()}`
            });
        }
    }

    return result;
}

function getDashboardBucketKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    if (dashboardRange === "7d" || dashboardRange === "30d") {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function renderDashboardTrendCharts() {
    if (typeof Chart === "undefined") return;

    const bookingCanvas = document.getElementById("monthlyBookingsChart");
    const revenueCanvas = document.getElementById("monthlyRevenueChart");
    if (!bookingCanvas || !revenueCanvas) return;

    const buckets = getDashboardBuckets();
    const counts = buckets.map(bucket =>
        dashboardFilteredBookings.filter(booking =>
            getDashboardBucketKey(booking.created_at) === bucket.key
        ).length
    );

    const revenue = buckets.map(bucket =>
        dashboardFilteredBookings.reduce((sum, booking) => {
            if (!["PENDING", "CONFIRMED"].includes(booking.status)) return sum;
            if (getDashboardBucketKey(booking.created_at) !== bucket.key) return sum;
            return sum + getDashboardPrice(booking) * Number(booking.people || 0);
        }, 0)
    );

    if (dashboardTrendBookingsChartInstance) dashboardTrendBookingsChartInstance.destroy();
    dashboardTrendBookingsChartInstance = new Chart(bookingCanvas, {
        type: "line",
        data: {
            labels: buckets.map(bucket => bucket.label),
            datasets: [{
                label: "Booking",
                data: counts,
                borderColor: CHART_COLORS.bookings,
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: dashboardRange === "30d" ? 3 : 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: context => `${context.raw} đơn` } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
                x: { ticks: { maxRotation: 45, autoSkip: dashboardRange === "30d" } }
            }
        }
    });

    if (dashboardTrendRevenueChartInstance) dashboardTrendRevenueChartInstance.destroy();
    dashboardTrendRevenueChartInstance = new Chart(revenueCanvas, {
        type: "line",
        data: {
            labels: buckets.map(bucket => bucket.label),
            datasets: [{
                label: "Doanh thu",
                data: revenue,
                borderColor: CHART_COLORS.revenue,
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: dashboardRange === "30d" ? 3 : 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: context => formatVND(context.raw) } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value) }
                },
                x: { ticks: { maxRotation: 45, autoSkip: dashboardRange === "30d" } }
            }
        }
    });

    const bookingDescription = document.querySelector("#monthlyBookingsChart")?.closest(".chart-card")?.querySelector(".chart-header p");
    const revenueDescription = document.querySelector("#monthlyRevenueChart")?.closest(".chart-card")?.querySelector(".chart-header p");
    if (bookingDescription) bookingDescription.textContent = `Xu hướng booking trong ${formatDashboardRange()}`;
    if (revenueDescription) revenueDescription.textContent = `Doanh thu PENDING + CONFIRMED trong ${formatDashboardRange()}`;
}

// Advanced charts should use the selected period for their ranking/reservation view.
window.getTourReservedSeats = function (tourId) {
    return dashboardFilteredBookings
        .filter(booking =>
            String(booking.tour_id) === String(tourId) &&
            ["PENDING", "CONFIRMED"].includes(booking.status)
        )
        .reduce((sum, booking) => sum + Number(booking.people || 0), 0);
};

window.renderDashboardStats = renderDashboardStatsV2;

(function injectDashboardFilterStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .dashboard-title-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .dashboard-filter-wrap { display: flex; align-items: center; gap: 8px; }
        .dashboard-filter-wrap label { color: #66727d; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .dashboard-filter-wrap select { min-width: 125px; height: 40px; padding: 0 34px 0 12px; border: 1px solid #d7e1e8; border-radius: 9px; background: white; color: #17212b; font-size: 14px; font-weight: 600; cursor: pointer; }
        .dashboard-filter-wrap select:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12); }
        @media (max-width: 700px) { .dashboard-title-actions { width: 100%; } .dashboard-filter-wrap { width: 100%; } .dashboard-filter-wrap select { flex: 1; } }
    `;
    document.head.appendChild(style);
})();

ensureDashboardFilter();
