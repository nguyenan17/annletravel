(function () {
    'use strict';

    const translations = {
        vi: {
            nav: { home: 'Trang chủ', tours: 'Tour', destinations: 'Điểm đến', services: 'Dịch vụ', business: 'Doanh nghiệp', about: 'Về chúng tôi', contact: 'Liên hệ', consult: 'Tư vấn ngay' },
            common: { viewAll: 'Xem tất cả →', explore: 'Khám phá', submit: 'Gửi yêu cầu', vietnamese: 'Tiếng Việt', english: 'English' },
            home: { heroSmall: 'TRAVEL • EXPLORE • EXPERIENCE', heroTitle: 'Khám phá hành trình của riêng bạn', heroDesc: 'Những chuyến đi đáng nhớ, những trải nghiệm tuyệt vời và hành trình dành riêng cho bạn.', exploreTours: 'Khám phá tour', consultation: 'Nhận tư vấn', searchDestination: 'Điểm đến', searchDate: 'Ngày khởi hành', searchPrice: 'Khoảng giá', searchButton: 'Tìm tour', featuredLabel: 'FEATURED TOURS', featuredTitle: 'Tour nổi bật', destinationsLabel: 'DESTINATIONS', destinationsTitle: 'Điểm đến yêu thích', departuresLabel: 'DEPARTURES', departuresTitle: 'Tour khởi hành trong tháng', whyLabel: 'WHY US', whyTitle: 'Vì sao chọn chúng tôi?', aboutLabel: 'ABOUT US', aboutTitle: 'ANNLETRAVEL', aboutText: 'Đồng hành cùng bạn trong những hành trình đáng nhớ, với thông tin tour rõ ràng và hỗ trợ tận tâm.', aboutLink: 'Xem chi tiết về chúng tôi →', helpLabel: 'NEED HELP?', helpTitle: 'Chưa biết chọn tour nào?', helpText: 'Để lại thông tin, nhân viên tư vấn sẽ liên hệ và giúp bạn lựa chọn hành trình phù hợp.', name: 'Họ và tên', phone: 'Số điện thoại', interest: 'Tôi quan tâm đến...', submitConsult: 'Nhận tư vấn', priceAll: 'Tất cả mức giá', under10: 'Dưới 10 triệu', from10to20: '10 - 20 triệu', over20: 'Trên 20 triệu' },
            tours: { label: 'KHÁM PHÁ', title: 'Tất cả hành trình', desc: 'Chọn hành trình phù hợp và bắt đầu chuyến đi tiếp theo của bạn.', filterDestination: 'Điểm đến', allDestinations: 'Tất cả điểm đến', filterDate: 'Ngày khởi hành', filterPrice: 'Khoảng giá', noLimit: 'Không giới hạn', sort: 'Sắp xếp', default: 'Mặc định', priceAsc: 'Giá thấp → cao', priceDesc: 'Giá cao → thấp', dateAsc: 'Khởi hành gần nhất', filter: 'Lọc tour', toursLabel: 'TOUR CỦA CHÚNG TÔI', choose: 'Chọn hành trình của bạn' },
            pages: {
                allDestinations: 'Tất cả điểm đến', domestic: 'Trong nước', international: 'Nước ngoài', explore: 'KHÁM PHÁ', exploreDestination: 'Xem điểm đến →', allTours: 'Tất cả tour', backServices: '← Quay lại dịch vụ', viewService: 'Xem dịch vụ', from: 'Từ', seatsLeft: 'Còn {n} chỗ', seats: '{n} chỗ', viewTour: 'Xem tour', noTours: 'Chưa có tour phù hợp.', noDestination: 'Chưa có điểm đến phù hợp', noDestinationDesc: 'Hãy thử lựa chọn khu vực khác.', noDestinationFound: 'Không tìm thấy điểm đến.', noTourFound: 'Không tìm thấy tour.', loading: 'Đang tải...', updateLater: 'Đang được cập nhật.', contact: 'Liên hệ', consult: 'Nhận tư vấn', search: 'Tìm kiếm', clearFilters: 'Xóa bộ lọc', all: 'Tất cả', brand: 'Thương hiệu', destination: 'Điểm đến', type: 'Loại vé', choices: '{n} lựa chọn', noTickets: 'Không có vé phù hợp. Hãy thử thay đổi bộ lọc.', ticketNamePlaceholder: 'Tên vé, địa điểm...', ticketBrandAll: 'Tất cả thương hiệu', ticketDestinationAll: 'Tất cả điểm đến', ticketAllTypes: 'Tất cả', ticketTypeAmusement: 'Công viên & khu vui chơi', ticketTypeAttraction: 'Điểm tham quan', ticketTypeShow: 'Show & biểu diễn', ticketTypeExperience: 'Trải nghiệm', viewTicket: 'Xem vé', thingsToDo: 'THINGS TO DO', howItWorks: 'HOW IT WORKS', ticketCollection: 'TICKET COLLECTION', needAdvice: 'Cần tư vấn?', discoverTickets: 'Khám phá vé', chooseTicket: 'Chọn vé theo cách đơn giản hơn', findTicket: 'Tìm vé phù hợp', noTicketType: 'Vé vui chơi & tham quan', businessAdvice: 'Nhận tư vấn & báo giá', sending: 'Đang gửi...', sent: 'Đã gửi yêu cầu.', tryAgain: 'Vui lòng thử lại sau.'
            },
            about: { kicker: 'ABOUT US', title: 'Về ANNLETRAVEL', subtitle: 'Niềm tin trên mọi hành trình', badge: '✦ Tận tâm trong từng hành trình', story: 'OUR STORY', storyTitle: 'Đồng hành cùng bạn trên mọi hành trình', storyText: 'Chúng tôi tin rằng một chuyến đi đáng nhớ không chỉ nằm ở điểm đến, mà còn ở cách hành trình được chuẩn bị và những trải nghiệm bạn mang về.', vision: 'Tầm nhìn', mission: 'Sứ mệnh', values: 'Giá trị cốt lõi', numbers: 'ANNLETRAVEL IN NUMBERS', numbersTitle: 'Những con số đáng nhớ', years: 'Năm hoạt động', customers: 'Khách hàng', tours: 'Tour đã tổ chức', destinations: 'Điểm đến', achievements: 'ACHIEVEMENTS', achievementsTitle: 'Thành tựu & dấu ấn', customerLove: 'CUSTOMER LOVE', reviewsTitle: 'Khách hàng nói gì?', loading: 'Đang tải...', updated: 'Đang được cập nhật.', noReviews: 'Chưa có đánh giá.' },
            business: { kicker: 'BUSINESS TRAVEL', title: 'Giải pháp du lịch cho doanh nghiệp', submit: 'Nhận tư vấn & báo giá', sending: 'Đang gửi...' },
            services: { kicker: 'SERVICES', title: 'Dịch vụ đồng hành trọn hành trình', desc: 'Vé máy bay, khách sạn, visa, hộ chiếu, vé tham quan và các dịch vụ du lịch được tư vấn theo nhu cầu của bạn.', all: 'Tất cả', view: 'Xem dịch vụ', notFound: 'Không tìm thấy dịch vụ', error: 'Không thể tải dịch vụ. Vui lòng thử lại sau.' }
        },
        en: {
            nav: { home: 'Home', tours: 'Tours', destinations: 'Destinations', services: 'Services', business: 'Business', about: 'About us', contact: 'Contact', consult: 'Get advice' },
            common: { viewAll: 'View all →', explore: 'Explore', submit: 'Submit request', vietnamese: 'Tiếng Việt', english: 'English' },
            home: { heroSmall: 'TRAVEL • EXPLORE • EXPERIENCE', heroTitle: 'Discover a journey made for you', heroDesc: 'Memorable trips, inspiring experiences and journeys designed around you.', exploreTours: 'Explore tours', consultation: 'Get consultation', searchDestination: 'Destination', searchDate: 'Departure date', searchPrice: 'Price range', searchButton: 'Search tours', featuredLabel: 'FEATURED TOURS', featuredTitle: 'Featured tours', destinationsLabel: 'DESTINATIONS', destinationsTitle: 'Popular destinations', departuresLabel: 'DEPARTURES', departuresTitle: 'Tours departing this month', whyLabel: 'WHY US', whyTitle: 'Why choose us?', aboutLabel: 'ABOUT US', aboutTitle: 'ANNLETRAVEL', aboutText: 'We accompany you on memorable journeys with clear tour information and dedicated support.', aboutLink: 'Learn more about us →', helpLabel: 'NEED HELP?', helpTitle: 'Not sure which tour to choose?', helpText: 'Leave your details and our consultant will help you find the right journey.', name: 'Full name', phone: 'Phone number', interest: 'I am interested in...', submitConsult: 'Get consultation', priceAll: 'All prices', under10: 'Under 10 million VND', from10to20: '10 - 20 million VND', over20: 'Over 20 million VND' },
            tours: { label: 'EXPLORE', title: 'All journeys', desc: 'Choose the right journey and start your next adventure.', filterDestination: 'Destination', allDestinations: 'All destinations', filterDate: 'Departure date', filterPrice: 'Price range', noLimit: 'No limit', sort: 'Sort by', default: 'Default', priceAsc: 'Price: low → high', priceDesc: 'Price: high → low', dateAsc: 'Nearest departure', filter: 'Filter tours', toursLabel: 'OUR TOURS', choose: 'Choose your journey' },
            pages: { allDestinations: 'All destinations', domestic: 'Domestic', international: 'International', explore: 'EXPLORE', exploreDestination: 'View destination →', allTours: 'All tours', backServices: '← Back to services', viewService: 'View service', from: 'From', seatsLeft: '{n} seats left', seats: '{n} seats', viewTour: 'View tour', noTours: 'No suitable tours found.', noDestination: 'No suitable destinations found', noDestinationDesc: 'Try another region.', noDestinationFound: 'Destination not found.', noTourFound: 'Tour not found.', loading: 'Loading...', updateLater: 'Updating...', contact: 'Contact', consult: 'Get advice', search: 'Search', clearFilters: 'Clear filters', all: 'All', brand: 'Brand', destination: 'Destination', type: 'Ticket type', choices: '{n} choices', noTickets: 'No suitable tickets. Try changing the filters.', ticketNamePlaceholder: 'Ticket name, location...', ticketBrandAll: 'All brands', ticketDestinationAll: 'All destinations', ticketAllTypes: 'All', ticketTypeAmusement: 'Amusement parks', ticketTypeAttraction: 'Attractions', ticketTypeShow: 'Shows & performances', ticketTypeExperience: 'Experiences', viewTicket: 'View ticket', thingsToDo: 'THINGS TO DO', howItWorks: 'HOW IT WORKS', ticketCollection: 'TICKET COLLECTION', needAdvice: 'Need advice?', discoverTickets: 'Explore tickets', chooseTicket: 'Choose tickets the simpler way', findTicket: 'Find the right ticket', noTicketType: 'Tickets & attractions', businessAdvice: 'Get advice & quote', sending: 'Sending...', sent: 'Request sent.', tryAgain: 'Please try again later.' },
            about: { kicker: 'ABOUT US', title: 'About ANNLETRAVEL', subtitle: 'Trust on every journey', badge: '✦ Dedicated to every journey', story: 'OUR STORY', storyTitle: 'We accompany you on every journey', storyText: 'We believe a memorable trip is not only about the destination, but also about how the journey is prepared and the experiences you bring home.', vision: 'Vision', mission: 'Mission', values: 'Core values', numbers: 'ANNLETRAVEL IN NUMBERS', numbersTitle: 'Numbers worth remembering', years: 'Years operating', customers: 'Customers', tours: 'Tours organized', destinations: 'Destinations', achievements: 'ACHIEVEMENTS', achievementsTitle: 'Achievements & milestones', customerLove: 'CUSTOMER LOVE', reviewsTitle: 'What our customers say', loading: 'Loading...', updated: 'Updating...', noReviews: 'No reviews yet.' },
            business: { kicker: 'BUSINESS TRAVEL', title: 'Corporate travel solutions', submit: 'Get advice & quote', sending: 'Sending...' },
            services: { kicker: 'SERVICES', title: 'Services for your entire journey', desc: 'Flights, hotels, visas, passports, attraction tickets and travel services tailored to your needs.', all: 'All', view: 'View service', notFound: 'Service not found', error: 'Unable to load services. Please try again later.' }
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
        'Vé máy bay': 'Flights', 'Khách sạn': 'Hotels', 'Visa': 'Visa', 'Hộ chiếu': 'Passport', 'Vé vui chơi & tham quan': 'Tickets & attractions', 'Xe đưa đón': 'Transfers', 'Vé tàu': 'Train tickets', 'Bảo hiểm du lịch': 'Travel insurance',
        'Giá tốt': 'Great prices', 'Lịch trình rõ ràng': 'Clear itineraries', 'Hỗ trợ tận tâm': 'Dedicated support', 'Nhiều điểm đến': 'Many destinations',
        'Những con số đáng nhớ': 'Numbers worth remembering', 'Năm hoạt động': 'Years operating', 'Khách hàng': 'Customers', 'Tour đã tổ chức': 'Tours organized', 'Điểm đến': 'Destinations', 'Thành tựu & dấu ấn': 'Achievements & milestones', 'Khách hàng nói gì?': 'What our customers say',
        'Tận tâm trong từng hành trình': 'Dedicated to every journey', 'Đồng hành cùng bạn trên mọi hành trình': 'We accompany you on every journey', 'Tầm nhìn': 'Vision', 'Sứ mệnh': 'Mission', 'Giá trị cốt lõi': 'Core values',
        'Không biết nên chọn vé nào?': 'Not sure which ticket to choose?', 'Nhận tư vấn': 'Get consultation', 'Nhận tư vấn & báo giá': 'Get advice & quote', 'Đang gửi...': 'Sending...'
    };

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

    function translateAutoNode(el, lang) {
        if (!el || el.nodeType !== 1) return;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) return;
        if (el.matches('[data-i18n],[data-i18n-placeholder],[data-i18n-title]')) return;

        const original = el.dataset.i18nAutoOriginal ?? el.textContent.trim();
        if (!original) return;
        el.dataset.i18nAutoOriginal = original;

        let translated = original;
        if (lang === 'en') {
            if (autoPairs[original]) translated = autoPairs[original];
            else {
                let m = original.match(/^Còn\s+(\d+)\s+chỗ$/);
                if (m) translated = `${m[1]} seats left`;
                m = original.match(/^(\d+)\s+chỗ$/);
                if (m) translated = `${m[1]} seats`;
                m = original.match(/^Từ\s+(.+)$/);
                if (m && /^\d/.test(m[1])) translated = `From ${m[1]}`;
                m = original.match(/^TOUR\s+tại\s+(.+)$/);
                if (m) translated = `Tours in ${m[1]}`;
                m = original.match(/^Chưa có tour tại\s+(.+)$/);
                if (m) translated = `No tours in ${m[1]}`;
            }
        } else {
            translated = original;
            for (const [vi, en] of Object.entries(autoPairs)) {
                if (translated === en) { translated = vi; break; }
            }
            let m = original.match(/^(\d+)\s+seats left$/);
            if (m) translated = `Còn ${m[1]} chỗ`;
            m = original.match(/^(\d+)\s+seats$/);
            if (m) translated = `${m[1]} chỗ`;
            m = original.match(/^From\s+(.+)$/);
            if (m) translated = `Từ ${m[1]}`;
            m = original.match(/^Tours in\s+(.+)$/);
            if (m) translated = `Tour tại ${m[1]}`;
            m = original.match(/^No tours in\s+(.+)$/);
            if (m) translated = `Chưa có tour tại ${m[1]}`;
        }
        if (el.children.length === 0 && el.textContent.trim() !== translated) el.textContent = translated;
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
        document.querySelectorAll('body *').forEach(el => translateAutoNode(el, selected));
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
        const headerButton = headerContainer.querySelector('.btn-header, .btn-primary');
        if (headerButton) headerButton.insertAdjacentElement('beforebegin', switcher);
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
                if (node.nodeType !== 1) return;
                translateAutoNode(node, lang);
                node.querySelectorAll?.('*').forEach(el => translateAutoNode(el, lang));
            });
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();