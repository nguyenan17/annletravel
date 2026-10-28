let tours = [];

let bookings = [];

let editingTourId = null;

let editingItineraryTourId = null;

let itineraryItems = [];

let editingTourImages = [];
let selectedGalleryFiles = [];

// Các ảnh cũ sẽ xóa khỏi Storage sau khi lưu thành công
let imagesToDelete = [];


// =========================
// ELEMENTS
// =========================

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutButton = document.getElementById("logoutButton");
const addTourButton = document.getElementById("addTourButton");
const refreshButton = document.getElementById("refreshButton");
const tourTableBody = document.getElementById("tourTableBody");
const tourModal = document.getElementById("tourModal");
const closeModalButton = document.getElementById("closeModalButton");
const cancelButton = document.getElementById("cancelButton");
const tourForm = document.getElementById("tourForm");
const bookingTableBody = document.getElementById("bookingTableBody");
const refreshBookingButton = document.getElementById("refreshBookingButton");
const bookingStatusFilter = document.getElementById("bookingStatusFilter");
const itineraryModal = document.getElementById("itineraryModal");
const itineraryModalTitle = document.getElementById("itineraryModalTitle");
const itineraryTourName = document.getElementById("itineraryTourName");
const itineraryList = document.getElementById("itineraryList");
const addItineraryDayButton = document.getElementById("addItineraryDayButton");
const saveItineraryButton = document.getElementById("saveItineraryButton");
const closeItineraryModalButton = document.getElementById("closeItineraryModalButton");
const cancelItineraryButton = document.getElementById("cancelItineraryButton");
const tourGalleryFiles = document.getElementById("tourGalleryFiles");
const galleryPreview = document.getElementById("galleryPreview");
const tourIsDaily = document.getElementById("tourIsDaily");
const tourUnlimitedSeats = document.getElementById("tourUnlimitedSeats");
const tourDeparture = document.getElementById("tourDeparture");
const tourSeats = document.getElementById("tourSeats");
function syncTourScheduleControls() {
    if (tourDeparture) { tourDeparture.disabled = !!tourIsDaily?.checked; tourDeparture.required = !tourIsDaily?.checked; if (tourIsDaily?.checked) tourDeparture.value = ""; }
    if (tourSeats) { tourSeats.disabled = !!tourUnlimitedSeats?.checked; tourSeats.required = !tourUnlimitedSeats?.checked; if (tourUnlimitedSeats?.checked) tourSeats.value = "0"; else if (!tourSeats.value || Number(tourSeats.value) < 0) tourSeats.value = "20"; }
}
tourIsDaily?.addEventListener("change", syncTourScheduleControls);
tourUnlimitedSeats?.addEventListener("change", syncTourScheduleControls);


// =========================
// ADMIN SIDEBAR NAVIGATION
// =========================

function showAdminSection(sectionName, updateHash = true) {
    const sectionMap = {
        dashboard: "adminSectionDashboard",
        tours: "adminSectionTours",
        bookings: "adminSectionBookings",
        destinations: "adminSectionDestinations",
        services: "adminSectionServices",
        hotels: "adminSectionHotels",
        tickets: "adminSectionTickets"
    };

    const targetId = sectionMap[sectionName] || sectionMap.dashboard;

    document.querySelectorAll(".admin-content-section").forEach(section => {
        section.classList.toggle("hidden", section.id !== targetId);
    });

    document.querySelectorAll(".admin-nav-link[data-section]").forEach(link => {
        link.classList.toggle("active", link.dataset.section === sectionName);
    });

    if (updateHash) {
        const newHash = `#${sectionName}`;
        if (window.location.hash !== newHash) {
            history.replaceState(null, "", newHash);
        }
    }

    if (sectionName === "hotels" && typeof window.initHotelManagement === "function") window.initHotelManagement();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function initAdminNavigation() {
    document.querySelectorAll(".admin-nav-link[data-section]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showAdminSection(link.dataset.section);
        });
    });

    const hash = window.location.hash.replace("#", "").trim();
    showAdminSection(hash || "dashboard", false);

    window.addEventListener("hashchange", () => {
        const currentHash = window.location.hash.replace("#", "").trim();
        showAdminSection(currentHash || "dashboard", false);
    });
}


// =========================
// CHECK LOGIN
// =========================

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        const isAdmin = await checkAdmin(session.user.id);

        if (!isAdmin) {
            await supabaseClient.auth.signOut();
            showLogin();
            loginError.textContent = "Tài khoản này không có quyền Admin.";
            return;
        }

        showDashboard();
    } else {
        showLogin();
    }
}


// =========================
// CHECK ADMIN
// =========================

async function checkAdmin(userId) {
    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Admin check error:", error);
        return false;
    }

    return !!data;
}


// =========================
// SHOW LOGIN
// =========================

function showLogin() {
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");
}


// =========================
// SHOW DASHBOARD
// =========================

async function showDashboard() {
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    initAdminNavigation();

    await loadTours();
    await loadBookings();
    await loadTourVesselPackageOptions();
}


// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        const isAdmin = await checkAdmin(data.user.id);

        if (!isAdmin) {
            await supabaseClient.auth.signOut();
            throw new Error("Tài khoản không có quyền Admin");
        }

        loginForm.reset();
        await showDashboard();
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = error.message === "Tài khoản không có quyền Admin"
            ? "Tài khoản này không có quyền Admin."
            : "Email hoặc mật khẩu không đúng.";
    }
});


