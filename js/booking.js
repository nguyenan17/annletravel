// ================================
// ANNLETRAVEL - ATOMIC BOOKING
// ================================
// Uses the Supabase create_booking RPC so seat checking,
// booking creation and seat decrement happen atomically.

let bookingSubmitting = false;

async function submitBooking(event, tourId) {
    event.preventDefault();

    if (bookingSubmitting) {
        return;
    }

    const name = document.getElementById("bookingName")?.value.trim() || "";
    const phone = document.getElementById("bookingPhone")?.value.trim() || "";
    const people = Number(document.getElementById("bookingPeople")?.value);
    const note = document.getElementById("bookingNote")?.value.trim() || "";
    const submitButton = event.submitter || event.currentTarget?.querySelector("button[type='submit']");

    if (!name || !phone) {
        alert("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
        return;
    }

    if (!Number.isInteger(people) || people <= 0) {
        alert("Số người đăng ký không hợp lệ.");
        return;
    }

    if (!tourId) {
        alert("Không xác định được tour.");
        return;
    }

    bookingSubmitting = true;

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = "Đang gửi...";
    }

    try {
        const { data, error } = await supabaseClient.rpc("create_booking", {
            p_tour_id: String(tourId),
            p_customer_name: name,
            p_phone: phone,
            p_people: people,
            p_note: note
        });

        if (error) {
            throw error;
        }

        const remainingSeats = data?.remaining_seats;

        // Keep the local tour cache in sync after a successful reservation.
        if (Array.isArray(window.tours)) {
            const cachedTour = window.tours.find(item => String(item.id) === String(tourId));
            if (cachedTour && Number.isInteger(remainingSeats)) {
                cachedTour.seats = remainingSeats;
            }
        }

        alert(
            Number.isInteger(remainingSeats)
                ? `Đăng ký tour thành công! Cảm ơn bạn đã đăng ký. Tour hiện còn ${remainingSeats} chỗ.`
                : "Đăng ký tour thành công! Cảm ơn bạn đã đăng ký."
        );

        if (typeof closeBookingModal === "function") {
            closeBookingModal();
        }
    } catch (error) {
        console.error("Không thể tạo booking:", error);

        const message = String(error?.message || error?.details || "");

        if (message.includes("NOT_ENOUGH_SEATS")) {
            alert("Tour không còn đủ chỗ cho số người bạn đăng ký. Vui lòng giảm số người hoặc chọn tour khác.");
        } else if (message.includes("TOUR_NOT_FOUND")) {
            alert("Không tìm thấy tour hoặc tour đã được cập nhật. Vui lòng tải lại trang.");
        } else if (message.includes("INVALID_PEOPLE")) {
            alert("Số người đăng ký không hợp lệ.");
        } else {
            alert("Không thể gửi đăng ký tour. Vui lòng thử lại sau.");
        }
    } finally {
        bookingSubmitting = false;

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || "Đăng ký";
            delete submitButton.dataset.originalText;
        }
    }
}
