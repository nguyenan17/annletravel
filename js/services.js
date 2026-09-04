// ANNLETRAVEL - PUBLIC SERVICES

function escapeServiceHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function serviceImageUrl(value) {
    const url = String(value || '').trim();
    return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : '';
}

let publicServiceCategories = [];
let publicServices = [];

async function loadPublicServices() {
    const [catResult, serviceResult] = await Promise.all([
        supabaseClient.from('service_categories').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabaseClient.from('services').select('*').eq('active', true).order('sort_order', { ascending: true })
    ]);
    if (catResult.error || serviceResult.error) {
        console.error('Load services error:', catResult.error || serviceResult.error);
        const grid = document.getElementById('servicesGrid');
        if (grid) grid.innerHTML = '<p>Không thể tải dịch vụ. Vui lòng thử lại sau.</p>';
        return;
    }
    publicServiceCategories = catResult.data || [];
    publicServices = serviceResult.data || [];
    renderServiceCategories();
    renderServices();
    renderServiceDetail();
}

function renderServiceCategories(active = 'ALL') {
    const el = document.getElementById('serviceCategories');
    if (!el) return;
    el.innerHTML = `<button class="service-filter active" data-category="ALL">Tất cả</button>` + publicServiceCategories.map(cat =>
        `<button class="service-filter" data-category="${escapeServiceHtml(cat.id)}">${escapeServiceHtml(cat.icon)} ${escapeServiceHtml(cat.name)}</button>`
    ).join('');
    el.querySelectorAll('.service-filter').forEach(button => {
        button.classList.toggle('active', button.dataset.category === active);
        button.addEventListener('click', () => {
            renderServiceCategories(button.dataset.category);
            renderServices(button.dataset.category);
        });
    });
}

function renderServices(categoryId = 'ALL') {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    const list = categoryId === 'ALL' ? publicServices : publicServices.filter(item => item.category_id === categoryId);
    if (!list.length) { grid.innerHTML = '<p>Chưa có dịch vụ phù hợp.</p>'; return; }
    grid.innerHTML = list.map(service => {
        const image = serviceImageUrl(service.image);
        const category = publicServiceCategories.find(c => c.id === service.category_id);
        return `<article class="service-card">${image ? `<img src="${escapeServiceHtml(image)}" alt="${escapeServiceHtml(service.name)}" loading="lazy">` : `<div class="service-image-placeholder">${escapeServiceHtml(category?.icon || '✈️')}</div>`}<div class="service-content"><span class="service-category-label">${escapeServiceHtml(category?.name || 'Dịch vụ')}</span><h3>${escapeServiceHtml(service.name)}</h3><p>${escapeServiceHtml(service.short)}</p><a class="btn btn-primary" href="service-detail.html?slug=${encodeURIComponent(service.slug)}">Xem dịch vụ</a></div></article>`;
    }).join('');
}

async function renderServiceDetail() {
    const container = document.getElementById('serviceDetail');
    if (!container) return;
    const slug = new URLSearchParams(location.search).get('slug');
    const service = publicServices.find(item => item.slug === slug);
    if (!service) { container.innerHTML = '<section class="section"><div class="container"><h1>Không tìm thấy dịch vụ</h1><a href="services.html">← Quay lại dịch vụ</a></div></section>'; return; }
    const category = publicServiceCategories.find(c => c.id === service.category_id);
    const image = serviceImageUrl(service.image);
    container.innerHTML = `<section class="page-hero"><div class="container"><p class="section-label">${escapeServiceHtml(category?.name || 'DỊCH VỤ')}</p><h1>${escapeServiceHtml(service.name)}</h1><p>${escapeServiceHtml(service.short)}</p></div></section><section class="section"><div class="container service-detail-grid"><div>${image ? `<img class="service-detail-image" src="${escapeServiceHtml(image)}" alt="${escapeServiceHtml(service.name)}">` : `<div class="service-detail-placeholder">${escapeServiceHtml(category?.icon || '✈️')}</div>`}</div><div><h2>${escapeServiceHtml(service.name)}</h2><p class="lead">${escapeServiceHtml(service.description)}</p>${Number(service.price_from) > 0 ? `<p class="service-price">Từ <strong>${new Intl.NumberFormat('vi-VN').format(Number(service.price_from))} đ</strong></p>` : ''}<a href="index.html#contact" class="btn btn-primary">Nhận tư vấn</a></div></div></section>`;
}

document.addEventListener('DOMContentLoaded', loadPublicServices);
