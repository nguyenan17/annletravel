// ================================
// YOUR TRAVEL - APP.JS
// ================================


// Danh sách tour
let tours = [];

// ================================
// TOUR GALLERY STATE
// ================================

let currentGalleryImages = [];
let currentGalleryIndex = 0;

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ================================
// LOAD TOURS
// ================================

async function loadTours() {

    if (tours.length > 0) {
        return tours;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("tours")
                .select("*")
                .order("departure", {
                    ascending: true
                });

        if (error) {
            throw error;
        }

        tours = data.map(tour => ({

            ...tour,

            displayDate: tour.is_daily ? "Hằng ngày" : (tour.departure ? new Intl.DateTimeFormat("vi-VN").format(new Date(tour.departure + "T00:00:00")) : "Chưa xác định")

        }));

        return tours;

    } catch (error) {

        console.error(
            "Không thể tải danh sách tour từ Supabase:",
            error
        );

        return [];

    }
}

// ================================
// DESTINATION MENU
// ================================

async function renderDestinationMenu() {

    const data = await loadTours();

    const menu =
        document.getElementById("destinationMenu");

    if (!menu) {
        return;
    }


    // Lấy danh sách điểm đến không trùng
    const destinations =
        [...new Set(
            data.map(tour => tour.destination)
        )];


    // Tạo menu
    menu.innerHTML =
        destinations.map(destination => `

            <li>
                <a href="tours.html?destination=${encodeURIComponent(destination)}">
                    ${destination}
                </a>
            </li>

        `).join("");

}


// ================================
// FORMAT PRICE
// ================================

function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN").format(price) + "đ";

}


// ================================
// TOUR CARD
// ================================

function createTourCard(tour) {

    return `
        <article class="tour-card">

            <a
                href="tour-detail.html?id=${tour.id}"
                class="tour-image"
                style="background-image: url('${tour.image}')"
            >

                <span class="tour-location">
                    ${tour.destination}
                </span>

                <span class="tour-seats">
                    ${tour.unlimited_seats ? "Không giới hạn chỗ" : `Còn ${Number(tour.seats) || 0} chỗ`}
                </span>

            </a>


            <div class="tour-content">

                <div class="tour-date">
                    📅 ${tour.displayDate}
                </div>

                <h3>
                    ${tour.name}
                </h3>

                <p>
                    ${tour.short}
                </p>


                <div class="tour-meta">

                    <span>
                        📍 ${tour.destination}
                    </span>

                    <span>
                        👥 ${tour.unlimited_seats ? "Không giới hạn chỗ" : `${Number(tour.seats) || 0} chỗ`}
                    </span>

                </div>


                <div class="tour-footer">

                    <div class="tour-price">

                        <small>
                            Chỉ từ
                        </small>

                        <strong>
                            ${formatPrice(tour.price)}
                        </strong>

                    </div>


                    <a
                        href="tour-detail.html?id=${tour.id}"
                        class="tour-button"
                    >
                        Xem tour
                        <span>→</span>
                    </a>

                </div>

            </div>

        </article>
    `;
}


// ================================
// HOME PAGE
// ================================

async function renderHomeTours() {

    const data = await loadTours();

    const container =
        document.getElementById("featuredTours");


    if (!container) {
        return;
    }


    // Hiển thị 3 tour đầu tiên
    const featuredTours = data.slice(0, 3);


    container.innerHTML =
        featuredTours
            .map(createTourCard)
            .join("");

}


// ================================
// MONTHLY DEPARTURES
// ================================

async function renderMonthlyTours() {

    const data = await loadTours();

    const container =
        document.getElementById("monthlyTours");


    if (!container) {
        return;
    }


    const monthlyTours = data.slice(0, 4);


    container.innerHTML =
        monthlyTours.map(tour => `

            <div class="departure-row">


                <div>

                    <strong>
                        ${tour.displayDate}
                    </strong>

                    <small>
                        ${tour.destination}
                    </small>

                </div>


                <strong>
                    ${tour.name}
                </strong>


                <span>
                    ${tour.unlimited_seats ? "Không giới hạn chỗ" : `Còn ${Number(tour.seats) || 0} chỗ`}
                </span>


                <strong>
                    ${formatPrice(tour.price)}
                </strong>


                <a href="tour-detail.html?id=${tour.id}">
                    Xem tour
                </a>


            </div>

        `).join("");

}