// =========================
// LOAD TOURS
// =========================

async function loadTours() {
    try {
        refreshButton.textContent = "Đang tải...";
        refreshButton.disabled = true;

        const { data, error } = await supabaseClient
            .from("tours")
            .select("*")
            .order("departure", { ascending: true });

        if (error) {
            console.error("SUPABASE LOAD TOURS ERROR:", error);
            alert("Lỗi tải tour:\n\n" + error.message + "\n\nCode: " + error.code);
            throw error;
        }

        tours = data || [];
        const groupSuggestions = document.getElementById("tourGroupSuggestions");
        if (groupSuggestions) {
            const groups = [...new Set(tours.map(tour => String(tour.tour_group || tour.destination || "").trim()).filter(Boolean))];
            groupSuggestions.innerHTML = groups.map(group => "<option value=\"" + String(group).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\"></option>").join("");
        }
        renderStats();
        renderTours();
    } catch (error) {
        console.error("Load tours error:", error);
        alert("Không thể tải danh sách tour.");
    } finally {
        refreshButton.textContent = "↻ Làm mới";
        refreshButton.disabled = false;
    }
}


// =========================
// LOAD BOOKINGS
// =========================

async function loadBookings() {
    try {
        refreshBookingButton.textContent = "Đang tải...";
        refreshBookingButton.disabled = true;

        const { data, error } = await supabaseClient
            .from("bookings")
            .select(`
                id,
                tour_id,
                customer_name,
                phone,
                people,
                note,
                status,
                created_at,
                updated_at,
                hotel_name_snapshot,
                room_type_snapshot,
                pricing_mode_snapshot,
                hotel_amount_snapshot,
                total_amount_snapshot
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        bookings = data || [];
        renderBookings();
    } catch (error) {
        console.error("Load bookings error:", error);
        alert("Không thể tải danh sách đăng ký.");
    } finally {
        refreshBookingButton.textContent = "↻ Làm mới";
        refreshBookingButton.disabled = false;
    }
}


// =========================
// RENDER BOOKINGS
// =========================

function renderBookings() {
    if (!bookingTableBody) return;

    const filter = bookingStatusFilter.value;
    let filteredBookings = bookings;

    if (filter !== "ALL") {
        filteredBookings = bookings.filter(booking => booking.status === filter);
    }

    if (filteredBookings.length === 0) {
        bookingTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-booking">Không có đơn đăng ký nào.</td>
            </tr>
        `;
        return;
    }

    bookingTableBody.innerHTML = filteredBookings.map(booking => {
        const tour = tours.find(tour => tour.id === booking.tour_id);
        const tourName = tour ? tour.name : "Tour không tồn tại";
        const createdDate = new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(booking.created_at));
        const statusText = getBookingStatusText(booking.status);
        const statusClass = getBookingStatusClass(booking.status);

        return `
            <tr>
                <td><div class="booking-customer-name">${escapeHtml(booking.customer_name)}</div></td>
                <td>${escapeHtml(tourName)}</td>
                <td>${booking.people}</td>
                <td>${escapeHtml(booking.phone)}</td>
                <td><div class="booking-note">${escapeHtml(booking.hotel_name_snapshot ? (booking.hotel_name_snapshot + (booking.room_type_snapshot ? " · " + booking.room_type_snapshot : "") + (booking.total_amount_snapshot != null ? " · Tổng: " + new Intl.NumberFormat("vi-VN").format(Number(booking.total_amount_snapshot) || 0) + "đ" : "")) : "Không chọn khách sạn")}</div></td>
                <td><div class="booking-note">${escapeHtml(booking.note || "-")}</div></td>
                <td><div class="booking-date">${createdDate}</div></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <select class="booking-action-select" onchange="updateBookingStatus('${booking.id}', this.value)">
                            <option value="PENDING" ${booking.status === "PENDING" ? "selected" : ""}>Chờ xác nhận</option>
                            <option value="CONFIRMED" ${booking.status === "CONFIRMED" ? "selected" : ""}>Đã xác nhận</option>
                            <option value="CANCELLED" ${booking.status === "CANCELLED" ? "selected" : ""}>Đã hủy</option>
                        </select>
                        <button class="booking-delete-button" onclick="deleteBooking('${booking.id}')">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


// =========================
// BOOKING STATUS TEXT
// =========================

function getBookingStatusText(status) {
    switch (status) {
        case "CONFIRMED": return "Đã xác nhận";
        case "CANCELLED": return "Đã hủy";
        case "PENDING":
        default: return "Chờ xác nhận";
    }
}


// =========================
// BOOKING STATUS CLASS
// =========================

function getBookingStatusClass(status) {
    switch (status) {
        case "CONFIRMED": return "status-confirmed";
        case "CANCELLED": return "status-cancelled";
        case "PENDING":
        default: return "status-pending";
    }
}


// =========================
// UPDATE BOOKING STATUS
// =========================

window.updateBookingStatus = async function (bookingId, newStatus) {
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) return;

    const oldStatus = booking.status;
    if (oldStatus === newStatus) return;

    try {
        const { error } = await supabaseClient
            .from("bookings")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", bookingId);

        if (error) throw error;

        booking.status = newStatus;
        renderBookings();
    } catch (error) {
        console.error("Update booking status error:", error);
        alert("Không thể cập nhật trạng thái.\n\n" + error.message);
        renderBookings();
    }
};


// =========================
// DELETE BOOKING
// =========================

window.deleteBooking = async function (bookingId) {
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) return;

    const confirmed = confirm(`Bạn có chắc muốn xóa đơn đăng ký của "${booking.customer_name}"?`);
    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from("bookings")
            .delete()
            .eq("id", bookingId);

        if (error) throw error;

        alert("Xóa đơn đăng ký thành công!");
        await loadBookings();
    } catch (error) {
        console.error("Delete booking error:", error);
        alert("Không thể xóa đơn đăng ký.\n\n" + error.message);
    }
};


// =========================
// RENDER STATS
// =========================

function renderStats() {
    const totalTours = tours.length;
    const totalSeats = tours.reduce((total, tour) => total + Number(tour.seats || 0), 0);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyTours = tours.filter(tour => {
        if (tour.is_daily) return true;
        if (!tour.departure) return false;
        const date = new Date(tour.departure + "T00:00:00");
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    }).length;

    document.getElementById("totalTours").textContent = totalTours;
    document.getElementById("monthlyTours").textContent = monthlyTours;
    document.getElementById("totalSeats").textContent = totalSeats;
}


// =========================
// RENDER TOURS
// =========================

function renderTours() {
    const search = (document.getElementById("tourAdminSearch")?.value || "").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim();
    const visibleTours = tours.filter(tour => !search || `${tour.name || ""} ${tour.destination || ""}`.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().includes(search));
    const count = document.getElementById("tourAdminCount");
    if (count) count.textContent = `${visibleTours.length} / ${tours.length} tour`;
    if (visibleTours.length === 0) {
        tourTableBody.innerHTML = `
            <tr>
                <td colspan="6">Chưa có tour nào.</td>
            </tr>
        `;
        return;
    }

    tourTableBody.innerHTML = visibleTours.map(tour => {
        const date = tour.is_daily ? "Hằng ngày" : (tour.departure ? new Intl.DateTimeFormat("vi-VN").format(new Date(tour.departure + "T00:00:00")) : "Chưa xác định");
        const seatsLabel = tour.unlimited_seats ? "Không giới hạn" : String(Number(tour.seats || 0));
        const price = Number(tour.price || 0).toLocaleString("vi-VN");

        return `
            <tr>
                <td>
                    <div class="tour-name">${escapeHtml(tour.name)}</div>
                    <div class="tour-description">${escapeHtml(tour.short || "")}</div>
                </td>
                <td>${escapeHtml(tour.destination)}</td>
                <td>${date}</td>
                <td>${seatsLabel}</td>
                <td>${price} ₫</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-button" onclick="editTour('${tour.id}')">Sửa</button>
                        <button class="edit-button" onclick="manageItinerary('${tour.id}')">Lịch trình</button>
                        <button class="delete-button" onclick="deleteTour('${tour.id}')">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


document.getElementById("tourAdminSearch")?.addEventListener("input", renderTours);

// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
    }[char]));
}


