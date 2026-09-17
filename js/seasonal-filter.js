// =========================================================
// ANNLETRAVEL - SEASONAL TOUR FILTER
// =========================================================
(function () {
    "use strict";

    const SEASONS = {
        autumn: { title: "Mùa thu & lúa chín", months: [9, 10] },
        redleaf: { title: "Mùa lá đỏ & sắc thu", months: [10, 11] },
        winter: { title: "Mùa hoa & tuyết", months: [12, 1, 2, 3] },
        summer: { title: "Mùa biển & nghỉ dưỡng", months: [4, 5, 6, 7, 8] }
    };

    function getSeason() {
        const key = new URLSearchParams(window.location.search).get("season");
        return key && SEASONS[key] ? { key, ...SEASONS[key] } : null;
    }

    function filterSeason(data, season) {
        return data.filter(tour => {
            if (!tour?.departure) return false;
            const date = new Date(`${tour.departure}T00:00:00`);
            return !Number.isNaN(date.getTime()) && season.months.includes(date.getMonth() + 1);
        });
    }

    function applySeasonToCurrentFilters(data, season) {
        const destination = document.getElementById("filterDestination")?.value || "";
        const date = document.getElementById("filterDate")?.value || "";
        const price = document.getElementById("filterPrice")?.value || "";
        const sort = document.getElementById("filterSort")?.value || "";

        let result = filterSeason(data, season);

        if (destination) {
            result = result.filter(tour => String(tour.destination || "") === destination);
        }
        if (date) {
            result = result.filter(tour => String(tour.departure || "") === date);
        }
        if (price === "under10") result = result.filter(tour => Number(tour.price) < 10000000);
        if (price === "10to20") result = result.filter(tour => Number(tour.price) >= 10000000 && Number(tour.price) <= 20000000);
        if (price === "over20") result = result.filter(tour => Number(tour.price) > 20000000);

        if (sort === "priceAsc") result.sort((a, b) => Number(a.price) - Number(b.price));
        if (sort === "priceDesc") result.sort((a, b) => Number(b.price) - Number(a.price));
        if (sort === "dateAsc") result.sort((a, b) => String(a.departure).localeCompare(String(b.departure)));

        return result;
    }

    async function renderSeasonTours() {
        const season = getSeason();
        const container = document.getElementById("allTours");
        if (!season || !container || typeof window.loadTours !== "function") return false;

        const data = await window.loadTours();
        const filtered = applySeasonToCurrentFilters(data, season);

        const heading = document.querySelector(".tour-list-section .section-heading h2");
        if (heading) heading.textContent = season.title;

        const count = document.getElementById("tourCount");
        if (count) count.textContent = `${filtered.length} hành trình · ${season.title}`;

        if (typeof window.renderFilteredTours === "function") {
            window.renderFilteredTours(filtered);
        }

        const seoHeading = document.querySelector(".tour-seo-copy h2");
        if (seoHeading) seoHeading.textContent = `Tour ${season.title.toLowerCase()} theo mùa`;

        container.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
    }

    function wrapFilterTours() {
        if (typeof window.filterTours !== "function" || window.filterTours.__seasonalWrapped) return;

        const original = window.filterTours;
        const wrapped = async function () {
            const season = getSeason();
            if (!season || typeof window.loadTours !== "function") {
                return original();
            }

            const data = await window.loadTours();
            const filtered = applySeasonToCurrentFilters(data, season);
            if (typeof window.renderFilteredTours === "function") {
                window.renderFilteredTours(filtered);
            }

            const count = document.getElementById("tourCount");
            if (count) count.textContent = `${filtered.length} hành trình · ${season.title}`;
        };

        wrapped.__seasonalWrapped = true;
        window.filterTours = wrapped;
    }

    async function init() {
        wrapFilterTours();
        await renderSeasonTours();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