// ================================
// TOUR DURATION HELPERS
// ================================
function getTourDurationDays(tour) {
    const explicit = Number(tour?.duration_days || tour?.days || 0);
    if (explicit > 0) return explicit;
    const text = `${tour?.name || ""} ${tour?.short || ""} ${tour?.duration || ""}`.toLowerCase();
    const nights = text.match(/(\d+)\s*n\s*(\d+)\s*[đd]/i);
    if (nights) return Number(nights[1]);
    const days = text.match(/(\d+)\s*(?:ngày|day|days)\b/i);
    if (days) return Number(days[1]);
    if (/hằng ngày|hang ngay|daily/.test(text)) return 1;
    return 0;
}
function matchesTourDuration(tour, filter) {
    if (!filter) return true;
    const days = getTourDurationDays(tour);
    if (!days) return false;
    if (filter === "1") return days === 1;
    if (filter === "2-3") return days >= 2 && days <= 3;
    if (filter === "4+") return days >= 4;
    return true;
}
function matchesTourKeyword(tour, keyword) {
    if (!keyword) return true;
    const haystack = `${tour?.name || ""} ${tour?.destination || ""} ${tour?.short || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const needle = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return haystack.includes(needle);
}

// ================================
// ALL TOURS PAGE
// ================================

async function renderAllTours() {

    const data = await loadTours();

    const container =
        document.getElementById("allTours");

    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(window.location.search);


    const destination =
        params.get("destination") || "";

    const date =
        params.get("date") || "";

    const price =
        params.get("price") || "";
    const duration = params.get("duration") || "";
    const keyword = params.get("q") || "";


    let filteredTours = data;


    // ================================
    // FILTER DESTINATION
    // ================================

    if (destination) {

        filteredTours =
            filteredTours.filter(
                tour =>
                    `${tour.destination || ""} ${tour.name || ""} ${tour.short || ""}`
                        .toLocaleLowerCase("vi")
                        .includes(destination.toLocaleLowerCase("vi"))
            );

    }


    // ================================
    // FILTER DATE
    // ================================

    if (date) {

        filteredTours = filteredTours.filter(tour => tour.is_daily || (tour.departure && tour.departure >= date));

    }


    // ================================
    // FILTER PRICE
    // ================================

    if (price === "under10") {

        filteredTours =
            filteredTours.filter(
                tour => tour.price < 10000000
            );

    }


    if (price === "10to20") {

        filteredTours =
            filteredTours.filter(
                tour =>
                    tour.price >= 10000000 &&
                    tour.price <= 20000000
            );

    }


    if (price === "over20") {

        filteredTours =
            filteredTours.filter(
                tour => tour.price > 20000000
            );

    }


    filteredTours = filteredTours.filter(tour => matchesTourDuration(tour, duration) && matchesTourKeyword(tour, keyword));

    // ================================
    // UPDATE FILTER UI
    // ================================

    const destinationSelect =
        document.getElementById("filterDestination");

    const priceSelect =
        document.getElementById("filterPrice");
    const durationSelect = document.getElementById("filterDuration");
    const keywordInput = document.getElementById("filterKeyword");


    if (destinationSelect) {
        destinationSelect.value = destination;
    }


    if (priceSelect) {
        priceSelect.value = price;
    }
    if (durationSelect) durationSelect.value = duration;
    if (keywordInput) keywordInput.value = keyword;


    // ================================
    // RESULT COUNT
    // ================================

    const count =
        document.getElementById("tourCount");


    if (count) {

        count.textContent =
            `${filteredTours.length} hành trình`;

    }


    // ================================
    // NO RESULT
    // ================================

    if (filteredTours.length === 0) {

        container.innerHTML = `

            <div style="grid-column:1/-1">

                <h3>
                    Không tìm thấy tour phù hợp.
                </h3>

                <p>
                    Hãy thử thay đổi điểm đến,
                    ngày khởi hành hoặc mức giá.
                </p>

                <br>

                <a
                    href="tours.html"
                    class="btn btn-primary">

                    Xem tất cả tour

                </a>

            </div>

        `;

        return;
    }


    // ================================
    // RENDER
    // ================================

    container.innerHTML =
        filteredTours
            .map(createTourCard)
            .join("");

}

// ================================
// FILTER TOURS
// ================================

async function filterTours() {

    const data = await loadTours();


    const destination =
        document.getElementById("filterDestination")?.value || "";

    const date =
        document.getElementById("filterDate")?.value || "";

    const price =
        document.getElementById("filterPrice")?.value || "";

    const sort =
        document.getElementById("filterSort")?.value || "";
    const duration = document.getElementById("filterDuration")?.value || "";
    const keyword = document.getElementById("filterKeyword")?.value || "";


    let filteredTours = [...data];


    // ================================
    // DESTINATION
    // ================================

    if (destination) {

        filteredTours =
            filteredTours.filter(tour =>
                `${tour.destination || ""} ${tour.name || ""} ${tour.short || ""}`.toLocaleLowerCase("vi").includes(destination.toLocaleLowerCase("vi"))
            );

    }


    // ================================
    // DATE
    // ================================

    if (date) {

        filteredTours =
            filteredTours.filter(tour =>
                tour.departure === date
            );

    }


    // ================================
    // PRICE
    // ================================

    if (price === "under10") {

        filteredTours =
            filteredTours.filter(tour =>
                tour.price < 10000000
            );

    }

    else if (price === "10to20") {

        filteredTours =
            filteredTours.filter(tour =>
                tour.price >= 10000000 &&
                tour.price <= 20000000
            );

    }

    else if (price === "over20") {

        filteredTours =
            filteredTours.filter(tour =>
                tour.price > 20000000
            );

    }


    // ================================
    // SORT
    // ================================

    if (sort === "priceAsc") {

        filteredTours.sort(
            (a, b) => a.price - b.price
        );

    }

    else if (sort === "priceDesc") {

        filteredTours.sort(
            (a, b) => b.price - a.price
        );

    }

    else if (sort === "dateAsc") {

        filteredTours.sort(
            (a, b) =>
                a.departure.localeCompare(b.departure)
        );

    }


    // ================================
    // RENDER
    // ================================

    renderFilteredTours(filteredTours);

}

// ================================
// RENDER FILTERED TOURS
// ================================

function renderFilteredTours(filteredTours) {

    const container =
        document.getElementById("allTours");


    if (!container) {
        return;
    }


    // Không có kết quả
    if (filteredTours.length === 0) {

        container.innerHTML = `

            <div style="grid-column:1/-1">

                <div class="empty-result">

                    <h3>
                        Không tìm thấy tour phù hợp
                    </h3>

                    <p>
                        Hãy thử thay đổi điều kiện tìm kiếm.
                    </p>

                </div>

            </div>

        `;

    }

    else {

        container.innerHTML =
            filteredTours
                .map(createTourCard)
                .join("");

    }


    // Update số lượng

    const count =
        document.getElementById("tourCount");


    if (count) {

        count.textContent =
            `${filteredTours.length} hành trình`;

    }

}


// ================================
// TOUR DETAIL
// ================================

async function renderTourDetail() {

    const data = await loadTours();

    const container =
        document.getElementById("tourDetail");


    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(window.location.search);


    const tourId =
        params.get("id");


    // ================================
    // FIND TOUR
    // ================================

    let tour =
        data.find(
            item =>
                item.id === tourId
        );


    // Nếu không tìm thấy
    // lấy tour đầu tiên
    if (!tour) {
        tour = data[0];
    }


    // ================================
    // NO TOUR
    // ================================

    if (!tour) {

        container.innerHTML = `
            <div class="container section">

                <h2>
                    Không tìm thấy tour.
                </h2>

            </div>
        `;

        return;
    }


    // ================================
    // TOUR IMAGES
    // ================================

    const galleryImages =
        Array.isArray(tour.images)
            ? tour.images.filter(Boolean)
            : [];


    // Ảnh cover
    const heroImage =
        tour.image ||
        galleryImages[0] ||
        "";


    // ================================
    // LIGHTBOX IMAGES
    // ================================

    // Đưa cover vào lightbox trước
    // Sau đó thêm các ảnh gallery
    currentGalleryImages = [
        heroImage,
        ...galleryImages
    ]
        .filter(Boolean)
        .filter(
            (image, index, array) =>
                array.indexOf(image) === index
        );


    currentGalleryIndex = 0;

    // Hiển thị các tour cùng nhóm/điểm đến, nhưng giữ giá và booking độc lập.
    const normalizeTourGroup = value => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    const currentTourGroup = normalizeTourGroup(tour.tour_group || tour.destination);
    const relatedTours = data.filter(item =>
        String(item.id) !== String(tour.id) &&
        currentTourGroup &&
        normalizeTourGroup(item.tour_group || item.destination) === currentTourGroup
    );
    const relatedToursSection = relatedTours.length ? `
        <section class="tour-related-section">
            <div class="container">
                <div class="tour-related-heading">
                    <span class="section-label">CÙNG ĐIỂM ĐẾN</span>
                    <h2>Khám phá thêm hành trình này</h2>
                    <p>Chọn thời lượng phù hợp với quỹ thời gian của bạn.</p>
                </div>
                <div class="tour-related-grid">
                    ${relatedTours.map(related => {
                        const relatedImage = related.image || (Array.isArray(related.images) ? related.images.find(Boolean) : "") || "";
                        const relatedDate = related.is_daily ? "Khởi hành hằng ngày" : (related.displayDate || "Liên hệ xác nhận");
                        return `
                            <article class="tour-related-card">
                                <a class="tour-related-image" href="tour-detail.html?id=${encodeURIComponent(related.id)}" aria-label="Xem ${escapeHtml(related.name)}">
                                    ${relatedImage ? `<img src="${escapeHtml(relatedImage)}" alt="${escapeHtml(related.name)}" loading="lazy">` : `<span class="tour-related-placeholder">ANNLETRAVEL</span>`}
                                </a>
                                <div class="tour-related-content">
                                    <span class="tour-related-date">${escapeHtml(relatedDate)}</span>
                                    <h3><a href="tour-detail.html?id=${encodeURIComponent(related.id)}">${escapeHtml(related.name)}</a></h3>
                                    <p>${escapeHtml(related.short || related.destination || "")}</p>
                                    <div class="tour-related-footer">
                                        <strong>${formatPrice(related.price)}</strong>
                                        <a class="tour-related-link" href="tour-detail.html?id=${encodeURIComponent(related.id)}">Xem tour <span aria-hidden="true">→</span></a>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join("")}
                </div>
            </div>
        </section>
    ` : "";


    document.title =
        tour.name + " - ANNLETRAVEL";


    // ================================
    // RENDER
    // ================================

    container.innerHTML = `

        <!-- ================================= -->
        <!-- TOUR IMAGE GALLERY -->
        <!-- ================================= -->

        <section class="detail-hero">

            <div
                class="detail-image"
                style="
                    background-image:
                    url('${heroImage}')
                "
                onclick="openTourLightbox(0)"
            >

                ${heroImage
            ? `
                            <button
                                type="button"
                                class="detail-image-view"
                                onclick="event.stopPropagation(); openTourLightbox(0)"
                            >
                                ⛶ Xem ảnh
                            </button>
                        `
            : ""
        }

            </div>

        </section>


        ${currentGalleryImages.length > 1
            ? `

                    <section class="tour-gallery">

                        <div class="container">

                            <div class="tour-gallery-header">

                                <div>

                                    <span class="section-label">
                                        HÌNH ẢNH
                                    </span>

                                    <h2>
                                        Khám phá hành trình
                                    </h2>

                                </div>

                                <span class="gallery-count">
                                    ${currentGalleryImages.length} ảnh
                                </span>

                            </div>


                            <div class="tour-gallery-grid">

                                ${currentGalleryImages
                .map(
                    (image, index) => `

                                            <button
                                                type="button"
                                                class="
                                                    tour-gallery-item
                                                    ${index === 0 ? "active" : ""}
                                                "
                                                onclick="openTourLightbox(${index})"
                                                aria-label="Xem ảnh ${index + 1}"
                                            >

                                                <img
                                                    src="${image}"
                                                    alt="${escapeHtml(tour.name)} - ảnh ${index + 1}"
                                                    loading="lazy"
                                                >

                                                ${index === 0
                            ? `
                                                            <span class="gallery-cover-badge">
                                                                Ảnh chính
                                                            </span>
                                                        `
                            : ""
                        }

                                                <span class="gallery-zoom">
                                                    ⛶
                                                </span>

                                            </button>

                                        `
                )
                .join("")
            }

                            </div>

                        </div>

                    </section>

                `
            : ""
        }


        <!-- ================================= -->
        <!-- DETAIL CONTENT -->
        <!-- ================================= -->

        <section class="section">

            <div class="container detail-grid">


                <!-- LEFT -->

                <div>

                    <p class="section-label">
                        ${escapeHtml(tour.destination)}
                    </p>


                    <h1>
                        ${escapeHtml(tour.name)}
                    </h1>


                    <p class="lead">
                        ${escapeHtml(tour.short)}
                    </p>


                    <br>


                    <h2>
                        Thông tin tour
                    </h2>


                    <br>


                    <p>
                        📅 Ngày khởi hành:
                        <strong>
                            ${tour.displayDate}
                        </strong>
                    </p>


                    <p>
                        👥 Số chỗ còn:
                        <strong>
                            ${tour.unlimited_seats ? "Không giới hạn chỗ" : `${Number(tour.seats) || 0} chỗ`}
                        </strong>
                    </p>


                    <p>
                        📍 Điểm đến:
                        <strong>
                            ${escapeHtml(tour.destination)}
                        </strong>
                    </p>

                    <p class="tour-transport-info">
                        🚌 Phương tiện di chuyển:
                        <strong>
                            ${escapeHtml(tour.transport || "Liên hệ xác nhận")}
                        </strong>
                    </p>


                    <br>


                    <h2>
                        Lịch trình
                    </h2>


                    <br>


                    <!-- ITINERARY -->

                    <div id="tourItinerary">

                        <p>
                            Đang tải lịch trình...
                        </p>

                    </div>


                </div>


                <!-- RIGHT -->

                <aside class="booking-box">


                    <h3>
                        ${escapeHtml(tour.name)}
                    </h3>


                    <p>
                        Khởi hành:
                        <strong>
                            ${tour.displayDate}
                        </strong>
                    </p>


                    <p>
                        Còn:
                        <strong>
                            ${tour.unlimited_seats ? "Không giới hạn chỗ" : `${Number(tour.seats) || 0} chỗ`}
                        </strong>
                    </p>


                    <div class="price">

                        ${formatPrice(tour.price)}

                    </div>


                    <button
                        class="btn full"
                        onclick="registerTour('${tour.id}')"
                    >
                        Đăng ký tour
                    </button>


                    <br><br>


                    <p>
                        💬 Sale sẽ liên hệ tư vấn
                        và xác nhận thông tin.
                    </p>


                </aside>


            </div>

        </section>


        ${relatedToursSection}

        <!-- ================================= -->
        <!-- LIGHTBOX -->
        <!-- ================================= -->

        <div
            id="tourLightbox"
            class="tour-lightbox"
            onclick="handleLightboxBackgroundClick(event)"
            aria-hidden="true"
        >

            <button
                type="button"
                class="lightbox-close"
                onclick="closeTourLightbox()"
                aria-label="Đóng"
            >
                ×
            </button>


            <button
                type="button"
                class="lightbox-prev"
                onclick="event.stopPropagation(); previousTourImage()"
                aria-label="Ảnh trước"
            >
                ←
            </button>


            <div
                class="lightbox-content"
                onclick="event.stopPropagation()"
            >

                <img
                    id="lightboxImage"
                    src=""
                    alt=""
                >

                <div
                    id="lightboxCounter"
                    class="lightbox-counter"
                >
                </div>

            </div>


            <button
                type="button"
                class="lightbox-next"
                onclick="event.stopPropagation(); nextTourImage()"
                aria-label="Ảnh tiếp theo"
            >
                →
            </button>

        </div>

    `;


    // ================================
    // LOAD ITINERARY
    // ================================

    await loadTourItinerary(tour.id);

}

// ================================
// OPEN LIGHTBOX
// ================================

function openTourLightbox(index) {

    if (
        !currentGalleryImages ||
        currentGalleryImages.length === 0
    ) {
        return;
    }


    if (
        index < 0 ||
        index >= currentGalleryImages.length
    ) {
        return;
    }


    currentGalleryIndex = index;


    const lightbox =
        document.getElementById("tourLightbox");

    const image =
        document.getElementById("lightboxImage");

    const counter =
        document.getElementById("lightboxCounter");


    if (!lightbox || !image) {
        return;
    }


    image.src =
        currentGalleryImages[currentGalleryIndex];


    image.alt =
        `Ảnh ${currentGalleryIndex + 1}`;


    if (counter) {

        counter.textContent =
            `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;

    }


    lightbox.classList.add("active");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "lightbox-open"
    );

}


// ================================
// CLOSE LIGHTBOX
// ================================

function closeTourLightbox() {

    const lightbox =
        document.getElementById("tourLightbox");


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove("active");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "lightbox-open"
    );

}


// ================================
// PREVIOUS IMAGE
// ================================

function previousTourImage() {

    if (
        !currentGalleryImages ||
        currentGalleryImages.length <= 1
    ) {
        return;
    }


    currentGalleryIndex--;


    if (currentGalleryIndex < 0) {

        currentGalleryIndex =
            currentGalleryImages.length - 1;

    }


    updateLightboxImage();

}


// ================================
// NEXT IMAGE
// ================================

function nextTourImage() {

    if (
        !currentGalleryImages ||
        currentGalleryImages.length <= 1
    ) {
        return;
    }


    currentGalleryIndex++;


    if (
        currentGalleryIndex >=
        currentGalleryImages.length
    ) {

        currentGalleryIndex = 0;

    }


    updateLightboxImage();

}


// ================================
// UPDATE LIGHTBOX
// ================================

function updateLightboxImage() {

    const image =
        document.getElementById("lightboxImage");

    const counter =
        document.getElementById("lightboxCounter");


    if (!image) {
        return;
    }


    image.src =
        currentGalleryImages[currentGalleryIndex];


    image.alt =
        `Ảnh ${currentGalleryIndex + 1}`;


    if (counter) {

        counter.textContent =
            `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;

    }

}


// ================================
// LIGHTBOX BACKGROUND
// ================================

function handleLightboxBackgroundClick(event) {

    if (
        event.target.classList.contains(
            "tour-lightbox"
        )
    ) {

        closeTourLightbox();

    }

}


// ================================
// KEYBOARD CONTROL
// ================================

document.addEventListener(
    "keydown",
    function (event) {

        const lightbox =
            document.getElementById("tourLightbox");


        if (
            !lightbox ||
            !lightbox.classList.contains("active")
        ) {
            return;
        }


        if (event.key === "Escape") {

            closeTourLightbox();

        }


        else if (event.key === "ArrowLeft") {

            previousTourImage();

        }


        else if (event.key === "ArrowRight") {

            nextTourImage();

        }

    }
);

async function loadTourItinerary(tourId) {

    const container =
        document.getElementById("tourItinerary");


    if (!container) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("tour_itineraries")
                .select(
                    "day, title, description"
                )
                .eq("tour_id", tourId)
                .order(
                    "day",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        // Không có lịch trình
        if (!data || data.length === 0) {

            container.innerHTML = `
                <p>
                    Lịch trình đang được cập nhật.
                </p>
            `;

            return;
        }


        container.innerHTML =
            data.map(item => {
                const lines = String(item.description || "")
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(Boolean);
                const bulletLines = lines.filter(line => /^(?:[-•*]|\d+[.)])\s*/.test(line));
                const plainLines = lines.filter(line => !/^(?:[-•*]|\d+[.)])\s*/.test(line));
                const body = [
                    plainLines.map(line => `<p>${escapeHtml(line)}</p>`).join(""),
                    bulletLines.length ? `<ul>${bulletLines.map(line => `<li>${escapeHtml(line.replace(/^(?:[-•*]|\d+[.)])\s*/, ""))}</li>`).join("")}</ul>` : ""
                ].join("");
                return `
                    <article class="itinerary-day">
                        <h3><span class="itinerary-day-label">NGÀY ${escapeHtml(item.day)}</span> ${escapeHtml(item.title || "")}</h3>
                        <div class="itinerary-day-content">${body || '<p>Lịch trình chi tiết đang được cập nhật.</p>'}</div>
                    </article>
                `;
            }).join("");


    } catch (error) {

        console.error("Load itinerary error:", {
            tourId,
            message: error?.message,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
            error
        });

        container.innerHTML = `
            <p>
                Chưa thể tải lịch trình lúc này. Vui lòng tải lại trang sau ít phút.
            </p>
        `;

    }

}