// =========================
// OPEN ADD MODAL
// =========================

addTourButton.addEventListener(
    "click",
    function () {

        editingTourId = null;

        imagesToDelete = [];

        document.getElementById(
            "modalTitle"
        ).textContent = "Thêm tour";

        tourForm.reset();
        syncTourScheduleControls();

        imagePreview.innerHTML = "";

        galleryPreview.innerHTML = "";

        editingTourImages = [];

        selectedGalleryFiles = [];

        document.getElementById(
            "tourId"
        ).value = "";
        renderTourVesselPackageOptions([]);

        tourModal.classList.remove(
            "hidden"
        );
    }
);

// =========================
// IMAGE PREVIEW
// =========================

const tourImageFile =
    document.getElementById("tourImageFile");

const imagePreview =
    document.getElementById("imagePreview");


// =========================
// MAIN IMAGE PREVIEW
// =========================

tourImageFile.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {
            return;
        }


        const imageUrl =
            URL.createObjectURL(file);


        imagePreview.innerHTML = `

            <img
                src="${imageUrl}"
                alt="Preview"
            >

        `;
    }
);


// =========================
// GALLERY PREVIEW
// =========================

tourGalleryFiles.addEventListener(
    "change",
    function () {

        selectedGalleryFiles =
            Array.from(this.files);


        renderGalleryPreview();

    }
);


function renderGalleryPreview() {

    galleryPreview.innerHTML = "";


    selectedGalleryFiles.forEach(
        (file, index) => {

            const imageUrl =
                URL.createObjectURL(file);


            const item =
                document.createElement("div");

            item.className =
                "gallery-preview-item";


            item.innerHTML = `

                <img
                    src="${imageUrl}"
                    alt="Gallery ${index + 1}"
                >

                <button
                    type="button"
                    onclick="removeGalleryFile(${index})"
                >
                    ×
                </button>

            `;


            galleryPreview.appendChild(item);

        }
    );
}


window.removeGalleryFile =
    function (index) {

        selectedGalleryFiles.splice(
            index,
            1
        );


        renderGalleryPreview();

    };


// =========================
// EDIT TOUR
// =========================

