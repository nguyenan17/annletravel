(function () {
    'use strict';

    const translations = {
        vi: {
            nav: { home: 'Trang chủ', tours: 'Tour', destinations: 'Điểm đến', services: 'Dịch vụ', business: 'Doanh nghiệp', about: 'Về chúng tôi', contact: 'Liên hệ', consult: 'Tư vấn ngay' },
            common: { viewAll: 'Xem tất cả →', explore: 'Khám phá', submit: 'Gửi yêu cầu', vietnamese: 'Tiếng Việt', english: 'English' },
            home: { heroSmall: 'TRAVEL • EXPLORE • EXPERIENCE', heroTitle: 'Khám phá hành trình của riêng bạn', heroDesc: 'Những chuyến đi đáng nhớ, những trải nghiệm tuyệt vời và hành trình dành riêng cho bạn.', exploreTours: 'Khám phá tour', consultation: 'Nhận tư vấn', searchDestination: 'Điểm đến', searchDate: 'Ngày khởi hành', searchPrice: 'Khoảng giá', searchButton: 'Tìm tour', featuredLabel: 'FEATURED TOURS', featuredTitle: 'Tour nổi bật', destinationsLabel: 'DESTINATIONS', destinationsTitle: 'Điểm đến yêu thích', departuresLabel: 'DEPARTURES', departuresTitle: 'Tour khởi hành trong tháng', whyLabel: 'WHY US', whyTitle: 'Vì sao chọn chúng tôi?', aboutLabel: 'ABOUT US', aboutTitle: 'ANNLETRAVEL', aboutText: 'Đồng hành cùng bạn trong những hành trình đáng nhớ, với thông tin tour rõ ràng và hỗ trợ tận tâm.', aboutLink: 'Xem chi tiết về chúng tôi →', helpLabel: 'NEED HELP?', helpTitle: 'Chưa biết chọn tour nào?', helpText: 'Để lại thông tin, nhân viên tư vấn sẽ liên hệ và giúp bạn lựa chọn hành trình phù hợp.', name: 'Họ và tên', phone: 'Số điện thoại', interest: 'Tôi quan tâm đến...', submitConsult: 'Nhận tư vấn', priceAll: 'Tất cả mức giá', under10: 'Dưới 10 triệu', from10to20: '10 - 20 triệu', over20: 'Trên 20 triệu' },
            tours: { label: 'KHÁM PHÁ', title: 'Tất cả hành trình', desc: 'Chọn hành trình phù hợp và bắt đầu chuyến đi tiếp theo của bạn.', filterDestination: 'Điểm đến', allDestinations: 'Tất cả điểm đến', filterDate: 'Ngày khởi hành', filterPrice: 'Khoảng giá', noLimit: 'Không giới hạn', sort: 'Sắp xếp', default: 'Mặc định', priceAsc: 'Giá thấp → cao', priceDesc: 'Giá cao → thấp', dateAsc: 'Khởi hành gần nhất', filter: 'Lọc tour', toursLabel: 'TOUR CỦA CHÚNG TÔI', choose: 'Chọn hành trình của bạn' }
        },
        en: {
            nav: { home: 'Home', tours: 'Tours', destinations: 'Destinations', services: 'Services', business: 'Business', about: 'About us', contact: 'Contact', consult: 'Get advice' },
            common: { viewAll: 'View all →', explore: 'Explore', submit: 'Submit request', vietnamese: 'Tiếng Việt', english: 'English' },
            home: { heroSmall: 'TRAVEL • EXPLORE • EXPERIENCE', heroTitle: 'Discover a journey made for you', heroDesc: 'Memorable trips, inspiring experiences and journeys designed around you.', exploreTours: 'Explore tours', consultation: 'Get consultation', searchDestination: 'Destination', searchDate: 'Departure date', searchPrice: 'Price range', searchButton: 'Search tours', featuredLabel: 'FEATURED TOURS', featuredTitle: 'Featured tours', destinationsLabel: 'DESTINATIONS', destinationsTitle: 'Popular destinations', departuresLabel: 'DEPARTURES', departuresTitle: 'Tours departing this month', whyLabel: 'WHY US', whyTitle: 'Why choose us?', aboutLabel: 'ABOUT US', aboutTitle: 'ANNLETRAVEL', aboutText: 'We accompany you on memorable journeys with clear tour information and dedicated support.', aboutLink: 'Learn more about us →', helpLabel: 'NEED HELP?', helpTitle: 'Not sure which tour to choose?', helpText: 'Leave your details and our consultant will help you find the right journey.', name: 'Full name', phone: 'Phone number', interest: 'I am interested in...', submitConsult: 'Get consultation', priceAll: 'All prices', under10: 'Under 10 million VND', from10to20: '10 - 20 million VND', over20: 'Over 20 million VND' },
            tours: { label: 'EXPLORE', title: 'All journeys', desc: 'Choose the right journey and start your next adventure.', filterDestination: 'Destination', allDestinations: 'All destinations', filterDate: 'Departure date', filterPrice: 'Price range', noLimit: 'No limit', sort: 'Sort by', default: 'Default', priceAsc: 'Price: low → high', priceDesc: 'Price: high → low', dateAsc: 'Nearest departure', filter: 'Filter tours', toursLabel: 'OUR TOURS', choose: 'Choose your journey' }
        }
    };

    const autoPairs = {
        'Trang chủ': 'Home', 'Tour': 'Tours', 'Điểm đến': 'Destinations', 'Dịch vụ': 'Services', 'Doanh nghiệp': 'Business', 'Về chúng tôi': 'About us', 'Liên hệ': 'Contact', 'Tư vấn ngay': 'Get advice',
        'Xem tất cả →': 'View all →', 'Khám phá': 'Explore', 'Gửi yêu cầu': 'Submit request', 'Tất cả': 'All', 'Trong nước': 'Domestic', 'Nước ngoài': 'International',
        'Xem điểm đến →': 'View destination →', 'Xem tour': 'View tour', 'Chỉ từ': 'From', 'Xem dịch vụ': 'View service', 'Xem vé': 'View ticket', 'Xóa bộ lọc': 'Clear filters',
        'Tìm kiếm': 'Search', 'Thương hiệu': 'Brand', 'Loại vé': 'Ticket type', 'Tên vé, địa điểm...': 'Ticket name, location...', 'Tất cả thương hiệu': 'All brands', 'Tất cả điểm đến': 'All destinations',
        'Công viên & khu vui chơi': 'Amusement parks', 'Điểm tham quan': 'Attractions', 'Show & biểu diễn': 'Shows & performances', 'Trải nghiệm': 'Experiences',
        'Khám phá vé': 'Explore tickets', 'Cần tư vấn?': 'Need advice?', 'Chọn thương hiệu': 'Choose a brand', 'Chọn địa điểm': 'Choose a location', 'Chọn trải nghiệm': 'Choose an experience',
        'Đang tải...': 'Loading...', 'Đang được cập nhật.': 'Updating...', 'Chưa có đánh giá.': 'No reviews yet.', 'Chưa có tour phù hợp.': 'No suitable tours found.', 'Chưa có điểm đến phù hợp': 'No suitable destinations found',
        'Hãy thử lựa chọn khu vực khác.': 'Try another region.', 'Không tìm thấy điểm đến.': 'Destination not found.', 'Không tìm thấy tour.': 'Tour not found.', 'Không tìm thấy dịch vụ': 'Service not found',
        'Không thể tải dịch vụ. Vui lòng thử lại sau.': 'Unable to load services. Please try again later.', 'Không có vé phù hợp. Hãy thử thay đổi bộ lọc.': 'No suitable tickets. Try changing the filters.',
        'Vé vui chơi & tham quan': 'Tickets & attractions', 'Ngày khởi hành': 'Departure date', 'Khoảng giá': 'Price range', 'Sắp xếp': 'Sort by', 'Mặc định': 'Default', 'Giá thấp → cao': 'Price: low → high', 'Giá cao → thấp': 'Price: high → low', 'Khởi hành gần nhất': 'Nearest departure', 'Lọc tour': 'Filter tours',
        'Dưới 10 triệu': 'Under 10 million VND', '10 - 20 triệu': '10 - 20 million VND', 'Trên 20 triệu': 'Over 20 million VND', 'Không giới hạn': 'No limit', 'Tất cả mức giá': 'All prices',
        'Vé máy bay': 'Flights', 'Khách sạn': 'Hotels', 'Visa': 'Visa', 'Hộ chiếu': 'Passport', 'Xe đưa đón': 'Transfers', 'Vé tàu': 'Train tickets', 'Bảo hiểm du lịch': 'Travel insurance',
        'Giá tốt': 'Great prices', 'Lịch trình rõ ràng': 'Clear itineraries', 'Hỗ trợ tận tâm': 'Dedicated support', 'Nhiều điểm đến': 'Many destinations',
        'Những con số đáng nhớ': 'Numbers worth remembering', 'Năm hoạt động': 'Years operating', 'Khách hàng': 'Customers', 'Tour đã tổ chức': 'Tours organized', 'Thành tựu & dấu ấn': 'Achievements & milestones', 'Khách hàng nói gì?': 'What our customers say',
        'Tận tâm trong từng hành trình': 'Dedicated to every journey', 'Đồng hành cùng bạn trên mọi hành trình': 'We accompany you on every journey', 'Tầm nhìn': 'Vision', 'Sứ mệnh': 'Mission', 'Giá trị cốt lõi': 'Core values',
        'Không biết nên chọn vé nào?': 'Not sure which ticket to choose?', 'Nhận tư vấn': 'Get consultation', 'Nhận tư vấn & báo giá': 'Get advice & quote', 'Đang gửi...': 'Sending...', 'Công ty TNHH Dịch vụ và Du lịch Ann Lê.': 'ANN LE Travel Services and Tourism Co., Ltd.'
    };

    const originalText = new WeakMap();

    function getLanguage() {
        return localStorage.getItem('annletravel_language') === 'en' ? 'en' : 'vi';
    }

    function getValue(lang, key) {
        return key.split('.').reduce((obj, part) => obj && obj[part], translations[lang]);
    }

    function injectCss() {
        if (document.querySelector('link[data-annle-i18n]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/i18n.css';
        link.dataset.annleI18n = '1';
        document.head.appendChild(link);
    }

    function translateTextNode(node, lang) {
        const raw = originalText.has(node) ? originalText.get(node) : node.nodeValue;
        const text = raw.trim();
        if (!text) return;
        originalText.set(node, raw);

        let translated = raw;
        const leading = raw.match(/^\s*/)?.[0] || '';
        const trailing = raw.match(/\s*$/)?.[0] || '';
        const core = text;

        if (lang === 'en') {
            if (autoPairs[core]) translated = leading + autoPairs[core] + trailing;
            else {
                let m = core.match(/^Còn\s+(\d+)\s+chỗ$/);
                if (m) translated = leading + `${m[1]} seats left` + trailing;
                m = core.match(/^(\d+)\s+chỗ$/);
                if (m) translated = leading + `${m[1]} seats` + trailing;
                m = core.match(/^Tours?\s+tại\s+(.+)$/);
                if (m) translated = leading + `Tours in ${m[1]}` + trailing;
                m = core.match(/^Chưa có tour tại\s+(.+)$/);
                if (m) translated = leading + `No tours in ${m[1]}` + trailing;
                m = core.match(/^Tour tại\s+(.+)$/);
                if (m) translated = leading + `Tours in ${m[1]}` + trailing;
            }
        } else {
            const reverse = Object.entries(autoPairs).find(([, en]) => en === core);
            if (reverse) translated = leading + reverse[0] + trailing;
            else {
                let m = core.match(/^(\d+)\s+seats left$/);
                if (m) translated = leading + `Còn ${m[1]} chỗ` + trailing;
                m = core.match(/^(\d+)\s+seats$/);
                if (m) translated = leading + `${m[1]} chỗ` + trailing;
                m = core.match(/^Tours in\s+(.+)$/);
                if (m) translated = leading + `Tour tại ${m[1]}` + trailing;
                m = core.match(/^No tours in\s+(.+)$/);
                if (m) translated = leading + `Chưa có tour tại ${m[1]}` + trailing;
            }
        }
        if (node.nodeValue !== translated) node.nodeValue = translated;
    }

    function translateTextNodes(root, lang) {
        const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            const parent = node.parentElement;
            if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return;
            if (parent?.closest('[data-i18n]')) return;
            translateTextNode(node, lang);
        });
    }

    function applyLanguage(lang) {
        const selected = lang === 'en' ? 'en' : 'vi';
        localStorage.setItem('annletravel_language', selected);
        document.documentElement.lang = selected;
        injectCss();

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const value = getValue(selected, el.dataset.i18n);
            if (value !== undefined) el.textContent = value;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const value = getValue(selected, el.dataset.i18nPlaceholder);
            if (value !== undefined) el.placeholder = value;
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const value = getValue(selected, el.dataset.i18nTitle);
            if (value !== undefined) el.title = value;
        });
        document.querySelectorAll('[data-lang-switch]').forEach(el => el.classList.toggle('active', el.dataset.langSwitch === selected));
        translateTextNodes(document.body, selected);
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: selected } }));
    }

    function createSwitcher() {
        if (document.querySelector('.language-switcher')) return;
        const headerContainer = document.querySelector('.header-container, .header-inner');
        if (!headerContainer) return;
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.setAttribute('aria-label', 'Language');
        switcher.innerHTML = '<button type="button" data-lang-switch="vi">🇻🇳 VI</button><span>|</span><button type="button" data-lang-switch="en">🇬🇧 EN</button>';
        switcher.addEventListener('click', event => {
            const button = event.target.closest('[data-lang-switch]');
            if (button) applyLanguage(button.dataset.langSwitch);
        });

        // Keep the language switcher on the far right of the header,
        // immediately after the main consultation CTA button.
        const headerButton = headerContainer.querySelector('.btn-header, .btn-primary');
        if (headerButton) headerButton.insertAdjacentElement('afterend', switcher);
        else headerContainer.appendChild(switcher);
    }

    function init() {
        createSwitcher();
        applyLanguage(getLanguage());
    }

    window.AnnLeI18n = { translations, getLanguage, applyLanguage, getValue };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    const observer = new MutationObserver(mutations => {
        const lang = getLanguage();
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                translateTextNodes(node, lang);
            });
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
