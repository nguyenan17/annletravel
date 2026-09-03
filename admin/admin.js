let tours = [];

let bookings = [];

let editingTourId = null;

let editingItineraryTourId = null;

let itineraryItems = [];


// =========================
// ELEMENTS
// =========================

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const addTourButton =
    document.getElementById("addTourButton");

const refreshButton =
    document.getElementById("refreshButton");

const tourTableBody =
    document.getElementById("tourTableBody");

const tourModal =
    document.getElementById("tourModal");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelButton =
    document.getElementById("cancelButton");

const tourForm =
    document.getElementById("tourForm");

const bookingTableBody =
    document.getElementById("bookingTableBody");

const refreshBookingButton =
    document.getElementById("refreshBookingButton");

const bookingStatusFilter =
    document.getElementById("bookingStatusFilter");

const itineraryModal =
    document.getElementById("itineraryModal");

const itineraryModalTitle =
    document.getElementById("itineraryModalTitle");

const itineraryTourName =
    document.getElementById("itineraryTourName");

const itineraryList =
    document.getElementById("itineraryList");

const addItineraryDayButton =
    document.getElementById(
        "addItineraryDayButton"
    );

const saveItineraryButton =
    document.getElementById(
        "saveItineraryButton"
    );

const closeItineraryModalButton =
    document.getElementById(
        "closeItineraryModalButton"
    );

const cancelItineraryButton =
    document.getElementById(
        "cancelItineraryButton"
    );


// =========================
// CHECK LOGIN
// =========================

async function checkAuth() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        const isAdmin =
            await checkAdmin(session.user.id);

        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            showLogin();

            loginError.textContent =
                "Tài khoản này không có quyền Admin.";

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

    const { data, error } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

    if (error) {

        console.error(
            "Admin check error:",
            error
        );

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

    await loadTours();

    await loadBookings();
}


// =========================
// LOGIN
// =========================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });

            if (error) {
                throw error;
            }


            const isAdmin =
                await checkAdmin(data.user.id);


            if (!isAdmin) {

                await supabaseClient.auth.signOut();

                throw new Error(
                    "Tài khoản không có quyền Admin"
                );
            }


            loginForm.reset();

            await showDashboard();

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginError.textContent =
                error.message ===
                    "Tài khoản không có quyền Admin"

                    ? "Tài khoản này không có quyền Admin."

                    : "Email hoặc mật khẩu không đúng.";
        }

    }
);


// =========================
// LOAD TOURS
// =========================

async function loadTours() {

    try {

        refreshButton.textContent =
            "Đang tải...";

        refreshButton.disabled = true;


        const { data, error } =
            await supabaseClient
                .from("tours")
                .select("*")
                .order("departure", {
                    ascending: true
                });


        if (error) {

            console.error("SUPABASE LOAD TOURS ERROR:", error);

            alert(
                "Lỗi tải tour:\n\n" +
                error.message +
                "\n\nCode: " +
                error.code
            );

            throw error;
        }


        tours = data || [];


        renderStats();

        renderTours();


    } catch (error) {

        console.error(
            "Load tours error:",
            error
        );

        alert(
            "Không thể tải danh sách tour."
        );

    } finally {

        refreshButton.textContent =
            "↻ Làm mới";

        refreshButton.disabled = false;
    }
}

// =========================
// LOAD BOOKINGS
// =========================

async function loadBookings() {

    try {

        refreshBookingButton.textContent =
            "Đang tải...";

        refreshBookingButton.disabled = true;


        const { data, error } =
            await supabaseClient
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
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        bookings = data || [];


        renderBookings();


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );

        alert(
            "Không thể tải danh sách đăng ký."
        );

    } finally {

        refreshBookingButton.textContent =
            "↻ Làm mới";

        refreshBookingButton.disabled = false;
    }
}


// =========================
// RENDER BOOKINGS
// =========================