window.editTour =
    function (tourId) {

        const tour =
            tours.find(
                item => item.id === tourId
            );

        if (!tour) {
            return;
        }


        editingTourId =
            tour.id;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Sửa tour";


        document.getElementById(
            "tourId"
        ).value =
            tour.id;


        document.getElementById(
            "tourName"
        ).value =
            tour.name || "";


        document.getElementById(
            "tourDestination"
        ).value =
            tour.destination || "";

        const tourTransportInput = document.getElementById("tourTransport");
        if (tourTransportInput) tourTransportInput.value = tour.transport || "";

        const tourGroupInput = document.getElementById("tourGroup");
        if (tourGroupInput) tourGroupInput.value = tour.tour_group || tour.destination || "";


        const tourIsDailyInput = document.getElementById("tourIsDaily");
        const tourUnlimitedSeatsInput = document.getElementById("tourUnlimitedSeats");
        const tourDepartureInput = document.getElementById("tourDeparture");
        const tourSeatsInput = document.getElementById("tourSeats");
        if (tourIsDailyInput) tourIsDailyInput.checked = !!tour.is_daily;
        if (tourUnlimitedSeatsInput) tourUnlimitedSeatsInput.checked = !!tour.unlimited_seats;
        if (tourDepartureInput) tourDepartureInput.value = tour.departure || "";
        if (tourSeatsInput) tourSeatsInput.value = tour.unlimited_seats ? "0" : (tour.capacity ?? tour.seats ?? 0);
        syncTourScheduleControls();


        document.getElementById(
            "tourPrice"
        ).value =
            tour.price || 0;


        document.getElementById(
            "tourImage"
        ).value =
            tour.image || "";

        editingTourImages =
            Array.isArray(tour.images)
                ? [...tour.images]
                : [];

        selectedGalleryFiles = [];

        imagesToDelete = [];

        tourGalleryFiles.value = "";

        renderExistingGallery();

        if (tour.image) {

            imagePreview.innerHTML = `
        <img
            src="${tour.image}"
            alt="${escapeHtml(tour.name)}"
        >
    `;

        } else {

            imagePreview.innerHTML = "";

        }


        document.getElementById(
            "tourShort"
        ).value =
            tour.short || "";


        tourModal.classList.remove(
            "hidden"
        );
        loadTourVesselPackageOptions(tour.id);
    };

function renderExistingGallery() {

    galleryPreview.innerHTML = "";


    editingTourImages.forEach(
        (imageUrl, index) => {

            const item =
                document.createElement("div");

            item.className =
                "gallery-preview-item";


            item.innerHTML = `

                <img
                    src="${imageUrl}"
                    alt="Gallery"
                >

                <button
                    type="button"
                    onclick="removeExistingGalleryImage(${index})"
                >
                    ×
                </button>

            `;


            galleryPreview.appendChild(item);

        }
    );
}

window.removeExistingGalleryImage =
    function (index) {

        const imageUrl =
            editingTourImages[index];

        if (!imageUrl) {
            return;
        }

        const confirmed =
            confirm(
                "Bạn có chắc muốn xóa ảnh này?"
            );

        if (!confirmed) {
            return;
        }

        // Đánh dấu ảnh để xóa khỏi Storage
        imagesToDelete.push(imageUrl);

        // Xóa khỏi danh sách gallery hiện tại
        editingTourImages.splice(
            index,
            1
        );

        renderExistingGallery();
    };

// =========================
// MANAGE ITINERARY
// =========================

window.manageItinerary =
    async function (tourId) {

        const tour =
            tours.find(
                item => item.id === tourId
            );

        if (!tour) {
            alert("Không tìm thấy tour.");
            return;
        }

        editingItineraryTourId =
            tourId;

        itineraryModalTitle.textContent =
            "Lịch trình";

        itineraryTourName.textContent =
            tour.name;


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("tour_itineraries")
                    .select("*")
                    .eq(
                        "tour_id",
                        tourId
                    )
                    .order(
                        "day",
                        {
                            ascending: true
                        }
                    );


            if (error) {
                throw error;
            }


            itineraryItems =
                data || [];


            renderItinerary();


            itineraryModal.classList.remove(
                "hidden"
            );


        } catch (error) {

            console.error(
                "Load itinerary error:",
                error
            );

            alert(
                "Không thể tải lịch trình.\n\n" +
                error.message
            );
        }
    };


// =========================
// RENDER ITINERARY
// =========================

function renderItinerary() {

    if (
        !itineraryItems ||
        itineraryItems.length === 0
    ) {

        itineraryList.innerHTML = `
            <div class="itinerary-empty">
                Chưa có lịch trình.
            </div>
        `;

        return;
    }


    itineraryList.innerHTML =
        itineraryItems
            .map(
                (item, index) => `

                <div
                    class="itinerary-item"
                    data-index="${index}"
                >

                    <div class="itinerary-item-header">

                        <div class="itinerary-day-title">
                            Ngày ${item.day}
                        </div>

                        <button
                            type="button"
                            class="itinerary-delete-button"
                            onclick="removeItineraryDay(${index})"
                        >
                            Xóa ngày
                        </button>

                    </div>


                    <div class="form-group">

                        <label>
                            Tiêu đề
                        </label>

                        <input
                            type="text"
                            class="itinerary-title"
                            value="${escapeHtml(
                    item.title || ""
                )}"
                            placeholder="Ví dụ: Hà Nội → Seoul"
                            oninput="updateItineraryItem(
                                ${index},
                                'title',
                                this.value
                            )"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nội dung
                        </label>

                        <textarea
                            class="itinerary-description"
                            placeholder="Mỗi dòng một hoạt động hoặc mốc giờ. Ví dụ: 08:00 – Đón khách tại Hà Nội\n10:30 – Đến điểm tham quan\n12:00 – Dùng bữa trưa"
                            oninput="updateItineraryItem(
                                ${index},
                                'description',
                                this.value
                            )"
                        >${escapeHtml(
                    item.description || ""
                )}</textarea>

                    </div>

                </div>

            `
            )
            .join("");
}


