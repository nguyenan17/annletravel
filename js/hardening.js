// ================================
// ANNLETRAVEL - FRONTEND HARDENING
// ================================
// Loaded before app.js so the safer wrappers below are used
// by the existing DOMContentLoaded handlers.

(function () {
    "use strict";

    // Business pages do not include the i18n/shared scripts statically.
    // Load the same public layout stack there so Personal <-> Business
    // always uses exactly the same language switcher implementation.
    if (document.body.classList.contains("business-page")) {
        const loadScript = src => new Promise(resolve => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = resolve;
            document.head.appendChild(script);
        });

        loadScript("js/shared-layout.js")
            .then(() => loadScript("js/i18n.js"))
            .then(() => loadScript("js/i18n-multi.js"));
    }

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
    // Only show today/future departures,
    // sorted by the actual departure date.
    // --------------------------------
    if (typeof originalRenderMonthlyTours === "function") {
        window.renderMonthlyTours = async function () {
            const data = await window.loadTours();
            const container = document.getElementById("monthlyTours");

            if (!container) {
                return;
            }

            const today = new Date();
            const todayKey = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, "0"),
                String(today.getDate()).padStart(2, "0")
            ].join("-");

            const monthlyTours = data
                .filter(tour => {
                    const departureKey = String(tour.departure ?? "").slice(0, 10);
                    return /^\d{4}-\d{2}-\d{2}$/.test(departureKey)
                        && departureKey >= todayKey;
                })
                .sort((a, b) => {
                    const dateA = String(a.departure ?? "").slice(0, 10);
                    const dateB = String(b.departure ?? "").slice(0, 10);
                    return dateA.localeCompare(dateB);
                })
                .slice(0, 4);

            if (monthlyTours.length === 0) {
                container.innerHTML = `
                    <div class="departure-empty">
                        <p>Hiện chưa có tour nào có lịch khởi hành sắp tới.</p>
                        <a href="tours.html" class="btn btn-primary">Xem tất cả tour</a>
                    </div>
                `;
                return;
            }

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

    // --------------------------------
    // Seasonal tour discovery.
    // Kept as a separate module so the
    // existing tour/app code stays untouched.
    // --------------------------------
    if (
        document.body.classList.contains("personal-page") ||
        document.getElementById("allTours")
    ) {
        const seasonalScript = document.createElement("script");
        seasonalScript.src = "js/seasonal-tours.js";
        seasonalScript.defer = true;
        document.head.appendChild(seasonalScript);

        const seasonalStyles = document.createElement("link");
        seasonalStyles.rel = "stylesheet";
        seasonalStyles.href = "css/seasonal.css";
        document.head.appendChild(seasonalStyles);
    }

    // --------------------------------
    // Public header social icons.
    // Render into both the static public
    // header and the shared business header.
    // The footer social block is intentionally
    // left untouched.
    // --------------------------------
    function renderHeaderSocial() {
        if (document.querySelector(".header-social")) {
            return;
        }

        const header = document.querySelector("header.header");
        if (!header) {
            return;
        }

        const actions = header.querySelector(".public-header-actions");
        const container = actions || header.querySelector(".header-container");
        if (!container) {
            return;
        }

        const social = document.createElement("div");
        social.className = "header-social";
        social.setAttribute("aria-label", "Kết nối với AnnLeTravel");
        social.innerHTML = `
            <a class="header-social-link" href="https://web.facebook.com/profile.php?id=61550505475800" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6h1.7V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z"/></svg>
            </a>
            <a class="header-social-link" href="https://www.threads.net/" target="_blank" rel="noopener noreferrer" aria-label="Threads" title="Threads">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.1 11.1c-.2-4.3-2.8-6.8-7-6.8-4.3 0-7.1 2.6-7.1 6.8 0 4.7 2.9 7.5 7.5 7.5 3.8 0 6.2-1.9 6.2-4.9 0-2.4-1.8-4-4.6-4-2.2 0-3.7 1-3.7 2.6 0 1.3 1.1 2.1 2.6 2.1 1.6 0 2.8-.8 3.5-2.1-.3 2.1-1.5 3.3-3.8 3.3-3.5 0-5.5-1.7-5.5-4.7 0-3 1.8-4.7 4.9-4.7 2.8 0 4.5 1.2 5 3.5-1.3-.5-2.6-.7-3.8-.7-1.8 0-2.8.7-2.8 1.9-1.8 0-2.8.7-2.8 1.9 0 .8.7 1.3 1.7 1.3 1.7 0 3-1.2 3.1-3.1.1 0 .2 0 .3.1 1.7.3 2.7 1.2 2.7 2.7 0 1.9-1.6 3-4.1 3-3.8 0-6.2-2.2-6.2-5.9 0-3.5 2.2-5.7 5.6-5.7 3.1 0 5.1 1.6 5.6 4.4l2.2.1c-.1-.3-.2-.6-.3-.9Z"/></svg>
            </a>
            <a class="header-social-link header-social-zalo" href="https://zalo.me/862421655" target="_blank" rel="noopener noreferrer" aria-label="Zalo" title="Zalo"><span>Zalo</span></a>
            <a class="header-social-link" href="mailto:dulichannle@gmail.com" aria-label="Email AnnLeTravel" title="Email">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.2A2.2 2.2 0 0 1 4.7 4h14.6a2.2 2.2 0 0 1 2.2 2.2v11.6a2.2 2.2 0 0 1-2.2 2.2H4.7a2.2 2.2 0 0 1-2.2-2.2V6.2Zm2.2-.1 7.3 5.7 7.3-5.7H4.7Zm14.6 2.8-6.6 5.1a1.1 1.1 0 0 1-1.4 0L4.7 8.9v8.9h14.6v-8.9Z"/></svg>
            </a>`;

        if (actions) {
            actions.insertBefore(social, actions.firstElementChild || null);
        } else {
            const consult = container.querySelector(".btn-header");
            if (consult) {
                container.insertBefore(social, consult);
            } else {
                container.appendChild(social);
            }
        }
    }

    function injectHeaderSocialStyles() {
        if (document.getElementById("annle-header-social-styles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "annle-header-social-styles";
        style.textContent = `
            .header-social{display:flex;align-items:center;gap:5px;flex-shrink:0}
            .header-social-link{position:relative;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid rgba(255,255,255,.28);border-radius:50%;background:rgba(255,255,255,.09);color:#fff;text-decoration:none;transition:transform .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease}
            .header-social-link svg{width:15px;height:15px;fill:currentColor}
            .header-social-zalo{font-size:8px;font-weight:900;letter-spacing:-.3px}
            .header-social-link:hover,.header-social-link:focus-visible{transform:translateY(-2px);background:#fff;color:#006b93;border-color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.16);outline:none}
            .business-shared-header .header-social-link{border-color:rgba(0,91,143,.2);background:rgba(0,91,143,.06);color:#005b8f}
            .business-shared-header .header-social-link:hover,.business-shared-header .header-social-link:focus-visible{background:#005b8f;color:#fff;border-color:#005b8f}
            @media(max-width:1100px){.header-social{gap:3px}.header-social-link{width:28px;height:28px}.header-social-link svg{width:14px;height:14px}}
            @media(max-width:820px){.header-social{gap:2px}.header-social-link{width:26px;height:26px}.header-social-link svg{width:13px;height:13px}.header-social-zalo{font-size:7px}.public-header-actions{gap:4px!important}}
            @media(max-width:650px){.header-social-link{width:25px;height:25px}.header-social-link svg{width:12px;height:12px}.header-social-zalo{font-size:6.5px}}
        `;
        document.head.appendChild(style);
    }

    injectHeaderSocialStyles();
    renderHeaderSocial();

    const headerObserver = new MutationObserver(() => renderHeaderSocial());
    headerObserver.observe(document.body, { childList: true, subtree: true });

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
