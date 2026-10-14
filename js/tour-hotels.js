(function () {
    let loadingTourId = "";
    window.selectedTourHotelOption = null;

    const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
    const money = value => new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "đ";

    function estimatedPrice(option, tour) {
        if (option.pricing_mode === "INCLUDED") {
            return Number(option.package_price_per_person ?? tour.price ?? 0);
        }
        return Number(tour.price || 0) + Number(option.price_per_person || 0)
            + Number(option.room_price_per_night || 0) * Number(option.nights || 1)
            / Math.max(1, Number(option.max_guests_per_room || 2));
    }

    function renderCard(option, tour) {
        const hotel = option.hotels;
        const image = hotel.cover_image || (Array.isArray(hotel.gallery_images) ? hotel.gallery_images[0] : "");
        const detail = [
            hotel.star_rating ? "★".repeat(hotel.star_rating) + " sao" : "",
            hotel.breakfast_included ? "Có buffet sáng" : "",
            option.label || "Gói lưu trú"
        ].filter(Boolean).join(" · ");
        const amenities = Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 3).map(esc).join(" · ") : "";
        let html = '<button type="button" class="tour-hotel-card" data-option-id="' + esc(option.id) + '" aria-pressed="false">';
        html += image ? '<img src="' + esc(image) + '" alt="' + esc(hotel.name) + '" loading="lazy">' : '<div class="tour-hotel-placeholder">🏨</div>';
        html += '<span class="tour-hotel-card-body"><strong>' + esc(hotel.name) + '</strong>';
        html += '<span class="tour-hotel-description">' + esc(detail) + '</span>';
        html += '<span class="tour-hotel-amenities">' + amenities + '</span>';
        if (hotel.breakfast_included && hotel.breakfast_description) {
            html += '<span class="tour-hotel-breakfast">Buffet sáng: ' + esc(hotel.breakfast_description) + '</span>';
        }
        html += '<span class="tour-hotel-price">' + money(estimatedPrice(option, tour)) + '<small>';
        html += option.pricing_mode === "INCLUDED" ? " / người · đã gồm khách sạn" : " / người ước tính · có phụ thu phòng";
        html += '</small></span><span class="tour-hotel-mode">';
        html += option.pricing_mode === "INCLUDED" ? "Giá gói đã bao gồm lưu trú" : "Giá tour + phụ thu lưu trú";
        html += '</span><span class="tour-hotel-note">' + esc(option.note || "") + '</span>';
        html += '<span class="tour-hotel-select-label">Chọn gói này</span></span></button>';
        return html;
    }

    function selectOption(option, tour, section, card) {
        window.selectedTourHotelOption = {
            id: option.id,
            hotelId: option.hotel_id,
            hotelName: option.hotels.name,
            hotelImage: option.hotels.cover_image || "",
            roomLabel: option.label || "Gói lưu trú",
            pricingMode: option.pricing_mode,
            pricePerPerson: Number(option.price_per_person || 0),
            roomPricePerNight: Number(option.room_price_per_night || 0),
            maxGuests: Number(option.max_guests_per_room || 2),
            nights: Number(option.nights || 1),
            packagePricePerPerson: option.package_price_per_person == null ? null : Number(option.package_price_per_person),
            baseTourPrice: Number(tour.price || 0),
            note: option.note || "",
            estimatedPerPerson: estimatedPrice(option, tour)
        };
        section.querySelectorAll(".tour-hotel-card").forEach(item => {
            const chosen = item === card;
            item.classList.toggle("selected", chosen);
            item.setAttribute("aria-pressed", String(chosen));
        });
        const summary = document.getElementById("tourHotelSelectionSummary");
        summary.innerHTML = '<strong>Đã chọn: ' + esc(option.hotels.name) + '</strong>'
            + '<span>' + esc(option.label || "Gói lưu trú") + " · " + money(estimatedPrice(option, tour)) + ' / người (ước tính)</span>'
            + '<span>' + (option.pricing_mode === "INCLUDED"
                ? "Giá gói đã bao gồm khách sạn."
                : "Tổng phụ thu phòng được tính theo số khách và số đêm; Sale sẽ xác nhận lại trước khi chốt.")
            + '</span>';
    }

    async function renderOptions() {
        const container = document.getElementById("tourDetail");
        if (!container) return;
        const id = new URLSearchParams(location.search).get("id");
        if (!id || (container.dataset.hotelOptionsTour === id && document.getElementById("tourHotelOptions")) || loadingTourId === id) return;
        loadingTourId = id;
        try {
            const result = await supabaseClient.from("tour_hotel_options")
                .select("*, hotels(*)").eq("tour_id", id).eq("active", true).order("sort_order");
            if (result.error) throw result.error;
            const tour = (Array.isArray(tours) ? tours : []).find(item => String(item.id) === String(id));
            if (!tour) return;
            const options = (result.data || []).filter(option => option.hotels && option.hotels.active);
            const section = document.createElement("section");
            section.id = "tourHotelOptions";
            section.className = "tour-hotel-options";
            let html = '<div class="container"><div class="tour-hotel-heading"><div><p class="section-label">CHỌN NƠI LƯU TRÚ</p><h2>Khách sạn & gói giá</h2><p>Thông tin khách sạn được lấy từ danh mục dùng chung. Chọn phương án phù hợp trước khi đăng ký tour.</p></div><a href="hotels.html" class="tour-hotel-catalog-link">Xem danh mục khách sạn →</a></div>';
            if (options.length) {
                html += '<div class="tour-hotel-grid">' + options.map(option => renderCard(option, tour)).join("") + '</div>';
                html += '<div id="tourHotelSelectionSummary" class="tour-hotel-selection-summary">Bạn chưa chọn khách sạn. Bạn có thể tiếp tục đăng ký theo giá tour cơ bản.</div>';
            } else {
                html += '<div class="tour-hotel-empty">Tour này chưa được cấu hình lựa chọn khách sạn. Vui lòng liên hệ để được tư vấn.</div>';
            }
            html += '</div>';
            section.innerHTML = html;
            container.appendChild(section);
            container.dataset.hotelOptionsTour = id;
            section.querySelectorAll("[data-option-id]").forEach(card => {
                card.addEventListener("click", () => {
                    const option = options.find(item => String(item.id) === card.dataset.optionId);
                    if (option) selectOption(option, tour, section, card);
                });
            });
        } catch (error) {
            console.error("Load tour hotel options failed:", error);
        } finally {
            loadingTourId = "";
        }
    }

    const target = document.getElementById("tourDetail");
    if (target) new MutationObserver(renderOptions).observe(target, { childList: true, subtree: false });
    document.addEventListener("DOMContentLoaded", renderOptions);
    setTimeout(renderOptions, 800);
})();