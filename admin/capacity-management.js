// ANNLETRAVEL - Total capacity management
// admin.js remains compatible: #tourSeats is used as the total-capacity input,
// then converted to remaining seats before admin.js saves the tour.

(function () {
    const form = document.getElementById("tourForm");
    const seatsInput = document.getElementById("tourSeats");
    if (!form || !seatsInput) return;

    const label = seatsInput.closest(".form-group")?.querySelector("label");
    if (label) label.textContent = "Tổng số chỗ";

    const help = document.createElement("p");
    help.className = "image-help";
    help.id = "tourCapacityHelp";
    help.textContent = "Số chỗ còn lại được tự động tính theo các đơn PENDING/CONFIRMED.";
    seatsInput.closest(".form-group")?.appendChild(help);

    const originalEditTour = window.editTour;
    if (typeof originalEditTour === "function") {
        window.editTour = function (tourId) {
            originalEditTour(tourId);
            const tour = tours.find(item => String(item.id) === String(tourId));
            if (tour) {
                seatsInput.value = Number.isInteger(Number(tour.capacity))
                    ? Number(tour.capacity)
                    : Number(tour.seats || 0);
            }
        };
    }

    function getActiveReservedPeople(tourId) {
        return bookings
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
            seatsInput.value = capacity;
            return;
        }

        const reserved = getActiveReservedPeople(tourId);
        if (capacity < reserved) {
            event.preventDefault();
            alert(`Không thể giảm tổng số chỗ xuống ${capacity}. Hiện đã có ${reserved} chỗ đang được giữ bởi đơn PENDING/CONFIRMED.`);
            return;
        }

        // admin.js reads #tourSeats as remaining seats.
        seatsInput.value = capacity - reserved;

        try {
            const { data, error } = await supabaseClient.rpc("update_tour_capacity", {
                p_tour_id: tourId,
                p_capacity: capacity
            });

            if (error) throw error;

            const tour = tours.find(item => String(item.id) === String(tourId));
            if (tour && data) {
                tour.capacity = Number(data.capacity);
                tour.seats = Number(data.remaining_seats);
            }
        } catch (error) {
            console.error("Update tour capacity error:", error);
            // The RPC is protected by the database. Keep the existing save flow
            // running so a temporary client-side error does not lose tour edits.
        }
    }, true);

    document.getElementById("addTourButton")?.addEventListener("click", function () {
        setTimeout(() => {
            seatsInput.value = "20";
        }, 0);
    });
})();