function renderBookings() {

    if (!bookingTableBody) {
        return;
    }


    const filter =
        bookingStatusFilter.value;


    let filteredBookings =
        bookings;


    if (filter !== "ALL") {

        filteredBookings =
            bookings.filter(
                booking =>
                    booking.status === filter
            );
    }


    if (filteredBookings.length === 0) {

        bookingTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-booking"
                >
                    Không có đơn đăng ký nào.
                </td>
            </tr>
        `;

        return;
    }


    bookingTableBody.innerHTML =
        filteredBookings
            .map(booking => {

                const tour =
                    tours.find(
                        tour =>
                            tour.id ===
                            booking.tour_id
                    );


                const tourName =
                    tour
                        ? tour.name
                        : "Tour không tồn tại";


                const createdDate =
                    new Intl.DateTimeFormat(
                        "vi-VN",
                        {
                            dateStyle: "short",
                            timeStyle: "short"
                        }
                    ).format(
                        new Date(
                            booking.created_at
                        )
                    );


                const statusText =
                    getBookingStatusText(
                        booking.status
                    );


                const statusClass =
                    getBookingStatusClass(
                        booking.status
                    );


                return `

                    <tr>

                        <td>

                            <div class="booking-customer-name">
                                ${escapeHtml(
                    booking.customer_name
                )}
                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                    tourName
                )}
                        </td>


                        <td>
                            ${booking.people}
                        </td>


                        <td>
                            ${escapeHtml(
                    booking.phone
                )}
                        </td>


                        <td>

                            <div class="booking-note">
                                ${escapeHtml(
                    booking.note || "-"
                )}
                            </div>

                        </td>


                        <td>

                            <div class="booking-date">
                                ${createdDate}
                            </div>

                        </td>


                        <td>

                            <span
                                class="status-badge ${statusClass}"
                            >
                                ${statusText}
                            </span>

                        </td>


                        <td>

                            <div class="action-buttons">

                                <select
                                    class="booking-action-select"
                                    onchange="updateBookingStatus(
                                        '${booking.id}',
                                        this.value
                                    )"
                                >

                                    <option
                                        value="PENDING"
                                        ${booking.status === "PENDING"
                        ? "selected"
                        : ""}
                                    >
                                        Chờ xác nhận
                                    </option>

                                    <option
                                        value="CONFIRMED"
                                        ${booking.status === "CONFIRMED"
                        ? "selected"
                        : ""}
                                    >
                                        Đã xác nhận
                                    </option>

                                    <option
                                        value="CANCELLED"
                                        ${booking.status === "CANCELLED"
                        ? "selected"
                        : ""}
                                    >
                                        Đã hủy
                                    </option>

                                </select>


                                <button
                                    class="booking-delete-button"
                                    onclick="deleteBooking('${booking.id}')"
                                >
                                    Xóa
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            })
            .join("");
}


// =========================
// BOOKING STATUS TEXT
// =========================

function getBookingStatusText(status) {

    switch (status) {

        case "CONFIRMED":
            return "Đã xác nhận";

        case "CANCELLED":
            return "Đã hủy";

        case "PENDING":
        default:
            return "Chờ xác nhận";
    }
}


// =========================
// BOOKING STATUS CLASS
// =========================

function getBookingStatusClass(status) {

    switch (status) {

        case "CONFIRMED":
            return "status-confirmed";

        case "CANCELLED":
            return "status-cancelled";

        case "PENDING":
        default:
            return "status-pending";
    }
}


// =========================
// UPDATE BOOKING STATUS
// =========================