// =========================
// UPDATE ITINERARY ITEM
// =========================

window.updateItineraryItem =
    function (
        index,
        field,
        value
    ) {

        if (!itineraryItems[index]) {
            return;
        }

        itineraryItems[index][field] =
            value;
    };


// =========================
// ADD ITINERARY DAY
// =========================

addItineraryDayButton.addEventListener(
    "click",
    function () {

        const nextDay =
            itineraryItems.length + 1;


        itineraryItems.push({

            id: null,

            tour_id:
                editingItineraryTourId,

            day:
                nextDay,

            title:
                "",

            description:
                ""

        });


        renderItinerary();
    }
);


// =========================
// REMOVE ITINERARY DAY
// =========================

window.removeItineraryDay =
    function (index) {

        if (!itineraryItems[index]) {
            return;
        }


        const confirmed =
            confirm(
                `Bạn có chắc muốn xóa Ngày ${itineraryItems[index].day}?`
            );


        if (!confirmed) {
            return;
        }


        itineraryItems.splice(
            index,
            1
        );


        // Đánh lại số ngày

        itineraryItems.forEach(
            (item, itemIndex) => {

                item.day =
                    itemIndex + 1;

            }
        );


        renderItinerary();
    };


// =========================
// SAVE ITINERARY
// =========================

saveItineraryButton.addEventListener(
    "click",
    async function () {

        if (!editingItineraryTourId) {
            return;
        }


        // Kiểm tra tiêu đề

        const invalidItem =
            itineraryItems.find(
                item =>
                    !item.title ||
                    !item.title.trim()
            );


        if (invalidItem) {

            alert(
                `Vui lòng nhập tiêu đề cho Ngày ${invalidItem.day}.`
            );

            return;
        }


        try {

            saveItineraryButton.disabled =
                true;

            saveItineraryButton.textContent =
                "Đang lưu...";


            // Xóa toàn bộ lịch trình cũ

            const {
                error: deleteError
            } =
                await supabaseClient
                    .from("tour_itineraries")
                    .delete()
                    .eq(
                        "tour_id",
                        editingItineraryTourId
                    );


            if (deleteError) {
                throw deleteError;
            }


            // Nếu có lịch trình mới thì insert

            if (itineraryItems.length > 0) {

                const rows =
                    itineraryItems.map(
                        item => ({

                            tour_id:
                                editingItineraryTourId,

                            day:
                                item.day,

                            title:
                                item.title.trim(),

                            description:
                                item.description
                                    ? item.description.trim()
                                    : ""

                        })
                    );


                const {
                    error: insertError
                } =
                    await supabaseClient
                        .from(
                            "tour_itineraries"
                        )
                        .insert(rows);


                if (insertError) {
                    throw insertError;
                }
            }


            alert(
                "Lưu lịch trình thành công!"
            );


            closeItineraryModal();


        } catch (error) {

            console.error(
                "Save itinerary error:",
                error
            );


            alert(
                "Không thể lưu lịch trình.\n\n" +
                error.message
            );


        } finally {

            saveItineraryButton.disabled =
                false;

            saveItineraryButton.textContent =
                "Lưu lịch trình";
        }
    }
);


// =========================
// CLOSE ITINERARY MODAL
// =========================

function closeItineraryModal() {

    itineraryModal.classList.add(
        "hidden"
    );

    editingItineraryTourId =
        null;

    itineraryItems = [];

    itineraryList.innerHTML = "";
}


closeItineraryModalButton.addEventListener(
    "click",
    closeItineraryModal
);


cancelItineraryButton.addEventListener(
    "click",
    closeItineraryModal
);


// =========================
// DELETE TOUR
// =========================

