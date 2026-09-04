// ANNLETRAVEL - Admin dashboard statistics

let bookingStatusChartInstance = null;
let tourCapacityChartInstance = null;
let monthlyBookingsChartInstance = null;
let monthlyRevenueChartInstance = null;

const CHART_COLORS = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    cancelled: "#ef4444",
    capacity: "#6366f1",
    remaining: "#f97316",
    bookings: "#06b6d4",
    revenue: "#8b5cf6"
};

function formatVND(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " đ";
}

function renderDashboardStats() {
    const activeBookings = bookings.filter(booking =>
        ["PENDING", "CONFIRMED"].includes(booking.status)
    );
    const pendingBookings = bookings.filter(booking => booking.status === "PENDING");
    const confirmedBookings = bookings.filter(booking => booking.status === "CONFIRMED");
    const cancelledBookings = bookings.filter(booking => booking.status === "CANCELLED");

    const totalCapacity = tours.reduce(
        (sum, tour) => sum + Number(tour.capacity ?? tour.seats ?? 0), 0
    );
    const remainingSeats = tours.reduce(
        (sum, tour) => sum + Number(tour.seats || 0), 0
    );
    const reservedSeats = activeBookings.reduce(
        (sum, booking) => sum + Number(booking.people || 0), 0
    );
    const expectedRevenue = activeBookings.reduce((sum, booking) => {
        const tour = tours.find(item => String(item.id) === String(booking.tour_id));
        return sum + Number(tour?.price || 0) * Number(booking.people || 0);
    }, 0);

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText("totalTours", tours.length);
    setText("monthlyTours", getCurrentMonthTourCount());
    setText("totalCapacity", totalCapacity);
    setText("remainingSeats", remainingSeats);
    setText("reservedSeats", reservedSeats);
    setText("totalBookings", bookings.length);
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
    renderMonthlyCharts();
}

function getCurrentMonthTourCount() {
    const now = new Date();
    return tours.filter(tour => {
        const date = new Date(`${tour.departure}T00:00:00`);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
}

function renderBookingStatusChart(pending, confirmed, cancelled) {
    const canvas = document.getElementById("bookingStatusChart");
    if (!canvas || typeof Chart === "undefined") return;

    if (bookingStatusChartInstance) bookingStatusChartInstance.destroy();

    bookingStatusChartInstance = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Chờ xác nhận", "Đã xác nhận", "Đã hủy"],
            datasets: [{
                data: [pending, confirmed, cancelled],
                backgroundColor: [CHART_COLORS.pending, CHART_COLORS.confirmed, CHART_COLORS.cancelled],
                borderColor: "#ffffff",
                borderWidth: 4,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { usePointStyle: true, padding: 18, font: { size: 13 } }
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${context.raw} đơn`
                    }
                }
            }
        }
    });
}

function renderTourCapacityChart() {
    const canvas = document.getElementById("tourCapacityChart");
    if (!canvas || typeof Chart === "undefined") return;
    if (tourCapacityChartInstance) tourCapacityChartInstance.destroy();

    const chartTours = [...tours].sort(
        (a, b) => Number(b.capacity ?? b.seats ?? 0) - Number(a.capacity ?? a.seats ?? 0)
    );

    tourCapacityChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: chartTours.map(tour => tour.name || tour.destination || tour.id),
            datasets: [
                {
                    label: "Tổng sức chứa",
                    data: chartTours.map(tour => Number(tour.capacity ?? tour.seats ?? 0)),
                    backgroundColor: CHART_COLORS.capacity,
                    borderRadius: 7,
                    borderSkipped: false
                },
                {
                    label: "Chỗ còn lại",
                    data: chartTours.map(tour => Number(tour.seats || 0)),
                    backgroundColor: CHART_COLORS.remaining,
                    borderRadius: 7,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Số chỗ" } },
                x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } }
            },
            plugins: {
                legend: { position: "top", labels: { usePointStyle: true, padding: 16 } },
                tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw} chỗ` } }
            }
        }
    });
}

function ensureMonthlyChartCards() {
    const chartsSection = document.querySelector(".dashboard-charts");
    if (!chartsSection) return null;

    let monthlySection = document.getElementById("monthlyChartsSection");
    if (monthlySection) return monthlySection;

    monthlySection = document.createElement("section");
    monthlySection.id = "monthlyChartsSection";
    monthlySection.className = "dashboard-charts monthly-charts";
    monthlySection.innerHTML = `
        <div class="chart-card">
            <div class="chart-header">
                <h2>Đơn đăng ký theo tháng</h2>
                <p>Xu hướng số booking trong 6 tháng gần nhất</p>
            </div>
            <div class="chart-body"><canvas id="monthlyBookingsChart"></canvas></div>
        </div>
        <div class="chart-card">
            <div class="chart-header">
                <h2>Doanh thu dự kiến theo tháng</h2>
                <p>Tính theo các đơn PENDING và CONFIRMED</p>
            </div>
            <div class="chart-body"><canvas id="monthlyRevenueChart"></canvas></div>
        </div>
    `;

    chartsSection.parentNode.insertBefore(monthlySection, chartsSection.nextSibling);
    return monthlySection;
}