// ================================
// REGISTER TOUR
// ================================

async function registerTour(tourId) {
    const data = await loadTours();
    const tour = data.find(item => String(item.id) === String(tourId));
    if (!tour) { alert("Không tìm thấy tour."); return; }

    document.getElementById("bookingModal")?.remove();
    let hotelOptions = [];
    try {
        const result = await supabaseClient.from("tour_hotel_options")
            .select("*, hotels(*)").eq("tour_id", String(tour.id))
            .eq("active", true).order("sort_order");
        if (result.error) throw result.error;
        hotelOptions = (result.data || []).filter(option => option.hotels && option.hotels.active);
    } catch (error) {
        console.error("Không tải được lựa chọn khách sạn khi đăng ký:", error);
    }

    window.bookingHotelOptions = hotelOptions;
    window.bookingCurrentTour = tour;
    const previousId = window.selectedTourHotelOption?.id;
    const initialOption = hotelOptions.find(option => String(option.id) === String(previousId)) || hotelOptions[0] || null;
    window.selectedTourHotelOption = null;
    const initialPrice = Number(initialOption?.package_price_per_person ?? tour.price ?? 0);
    const hotelCards = hotelOptions.map(option => {
        const hotel = option.hotels || {};
        const price = Number(option.package_price_per_person ?? tour.price ?? 0);
        const image = hotel.cover_image || (Array.isArray(hotel.gallery_images) ? hotel.gallery_images[0] : "");
        const title = [hotel.name, option.label].filter(Boolean).join(" · ");
        return `<button type="button" class="booking-hotel-card" data-booking-option="${escapeHtml(option.id)}" aria-pressed="false">
            ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : '<span class="booking-hotel-card-placeholder" aria-hidden="true">🏨</span>'}
            <span class="booking-hotel-card-copy"><strong>${escapeHtml(title)}</strong>
                <span>${Number(option.nights || 1)} đêm${hotel.breakfast_included ? " · Có buffet sáng" : ""}</span>
                <b>${formatPrice(price)}<small>/người · trọn gói</small></b>
            </span><span class="booking-hotel-check" aria-hidden="true">✓</span>
        </button>`;
    }).join("");

    const modal = document.createElement("div");
    modal.id = "bookingModal";
    modal.className = "booking-modal";
    modal.innerHTML = `
        <div class="booking-overlay" data-booking-close></div>
        <section class="booking-modal-content" role="dialog" aria-modal="true" aria-labelledby="bookingTitle">
            <button type="button" class="booking-close" data-booking-close aria-label="Đóng form">×</button>
            <div class="booking-modal-heading">
                <span class="booking-eyebrow">ANNLETRAVEL · BOOKING</span>
                <h2 id="bookingTitle">Đăng ký chuyến đi</h2>
                <p>Để lại thông tin, đội ngũ AnnLeTravel sẽ liên hệ xác nhận với bạn.</p>
            </div>
            <div class="booking-tour-summary">
                <div class="booking-tour-summary-icon" aria-hidden="true">✈</div>
                <div class="booking-tour-summary-copy">
                    <strong>${escapeHtml(tour.name)}</strong>
                    <span>📍 ${escapeHtml(tour.destination || "Điểm đến đang cập nhật")}</span>
                    <span>📅 ${escapeHtml(tour.displayDate || "Chưa xác định")}</span>
                    <span>🚌 ${escapeHtml(tour.transport || "Phương tiện sẽ được xác nhận")}</span>
                </div>
            </div>
            <form onsubmit="submitBooking(event, '${String(tour.id).replace(/'/g, "\\'")}')" class="booking-form booking-form-redesigned">
                <div class="booking-form-section-title"><span>01</span><div><strong>Thông tin liên hệ</strong><small>Thông tin để chúng tôi liên lạc với bạn</small></div></div>
                <div class="booking-form-grid">
                    <div class="form-group"><label for="bookingName">Họ và tên <em>*</em></label><input type="text" id="bookingName" placeholder="Nguyễn Văn A" autocomplete="name" required></div>
                    <div class="form-group"><label for="bookingPhone">Số điện thoại <em>*</em></label><input type="tel" id="bookingPhone" placeholder="09xx xxx xxx" autocomplete="tel" inputmode="tel" required></div>
                </div>
                <div class="booking-form-section-title"><span>02</span><div><strong>Tuỳ chọn chuyến đi</strong><small>Chọn số người và gói phù hợp</small></div></div>
                <div class="form-group booking-people-field"><label for="bookingPeople">Số người tham gia</label>
                    <select id="bookingPeople">
                    ${Array.from({length:20},(_,i)=>`<option value="${i+1}" ${i===0?"selected":""}>${i+1} ${i===0?"người":"người"}</option>`).join("")}
                    </select>
                </div>
                ${hotelOptions.length ? `
                    <div class="form-group booking-hotel-picker">
                        <div class="booking-field-heading"><label>Chọn gói khách sạn <em>*</em></label><span>Giá đã bao gồm tour + khách sạn</span></div>
                        <div class="booking-hotel-card-list">${hotelCards}</div>
                        <p class="booking-note">Chọn một gói bên trên. Giá trọn gói/người và tổng tiền sẽ tự cập nhật.</p>
                    </div>
                ` : `<div class="booking-no-hotel"><span aria-hidden="true">ℹ</span><p><strong>Giá tour cơ bản</strong><br>Tour này chưa có gói khách sạn cần chọn. Nhân viên sẽ xác nhận chi tiết khi liên hệ.</p></div>`}
                <div class="form-group booking-note-field"><label for="bookingNote">Yêu cầu thêm <span>(không bắt buộc)</span></label><textarea id="bookingNote" rows="3" placeholder="Ví dụ: điểm đón mong muốn, yêu cầu ăn uống…"></textarea></div>
                <div class="booking-price-panel" aria-live="polite">
                    <div><span>Giá trọn gói / người</span><strong id="bookingPackagePerPerson">${formatPrice(initialPrice)}</strong></div>
                    <div><span>Số người</span><strong id="bookingPackagePeople">1 người</strong></div>
                    <div class="booking-price-total"><span>Tổng dự kiến</span><strong id="bookingPackageTotal">${formatPrice(initialPrice)}</strong></div>
                    <p>Giá cuối cùng sẽ được xác nhận trước khi đặt cọc.</p>
                </div>
                <button type="submit" class="btn btn-primary full booking-submit-button"><span>Gửi yêu cầu đăng ký</span><span aria-hidden="true">→</span></button>
                <p class="booking-privacy-note">Thông tin của bạn chỉ được sử dụng để tư vấn và xác nhận tour.</p>
            </form>
        </section>`;
    document.body.appendChild(modal);
    document.body.classList.add("modal-open");
    modal.querySelectorAll("[data-booking-close]").forEach(button => button.addEventListener("click", closeBookingModal));
    modal.querySelectorAll("[data-booking-option]").forEach(button => button.addEventListener("click", () => window.setBookingHotelOption(button.dataset.bookingOption)));
    document.getElementById("bookingPeople")?.addEventListener("change", window.updateBookingPackagePrice);
    if (initialOption) window.setBookingHotelOption(initialOption.id);
    else window.updateBookingPackagePrice();
}