window.deleteTour =
    async function (tourId) {

        const tour =
            tours.find(
                item => item.id === tourId
            );

        if (!tour) {
            return;
        }


        const confirmed =
            confirm(
                `Bạn có chắc muốn xóa tour "${tour.name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            // =========================
            // LẤY TOÀN BỘ ẢNH
            // =========================

            const imagesToRemove = [
                tour.image,
                ...(Array.isArray(tour.images)
                    ? tour.images
                    : [])
            ].filter(Boolean);


            // =========================
            // XÓA TOUR TRONG DATABASE
            // =========================

            const { error } =
                await supabaseClient
                    .from("tours")
                    .delete()
                    .eq("id", tourId);


            if (error) {
                throw error;
            }


            // =========================
            // XÓA ẢNH KHỎI STORAGE
            // =========================

            if (imagesToRemove.length > 0) {

                try {

                    await deleteTourStorageImages(
                        imagesToRemove
                    );

                } catch (storageError) {

                    console.error(
                        "Tour đã xóa nhưng ảnh Storage chưa xóa hết:",
                        storageError
                    );

                }
            }


            alert(
                "Xóa tour thành công!"
            );


            await loadTours();


        } catch (error) {

            console.error(
                "Delete tour error:",
                error
            );

            alert(
                "Không thể xóa tour.\n\n" +
                error.message
            );
        }
    };

// =========================
// IMAGE COMPRESSION
// =========================

async function compressImage(file) {

    // Giữ độ phân giải phù hợp cho ảnh cover desktop, không phóng to ảnh nguồn.
    const maxWidth = 1920;
    const maxHeight = 1200;
    const quality = 0.86;

    const bitmap =
        await createImageBitmap(file);

    let width = bitmap.width;
    let height = bitmap.height;

    const ratio =
        Math.min(
            maxWidth / width,
            maxHeight / height,
            1
        );

    width =
        Math.round(width * ratio);

    height =
        Math.round(height * ratio);


    const canvas =
        document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;


    const ctx =
        canvas.getContext("2d");

    ctx.drawImage(
        bitmap,
        0,
        0,
        width,
        height
    );


    const blob =
        await new Promise(resolve => {

            canvas.toBlob(
                resolve,
                "image/webp",
                quality
            );

        });


    if (!blob) {
        throw new Error(
            "Không thể nén ảnh."
        );
    }


    return new File(
        [blob],
        `${crypto.randomUUID()}.webp`,
        {
            type: "image/webp"
        }
    );
}


// =========================
// UPLOAD ONE IMAGE
// =========================

async function uploadTourImage(file) {

    if (!file) {
        return null;
    }


    const compressedFile =
        await compressImage(file);


    const fileName =
        `${crypto.randomUUID()}.webp`;


    const filePath =
        `tours/${fileName}`;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("tour-images")
            .upload(
                filePath,
                compressedFile,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: "image/webp"
                }
            );


    if (uploadError) {
        throw uploadError;
    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("tour-images")
            .getPublicUrl(
                filePath
            );


    return data.publicUrl;
}

// =========================
// UPLOAD GALLERY
// =========================

async function uploadTourGallery(files) {

    if (!files || files.length === 0) {
        return [];
    }


    const urls = [];


    for (const file of files) {

        const url =
            await uploadTourImage(file);

        if (url) {
            urls.push(url);
        }

    }


    return urls;
}

// =========================
// GET STORAGE PATH
// =========================

function getTourStoragePath(imageUrl) {

    if (!imageUrl) {
        return null;
    }

    const marker =
        "/storage/v1/object/public/tour-images/";

    const index =
        imageUrl.indexOf(marker);

    if (index === -1) {
        console.warn(
            "Không xác định được Storage path:",
            imageUrl
        );

        return null;
    }

    return decodeURIComponent(
        imageUrl.substring(
            index + marker.length
        )
    );
}

// =========================
// DELETE IMAGES FROM STORAGE
// =========================

async function deleteTourStorageImages(imageUrls = []) {

    const paths = [
        ...new Set(
            imageUrls
                .map(getTourStoragePath)
                .filter(Boolean)
        )
    ];

    if (paths.length === 0) {
        console.log("Không có ảnh cần xóa.");
        return;
    }

    console.log("========== STORAGE DELETE ==========");
    console.log("Bucket:", "tour-images");
    console.log("Paths:", paths);

    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from("tour-images")
        .remove(paths);

    console.log("REMOVE DATA:", data);
    console.log("REMOVE ERROR:", error);

    if (error) {
        console.error(
            "❌ STORAGE DELETE ERROR:",
            error
        );

        throw error;
    }

    console.log(
        "✅ REMOVE REQUEST SUCCESS"
    );

    // =========================
    // KIỂM TRA FILE CÒN TRONG STORAGE KHÔNG
    // =========================

    const { data: files, error: listError } =
        await supabaseClient
            .storage
            .from("tour-images")
            .list("tours", {
                limit: 1000
            });

    if (listError) {

        console.error(
            "❌ Không thể kiểm tra Storage:",
            listError
        );

        return;
    }

    const existingFiles =
        new Set(
            (files || []).map(
                file => `tours/${file.name}`
            )
        );

    console.log(
        "========== STORAGE CHECK =========="
    );

    paths.forEach(path => {

        console.log(
            path,
            existingFiles.has(path)
                ? "❌ VẪN CÒN"
                : "✅ ĐÃ XÓA"
        );

    });

    console.log(
        "===================================="
    );

    return data;
}

// =========================
/* Reusable vessel package picker for tour create/edit */
let adminVesselPackages = [];
let adminVessels = [];
let adminTourVesselOptions = [];

function renderTourVesselPackageOptions(assignments = []) {
    const root = document.getElementById("tourVesselPackageOptions");
    if (!root) return;
    if (!adminVesselPackages.length) {
        root.innerHTML = '<p class="image-help">Chưa có gói tàu nào. Hãy tạo tàu và gói tại <a href="vessels.html" target="_blank" rel="noopener">Quản lý tàu thuyền & combo</a>.</p>';
        return;
    }
    const byPackage = new Map((assignments || []).map(item => [String(item.vessel_package_id), item]));
    root.innerHTML = adminVesselPackages.map(pkg => {
        const vessel = adminVessels.find(v => String(v.id) === String(pkg.vessel_id));
        const selected = byPackage.get(String(pkg.id));
        const checked = !!selected;
        const price = selected?.price_per_person == null ? "" : String(selected.price_per_person);
        const money = Number(pkg.price_from || 0).toLocaleString("vi-VN");
        return '<div class="tour-vessel-option"><div><label><input type="checkbox" class="tour-vessel-package-check" value="' + escapeHtml(pkg.id) + '"' + (checked ? ' checked' : '') + '><span>' + escapeHtml(pkg.name) + '<small>' + escapeHtml(vessel?.name || "Tàu") + ' · ' + escapeHtml(pkg.duration || "Chưa ghi thời lượng") + (pkg.meal_plan ? ' · ' + escapeHtml(pkg.meal_plan) : '') + ' · Giá mặc định ' + money + ' đ/người</small></span></label></div><div><label for="vessel-price-' + escapeHtml(pkg.id) + '">Giá riêng tour (đ/người)</label><input id="vessel-price-' + escapeHtml(pkg.id) + '" class="price-override tour-vessel-price" data-package-id="' + escapeHtml(pkg.id) + '" type="number" min="0" step="1000" placeholder="Dùng giá gói" value="' + escapeHtml(price) + '"></div></div>';
    }).join("");
}

async function loadTourVesselPackageOptions(tourId = null) {
    const root = document.getElementById("tourVesselPackageOptions");
    if (!root) return;
    try {
        const [vesselResult, packageResult] = await Promise.all([
            supabaseClient.from("vessels").select("id,name").eq("active", true).order("sort_order").order("name"),
            supabaseClient.from("vessel_packages").select("*").eq("active", true).order("sort_order").order("name")
        ]);
        if (vesselResult.error) throw vesselResult.error;
        if (packageResult.error) throw packageResult.error;
        adminVessels = vesselResult.data || [];
        adminVesselPackages = packageResult.data || [];
        let assignments = [];
        if (tourId) {
            const { data, error } = await supabaseClient.from("tour_vessel_options").select("*").eq("tour_id", String(tourId)).order("sort_order");
            if (error) throw error;
            assignments = data || [];
        }
        adminTourVesselOptions = assignments;
        renderTourVesselPackageOptions(assignments);
    } catch (error) {
        console.warn("Vessel package picker unavailable:", error);
        root.innerHTML = '<p class="image-help">Chưa tải được danh mục tàu. Hãy kiểm tra đã chạy migration <code>20261021_vessel_catalogue_and_combos.sql</code> trong Supabase chưa. Lỗi: ' + escapeHtml(error.message || error) + '</p>';
    }
}

async function saveTourVesselAssignments(tourId) {
    const root = document.getElementById("tourVesselPackageOptions");
    if (!root) return;
    const selected = Array.from(root.querySelectorAll(".tour-vessel-package-check:checked")).map(check => {
        const packageId = check.value;
        const priceInput = root.querySelector('.tour-vessel-price[data-package-id="' + CSS.escape(packageId) + '"]');
        return { vessel_package_id: packageId, price_per_person: priceInput && priceInput.value.trim() !== "" ? Number(priceInput.value) : null };
    });
    const { data: existing, error: loadError } = await supabaseClient.from("tour_vessel_options").select("id,vessel_package_id").eq("tour_id", String(tourId));
    if (loadError) throw loadError;
    const existingByPackage = new Map((existing || []).map(row => [String(row.vessel_package_id), row]));
    const rows = selected.map((item, index) => ({
        tour_id: String(tourId),
        vessel_package_id: item.vessel_package_id,
        price_per_person: item.price_per_person,
        pricing_mode: "INCLUDED",
        label: "",
        note: "",
        active: true,
        sort_order: index * 10,
        updated_at: new Date().toISOString()
    }));
    if (rows.length) {
        const { error } = await supabaseClient.from("tour_vessel_options").upsert(rows, { onConflict: "tour_id,vessel_package_id" });
        if (error) throw error;
    }
    const keep = new Set(selected.map(item => String(item.vessel_package_id)));
    for (const row of existing || []) {
        if (!keep.has(String(row.vessel_package_id))) {
            const { error } = await supabaseClient.from("tour_vessel_options").delete().eq("id", row.id);
            if (error) throw error;
        }
    }
}

// =========================
// SAVE TOUR
// =========================


function generateTourId(name) {

    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        + "-" +
        Date.now();

}

tourForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const imageFile =
            document
                .getElementById("tourImageFile")
                .files[0];

        const oldTour =
            editingTourId
                ? tours.find(
                    tour =>
                        tour.id === editingTourId
                )
                : null;

        const oldCoverImage =
            oldTour?.image || null;


        let imageUrl =
            document
                .getElementById("tourImage")
                .value
                .trim();


        if (imageFile) {

            imageUrl =
                await uploadTourImage(
                    imageFile
                );

        }

        // =========================
        // UPLOAD GALLERY
        // =========================

        let newGalleryUrls = [];


        if (selectedGalleryFiles.length > 0) {

            newGalleryUrls =
                await uploadTourGallery(
                    selectedGalleryFiles
                );

        }

        let finalGalleryImages = [];


        if (editingTourId) {

            finalGalleryImages = [
                ...editingTourImages,
                ...newGalleryUrls
            ];

        } else {

            finalGalleryImages =
                newGalleryUrls;

        }

        const tourData = {

            id:
                editingTourId ||
                generateTourId(
                    document
                        .getElementById("tourName")
                        .value
                        .trim()
                ),

            name:
                document
                    .getElementById("tourName")
                    .value
                    .trim(),

            destination:
                document
                    .getElementById("tourDestination")
                    .value
                    .trim(),

            transport: (document.getElementById("tourTransport")?.value || "").trim(),

            tour_group:
                (document.getElementById("tourGroup")?.value || "").trim() ||
                document.getElementById("tourDestination").value.trim(),

            departure: document.getElementById("tourIsDaily")?.checked ? null : (document.getElementById("tourDeparture")?.value || null),
            is_daily: !!document.getElementById("tourIsDaily")?.checked,
            unlimited_seats: !!document.getElementById("tourUnlimitedSeats")?.checked,

            seats: document.getElementById("tourUnlimitedSeats")?.checked ? Number(oldTour?.seats || 0) : Number(document.getElementById("tourSeats")?.value || 0),

            price:
                Number(
                    document
                        .getElementById("tourPrice")
                        .value
                ),

            image: imageUrl,

            images:
                finalGalleryImages,

            short:
                document
                    .getElementById("tourShort")
                    .value
                    .trim()

        };


        try {

            if (editingTourId) {

                const { error } =
                    await supabaseClient
                        .from("tours")
                        .update({

                            name: tourData.name,

                            destination:
                                tourData.destination,

                            tour_group:
                                tourData.tour_group,

                            transport: tourData.transport,

                            departure:
                                tourData.departure,
                            is_daily: tourData.is_daily,
                            unlimited_seats: tourData.unlimited_seats,

                            seats:
                                tourData.seats,

                            price:
                                tourData.price,

                            image:
                                tourData.image,

                            images:
                                tourData.images,

                            short:
                                tourData.short,

                            updated_at:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            editingTourId
                        );


                if (error) {
                    throw error;
                }


                // =========================
                // XÓA ẢNH CŨ KHỎI STORAGE
                // =========================

                const storageImagesToDelete = [
                    ...imagesToDelete
                ];

                // Nếu thay ảnh đại diện
                if (
                    imageFile &&
                    oldCoverImage &&
                    oldCoverImage !== imageUrl
                ) {
                    storageImagesToDelete.push(
                        oldCoverImage
                    );
                }


                // Không xóa nhầm ảnh vẫn đang được sử dụng
                const finalImagesSet =
                    new Set([
                        tourData.image,
                        ...tourData.images
                    ]);

                const safeImagesToDelete =
                    storageImagesToDelete.filter(
                        imageUrl =>
                            !finalImagesSet.has(imageUrl)
                    );


                if (safeImagesToDelete.length > 0) {

                    try {

                        await deleteTourStorageImages(
                            safeImagesToDelete
                        );

                    } catch (storageError) {

                        console.error(
                            "Storage delete error:",
                            storageError
                        );

                        alert(
                            "Tour đã cập nhật nhưng có ảnh chưa xóa được khỏi Storage.\n\n" +
                            storageError.message
                        );

                    }
                }

                // ✅ THÔNG BÁO THÀNH CÔNG
                alert(
                    oldTour
                        ? "✅ Cập nhật tour thành công!"
                        : "✅ Thêm tour thành công!"
                );

            } else {
                const { error } =
                    await supabaseClient
                        .from("tours")
                        .insert(
                            tourData
                        );


                if (error) {
                    throw error;
                }


                alert(
                    "Thêm tour thành công!"
                );
            }


            const savedTourId = editingTourId || tourData.id;
            try {
                await saveTourVesselAssignments(savedTourId);
            } catch (vesselError) {
                console.error("Save tour vessel packages error:", vesselError);
                alert("Tour đã được lưu, nhưng chưa cập nhật được các gói tàu. Hãy kiểm tra migration tàu thuyền trong Supabase và sửa tour để thử lại.\\n\\n" + vesselError.message);
            }

            closeModal();

            await loadTours();


        } catch (error) {

            console.error(
                "Save tour error:",
                error
            );

            alert(
                "Không thể lưu tour.\n\n" +
                error.message
            );
        }

    }
);


// =========================
// CLOSE MODAL
// =========================

function closeModal() {

    tourModal.classList.add(
        "hidden"
    );

    editingTourId = null;

    editingTourImages = [];

    selectedGalleryFiles = [];

    imagesToDelete = [];

    tourForm.reset();

    imagePreview.innerHTML = "";

    galleryPreview.innerHTML = "";
}


closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelButton.addEventListener(
    "click",
    closeModal
);


// =========================
// REFRESH
// =========================

refreshButton.addEventListener(
    "click",
    loadTours
);


// =========================
// BOOKING EVENTS
// =========================

refreshBookingButton.addEventListener(
    "click",
    loadBookings
);


bookingStatusFilter.addEventListener(
    "change",
    renderBookings
);


// =========================
// LOGOUT
// =========================

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        tours = [];

        showLogin();

    }
);


// =========================
// AUTH STATE
// =========================

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        if (!session) {

            showLogin();

        }

    }
);


// =========================
// INIT
// =========================

checkAuth();