function getLastSixMonths() {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            label: `T${date.getMonth() + 1}/${date.getFullYear()}`
        });
    }
    return result;
}

function getBookingTourPrice(booking) {
    const tour = tours.find(item => String(item.id) === String(booking.tour_id));
    return Number(tour?.price || 0);
}

function renderMonthlyCharts() {
    if (typeof Chart === "undefined") return;
    const section = ensureMonthlyChartCards();
    if (!section) return;

    const months = getLastSixMonths();
    const bookingCounts = months.map(month =>
        bookings.filter(booking => {
            const date = new Date(booking.created_at);
            return !Number.isNaN(date.getTime()) &&
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` === month.key;
        }).length
    );

    const revenue = months.map(month =>
        bookings.reduce((sum, booking) => {
            if (!["PENDING", "CONFIRMED"].includes(booking.status)) return sum;
            const date = new Date(booking.created_at);
            if (Number.isNaN(date.getTime())) return sum;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            return key === month.key
                ? sum + getBookingTourPrice(booking) * Number(booking.people || 0)
                : sum;
        }, 0)
    );

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    if (monthlyBookingsChartInstance) monthlyBookingsChartInstance.destroy();
    monthlyBookingsChartInstance = new Chart(document.getElementById("monthlyBookingsChart"), {
        type: "line",
        data: {
            labels: months.map(item => item.label),
            datasets: [{
                label: "Booking",
                data: bookingCounts,
                borderColor: CHART_COLORS.bookings,
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                tooltip: { callbacks: { label: context => `${context.raw} đơn` } }
            },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });

    if (monthlyRevenueChartInstance) monthlyRevenueChartInstance.destroy();
    monthlyRevenueChartInstance = new Chart(document.getElementById("monthlyRevenueChart"), {
        type: "line",
        data: {
            labels: months.map(item => item.label),
            datasets: [{
                label: "Doanh thu",
                data: revenue,
                borderColor: CHART_COLORS.revenue,
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                tooltip: { callbacks: { label: context => formatVND(context.raw) } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value) }
                }
            }
        }
    });
}

(function injectDashboardStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .stats-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        .stat-card { min-width: 0; }
        .stat-subtext { margin-top: 4px; color: #66727d; font-size: 12px; }
        .dashboard-overview { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; margin-bottom: 32px; }
        .overview-card { background: white; border: 1px solid #e1eaf0; border-radius: 12px; padding: 18px 20px; min-width: 0; }
        .overview-label { color: #66727d; font-size: 13px; margin-bottom: 8px; }
        .overview-card strong { display: block; font-size: 23px; line-height: 1.25; color: #17212b; overflow-wrap: anywhere; }
        .overview-card > span { display: block; margin-top: 5px; color: #8a969f; font-size: 12px; }
        .revenue-card strong { color: #168b57; font-size: 21px; }
        .dashboard-charts { display: grid; grid-template-columns: minmax(300px, 0.85fr) minmax(0, 1.7fr); gap: 20px; margin: 0 0 32px; }
        .monthly-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .chart-card { background: white; border: 1px solid #e1eaf0; border-radius: 14px; padding: 20px; min-width: 0; box-shadow: 0 4px 18px rgba(20, 35, 50, 0.05); }
        .chart-header h2 { margin: 0; color: #17212b; font-size: 18px; }
        .chart-header p { margin: 6px 0 0; color: #66727d; font-size: 13px; }
        .chart-body { position: relative; height: 320px; margin-top: 16px; }
        .chart-body-doughnut { height: 300px; }
        .chart-body canvas { max-width: 100%; }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } .dashboard-overview { grid-template-columns: repeat(3, 1fr); } .dashboard-charts, .monthly-charts { grid-template-columns: 1fr; } }
        @media (max-width: 700px) { .stats-grid, .dashboard-overview { grid-template-columns: 1fr; } .chart-card { padding: 16px; } .chart-body, .chart-body-doughnut { height: 280px; } }
    `;
    document.head.appendChild(style);
})();

const originalRenderBookingsForStats = window.renderBookings;
if (typeof originalRenderBookingsForStats === "function") {
    window.renderBookings = function () {
        originalRenderBookingsForStats();
        renderDashboardStats();
    };
}

const originalShowDashboardForStats = window.showDashboard;
if (typeof originalShowDashboardForStats === "function") {
    window.showDashboard = async function () {
        await originalShowDashboardForStats();
        renderDashboardStats();
    };
}

window.renderDashboardStats = renderDashboardStats;
