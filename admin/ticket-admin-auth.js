async function ticketAdminCheck() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    // Không có session thì quay về trang admin chính để đăng nhập.
    // Không tạo một màn hình đăng nhập riêng cho trang vé.
    if (!session) {
        window.location.replace("index.html");
        return false;
    }

    // Chỉ kiểm tra quyền để bảo vệ trang. Tuyệt đối không signOut
    // nếu query admin_users gặp lỗi tạm thời, vì signOut sẽ làm mất
    // session dùng chung của toàn bộ trang quản trị.
    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        console.error("Ticket admin permission check error:", error);
        document.getElementById("loginPage")?.classList.add("hidden");
        document.getElementById("dashboardPage")?.classList.remove("hidden");
        return true;
    }

    if (!data) {
        alert("Tài khoản này không có quyền Admin.");
        window.location.replace("index.html");
        return false;
    }

    document.getElementById("loginPage")?.classList.add("hidden");
    document.getElementById("dashboardPage")?.classList.remove("hidden");
    return true;
}

// Trang vé dùng chung phiên đăng nhập với /admin/index.html.
document.addEventListener("DOMContentLoaded", ticketAdminCheck);

document.getElementById("logoutButton")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.replace("index.html");
});
