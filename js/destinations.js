// ANNLETRAVEL - DESTINATIONS

let destinations = [];

function escapeDestinationHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

function destinationImage(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    try {
        const parsed = new URL(value, window.location.origin);
        if (["http:", "https:"].includes(parsed.protocol)) return parsed.href;
    } catch (_) {}
    return "";
}

async function loadDestinations(force = false) {
    if (destinations.length && !force) return destinations;

    const { data, error } = await supabaseClient
        .from("destinations")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        console.error("Không thể tải điểm đến:", error);
        return [];
    }

    destinations = data || [];
    return destinations;
}

function destinationCard(destination) {
    const image = destinationImage(destination.image);
    const background = image
        ? `style="background-image:url('${escapeDestinationHtml(image)}')"`
        : "";

    return `
        <a class="destination-card destination-card-v2" href="destination.html?slug=${encodeURIComponent(destination.slug)}">
            <div class="destination-placeholder" ${background}>
                ${image ? "" : "<span>KHÁM PHÁ</span>"}
            </div>
            <div class="destination-card-content">
                <small>${escapeDestinationHtml(destination.country)}</small>
                <div class="destination-name">${escapeDestinationHtml(destination.name)}</div>
                <span>Xem điểm đến →</span>
            </div>
        </a>
    `;
}

async function renderDestinationMenu() {
    const menu = document.getElementById("destinationMenu");
    if (!menu) return;

    const data = await loadDestinations();
    const domestic = data.filter(item => item.region === "domestic");
    const international = data.filter(item => item.region === "international");

    const group = (title, items) => `
        <li class="destination-menu-group">
            <strong>${title}</strong>
            ${items.map(item => `
                <a href="destinations.html?region=${encodeURIComponent(item.region)}&destination=${encodeURIComponent(item.slug)}">
                    ${escapeDestinationHtml(item.name)}
                </a>
            `).join("")}
            <a class="destination-menu-all" href="destinations.html?region=${encodeURIComponent(items[0]?.region || "domestic")}">Xem tất cả →</a>
        </li>
    `;

    menu.innerHTML = group("🇻🇳 Trong nước", domestic) + group("🌏 Nước ngoài", international);
}

async function renderHomeDestinations() {
    const container = document.getElementById("destinationGrid");
    if (!container) return;

    const data = await loadDestinations();
    const featured = data.filter(item => item.featured).slice(0, 6);
    container.innerHTML = (featured.length ? featured : data.slice(0, 6)).map(destinationCard).join("");
}

async function renderDestinationsPage() {
    const container = document.getElementById("destinationList");
    if (!container) return;

    const data = await loadDestinations();
    const params = new URLSearchParams(window.location.search);
    const region = params.get("region") || "";
    const selectedSlug = params.get("destination") || "";

    let filtered = data;
    if (region) filtered = filtered.filter(item => item.region === region);
    if (selectedSlug) filtered = filtered.filter(item => item.slug === selectedSlug);

    const title = document.getElementById("destinationPageTitle");
    const description = document.getElementById("destinationPageDescription");
    if (title) title.textContent = region === "international" ? "Điểm đến nước ngoài" : region === "domestic" ? "Điểm đến trong nước" : "Tất cả điểm đến";
    if (description) description.textContent = selectedSlug ? "Khám phá điểm đến và các hành trình phù hợp." : "Lựa chọn những điểm đến phù hợp cho hành trình tiếp theo.";

    container.innerHTML = filtered.length
        ? filtered.map(destinationCard).join("")
        : `<div class="empty-result"><h3>Chưa có điểm đến phù hợp</h3><p>Hãy thử lựa chọn khu vực khác.</p></div>`;
}

async function renderDestinationDetail() {
    const container = document.getElementById("destinationDetail");
    if (!container) return;

    const data = await loadDestinations();
    const slug = new URLSearchParams(window.location.search).get("slug");
    const destination = data.find(item => item.slug === slug);

    if (!destination) {
        container.innerHTML = `<div class="container section"><h2>Không tìm thấy điểm đến.</h2><a class="btn" href="destinations.html">Xem điểm đến</a></div>`;
        return;
    }

    document.title = `${destination.name} - ANNLETRAVEL`;

    const image = destinationImage(destination.image);
    container.innerHTML = `
        <section class="destination-detail-hero" ${image ? `style="background-image:url('${escapeDestinationHtml(image)}')"` : ""}>
            <div class="destination-detail-overlay"></div>
            <div class="container destination-detail-content">
                <span class="section-label">${escapeDestinationHtml(destination.country)}</span>
                <h1>${escapeDestinationHtml(destination.name)}</h1>
                <p>${escapeDestinationHtml(destination.description)}</p>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="section-header">
                    <div><span class="section-label">TOURS</span><h2>Tour tại ${escapeDestinationHtml(destination.name)}</h2></div>
                    <a class="view-all" href="tours.html?destination=${encodeURIComponent(destination.name)}">Xem tất cả →</a>
                </div>
                <div id="destinationTours" class="tour-grid"></div>
            </div>
        </section>
    `;

    const toursData = await loadTours();
    const matchingTours = toursData.filter(tour =>
        String(tour.destination || "").trim().toLowerCase() === String(destination.name).trim().toLowerCase()
    );
    const toursContainer = document.getElementById("destinationTours");
    if (toursContainer) {
        toursContainer.innerHTML = matchingTours.length
            ? matchingTours.map(createTourCard).join("")
            : `<div class="empty-result"><h3>Chưa có tour tại ${escapeDestinationHtml(destination.name)}</h3><p>Liên hệ ANNLETRAVEL để được tư vấn hành trình theo yêu cầu.</p></div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderDestinationMenu();
    renderHomeDestinations();
    renderDestinationsPage();
    renderDestinationDetail();
});