window.setBookingHotelOption = function(optionId) {
    const option = (window.bookingHotelOptions || []).find(item => String(item.id) === String(optionId));
    const tour = window.bookingCurrentTour;
    if (!option || !tour) {
        window.selectedTourHotelOption = null;
        window.updateBookingPackagePrice();
        return;
    }
    const hotel = option.hotels || {};
    const packagePrice = Number(option.package_price_per_person ?? tour.price ?? 0);
    window.selectedTourHotelOption = {
        id: option.id, hotelId: option.hotel_id, hotelName: hotel.name || "",
        hotelImage: hotel.cover_image || "", roomLabel: option.label || "Gói lưu trú",
        pricingMode: "INCLUDED", pricePerPerson: 0, roomPricePerNight: 0,
        maxGuests: Number(option.max_guests_per_room || 2), nights: Number(option.nights || 1),
        packagePricePerPerson: packagePrice, baseTourPrice: Number(tour.price || 0),
        note: option.note || "", estimatedPerPerson: packagePrice
    };
    document.querySelectorAll("[data-booking-option]").forEach(button => {
        const chosen = String(button.dataset.bookingOption) === String(option.id);
        button.classList.toggle("selected", chosen);
        button.setAttribute("aria-pressed", String(chosen));
    });
    window.updateBookingPackagePrice();
};

