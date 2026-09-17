// ================================================
// ANNLETRAVEL - SEASONAL TOUR DISCOVERY
// ================================================
(function () {
    "use strict";

    const SEASONS = {
        autumn: {
            title: "Mùa thu & lúa chín",
            label: "ĐANG VÀO MÙA",
            description: "Không khí se lạnh, ruộng bậc thang và những hành trình mùa thu đầy cảm hứng.",
            months: [9, 10],
            image: "images/vietnam.jpg",
            tags: "Tây Bắc · Hà Giang · Nhật Bản"
        },
        redleaf: {
            title: "Mùa lá đỏ & sắc thu",
            label: "SẮP VÀO MÙA",
            description: "Những cung đường ngập sắc thu, lá vàng lá đỏ và trải nghiệm văn hóa đặc trưng.",
            months: [10, 11],
            image: "images/korea.jpg",
            tags: "Nhật Bản · Hàn Quốc"
        },
        winter: {
            title: "Mùa hoa & tuyết",
            label: "LÊN KẾ HOẠCH SỚM",
            description: "Đón mùa hoa, săn tuyết và tận hưởng những chuyến đi đặc biệt cuối năm – đầu năm.",
            months: [12, 1, 2, 3],
            image: "images/korea.jpg",
            tags: "Hàn Quốc · Nhật Bản · miền Bắc"
        },
        summer: {
            title: "Mùa biển & nghỉ dưỡng",
            label: "MÙA HÈ",
            description: "Biển xanh, nghỉ dưỡng và những chuyến đi dành cho gia đình, bạn bè.",
            months: [4, 5, 6, 7, 8],
            image: "images/thailand.jpg",
            tags: "Phuket · Đà Nẵng · Phú Quốc"
        }
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function monthOfToday() {
        return new Date().getMonth() + 1;
    }

    function seasonMatchesMonth(season, month) {
        return season.months.includes(month);
    }

    function seasonForMonth(month) {
        return Object.entries(SEASONS).find(([, season]) => seasonMatchesMonth(season, month))?.[0] || "summer";
    }

    function nextSeasonKey(currentKey) {
        const keys = Object.keys(SEASONS);
        const index = keys.indexOf(currentKey);
        return keys[(index + 1) % keys.length];
    }

    function imageUrl(value) {
        const url = String(value || "").trim();
        if (!url) return "";
        try {
            const parsed = new URL(url, window.location.href);
            return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
        } catch (_) {
            return "";
        }
    }

    function renderSeasonalCards() {
        const marker = document.getElementById("monthlyTours");
        if (!marker || document.getElementById("seasonalToursSection")) return;

        const currentKey = seasonForMonth(monthOfToday());
        const upcomingKey = nextSeasonKey(currentKey);
        const thirdKey = nextSeasonKey(upcomingKey);
        const keys = [currentKey, upcomingKey, thirdKey];

        const section = document.createElement("section");
        section.id = "seasonalToursSection";
        section.className = "seasonal-section";
        section.innerHTML = `
            <div class="container">
                <div class="section-header seasonal-header">
                    <div>
                        <p class="section-label">SEASONAL TRAVEL</p>
                        <h2>Đi đúng mùa – Trải nghiệm đúng lúc</h2>
                        <p class="seasonal-intro">Có những nơi đẹp nhất chỉ trong một khoảng thời gian rất ngắn.</p>
                    </div>
                    <a href="tours.html" class="view-all">Xem tất cả tour →</a>
                </div>
                <div class="seasonal-grid">
                    ${keys.map((key, index) => {
                        const season = SEASONS[key];
                        const image = imageUrl(season.image);
                        return `
                            <a class="seasonal-card ${index === 0 ? "is-current" : ""}" href="tours.html?season=${key}">
                                <div class="seasonal-image" ${image ? `style="background-image:url('${escapeHtml(image)}')"` : ""}>
                                    <span class="seasonal-badge">${escapeHtml(season.label)}</span>
                                    <span class="seasonal-index">0${index + 1}</span>
                                </div>
                                <div class="seasonal-content">
                                    <h3>${escapeHtml(season.title)}</h3>
                                    <p>${escapeHtml(season.description)}</p>
                                    <small>${escapeHtml(season.tags)}</small>
                                    <span class="seasonal-link">Xem tour theo mùa <b>→</b></span>
                                </div>
                            </a>
                        `;
                    }).join("")}
                </div>
            </div>
        `;

        marker.closest(".section")?.before(section);
    }

    function filterBySeason(data, seasonKey) {
        const season = SEASONS[seasonKey];
        if (!season) return data;

        return data.filter(tour => {
            const date = new Date(`${tour.departure}T00:00:00`);
            return !Number.isNaN(date.getTime()) && season.months.includes(date.getMonth() + 1);
        });
    }

    async function applySeasonFilter() {
        const container = document.getElementById("allTours");
        const params = new URLSearchParams(window.location.search);
        const seasonKey = params.get("season");

        if (!container || !seasonKey || !SEASONS[seasonKey] || typeof window.loadTours !== "function") return;

        const data = await window.loadTours();
        const filtered = filterBySeason(data, seasonKey);
        const season = SEASONS[seasonKey];
        const count = document.getElementById("tourCount");
        if (count) count.textContent = `${filtered.length} tour · ${season.title}`;

        const heading = document.querySelector(".tour-list-section .section-heading h2");
        if (heading) heading.textContent = season.title;

        if (typeof window.renderFilteredTours === "function") {
            window.renderFilteredTours(filtered);
        }

        if (!filtered.length) {
            container.innerHTML = `
                <div class="empty-result seasonal-empty">
                    <h3>Chưa có tour cho mùa này</h3>
                    <p>ANNLETRAVEL sẽ cập nhật thêm hành trình phù hợp. Bạn có thể xem tất cả tour để lựa chọn thời gian khác.</p>
                    <a class="btn" href="tours.html">Xem tất cả tour</a>
                </div>
            `;
        }
    }

    function installFilterWrapper() {
        const originalFilterTours = window.filterTours;
        if (typeof originalFilterTours !== "function" || originalFilterTours.__seasonalWrapped) return;

        const wrapped = async function () {
            const params = new URLSearchParams(window.location.search);
            const seasonKey = params.get("season");
            if (!seasonKey || !SEASONS[seasonKey]) {
                return originalFilterTours();
            }

            await originalFilterTours();
            const data = await window.loadTours();
            const seasonData = filterBySeason(data, seasonKey);
            const destination = document.getElementById("filterDestination")?.value || "";
            const date = document.getElementById("filterDate")?.value || "";
            const price = document.getElementById("filterPrice")?.value || "";

            const filtered = seasonData.filter(tour => {
                if (destination && !String(tour.destination || "").toLowerCase().includes(destination.toLowerCase())) return false;
                if (date && String(tour.departure) !== date) return false;
                if (price === "under10" && Number(tour.price) >= 10000000) return false;
                if (price === "10to20" && (Number(tour.price) < 10000000 || Number(tour.price) > 20000000)) return false;
                if (price === "over20" && Number(tour.price) <= 20000000) return false;
                return true;
            });

            if (typeof window.renderFilteredTours === "function") window.renderFilteredTours(filtered);
            const count = document.getElementById("tourCount");
            if (count) count.textContent = `${filtered.length} tour · ${SEASONS[seasonKey].title}`;
        };

        wrapped.__seasonalWrapped = true;
        window.filterTours = wrapped;
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderSeasonalCards();
        installFilterWrapper();
        applySeasonFilter();
    });
})();
