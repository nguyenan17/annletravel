/* ANNLETRAVEL - SHARED PUBLIC HEADER / FOOTER */
(function () {
    "use strict";

    if (window.__annleSharedLayoutInitialized) return;
    window.__annleSharedLayoutInitialized = true;
    if (window.location.pathname.includes("/admin/")) return;

    const LANGUAGES = {
        vi: { flag: "🇻🇳", name: "Tiếng Việt", code: "vn" },
        en: { flag: "🇬🇧", name: "English", code: "gb" },
        zh: { flag: "🇨🇳", name: "中文", code: "cn" },
        ko: { flag: "🇰🇷", name: "한국어", code: "kr" },
        ja: { flag: "🇯🇵", name: "日本語", code: "jp" }
    };

    const addCss = href => {
        if (document.querySelector(`link[href*="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    };

    addCss("css/i18n.css");
    addCss("css/audience.css");
    addCss("css/audience-pages.css");
    addCss("css/public-pages.css");

    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const isBusiness = file === "business.html" || document.body.classList.contains("business-page");
    const active = key => ({
        home: isBusiness ? file === "business.html" : file === "ca-nhan.html",
        tours: !isBusiness && (file === "tours.html" || file === "tour-detail.html"),
        destinations: file === "destinations.html" || file === "destination.html",
        services: !isBusiness && ["services.html", "service-detail.html", "tickets.html", "ticket-detail.html"].includes(file),
        blog: !isBusiness && (file === "blog.html" || file === "blog-detail.html"),
        business: file === "business.html",
        about: file === "about.html"
    }[key] ? "active" : "");

    const destinationMenu = `<div class="nav-dropdown"><a href="destinations.html" class="${active("destinations")}" data-i18n="nav.destinations">Điểm đến <span class="nav-chevron">▾</span></a><ul id="destinationMenu" class="dropdown-menu"></ul></div>`;
    const serviceMenu = `<div class="nav-dropdown"><a href="services.html" class="${active("services")}" data-i18n="nav.services">Dịch vụ <span class="nav-chevron">▾</span></a><ul class="dropdown-menu service-menu"><li><a href="services.html?category=flights">✈️ Vé máy bay</a></li><li><a href="services.html?category=hotels">🏨 Khách sạn</a></li><li><a href="services.html?category=visa">🛂 Visa</a></li><li><a href="services.html?category=passport">🪪 Hộ chiếu</a></li><li><a href="tickets.html">🎫 Vé vui chơi &amp; tham quan</a></li><li><a href="services.html?category=transport">🚗 Xe đưa đón</a></li><li><a href="services.html?category=trains">🚆 Vé tàu</a></li><li><a href="services.html?category=insurance">🛡️ Bảo hiểm du lịch</a></li></ul></div>`;

    function getCurrentLanguage() {
        const stored = localStorage.getItem("annletravel_language");
        return LANGUAGES[stored] ? stored : "vi";
    }

    function renderLanguageSwitcher() {
        return `<div class="language-switcher" data-annle-shared-language-switcher aria-label="Language">
            <button type="button" class="language-current" aria-expanded="false" aria-haspopup="true" aria-label="Language">
                <span class="language-flag" aria-hidden="true"></span>
            </button>
            <div class="language-options" role="menu">
                ${Object.entries(LANGUAGES).map(([lang, item]) => `<button type="button" data-shared-lang="${lang}" role="menuitem" aria-label="${item.name}"><span class="language-option-flag" aria-hidden="true"></span></button>`).join("")}
            </div>
        </div>`;
    }

    function setLanguageUi(lang) {
        const selected = LANGUAGES[lang] ? lang : "vi";
        const box = document.querySelector("[data-annle-shared-language-switcher]");
        if (!box) return;

        // The flag is rendered by CSS only. Never inject emoji text or inline background styles here.
        box.dataset.currentLang = selected;
        box.querySelectorAll("[data-shared-lang]").forEach(button => {
            button.classList.toggle("active", button.dataset.sharedLang === selected);
        });
    }

    function applyLanguage(lang) {
        const selected = LANGUAGES[lang] ? lang : "vi";
        if (selected === "vi" || selected === "en") {
            if (window.AnnLeI18n?.applyLanguage) window.AnnLeI18n.applyLanguage(selected);
            else {
                localStorage.setItem("annletravel_language", selected);
                window.location.reload();
            }
        } else if (window.AnnLeMultiI18n?.apply) {
            window.AnnLeMultiI18n.apply(selected);
        } else {
            localStorage.setItem("annletravel_language", selected);
            window.location.reload();
        }
        setLanguageUi(selected);
    }

    const header = document.querySelector("header.header");
    if (header) {
        const homeHref = isBusiness ? "business.html" : "ca-nhan.html";
        const contactHref = isBusiness ? "business.html#businessContact" : "ca-nhan.html#contact";
        const switchHref = isBusiness ? "ca-nhan.html" : "business.html";
        const switchLabel = isBusiness ? "Cá nhân" : "Doanh nghiệp";
        const menu = isBusiness
            ? `<a href="business.html" class="${active("home")}">Trang chủ</a><a href="business.html#businessServices">Giải pháp</a>${destinationMenu}<a href="business.html#businessProcess">Quy trình</a><a href="about.html" class="${active("about")}">Về chúng tôi</a><a href="blog.html" class="${active("blog")}">Blog</a><a href="${contactHref}">Tư vấn</a>`
            : `<a href="${homeHref}" class="${active("home")}" data-i18n="nav.home">Trang chủ</a><a href="tours.html" class="${active("tours")}" data-i18n="nav.tours">Tour</a>${destinationMenu}${serviceMenu}<a href="blog.html" class="${active("blog")}" data-i18n="nav.blog">Blog</a><a href="about.html" class="${active("about")}" data-i18n="nav.about">Về chúng tôi</a><a href="${contactHref}" data-i18n="nav.contact">Liên hệ</a>`;

        header.className = `header audience-header ${isBusiness ? "business-shared-header" : "personal-shared-header"}`;
        header.innerHTML = `<div class="container header-container"><a href="${homeHref}" class="logo"><img src="images/logo.png" alt="ANNLETRAVEL"></a><nav class="menu">${menu}</nav><div class="public-header-actions">${renderLanguageSwitcher()}<a href="${switchHref}" class="audience-switch-btn">${switchLabel}</a><a href="${contactHref}" class="btn btn-header" data-i18n="nav.consult">Tư vấn ngay</a></div></div>`;

        const languageSwitcher = header.querySelector("[data-annle-shared-language-switcher]");
        const currentButton = languageSwitcher?.querySelector(".language-current");

        currentButton?.addEventListener("click", event => {
            event.preventDefault();
            const open = languageSwitcher.classList.toggle("open");
            currentButton.setAttribute("aria-expanded", String(open));
        });

        languageSwitcher?.querySelectorAll("[data-shared-lang]").forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                applyLanguage(button.dataset.sharedLang);
                languageSwitcher.classList.remove("open");
                currentButton?.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", event => {
            if (languageSwitcher && !languageSwitcher.contains(event.target)) {
                languageSwitcher.classList.remove("open");
                currentButton?.setAttribute("aria-expanded", "false");
            }
        });

        window.addEventListener("languageChanged", event => setLanguageUi(event.detail?.language));
        setLanguageUi(getCurrentLanguage());
    }

    const footer = document.querySelector("footer");
    if (footer) footer.innerHTML = `<div class="container footer-container"><div><a href="${isBusiness ? "business.html" : "ca-nhan.html"}" class="footer-logo-link"><img src="images/logo.png" class="footer-logo-image" alt="ANNLETRAVEL"></a><p>CÔNG TY TNHH DỊCH VỤ VÀ DU LỊCH ANN LÊ.</p></div><div><h4>Khám phá</h4><a href="${isBusiness ? "business.html#businessServices" : "tours.html"}">${isBusiness ? "Giải pháp doanh nghiệp" : "Tất cả tour"}</a><a href="destinations.html">Điểm đến</a><a href="${isBusiness ? "business.html" : "services.html"}">${isBusiness ? "Trang doanh nghiệp" : "Dịch vụ"}</a><a href="blog.html">Blog / Kinh nghiệm</a><a href="about.html">Về chúng tôi</a></div><div><h4>Liên hệ</h4><p>Hotline: 0862421655</p><p>Email: dulichannle@gmail.com</p><p>Số 136 phố Hàng Bạc, Phường Hoàn Kiếm, Thành phố Hà Nội</p></div></div><div class="copyright">© 2026 ANNLETRAVEL. All rights reserved.</div>`;

    const style = document.createElement("style");
    style.textContent = `.audience-header{position:absolute;top:0;left:0;right:0;z-index:100}.audience-header .header-container{min-height:88px;gap:20px}.audience-header .logo{flex-shrink:0}.audience-header .logo img{width:72px;height:72px;object-fit:contain;display:block}.audience-header .menu>a.active,.audience-header .menu .nav-dropdown>a.active{color:#fff;background:rgba(255,255,255,.12)}.audience-header .menu>a.active::after,.audience-header .menu .nav-dropdown>a.active::after{transform:scaleX(1)}.audience-header .nav-chevron{font-size:10px;margin-left:5px;opacity:.75}.public-header-actions{display:flex;align-items:center;gap:9px;flex-shrink:0}.audience-header .language-switcher{position:relative;display:flex;align-items:center;visibility:visible!important;opacity:1!important;margin:0!important;order:1;z-index:1100}.audience-header .language-current{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:32px!important;min-width:32px!important;height:32px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:transparent!important;font-size:0!important;line-height:1!important;cursor:pointer!important;transform:none!important;transition:none!important;appearance:none!important;-webkit-appearance:none!important}.audience-header .language-current:hover,.audience-header .language-current:focus,.audience-header .language-current:active{width:32px!important;min-width:32px!important;height:32px!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:transparent!important;transform:none!important;transition:none!important}.audience-header .language-flag{display:none!important}.audience-header .language-options{right:0!important;top:calc(100% + 7px)!important;min-width:0!important;width:52px!important;padding:6px!important;background:#fff!important;border:1px solid #e1eaf0!important;border-radius:10px!important;box-shadow:0 14px 35px rgba(0,0,0,.18)!important}.audience-header .language-switcher:not(.open) .language-options{display:none!important}.audience-header .language-switcher.open .language-options{display:flex!important;flex-direction:column!important;gap:2px!important}.audience-header .language-options button{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:34px!important;padding:5px!important;border:0!important;border-radius:7px!important;background:transparent!important;color:transparent!important;font-size:0!important;line-height:0!important;cursor:pointer!important;transform:none!important;transition:none!important}.audience-header .language-options button:hover,.audience-header .language-options button:focus,.audience-header .language-options button:active,.audience-header .language-options button.active{transform:none!important;font-size:0!important;background:#f3f6fa!important}.audience-header .language-option-flag{display:none!important}.audience-header .audience-switch-btn{display:inline-flex;align-items:center;justify-content:center;min-width:104px;padding:10px 15px;border-radius:999px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.32);color:#fff;font-size:12px;font-weight:800;white-space:nowrap;transition:.2s ease}.audience-header .audience-switch-btn:hover{background:#fff;color:var(--primary);transform:translateY(-2px)}.audience-header .btn-header{display:inline-flex!important;padding:10px 16px!important}.business-shared-header .audience-switch-btn{background:#eaf7fd;color:#005B8F;border-color:#eaf7fd}.business-shared-header .audience-switch-btn:hover{background:#fff;color:#0077B6}.business-page .business-switch{display:none!important}.footer-logo-link{display:inline-flex;align-items:center;margin-bottom:10px}.footer-logo-image{width:74px;height:74px;object-fit:contain;display:block}.footer-container>div:nth-child(2) a{display:block;margin:5px 0;color:rgba(255,255,255,.68);font-size:14px}@media(max-width:1100px){.audience-header .menu>a,.audience-header .menu>.nav-dropdown>a{padding:0 7px;font-size:10px}.public-header-actions{gap:6px}.audience-header .audience-switch-btn{min-width:auto;padding:9px 11px}.audience-header .btn-header{padding:9px 12px!important}}@media(max-width:820px){.audience-header .header-container{min-height:0;display:grid;grid-template-columns:1fr auto;grid-template-areas:"logo actions" "menu menu";align-items:center;gap:6px 10px;padding:8px 0}.audience-header .logo{grid-area:logo}.audience-header .logo img{width:54px;height:54px}.public-header-actions{grid-area:actions;display:flex!important;align-items:center;justify-content:flex-end;gap:5px}.public-header-actions .audience-switch-btn{display:inline-flex!important;min-width:0;padding:8px 10px;font-size:10px}.audience-header .btn-header{display:inline-flex!important;padding:8px 10px!important;font-size:10px;white-space:nowrap}.audience-header .language-switcher{display:flex!important;order:1;margin:0!important}.audience-header .language-current{width:32px!important;min-width:32px!important;height:30px!important}.audience-header .menu{grid-area:menu;width:100%;display:flex;justify-content:flex-start;overflow-x:auto;padding:4px 0 5px;scrollbar-width:none;gap:5px}.audience-header .menu::-webkit-scrollbar{display:none}.audience-header .menu>a,.audience-header .menu>.nav-dropdown>a{font-size:12px;min-height:36px;flex-shrink:0;padding:0 7px}}@media(max-width:650px){.audience-header .header-container{padding:7px 10px}.audience-header .logo img{width:48px;height:48px}.public-header-actions{gap:3px}.public-header-actions .audience-switch-btn{padding:7px 8px;font-size:9px}.audience-header .btn-header{padding:7px 8px!important;font-size:9px}.audience-header .language-current,.audience-header .language-current:hover,.audience-header .language-current:focus,.audience-header .language-current:active{width:30px!important;min-width:30px!important;height:28px!important}.audience-header .menu{gap:4px}.audience-header .menu>a,.audience-header .menu>.nav-dropdown>a{font-size:12px;padding:0 6px}.footer-logo-image{width:62px;height:62px}}`;
    document.head.appendChild(style);

    async function renderSharedDestinationMenu() {
        const menu = document.getElementById("destinationMenu");
        if (!menu || menu.dataset.loaded === "true") return;

        if (typeof window.renderDestinationMenu === "function") {
            await window.renderDestinationMenu();
            menu.dataset.loaded = "true";
            return;
        }

        let client = null;
        try {
            if (typeof supabaseClient !== "undefined" && supabaseClient) client = supabaseClient;
        } catch (_) {}
        client = client || window.supabaseClient || null;
        if (!client) return;

        try {
            const { data, error } = await client.from("destinations").select("slug,name,region").order("sort_order", { ascending: true }).order("name", { ascending: true });
            if (error || !data) return;
            const escape = value => String(value || "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
            const domestic = data.filter(item => item.region === "domestic");
            const international = data.filter(item => item.region === "international");
            const group = (title, region, items) => `<li class="destination-menu-group"><strong>${title}</strong>${items.map(item => `<a href="destinations.html?region=${encodeURIComponent(region)}&destination=${encodeURIComponent(item.slug)}">${escape(item.name)}</a>`).join("")}<a class="destination-menu-all" href="destinations.html?region=${region}">Xem tất cả →</a></li>`;
            menu.innerHTML = group("🇻🇳 Trong nước", "domestic", domestic) + group("🌏 Nước ngoài", "international", international);
            menu.dataset.loaded = "true";
        } catch (error) {
            console.warn("Không thể tải menu điểm đến:", error);
        }
    }

    renderSharedDestinationMenu();
})();