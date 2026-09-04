// ANNLETRAVEL - Advanced dashboard charts

let topToursChartInstance = null;
let occupancyByTourChartInstance = null;

const ADVANCED_COLORS = {
    primary: "#0ea5e9",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444"
};

function renderAdvancedDashboardCharts() {
    if (typeof Chart === "undefined" || !Array.isArray(tours) || !Array.isArray(bookings)) return;
    renderTopToursChart();
    renderOccupancyByTourChart();
}

function getTourReservedSeats(tourId, sourceBookings = bookings) {
    return sourceBookings
        .filter(booking => String(booking.tour_id) === String(tourId) && ["PENDING", "CONFIRMED"].includes(booking.status))
        .reduce((sum, booking) => sum + Number(booking.people || 0), 0);
}

function getTourName(tour) {
    return tour.name || tour.destination || tour.id;
}

function getDashboard21Tours() {
    if (typeof dashboardMatchesTour === "function") return tours.filter(dashboardMatchesTour);
    return tours;
}

function renderTopToursChart() {
    const canvas = document.getElementById("topToursChart");
    if (!canvas) return;
    if (topToursChartInstance) topToursChartInstance.destroy();

    const sourceBookings = Array.isArray(window.dashboardFilteredBookings)
        ? window.dashboardFilteredBookings
        : (typeof dashboardFilteredBookings !== "undefined" ? dashboardFilteredBookings : bookings);

    const visibleTours = getDashboard21Tours();
    const data = visibleTours.map(tour => ({
        name: getTourName(tour),
        reserved: getTourReservedSeats(tour.id, sourceBookings)
    })).sort((a, b) => b.reserved - a.reserved).slice(0, 8);

    topToursChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: data.map(item => item.name),
            datasets: [{ label: "Khách trong kỳ", data: data.map(item => item.reserved), backgroundColor: ADVANCED_COLORS.primary, borderRadius: 8, borderSkipped: false }]
        },
        options: {
            indexAxis: "y", responsive: true, maintainAspectRatio: false,
            scales: { x: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Số khách" } } },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.raw} khách` } } }
        }
    });
}

function renderOccupancyByTourChart() {
    const canvas = document.getElementById("occupancyByTourChart");
    if (!canvas) return;
    if (occupancyByTourChartInstance) occupancyByTourChartInstance.destroy();

    const visibleTours = getDashboard21Tours();
    const data = visibleTours.map(tour => {
        const capacity = Number(tour.capacity ?? tour.seats ?? 0);
        const remaining = Number(tour.seats || 0);
        const reserved = Math.max(0, capacity - remaining);
        const rate = capacity > 0 ? Math.round((reserved / capacity) * 100) : 0;
        return { name: getTourName(tour), rate };
    }).sort((a, b) => b.rate - a.rate).slice(0, 8);

    occupancyByTourChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: "Tỷ lệ lấp đầy",
                data: data.map(item => item.rate),
                backgroundColor: data.map(item => item.rate >= 80 ? ADVANCED_COLORS.danger : item.rate >= 50 ? ADVANCED_COLORS.warning : ADVANCED_COLORS.success),
                borderRadius: 8, borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y", responsive: true, maintainAspectRatio: false,
            scales: { x: { beginAtZero: true, max: 100, ticks: { callback: value => `${value}%` }, title: { display: true, text: "Tỷ lệ" } } },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.raw}% lấp đầy` } } }
        }
    });
}

(function injectAdvancedChartStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .advanced-charts { grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr); }
        .advanced-charts .chart-card-wide { min-width: 0; }
        @media (max-width: 1100px) { .advanced-charts { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
})();

const originalRenderBookingsForAdvancedCharts = window.renderBookings;
if (typeof originalRenderBookingsForAdvancedCharts === "function") {
    window.renderBookings = function () {
        originalRenderBookingsForAdvancedCharts();
        renderAdvancedDashboardCharts();
    };
}

const originalShowDashboardForAdvancedCharts = window.showDashboard;
if (typeof originalShowDashboardForAdvancedCharts === "function") {
    window.showDashboard = async function () {
        await originalShowDashboardForAdvancedCharts();
        renderAdvancedDashboardCharts();
    };
}

window.renderAdvancedDashboardCharts = renderAdvancedDashboardCharts;
