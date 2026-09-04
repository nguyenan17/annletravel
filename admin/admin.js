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


// =========================
// ADMIN SIDEBAR NAVIGATION
// =========================

function showAdminSection(sectionName, updateHash = true) {
    const sectionMap = {
        dashboard: "adminSectionDashboard",
        tours: "adminSectionTours",
        bookings: "adminSectionBookings",
        destinations: "adminSectionDestinations",
        services: "adminSectionServices"
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
                updated_at
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
                <td colspan="8" class="empty-booking">Không có đơn đăng ký nào.</td>
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
    if (tours.length === 0) {
        tourTableBody.innerHTML = `
            <tr>
                <td colspan="6">Chưa có tour nào.</td>
            </tr>
        `;
        return;
    }

    tourTableBody.innerHTML = tours.map(tour => {
        const date = new Intl.DateTimeFormat("vi-VN").format(
            new Date(tour.departure + "T00:00:00")
        );
        const price = Number(tour.price || 0).toLocaleString("vi-VN");

        return `
            <tr>
                <td>
                    <div class="tour-name">${escapeHtml(tour.name)}</div>
                    <div class="tour-description">${escapeHtml(tour.short || "")}</div>
                </td>
                <td>${escapeHtml(tour.destination)}</td>
                <td>${date}</td>
                <td>${tour.seats}</td>
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
// LOAD REMAINING ADMIN LOGIC
// =========================

// Giữ các hàm quản lý tour/ảnh/lịch trình được khai báo ở các script admin khác.
// Nếu các script này đã được load trong index.html, chúng sẽ sử dụng cùng các biến
// và element ở phía trên. Navigation được xử lý hoàn toàn ở đây.
