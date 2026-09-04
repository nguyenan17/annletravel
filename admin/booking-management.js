// ================================
// ANNLETRAVEL - ATOMIC BOOKING MANAGEMENT
// ================================
// This file overrides the legacy direct booking update/delete handlers.
// Seat changes are performed inside Supabase RPC transactions.

function refreshBookingDashboard() {
    if (typeof renderDashboardStats === "function") {
        renderDashboardStats();
    }

    if (typeof renderTours === "function") {
        renderTours();
    }
}

window.updateBookingStatus = async function (bookingId, newStatus) {
    const booking = bookings.find(item => item.id === bookingId);

    if (!booking) {
        return;
    }

    const oldStatus = booking.status;

    if (oldStatus === newStatus) {
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc("update_booking_status", {
            p_booking_id: bookingId,
            p_new_status: newStatus
        });

        if (error) {
            throw error;
        }

        booking.status = newStatus;

        const remainingSeats = Number(data?.remaining_seats);
        const tour = tours.find(item => String(item.id) === String(booking.tour_id));

        if (tour && Number.isInteger(remainingSeats)) {
            tour.seats = remainingSeats;
        }

        renderBookings();
        refreshBookingDashboard();

        if (oldStatus === "PENDING" && newStatus === "CANCELLED") {
            alert(`Đã hủy booking và hoàn ${booking.people} chỗ cho tour.`);
        } else if (oldStatus === "CONFIRMED" && newStatus === "CANCELLED") {
            alert(`Đã hủy booking và hoàn ${booking.people} chỗ cho tour.`);
        } else if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
            alert(`Đã ${newStatus === "CONFIRMED" ? "xác nhận" : "mở lại"} booking và giữ lại ${booking.people} chỗ.`);
        }
    } catch (error) {
        console.error("Update booking status error:", error);

        const message = String(error?.message || error?.details || "");

        if (message.includes("NOT_ENOUGH_SEATS")) {
            alert("Không đủ chỗ để mở lại booking này. Booking vẫn giữ trạng thái Đã hủy.");
        } else if (message.includes("ADMIN_ONLY")) {
            alert("Phiên đăng nhập không có quyền Admin hoặc đã hết hạn.");
        } else if (message.includes("BOOKING_NOT_FOUND")) {
            alert("Booking không còn tồn tại. Vui lòng làm mới danh sách.");
        } else {
            alert("Không thể cập nhật trạng thái booking.\n\n" + message);
        }

        await loadBookings();
    }
};

window.deleteBooking = async function (bookingId) {
    const booking = bookings.find(item => item.id === bookingId);

    if (!booking) {
        return;
    }

    const confirmed = confirm(
        `Bạn có chắc muốn xóa đơn đăng ký của "${booking.customer_name}"?\n\n` +
        (booking.status === "CANCELLED"
            ? "Booking đã hủy nên không hoàn thêm ghế."
            : `Booking đang giữ ${booking.people} chỗ. Các chỗ này sẽ được hoàn lại.`)
    );

    if (!confirmed) {
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc("delete_booking", {
            p_booking_id: bookingId
        });

        if (error) {
            throw error;
        }

        const releasedSeats = Number(data?.released_seats || 0);
        const tour = tours.find(item => String(item.id) === String(booking.tour_id));

        if (tour && releasedSeats > 0) {
            tour.seats = Number(tour.seats || 0) + releasedSeats;
        }

        alert(
            releasedSeats > 0
                ? `Xóa booking thành công và hoàn ${releasedSeats} chỗ cho tour.`
                : "Xóa booking thành công."
        );

        await loadBookings();
        refreshBookingDashboard();
    } catch (error) {
        console.error("Delete booking error:", error);
        alert("Không thể xóa đơn đăng ký.\n\n" + (error?.message || "Lỗi không xác định."));
        await loadBookings();
    }
};
