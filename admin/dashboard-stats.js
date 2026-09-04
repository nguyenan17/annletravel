// ANNLETRAVEL - Admin dashboard statistics

function formatVND(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " đ";
}

function renderDashboardStats() {
    const activeBookings = bookings.filter(booking =>
        ["PENDING", "CONFIRMED"].includes(booking.status)
    );

    const pendingBookings = bookings.filter(
        booking => booking.status === "PENDING"
    );

    const confirmedBookings = bookings.filter(
        booking => booking.status === "CONFIRMED"
    );

    const cancelledBookings = bookings.filter(
        booking => booking.status === "CANCELLED"
    );

    const totalCapacity = tours.reduce(
        (sum, tour) => sum + Number(tour.capacity ?? tour.seats ?? 0),
        0
    );

    const remainingSeats = tours.reduce(
        (sum, tour) => sum + Number(tour.seats || 0),
        0
    );

    const reservedSeats = activeBookings.reduce(
        (sum, booking) => sum + Number(booking.people || 0),
        0
    );

    const activeGuests = reservedSeats;

    const expectedRevenue = activeBookings.reduce((sum, booking) => {
        const tour = tours.find(
            item => String(item.id) === String(booking.tour_id)
        );

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
    setText("activeGuests", activeGuests);
    setText("expectedRevenue", formatVND(expectedRevenue));

    const occupancyRate = totalCapacity > 0
        ? Math.round((reservedSeats / totalCapacity) * 100)
        : 0;

    setText("occupancyRate", `${occupancyRate}%`);
}

function getCurrentMonthTourCount() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return tours.filter(tour => {
        const date = new Date(`${tour.departure}T00:00:00`);
        return date.getMonth() === month && date.getFullYear() === year;
    }).length;
}

// Dashboard styling is kept here so no extra CSS dependency is required.
(function injectDashboardStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .stats-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        .stat-card { min-width: 0; }
        .stat-subtext {
            margin-top: 4px;
            color: #66727d;
            font-size: 12px;
        }
        .dashboard-overview {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .overview-card {
            background: white;
            border: 1px solid #e1eaf0;
            border-radius: 12px;
            padding: 18px 20px;
            min-width: 0;
        }
        .overview-label {
            color: #66727d;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .overview-card strong {
            display: block;
            font-size: 23px;
            line-height: 1.25;
            color: #17212b;
            overflow-wrap: anywhere;
        }
        .overview-card > span {
            display: block;
            margin-top: 5px;
            color: #8a969f;
            font-size: 12px;
        }
        .revenue-card strong {
            color: #168b57;
            font-size: 21px;
        }
        @media (max-width: 1100px) {
            .stats-grid { grid-template-columns: repeat(3, 1fr); }
            .dashboard-overview { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
            .stats-grid,
            .dashboard-overview { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
})();

// Re-render dashboard numbers whenever booking data changes.
const originalRenderBookingsForStats = window.renderBookings;
if (typeof originalRenderBookingsForStats === "function") {
    window.renderBookings = function () {
        originalRenderBookingsForStats();
        renderDashboardStats();
    };
}

// Re-render after the initial dashboard load.
const originalShowDashboardForStats = window.showDashboard;
if (typeof originalShowDashboardForStats === "function") {
    window.showDashboard = async function () {
        await originalShowDashboardForStats();
        renderDashboardStats();
    };
}

window.renderDashboardStats = renderDashboardStats;
