/* ANNLETRAVEL - SHARED PUBLIC HEADER / FOOTER */
(function () {
    "use strict";
    if (window.location.pathname.includes("/admin/")) return;

    // Ensure the shared language selector CSS is available on every public page.
    if (!document.querySelector('link[href*="css/i18n.css"]')) {
        const i18nCss = document.createElement("link");
        i18nCss.rel = "stylesheet";
        i18nCss.href = "css/i18n.css";
        document.head.appendChild(i18nCss);
    }

    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const active = key => {
        const map = {
            home: file === "" || file === "index.html",
            tours: file === "tours.html" || file === "tour-detail.html",
            destinations: file === "destinations.html" || file === "destination.html",
            services: ["services.html", "service-detail.html", "tickets.html", "ticket-detail.html"].includes(file),
            business: file === "business.html",
            about: file === "about.html"
        };
        return map[key] ? "active" : "";
    };

    const header = document.querySelector("header.header");
    if (header) {
        header.innerHTML = `
            <div class="container header-container">
                <a href="index.html" class="logo"><img src="images/logo.png" alt="ANNLETRAVEL"></a>
                <nav class="menu">
                    <a href="index.html" class="${active("home")}" data-i18n="nav.home">Trang chủ</a>
                    <a href="tours.html" class="${active("tours")}" data-i18n="nav.tours">Tour</a>
                    <div class="nav-dropdown">
                        <a href="destinations.html" class="${active("destinations")}" data-i18n="nav.destinations">Điểm đến ▾</a>
                        <ul id="destinationMenu" class="dropdown-menu"></ul>
                    </div>
                    <div class="nav-dropdown">
                        <a href="services.html" class="${active("services")}" data-i18n="nav.services">Dịch vụ ▾</a>
                        <ul class="dropdown-menu service-menu">
                            <li><a href="services.html?category=flights">✈️ Vé máy bay</a></li>
                            <li><a href="services.html?category=hotels">🏨 Khách sạn</a></li>
                            <li><a href="services.html?category=visa">🛂 Visa</a></li>
                            <li><a href="services.html?category=passport">🪪 Hộ chiếu</a></li>
                            <li><a href="tickets.html">🎫 Vé vui chơi &amp; tham quan</a></li>
                            <li><a href="services.html?category=transport">🚗 Xe đưa đón</a></li>
                            <li><a href="services.html?category=trains">🚆 Vé tàu</a></li>
                            <li><a href="services.html?category=insurance">🛡️ Bảo hiểm du lịch</a></li>
                        </ul>
                    </div>
                    <a href="business.html" class="${active("business")}" data-i18n="nav.business">Doanh nghiệp</a>
                    <a href="about.html" class="${active("about")}" data-i18n="nav.about">Về chúng tôi</a>
                    <a href="index.html#contact" data-i18n="nav.contact">Liên hệ</a>
                </nav>
                <div class="language-switcher" aria-label="Language selector"></div>
                <a href="index.html#contact" class="btn btn-header" data-i18n="nav.consult">Tư vấn ngay</a>
            </div>`;
    }

    const footer = document.querySelector("footer");
    if (footer) {
        footer.innerHTML = `
            <div class="container footer-container">
                <div>
                    <a href="index.html" class="footer-logo-link"><img src="images/logo.png" class="footer-logo-image" alt="ANNLETRAVEL"></a>
                    <p>CÔNG TY TNHH DỊCH VỤ VÀ DU LỊCH ANN LÊ.</p>
                </div>
                <div>
                    <h4>Khám phá</h4>
                    <a href="tours.html">Tất cả tour</a>
                    <a href="destinations.html">Điểm đến</a>
                    <a href="services.html">Dịch vụ</a>
                    <a href="about.html">Về chúng tôi</a>
                </div>
                <div>
                    <h4>Liên hệ</h4>
                    <p>Hotline: 0862421655</p>
                    <p>Email: dulichannle@gmail.com</p>
                    <p>Số 136 phố Hàng Bạc, Phường Hoàn Kiếm, Thành phố Hà Nội</p>
                </div>
            </div>
            <div class="copyright">© 2026 ANNLETRAVEL. All rights reserved.</div>`;
    }

    const style = document.createElement("style");
    style.textContent = `
        .header .logo{display:flex;align-items:center}
        .header .logo img{width:82px;height:82px;object-fit:contain;display:block}
        .header .menu > a.active,.header .menu .nav-dropdown > a.active{color:var(--primary)}
        .footer-logo-link{display:inline-flex;align-items:center;margin-bottom:10px}
        .footer-logo-image{width:74px;height:74px;object-fit:contain;display:block}
        @media(max-width:900px){.header-container{flex-wrap:wrap}.language-switcher{order:3}.btn-header{order:4}}
        @media(max-width:650px){.header .logo img{width:68px;height:68px}.footer-logo-image{width:62px;height:62px}}
    `;
    document.head.appendChild(style);

    if (typeof window.renderDestinationMenu === "function") {
        window.renderDestinationMenu();
    }
})();
