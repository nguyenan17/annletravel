// ================================
// ANNLETRAVEL - FRONTEND HARDENING
// ================================
// Loaded before app.js so the safer wrappers below are used
// by the existing DOMContentLoaded handlers.

(function () {
    "use strict";

    const originalRenderTourDetail = window.renderTourDetail;
    const originalLoadTourItinerary = window.loadTourItinerary;
    const originalCreateTourCard = window.createTourCard;
    const originalRenderMonthlyTours = window.renderMonthlyTours;
    const originalSubmitBooking = window.submitBooking;

    // --------------------------------
    // Invalid tour id must NOT fall back
    // to the first tour.
    // --------------------------------
    if (typeof originalRenderTourDetail === "function") {
        window.renderTourDetail = async function () {
            const container = document.getElementById("tourDetail");

            if (!container) {
                return originalRenderTourDetail();
            }

            const tourId = new URLSearchParams(window.location.search).get("id");
            const data = await window.loadTours();
            const tour = data.find(item => item.id === tourId);

            if (!tour) {
                window.currentGalleryImages = [];
                container.innerHTML = `
                    <div class="container section">
                        <h2>Không tìm thấy tour.</h2>
                        <p>Tour bạn đang tìm kiếm không tồn tại hoặc đã được thay đổi.</p>
                        <br>
                        <a href="tours.html" class="btn btn-primary">Xem tất cả tour</a>
                    </div>
                `;
                return;
            }

            return originalRenderTourDetail();
        };
    }

    // --------------------------------
    // Escape itinerary content before
    // inserting it into innerHTML.
    // --------------------------------
    if (typeof originalLoadTourItinerary === "function") {
        window.loadTourItinerary = async function (tourId) {
            const container = document.getElementById("tourItinerary");

            if (!container) {
                return;
            }

            try {
                const { data, error } = await window.supabaseClient
                    .from("tour_itineraries")
                    .select("day, title, description")
                    .eq("tour_id", tourId)
                    .order("day", { ascending: true });

                if (error) {
                    throw error;
                }

                if (!data || data.length === 0) {
                    container.innerHTML = "<p>Lịch trình đang được cập nhật.</p>";
                    return;
                }

                container.innerHTML = data.map(item => `
                    <div class="itinerary-day">
                        <h3>Ngày ${Number(item.day) || 0}: ${escapeHtmlSafe(item.title)}</h3>
                        ${item.description
                            ? `<p>${escapeHtmlSafe(item.description)}</p>`
                            : ""}
                    </div>
                `).join("");
            } catch (error) {
                console.error("Load itinerary error:", error);
                container.innerHTML = "<p>Không thể tải lịch trình.</p>";
            }
        };
    }

    // --------------------------------
    // Safer tour cards. This keeps the
    // existing visual structure but escapes
    // database-controlled text.
    // --------------------------------
    if (typeof originalCreateTourCard === "function") {
        window.createTourCard = function (tour) {
            const id = encodeURIComponent(String(tour.id ?? ""));
            const destination = escapeHtmlSafe(tour.destination);
            const name = escapeHtmlSafe(tour.name);
            const short = escapeHtmlSafe(tour.short);
            const image = safeImageUrl(tour.image);
            const seats = Number(tour.seats) || 0;
            const price = Number(tour.price) || 0;

            return `
                <article class="tour-card">
                    <a href="tour-detail.html?id=${id}"
                       class="tour-image"
                       style="background-image: url('${escapeCssUrl(image)}')">
                        <span class="tour-location">${destination}</span>
                        <span class="tour-seats">Còn ${seats} chỗ</span>
                    </a>

                    <div class="tour-content">
                        <div class="tour-date">📅 ${escapeHtmlSafe(tour.displayDate)}</div>
                        <h3>${name}</h3>
                        <p>${short}</p>

                        <div class="tour-meta">
                            <span>📍 ${destination}</span>
                            <span>👥 ${seats} chỗ</span>
                        </div>

                        <div class="tour-footer">
                            <div class="tour-price">
                                <small>Chỉ từ</small>
                                <strong>${formatPrice(price)}</strong>
                            </div>

                            <a href="tour-detail.html?id=${id}" class="tour-button">
                                Xem tour <span>→</span>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        };
    }

    // --------------------------------
    // Safer monthly departure rendering.
    // --------------------------------
    if (typeof originalRenderMonthlyTours === "function") {
        window.renderMonthlyTours = async function () {
            const data = await window.loadTours();
            const container = document.getElementById("monthlyTours");

            if (!container) {
                return;
            }

            const monthlyTours = data.slice(0, 4);

            container.innerHTML = monthlyTours.map(tour => `
                <div class="departure-row">
                    <div>
                        <strong>${escapeHtmlSafe(tour.displayDate)}</strong>
                        <small>${escapeHtmlSafe(tour.destination)}</small>
                    </div>
                    <strong>${escapeHtmlSafe(tour.name)}</strong>
                    <span>Còn ${Number(tour.seats) || 0} chỗ</span>
                    <strong>${formatPrice(Number(tour.price) || 0)}</strong>
                    <a href="tour-detail.html?id=${encodeURIComponent(String(tour.id ?? ""))}">
                        Xem tour
                    </a>
                </div>
            `).join("");
        };
    }

    // --------------------------------
    // Prevent accidental double-submit.
    // The original function remains responsible
    // for validation and the Supabase insert.
    // --------------------------------
    if (typeof originalSubmitBooking === "function") {
        window.submitBooking = async function (event, tourId) {
            const form = event?.currentTarget || event?.target;
            const button = form?.querySelector('button[type="submit"]');

            if (button?.dataset.submitting === "true") {
                return;
            }

            if (button) {
                button.dataset.submitting = "true";
                button.disabled = true;
                button.textContent = "Đang gửi...";
            }

            try {
                await originalSubmitBooking(event, tourId);
            } finally {
                // If the modal is still open, validation/error occurred;
                // allow the user to correct the form and retry.
                const modal = document.getElementById("bookingModal");
                const currentButton = form?.querySelector('button[type="submit"]');

                if (modal && currentButton) {
                    currentButton.dataset.submitting = "false";
                    currentButton.disabled = false;
                    currentButton.textContent = "Gửi yêu cầu đăng ký";
                }
            }
        };
    }

    function escapeHtmlSafe(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function safeImageUrl(value) {
        const url = String(value ?? "").trim();

        if (!url) {
            return "";
        }

        try {
            const parsed = new URL(url, window.location.href);
            if (["http:", "https:"].includes(parsed.protocol)) {
                return parsed.href;
            }
        } catch (_) {
            // Ignore malformed URLs.
        }

        return "";
    }

    function escapeCssUrl(value) {
        return String(value ?? "")
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")
            .replace(/\r/g, "")
            .replace(/\n/g, "");
    }
})();
