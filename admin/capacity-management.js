// ANNLETRAVEL - Total capacity management
// admin.js remains compatible: #tourSeats is temporarily used as the
// visible capacity input, then converted to available seats on submit.

(function () {
    const form = document.getElementById("tourForm");
    const seatsInput = document.getElementById("tourSeats");
    if (!form || !seatsInput) return;

    const label = seatsInput.closest(".form-group")?.querySelector("label");
    if (label) label.textContent = "Tổng số chỗ";

    const help = document.createElement("p");
    help.className = "image-help";
    help.id = "tourCapacityHelp";
    help.textContent = "Số chỗ còn lại sẽ được tự động tính theo các đơn PENDING/CONFIRMED.";
    seatsInput.closest(".form-group")?.appendChild(help);

    const originalEditTour = window.editTour;
    if (typeof originalEditTour === "function") {
        window.editTour = function (tourId) {
            originalEditTour(tourId);
            const tour = Array.isArray(window.tours)
                ? window.tours.find(item => String(item.id) === String(tourId))
                : null;
            if (tour) {
                seatsInput.value = Number.isInteger(Number(tour.capacity))
                    ? Number(tour.capacity)
                    : Number(tour.seats || 0);
            }
        };
    }

    function getActiveReservedPeople(tourId) {
        if (!Array.isArray(window.bookings)) return 0;
        return window.bookings
            .filter(booking =>
                String(booking.tour_id) === String(tourId) &&
                ["PENDING", "CONFIRMED"].includes(booking.status)
            )
            .reduce((sum, booking) => sum + Number(booking.people || 0), 0);
    }

    form.addEventListener("submit", async function (event) {
        const tourId = document.getElementById("tourId")?.value?.trim();
        const capacity = Number(seatsInput.value);

        if (!Number.isInteger(capacity) || capacity < 0) {
            event.preventDefault();
            alert("Tổng số chỗ không hợp lệ.");
            return;
        }

        if (!tourId) {
            // New tour: total capacity equals available seats.
            seatsInput.value = capacity;
            return;
        }

        const reserved = getActiveReservedPeople(tourId);
        if (capacity < reserved) {
            event.preventDefault();
            alert(`Không thể giảm tổng số chỗ xuống ${capacity}. Hiện đã có ${reserved} chỗ đang được giữ bởi đơn PENDING/CONFIRMED.`);
            return;
        }

        // admin.js reads #tourSeats as the remaining seats.
        // Set it before its own submit handler runs.
        seatsInput.value = capacity - reserved;

        // Update the independent capacity column asynchronously.
        try {
            const { data, error } = await supabaseClient.rpc("update_tour_capacity", {
                p_tour_id: tourId,
                p_capacity: capacity
            });

            if (error) throw error;

            const tour = Array.isArray(window.tours)
                ? window.tours.find(item => String(item.id) === String(tourId))
                : null;
            if (tour && data) {
                tour.capacity = Number(data.capacity);
                tour.seats = Number(data.remaining_seats);
            }
        } catch (error) {
            console.error("Update tour capacity error:", error);
            // Do not block the legacy tour update here; the RPC is protected
            // and will surface the problem in console for diagnosis.
        }
    }, true);

    // New tour modal should start with a sensible capacity.
    document.getElementById("addTourButton")?.addEventListener("click", function () {
        setTimeout(() => {
            seatsInput.value = "20";
        }, 0);
    });
})();