window.updateBookingPackagePrice = function() {
    const tour = window.bookingCurrentTour;
    if (!tour) return;
    const people = Math.max(1, Number(document.getElementById("bookingPeople")?.value || 1));
    const perPerson = Number(window.selectedTourHotelOption?.packagePricePerPerson ?? tour.price ?? 0);
    const perPersonEl = document.getElementById("bookingPackagePerPerson");
    const peopleEl = document.getElementById("bookingPackagePeople");
    const totalEl = document.getElementById("bookingPackageTotal");
    if (perPersonEl) perPersonEl.textContent = formatPrice(perPerson);
    if (peopleEl) peopleEl.textContent = people + " người";
    if (totalEl) totalEl.textContent = formatPrice(perPerson * people);
};


// CLOSE BOOKING MODAL
// ================================

function closeBookingModal() {

    const modal =
        document.getElementById("bookingModal");


    if (modal) {
        modal.remove();
    }


    document.body.classList.remove("modal-open");

}


// ================================
// SUBMIT BOOKING
// ================================

async function submitBooking(event, tourId) {

    event.preventDefault();


    const name =
        document
            .getElementById("bookingName")
            .value
            .trim();

    const phone =
        document
            .getElementById("bookingPhone")
            .value
            .trim();

    const people =
        Number(
            document
                .getElementById("bookingPeople")
                .value
        );

    const note =
        document
            .getElementById("bookingNote")
            ?.value
            .trim() || "";


    // ================================
    // VALIDATE
    // ================================

    if (!name || !phone) {

        alert(
            "Vui lòng nhập đầy đủ họ tên và số điện thoại."
        );

        return;
    }


    if (people <= 0) {

        alert(
            "Số người đăng ký không hợp lệ."
        );

        return;
    }


    // ================================
    // FIND TOUR
    // ================================

    const data =
        await loadTours();

    const tour =
        data.find(
            item => item.id === tourId
        );


    if (!tour) {

        alert(
            "Không tìm thấy tour."
        );

        return;
    }


    // ================================
    // CHECK SEATS
    // ================================

    if (!tour.unlimited_seats && Number(tour.seats) <= 0) {

        alert(
            "Tour này hiện đã hết chỗ."
        );

        return;
    }


    if (!tour.unlimited_seats && people > Number(tour.seats)) {

        alert(
            `Tour chỉ còn ${tour.unlimited_seats ? "Không giới hạn chỗ" : `${Number(tour.seats) || 0} chỗ`}.\n\n` +
            `Vui lòng giảm số người đăng ký.`
        );

        return;
    }


    // ================================
    // INSERT BOOKING
    // ================================

    try {

        const {
            data: booking,
            error
        } =
            await supabaseClient
                .from("bookings")
                .insert({

                    tour_id: tourId,

                    customer_name: name,

                    phone: phone,

                    people: people,

                    note: note,

                    status: "PENDING"

                })
                .select()
                .single();


        if (error) {

            throw error;

        }


        console.log(
            "BOOKING CREATED:",
            booking
        );


        // ================================
        // SUCCESS
        // ================================

        alert(
            "Đăng ký tour thành công! 🎉\n\n" +
            "ANNLETRAVEL sẽ liên hệ với bạn " +
            "sớm nhất để xác nhận thông tin."
        );


        closeBookingModal();


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        alert(
            "Không thể gửi đăng ký tour.\n\n" +
            "Vui lòng thử lại sau."
        );

    }

}


