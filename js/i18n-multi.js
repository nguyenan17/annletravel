(function () {
    'use strict';
    const LANGUAGES = {
        vi: { flag: '🇻🇳', short: 'VI', name: 'Tiếng Việt' },
        en: { flag: '🇬🇧', short: 'EN', name: 'English' },
        zh: { flag: '🇨🇳', short: 'ZH', name: '中文' },
        ko: { flag: '🇰🇷', short: 'KO', name: '한국어' },
        ja: { flag: '🇯🇵', short: 'JA', name: '日本語' }
    };
    const pairs = {
        'Trang chủ': { en: 'Home', zh: '首页', ko: '홈', ja: 'ホーム' },
        'Tour': { en: 'Tours', zh: '旅游团', ko: '투어', ja: 'ツアー' },
        'Điểm đến': { en: 'Destinations', zh: '目的地', ko: '여행지', ja: '目的地' },
        'Dịch vụ': { en: 'Services', zh: '服务', ko: '서비스', ja: 'サービス' },
        'Doanh nghiệp': { en: 'Business', zh: '企业', ko: '기업', ja: '法人 서비스' },
        'Về chúng tôi': { en: 'About us', zh: '关于我们', ko: '회사 소개', ja: '私たちについて' },
        'Liên hệ': { en: 'Contact', zh: '联系我们', ko: '문의하기', ja: 'お問い合わせ' },
        'Tư vấn ngay': { en: 'Get advice', zh: '立即咨询', ko: '상담하기', ja: '今すぐ相談' },
        'Xem tất cả →': { en: 'View all →', zh: '查看全部 →', ko: '전체 보기 →', ja: 'すべて見る →' },
        'Khám phá': { en: 'Explore', zh: '探索', ko: '둘러보기', ja: '探す' },
        'Xem tour': { en: 'View tour', zh: '查看行程', ko: '투어 보기', ja: 'ツアーを見る' },
        'Xem điểm đến →': { en: 'View destination →', zh: '查看目的地 →', ko: '여행지 보기 →', ja: '目的地を見る →' },
        'Tìm kiếm': { en: 'Search', zh: '搜索', ko: '검색', ja: '検索' },
        'Thương hiệu': { en: 'Brand', zh: '品牌', ko: '브랜드', ja: 'ブランド' },
        'Loại vé': { en: 'Ticket type', zh: '票种', ko: '티켓 종류', ja: 'チケットタイプ' },
        'Tất cả': { en: 'All', zh: '全部', ko: '전체', ja: 'すべて' },
        'Trong nước': { en: 'Domestic', zh: '国内', ko: '국내', ja: '国内' },
        'Nước ngoài': { en: 'International', zh: '国际', ko: '해외', ja: '海外' },
        'Tất cả điểm đến': { en: 'All destinations', zh: '所有目的地', ko: '모든 여행지', ja: 'すべての目的地' },
        'Ngày khởi hành': { en: 'Departure date', zh: '出发日期', ko: '출발일', ja: '出発日' },
        'Khoảng giá': { en: 'Price range', zh: '价格范围', ko: '가격대', ja: '料金範囲' },
        'Sắp xếp': { en: 'Sort by', zh: '排序', ko: '정렬', ja: '並び替え' },
        'Mặc định': { en: 'Default', zh: '默认', ko: '기본', ja: 'デフォルト' },
        'Giá thấp → cao': { en: 'Price: low → high', zh: '价格：低 → 高', ko: '가격: 낮은순 → 높은순', ja: '料金：安い順 → 高い順' },
        'Giá cao → thấp': { en: 'Price: high → low', zh: '价格：高 → 低', ko: '가격: 높은순 → 낮은순', ja: '料金：高い順 → 安い順' },
        'Khởi hành gần nhất': { en: 'Nearest departure', zh: '最近出发', ko: '가까운 출발일', ja: '出発日が近い順' },
        'Lọc tour': { en: 'Filter tours', zh: '筛选行程', ko: '투어 필터', ja: 'ツアーを絞り込む' },
        'Không giới hạn': { en: 'No limit', zh: '不限', ko: '제한 없음', ja: '制限なし' },
        'Dưới 10 triệu': { en: 'Under 10 million VND', zh: '低于1000万越南盾', ko: '1천만 동 미만', ja: '1,000万VND未満' },
        '10 - 20 triệu': { en: '10 - 20 million VND', zh: '1000万 - 2000万越南盾', ko: '1천만~2천만 동', ja: '1,000万～2,000万VND' },
        'Trên 20 triệu': { en: 'Over 20 million VND', zh: '超过2000万越南盾', ko: '2천만 동 이상', ja: '2,000万VND以上' },
        'Đang tải...': { en: 'Loading...', zh: '加载中...', ko: '로딩 중...', ja: '読み込み中...' },
        'Đang được cập nhật.': { en: 'Updating...', zh: '正在更新...', ko: '업데이트 중...', ja: '更新中...' },
        'Chưa có đánh giá.': { en: 'No reviews yet.', zh: '暂无评价。', ko: '아직 리뷰가 없습니다.', ja: 'まだレビューはありません。' },
        'Chưa có tour phù hợp.': { en: 'No suitable tours found.', zh: '暂无符合条件的行程。', ko: '조건에 맞는 투어가 없습니다.', ja: '条件に合うツアーがありません。' },
        'Không tìm thấy tour.': { en: 'Tour not found.', zh: '找不到行程。', ko: '투어를 찾을 수 없습니다.', ja: 'ツアーが見つかりません。' },
        'Không tìm thấy điểm đến.': { en: 'Destination not found.', zh: '找不到目的地。', ko: '여행지를 찾을 수 없습니다.', ja: '目的地が見つかりません。' },
        'Không tìm thấy dịch vụ': { en: 'Service not found', zh: '找不到服务', ko: '서비스를 찾을 수 없습니다', ja: 'サービスが見つかりません' },
        'Nhận tư vấn': { en: 'Get consultation', zh: '获取咨询', ko: '상담 받기', ja: '相談を申し込む' },
        'Nhận tư vấn & báo giá': { en: 'Get advice & quote', zh: '咨询及报价', ko: '상담 및 견적 받기', ja: '相談・見積もり' },
        'Đang gửi...': { en: 'Sending...', zh: '发送中...', ko: '전송 중...', ja: '送信中...' },
        'Giá tốt': { en: 'Great prices', zh: '价格优惠', ko: '좋은 가격', ja: 'お得な料金' },
        'Lịch trình rõ ràng': { en: 'Clear itineraries', zh: '行程清晰', ko: '명확한 일정', ja: '分かりやすい旅程' },
        'Hỗ trợ tận tâm': { en: 'Dedicated support', zh: '贴心服务', ko: '세심한 지원', ja: '丁寧なサポート' },
        'Nhiều điểm đến': { en: 'Many destinations', zh: '众多目的地', ko: '다양한 여행지', ja: '豊富な目的地' },
        'Tầm nhìn': { en: 'Vision', zh: '愿景', ko: '비전', ja: 'ビジョン' },
        'Sứ mệnh': { en: 'Mission', zh: '使命', ko: '미션', ja: 'ミッション' },
        'Giá trị cốt lõi': { en: 'Core values', zh: '核心价值观', ko: '핵심 가치', ja: 'コアバリュー' },
        'Khách hàng': { en: 'Customers', zh: '客户', ko: '고객', ja: 'お客様' },
        'Năm hoạt động': { en: 'Years operating', zh: '运营年数', ko: '운영 연수', ja: '運営年数' },
        'Tour đã tổ chức': { en: 'Tours organized', zh: '已组织行程', ko: '진행한 투어', ja: '催行ツアー' },
        'Thành tựu & dấu ấn': { en: 'Achievements & milestones', zh: '成就与里程碑', ko: '성과와 발자취', ja: '実績と歩み' },
        'Khách hàng nói gì?': { en: 'What our customers say', zh: '客户评价', ko: '고객 후기', ja: 'お客様の声' },
        'Cần tư vấn?': { en: 'Need advice?', zh: '需要咨询？', ko: '상담이 필요하신가요?', ja: 'ご相談ですか？' },
        'Không biết nên chọn vé nào?': { en: 'Not sure which ticket to choose?', zh: '不知道该选择哪张票？', ko: '어떤 티켓을 선택해야 할지 모르시나요?', ja: 'どのチケットを選べばよいか分かりませんか？' }
    };
    const reverse = {};
    Object.keys(pairs).forEach(vi => Object.keys(pairs[vi]).forEach(lang => { (reverse[lang] ||= {})[pairs[vi][lang]] = vi; }));
    const original = new WeakMap();
    let current = localStorage.getItem('annletravel_language') || 'vi';
    if (!LANGUAGES[current]) current = 'vi';

    function translateNode(node, lang) {
        const raw = original.has(node) ? original.get(node) : node.nodeValue;
        const core = raw.trim();
        if (!core) return;
        original.set(node, raw);
        let value = core;
        if (lang !== 'vi' && pairs[core]?.[lang]) value = pairs[core][lang];
        else if (lang === 'vi' && reverse.en?.[core]) value = reverse.en[core];
        else if (reverse[lang]?.[core]) value = reverse[lang][core];
        else {
            let m = core.match(/^Còn\s+(\d+)\s+chỗ$/);
            if (m && lang !== 'vi') value = { en: `${m[1]} seats left`, zh: `还剩${m[1]}个名额`, ko: `${m[1]}석 남음`, ja: `残り${m[1]}席` }[lang];
            m = core.match(/^(\d+)\s+chỗ$/);
            if (m && lang !== 'vi') value = { en: `${m[1]} seats`, zh: `${m[1]}个名额`, ko: `${m[1]}석`, ja: `${m[1]}席` }[lang];
        }
        node.nodeValue = raw.replace(core, value);
    }

    function apply(lang) {
        if (!LANGUAGES[lang]) lang = 'vi';
        current = lang;
        localStorage.setItem('annletravel_language', lang);
        document.documentElement.lang = lang;
        if (lang === 'vi' || lang === 'en') window.AnnLeI18n?.applyLanguage(lang);
        else {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                const vi = key.split('.').reduce((o, p) => o && o[p], window.AnnLeI18n?.translations?.vi);
                if (vi && pairs[vi]?.[lang]) el.textContent = pairs[vi][lang];
            });
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(n => {
                const p = n.parentElement;
                if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(p.tagName) || p.closest('[data-i18n]')) return;
                translateNode(n, lang);
            });
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        }
        updateSwitcher();
    }

    function updateSwitcher() {
        const box = document.querySelector('.language-switcher');
        if (!box) return;
        box.innerHTML = `<button type="button" class="language-current">${LANGUAGES[current].flag} ${LANGUAGES[current].short} ▾</button><div class="language-options">${Object.entries(LANGUAGES).map(([code, item]) => `<button type="button" data-multi-lang="${code}" class="${code === current ? 'active' : ''}">${item.flag} ${item.name}</button>`).join('')}</div>`;
        box.querySelector('.language-current').onclick = () => box.classList.toggle('open');
        box.querySelectorAll('[data-multi-lang]').forEach(btn => btn.onclick = () => { apply(btn.dataset.multiLang); box.classList.remove('open'); });
    }

    function install() {
        const box = document.querySelector('.language-switcher');
        if (!box) return setTimeout(install, 50);
        box.classList.add('multi-language-switcher');
        updateSwitcher();
        if (current !== 'vi') setTimeout(() => apply(current), 0);
        document.addEventListener('click', e => { const b = document.querySelector('.language-switcher'); if (b && !b.contains(e.target)) b.classList.remove('open'); });
    }
    window.AnnLeMultiI18n = { languages: LANGUAGES, apply, getLanguage: () => current };
    install();
})();
