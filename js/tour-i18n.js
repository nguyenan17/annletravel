/* ANNLETRAVEL - TOUR CONTENT TRANSLATIONS */
(function () {
    "use strict";

    const TOUR_TEXTS = {
        "seoul-5n4d": {
            vi: ["Seoul 5N4Đ", "Hàn Quốc", "Khám phá Seoul, đảo Nami và những địa điểm nổi tiếng của Hàn Quốc."],
            en: ["Seoul 5D4N", "South Korea", "Discover Seoul, Nami Island and South Korea's most famous attractions."],
            zh: ["首尔5天4晚", "韩国", "探索首尔、南怡岛以及韩国著名景点。"],
            ko: ["서울 5일4박", "대한민국", "서울, 남이섬과 한국의 유명 관광지를 만나보세요."],
            ja: ["ソウル5日4泊", "韓国", "ソウル、南怡島と韓国の人気観光スポットを巡ります。"]
        },
        "tokyo-fuji-5n4d": {
            vi: ["Tokyo - Fuji 5N4Đ", "Nhật Bản", "Khám phá Tokyo, núi Phú Sĩ và những trải nghiệm đặc sắc của Nhật Bản."],
            en: ["Tokyo - Fuji 5D4N", "Japan", "Discover Tokyo, Mount Fuji and unforgettable experiences in Japan."],
            zh: ["东京-富士5天4晚", "日本", "探索东京、富士山以及日本的精彩体验。"],
            ko: ["도쿄 - 후지 5일4박", "일본", "도쿄, 후지산과 일본의 특별한 경험을 만나보세요."],
            ja: ["東京・富士5日4泊", "日本", "東京、富士山と日本ならではの魅力を楽しむ旅です。"]
        },
        "phuket-4n3d": {
            vi: ["Phuket 4N3Đ", "Thái Lan", "Nghỉ dưỡng và khám phá biển đảo Phuket."],
            en: ["Phuket 4D3N", "Thailand", "Relax and explore the beautiful islands and beaches of Phuket."],
            zh: ["普吉岛4天3晚", "泰国", "享受度假时光，探索普吉岛的海滩与海岛。"],
            ko: ["푸켓 4일3박", "태국", "푸켓의 아름다운 해변과 섬을 즐기는 휴양 여행입니다."],
            ja: ["プーケット4日3泊", "タイ", "プーケットの美しいビーチと島々を楽しむリゾート旅行です。"]
        },
        "sapa-3n2d": {
            vi: ["Sapa 3N2Đ", "Việt Nam", "Khám phá núi rừng Tây Bắc và văn hóa bản địa."],
            en: ["Sapa 3D2N", "Vietnam", "Explore the mountains of Northwest Vietnam and local culture."],
            zh: ["沙坝3天2晚", "越南", "探索越南西北山区与当地文化。"],
            ko: ["사파 3일2박", "베트남", "베트남 북서부의 산악 풍경과 현지 문화를 만나보세요."],
            ja: ["サパ3日2泊", "ベトナム", "ベトナム北西部の山々と現地文化を楽しむ旅です。"]
        },
        "busan-5n4d": {
            vi: ["Busan 5N4Đ", "Hàn Quốc", "Khám phá biển Busan, Gamcheon và những địa điểm nổi bật."],
            en: ["Busan 5D4N", "South Korea", "Discover Busan's beaches, Gamcheon Culture Village and top attractions."],
            zh: ["釜山5天4晚", "韩国", "探索釜山海滩、甘川文化村及热门景点。"],
            ko: ["부산 5일4박", "대한민국", "부산의 해변, 감천문화마을과 주요 명소를 둘러보세요."],
            ja: ["釜山5日4泊", "韓国", "釜山のビーチ、甘川文化村と人気スポットを巡ります。"]
        },
        "osaka-kyoto-6n5d": {
            vi: ["Osaka - Kyoto 6N5Đ", "Nhật Bản", "Kết hợp Osaka, Kyoto và những địa danh truyền thống của Nhật Bản."],
            en: ["Osaka - Kyoto 6D5N", "Japan", "Experience Osaka, Kyoto and Japan's traditional landmarks in one journey."],
            zh: ["大阪-京都6天5晚", "日本", "一次探索大阪、京都以及日本传统文化地标。"],
            ko: ["오사카 - 교토 6일5박", "일본", "오사카, 교토와 일본의 전통 명소를 함께 둘러보세요."],
            ja: ["大阪・京都6日5泊", "日本", "大阪、京都と日本の伝統的な名所を巡る旅です。"]
        },
        "singapore-4n3d": {
            vi: ["Singapore 4N3Đ", "Singapore", "Khám phá Singapore hiện đại và Gardens by the Bay."],
            en: ["Singapore 4D3N", "Singapore", "Discover modern Singapore and Gardens by the Bay."],
            zh: ["新加坡4天3晚", "新加坡", "探索现代化的新加坡与滨海湾花园。"],
            ko: ["싱가포르 4일3박", "싱가포르", "현대적인 싱가포르와 가든스 바이 더 베이를 만나보세요."],
            ja: ["シンガポール4日3泊", "シンガポール", "近代的なシンガポールとガーデンズ・バイ・ザ・ベイを楽しみます。"]
        }
    };

    const destinationTexts = {
        "Hàn Quốc": { en: "South Korea", zh: "韩国", ko: "대한민국", ja: "韓国" },
        "Nhật Bản": { en: "Japan", zh: "日本", ko: "일본", ja: "日本" },
        "Thái Lan": { en: "Thailand", zh: "泰国", ko: "태국", ja: "タイ" },
        "Việt Nam": { en: "Vietnam", zh: "越南", ko: "베트남", ja: "ベトナム" },
        "Singapore": { en: "Singapore", zh: "新加坡", ko: "싱가포르", ja: "シンガポール" }
    };

    const original = new WeakMap();
    let translating = false;

    function getLanguage() {
        const lang = localStorage.getItem("annletravel_language") || "vi";
        return ["vi", "en", "zh", "ko", "ja"].includes(lang) ? lang : "vi";
    }

    function getTourId(node) {
        const card = node.closest(".tour-card, .departure-row");
        const link = card?.querySelector('a[href*="tour-detail.html?id="]');
        if (!link) return null;
        return new URL(link.href, window.location.href).searchParams.get("id");
    }

    function findTourField(core) {
        for (const tour of Object.values(TOUR_TEXTS)) {
            for (let i = 0; i < 3; i++) {
                if (tour.vi[i] === core) return i;
            }
        }
        return -1;
    }

    function translateTextNode(node, lang) {
        const raw = original.has(node) ? original.get(node) : node.nodeValue;
        const core = raw.trim();
        if (!core) return;
        original.set(node, raw);

        let value = core;
        const tourId = getTourId(node);
        const tour = tourId && TOUR_TEXTS[tourId];
        const field = findTourField(core);

        if (tour && field >= 0 && tour[lang]?.[field]) value = tour[lang][field];
        else if (field >= 0) {
            for (const item of Object.values(TOUR_TEXTS)) {
                if (item.vi[field] === core && item[lang]?.[field]) {
                    value = item[lang][field];
                    break;
                }
            }
        }

        if (value === core && destinationTexts[core]?.[lang]) value = destinationTexts[core][lang];

        let m = core.match(/^Còn\s+(\d+)\s+chỗ$/);
        if (m && lang !== "vi") value = { en: `${m[1]} seats left`, zh: `还剩${m[1]}个名额`, ko: `${m[1]}석 남음`, ja: `残り${m[1]}席` }[lang];
        m = core.match(/^(\d+)\s+chỗ$/);
        if (m && lang !== "vi") value = { en: `${m[1]} seats`, zh: `${m[1]}个名额`, ko: `${m[1]}석`, ja: `${m[1]}席` }[lang];
        m = core.match(/^(\d+)\s+hành trình$/);
        if (m && lang !== "vi") value = { en: `${m[1]} journeys`, zh: `${m[1]}个行程`, ko: `${m[1]}개 여행`, ja: `${m[1]}件の旅程` }[lang];

        const translated = raw.replace(core, value);
        if (node.nodeValue !== translated) node.nodeValue = translated;
    }

    function translateAll() {
        if (translating || !document.body) return;
        translating = true;
        const lang = getLanguage();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            const parent = node.parentElement;
            if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return;
            translateTextNode(node, lang);
        });
        translating = false;
    }

    window.addEventListener("languageChanged", translateAll);
    window.addEventListener("load", translateAll);

    const observer = new MutationObserver(mutations => {
        if (translating || getLanguage() === "vi") return;
        if (mutations.some(m => m.addedNodes.length)) setTimeout(translateAll, 0);
    });

    function startObserver() {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startObserver);
    else startObserver();

    window.AnnLeTourI18n = { translations: TOUR_TEXTS, getLanguage };
    translateAll();
})();
