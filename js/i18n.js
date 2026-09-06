(function () {
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

    function getLanguage() {
        const saved = localStorage.getItem('annletravel_language');
        return saved === 'en' ? 'en' : 'vi';
    }

    function getValue(lang, key) {
        return key.split('.').reduce((obj, part) => obj && obj[part], translations[lang]);
    }

    function applyLanguage(lang) {
        const selected = lang === 'en' ? 'en' : 'vi';
        localStorage.setItem('annletravel_language', selected);
        document.documentElement.lang = selected;
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
        document.querySelectorAll('[data-lang-switch]').forEach(el => {
            el.classList.toggle('active', el.dataset.langSwitch === selected);
        });
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
        const headerButton = headerContainer.querySelector('.btn-header');
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
})();
