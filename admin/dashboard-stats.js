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

    const activeGuests = activeBookings.reduce(
        (sum, booking) => sum + Number(booking.people || 0),
        0
    );

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

// Re-render dashboard numbers whenever booking data changes.
const originalRenderBookingsForStats = window.renderBookings;
if (typeof originalRenderBookingsForStats === "function") {
    window.renderBookings = function () {
        originalRenderBookingsForStats();
        renderDashboardStats();
    };
}

// admin.js calls this after loading tours/bookings.
window.renderDashboardStats = renderDashboardStats;
