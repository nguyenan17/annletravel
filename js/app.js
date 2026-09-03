// ================================
// YOUR TRAVEL - APP.JS
// ================================


// Danh sách tour
let tours = [];


// ================================
// LOAD TOURS
// ================================

async function loadTours() {

    // Nếu đã load rồi thì không load lại
    if (tours.length > 0) {
        return tours;
    }

    try {

        const response = await fetch("data/tours.json");

        tours = await response.json();

        return tours;

    } catch (error) {

        console.error("Không thể tải danh sách tour:", error);

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
                    Còn ${tour.seats} chỗ
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
                        👥 ${tour.seats} chỗ
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
                    Còn ${tour.seats} chỗ
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


    let filteredTours = data;


    // ================================
    // FILTER DESTINATION
    // ================================

    if (destination) {

        filteredTours =
            filteredTours.filter(
                tour =>
                    tour.destination
                        .toLowerCase()
                        .includes(destination.toLowerCase())
            );

    }


    // ================================
    // FILTER DATE
    // ================================

    if (date) {

        filteredTours =
            filteredTours.filter(
                tour =>
                    tour.departure >= date
            );

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


    // ================================
    // UPDATE FILTER UI
    // ================================

    const destinationSelect =
        document.getElementById("filterDestination");

    const priceSelect =
        document.getElementById("filterPrice");


    if (destinationSelect) {
        destinationSelect.value = destination;
    }


    if (priceSelect) {
        priceSelect.value = price;
    }


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


    let filteredTours = [...data];


    // ================================
    // DESTINATION
    // ================================

    if (destination) {

        filteredTours =
            filteredTours.filter(tour =>
                tour.destination === destination
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


    // Tìm tour
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


    if (!tour) {

        container.innerHTML = `
            <div class="container section">
                <h2>Không tìm thấy tour.</h2>
            </div>
        `;

        return;

    }


    document.title =
        tour.name + " - YOUR TRAVEL";


    container.innerHTML = `

        <!-- DETAIL IMAGE -->

        <section class="detail-hero">

            <div
                class="detail-image"
                style="
                    background-image:
                    url('${tour.image}')
                "
            >
            </div>

        </section>


        <!-- DETAIL CONTENT -->

        <section class="section">

            <div class="container detail-grid">


                <!-- LEFT -->

                <div>

                    <p class="section-label">
                        ${tour.destination}
                    </p>


                    <h1>
                        ${tour.name}
                    </h1>


                    <p class="lead">
                        ${tour.short}
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
                            ${tour.seats} chỗ
                        </strong>
                    </p>


                    <p>
                        📍 Điểm đến:
                        <strong>
                            ${tour.destination}
                        </strong>
                    </p>


                    <br>


                    <h2>
                        Lịch trình
                    </h2>


                    <br>


                    <p>
                        <strong>Ngày 1:</strong>
                        Khởi hành và nhận phòng.
                    </p>


                    <p>
                        <strong>Ngày 2:</strong>
                        Tham quan các địa điểm nổi bật.
                    </p>


                    <p>
                        <strong>Ngày 3:</strong>
                        Khám phá văn hóa và ẩm thực địa phương.
                    </p>


                    <p>
                        <strong>Ngày cuối:</strong>
                        Mua sắm và trở về.
                    </p>


                </div>


                <!-- RIGHT -->

                <aside class="booking-box">


                    <h3>
                        ${tour.name}
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
                            ${tour.seats} chỗ
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

    `;

}


// ================================
// REGISTER TOUR
// ================================

async function registerTour(tourId) {

    const data = await loadTours();

    const tour =
        data.find(item => item.id === tourId);


    if (!tour) {
        alert("Không tìm thấy tour.");
        return;
    }


    // Xóa popup cũ nếu có
    const oldModal =
        document.getElementById("bookingModal");

    if (oldModal) {
        oldModal.remove();
    }


    const modal = document.createElement("div");

    modal.id = "bookingModal";

    modal.className = "booking-modal";


    modal.innerHTML = `

        <div class="booking-overlay"
             onclick="closeBookingModal()">
        </div>


        <div class="booking-modal-content">


            <button
                class="booking-close"
                onclick="closeBookingModal()">

                ×

            </button>


            <span class="section-label">
                ĐĂNG KÝ TOUR
            </span>


            <h2>
                ${tour.name}
            </h2>


            <div class="booking-summary">

                <div>
                    <span>Khởi hành</span>
                    <strong>
                        ${tour.displayDate}
                    </strong>
                </div>


                <div>
                    <span>Điểm đến</span>
                    <strong>
                        ${tour.destination}
                    </strong>
                </div>


                <div>
                    <span>Giá tour</span>
                    <strong>
                        ${formatPrice(tour.price)}
                    </strong>
                </div>

            </div>


            <form
                onsubmit="submitBooking(event, '${tour.id}')"
                class="booking-form">


                <div class="form-group">

                    <label>
                        Họ và tên *
                    </label>

                    <input
                        type="text"
                        id="bookingName"
                        placeholder="Nhập họ và tên"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Số điện thoại *
                    </label>

                    <input
                        type="tel"
                        id="bookingPhone"
                        placeholder="09xxxxxxxx"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Số người
                    </label>

                    <select id="bookingPeople">

                        <option value="1">
                            1 người
                        </option>

                        <option value="2">
                            2 người
                        </option>

                        <option value="3">
                            3 người
                        </option>

                        <option value="4">
                            4 người
                        </option>

                        <option value="5">
                            5 người
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Ghi chú
                    </label>

                    <textarea
                        id="bookingNote"
                        rows="3"
                        placeholder="Bạn muốn yêu cầu gì thêm?"
                    ></textarea>

                </div>


                <button
                    type="submit"
                    class="btn btn-primary full">

                    Gửi yêu cầu đăng ký

                </button>


                <p class="booking-note">

                    Sale sẽ liên hệ lại để xác nhận
                    lịch trình và thông tin đặt tour.

                </p>


            </form>

        </div>

    `;


    document.body.appendChild(modal);

    document.body.classList.add("modal-open");

}


// ================================
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

function submitBooking(event, tourId) {

    event.preventDefault();


    const name =
        document.getElementById("bookingName").value.trim();

    const phone =
        document.getElementById("bookingPhone").value.trim();

    const people =
        document.getElementById("bookingPeople").value;


    if (!name || !phone) {

        alert(
            "Vui lòng nhập đầy đủ họ tên và số điện thoại."
        );

        return;
    }


    console.log("BOOKING:", {

        tourId: tourId,

        name: name,

        phone: phone,

        people: people

    });


    alert(
        "Đăng ký thành công!\n\n" +
        "YOUR TRAVEL sẽ liên hệ với bạn sớm nhất."
    );


    closeBookingModal();

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