window.updateBookingStatus =
    async function (bookingId, newStatus) {

        const booking =
            bookings.find(
                item =>
                    item.id === bookingId
            );


        if (!booking) {
            return;
        }


        const oldStatus =
            booking.status;


        if (oldStatus === newStatus) {
            return;
        }


        try {

            const { error } =
                await supabaseClient
                    .from("bookings")
                    .update({

                        status:
                            newStatus,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        bookingId
                    );


            if (error) {
                throw error;
            }


            booking.status =
                newStatus;


            renderBookings();


        } catch (error) {

            console.error(
                "Update booking status error:",
                error
            );


            alert(
                "Không thể cập nhật trạng thái.\n\n" +
                error.message
            );


            renderBookings();
        }
    };


// =========================
// DELETE BOOKING
// =========================

window.deleteBooking =
    async function (bookingId) {

        const booking =
            bookings.find(
                item =>
                    item.id === bookingId
            );


        if (!booking) {
            return;
        }


        const confirmed =
            confirm(
                `Bạn có chắc muốn xóa đơn đăng ký của "${booking.customer_name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const { error } =
                await supabaseClient
                    .from("bookings")
                    .delete()
                    .eq(
                        "id",
                        bookingId
                    );


            if (error) {
                throw error;
            }


            alert(
                "Xóa đơn đăng ký thành công!"
            );


            await loadBookings();


        } catch (error) {

            console.error(
                "Delete booking error:",
                error
            );


            alert(
                "Không thể xóa đơn đăng ký.\n\n" +
                error.message
            );
        }
    };


// =========================
// RENDER STATS
// =========================

function renderStats() {

    const totalTours =
        tours.length;


    const totalSeats =
        tours.reduce(
            (total, tour) =>
                total + Number(tour.seats || 0),
            0
        );


    const now =
        new Date();

    const currentMonth =
        now.getMonth() + 1;

    const currentYear =
        now.getFullYear();


    const monthlyTours =
        tours.filter(tour => {

            const date =
                new Date(
                    tour.departure + "T00:00:00"
                );

            return (
                date.getMonth() + 1 === currentMonth &&
                date.getFullYear() === currentYear
            );

        }).length;


    document.getElementById(
        "totalTours"
    ).textContent = totalTours;


    document.getElementById(
        "monthlyTours"
    ).textContent = monthlyTours;


    document.getElementById(
        "totalSeats"
    ).textContent = totalSeats;
}


// =========================
// RENDER TOURS
// =========================

function renderTours() {

    if (tours.length === 0) {

        tourTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Chưa có tour nào.
                </td>
            </tr>
        `;

        return;
    }


    tourTableBody.innerHTML =
        tours.map(tour => {

            const date =
                new Intl.DateTimeFormat(
                    "vi-VN"
                ).format(
                    new Date(
                        tour.departure +
                        "T00:00:00"
                    )
                );


            const price =
                Number(
                    tour.price || 0
                ).toLocaleString(
                    "vi-VN"
                );


            return `

                <tr>

                    <td>

                        <div class="tour-name">
                            ${escapeHtml(tour.name)}
                        </div>

                        <div class="tour-description">
                            ${escapeHtml(tour.short || "")}
                        </div>

                    </td>


                    <td>
                        ${escapeHtml(tour.destination)}
                    </td>


                    <td>
                        ${date}
                    </td>


                    <td>
                        ${tour.seats}
                    </td>


                    <td>
                        ${price} ₫
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="edit-button"
                                onclick="editTour('${tour.id}')"
                            >
                                Sửa
                            </button>

                            <button
                                class="edit-button"
                                onclick="manageItinerary('${tour.id}')"
                            >
                                Lịch trình
                            </button>

                            <button
                                class="delete-button"
                                onclick="deleteTour('${tour.id}')"
                            >
                                Xóa
                            </button>

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

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================
// OPEN ADD MODAL
// =========================

addTourButton.addEventListener(
    "click",
    function () {

        editingTourId = null;

        document.getElementById(
            "modalTitle"
        ).textContent = "Thêm tour";

        tourForm.reset();
        imagePreview.innerHTML = "";

        document.getElementById(
            "tourId"
        ).value = "";

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


        document.getElementById(
            "tourDeparture"
        ).value =
            tour.departure || "";


        document.getElementById(
            "tourSeats"
        ).value =
            tour.seats || 0;


        document.getElementById(
            "tourPrice"
        ).value =
            tour.price || 0;


        document.getElementById(
            "tourImage"
        ).value =
            tour.image || "";

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
                            placeholder="Mô tả lịch trình trong ngày..."
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

            const { error } =
                await supabaseClient
                    .from("tours")
                    .delete()
                    .eq("id", tourId);


            if (error) {
                throw error;
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

async function uploadTourImage(file) {

    if (!file) {
        return null;
    }

    const fileExtension =
        file.name.split(".").pop();

    const fileName =
        `${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
        `tours/${fileName}`;


    const { error: uploadError } =
        await supabaseClient
            .storage
            .from("tour-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
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
            .getPublicUrl(filePath);


    return data.publicUrl;
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

            departure:
                document
                    .getElementById("tourDeparture")
                    .value,

            seats:
                Number(
                    document
                        .getElementById("tourSeats")
                        .value
                ),

            price:
                Number(
                    document
                        .getElementById("tourPrice")
                        .value
                ),

            image: imageUrl,

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

                            departure:
                                tourData.departure,

                            seats:
                                tourData.seats,

                            price:
                                tourData.price,

                            image:
                                tourData.image,

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


                alert(
                    "Cập nhật tour thành công!"
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

    tourForm.reset();

    imagePreview.innerHTML = "";
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