// ================================
// SEARCH TOUR
// ================================

function searchTours() {

    const destination =
        document.getElementById("searchDestination")?.value.trim() || "";

    const date =
        document.getElementById("searchDate")?.value || "";

    const price =
        document.getElementById("searchPrice")?.value || "";


    const params = new URLSearchParams();


    if (destination) {
        params.set("destination", destination);
    }


    if (date) {
        params.set("date", date);
    }


    if (price) {
        params.set("price", price);
    }


    const query = params.toString();


    window.location.href =
        "tours.html" + (query ? "?" + query : "");

}


// ================================
// CONTACT FORM
// ================================

function submitLead(event) {

    event.preventDefault();


    alert(
        "Cảm ơn bạn!\n\n" +
        "Thông tin tư vấn đã được ghi nhận.\n\n" +
        "Đây đang là bản demo."
    );

}


// ================================
// AUTO LOAD
// ================================

document.addEventListener("DOMContentLoaded", async function () {

    await loadTours();

    // Menu điểm đến
    renderDestinationMenu();

    // Trang chủ
    if (document.getElementById("featuredTours")) {
        renderHomeTours();
    }

    if (document.getElementById("monthlyTours")) {
        renderMonthlyTours();
    }


    // Trang danh sách tour
    if (document.getElementById("allTours")) {

        renderAllTours();

    }


    // Trang chi tiết
    if (document.getElementById("tourDetail")) {
        renderTourDetail();
    }

});