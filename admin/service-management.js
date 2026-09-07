// ANNLETRAVEL - SERVICE ADMIN CRUD

let adminServiceCategories = [];
let adminServices = [];
let editingServiceId = null;

const escServiceAdmin = value => String(value ?? '').replace(/[&<>'\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '\"':'&quot;' }[c]));

async function loadAdminServices() {
    const [cats, services] = await Promise.all([
        supabaseClient.from('service_categories').select('*').order('sort_order', { ascending: true }),
        supabaseClient.from('services').select('*').order('sort_order', { ascending: true })
    ]);
    if (cats.error || services.error) { console.error(cats.error || services.error); alert('Không thể tải dịch vụ.\n\n' + (cats.error || services.error).message); return; }
    adminServiceCategories = cats.data || [];
    adminServices = services.data || [];
    renderAdminServices();
}
function renderAdminServices() {
    const body = document.getElementById('serviceTableBody'); if (!body) return;
    body.innerHTML = adminServices.length ? adminServices.map(s => { const c = adminServiceCategories.find(x => x.id === s.category_id); return `<tr><td><strong>${escServiceAdmin(s.name)}</strong><br><small>${escServiceAdmin(s.slug)}</small></td><td>${escServiceAdmin(c?.name || s.category_id)}</td><td>${s.featured ? '✓' : '-'}</td><td>${s.active ? 'Đang hiển thị' : 'Ẩn'}</td><td>${Number(s.sort_order || 0)}</td><td><div class="action-buttons"><button type="button" class="refresh-button" onclick="editService('${escServiceAdmin(s.id)}')">Sửa</button><button type="button" class="booking-delete-button" onclick="removeService('${escServiceAdmin(s.id)}')">Xóa</button></div></td></tr>`; }).join('') : '<tr><td colspan="6">Chưa có dịch vụ.</td></tr>';
}
function openServiceModal(service = null) { editingServiceId = service?.id || null; const modal = document.getElementById('serviceModal'); if (!modal) return; document.getElementById('serviceModalTitle').textContent = service ? 'Sửa dịch vụ' : 'Thêm dịch vụ'; document.getElementById('serviceId').value = service?.id || ''; document.getElementById('serviceCategory').value = service?.category_id || adminServiceCategories[0]?.id || ''; document.getElementById('serviceName').value = service?.name || ''; document.getElementById('serviceSlug').value = service?.slug || ''; document.getElementById('serviceShort').value = service?.short || ''; document.getElementById('serviceDescription').value = service?.description || ''; document.getElementById('serviceImage').value = service?.image || ''; document.getElementById('servicePriceFrom').value = service?.price_from || 0; document.getElementById('serviceSortOrder').value = service?.sort_order ?? 100; document.getElementById('serviceFeatured').checked = !!service?.featured; document.getElementById('serviceActive').checked = service ? !!service.active : true; modal.classList.remove('hidden'); }
function closeServiceModal() { document.getElementById('serviceModal')?.classList.add('hidden'); editingServiceId = null; }
function slugifyService(value) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
window.editService = id => { const s = adminServices.find(x => String(x.id) === String(id)); if (s) openServiceModal(s); };
window.removeService = async id => { const s = adminServices.find(x => String(x.id) === String(id)); if (!s || !confirm(`Xóa dịch vụ \"${s.name}\"?`)) return; const { error } = await supabaseClient.from('services').delete().eq('id', id); if (error) { alert('Không thể xóa dịch vụ.\n\n' + error.message); return; } alert('Xóa dịch vụ thành công!'); await loadAdminServices(); };
async function saveService(event) { event.preventDefault(); const name = document.getElementById('serviceName').value.trim(); const slug = document.getElementById('serviceSlug').value.trim() || slugifyService(name); const category_id = document.getElementById('serviceCategory').value; if (!name || !slug || !category_id) { alert('Vui lòng nhập tên, slug và nhóm dịch vụ.'); return; } const payload = { category_id, name, slug, short: document.getElementById('serviceShort').value.trim(), description: document.getElementById('serviceDescription').value.trim(), image: document.getElementById('serviceImage').value.trim(), price_from: Number(document.getElementById('servicePriceFrom').value || 0), sort_order: Number(document.getElementById('serviceSortOrder').value || 100), featured: document.getElementById('serviceFeatured').checked, active: document.getElementById('serviceActive').checked, updated_at: new Date().toISOString() }; let query; if (editingServiceId) query = supabaseClient.from('services').update(payload).eq('id', editingServiceId); else { payload.id = slugifyService(slug) || `service-${Date.now()}`; query = supabaseClient.from('services').insert(payload); } const { error } = await query; if (error) { alert('Không thể lưu dịch vụ.\n\n' + error.message); return; } const wasEditing = !!editingServiceId; closeServiceModal(); alert(wasEditing ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ thành công!'); await loadAdminServices(); }
function renderServiceCategoryOptions() { const select = document.getElementById('serviceCategory'); if (!select) return; select.innerHTML = adminServiceCategories.map(c => `<option value="${escServiceAdmin(c.id)}">${escServiceAdmin(c.icon)} ${escServiceAdmin(c.name)}</option>`).join(''); }
(function initServiceAdmin() { const form = document.getElementById('serviceForm'); if (!form) return; form.addEventListener('submit', saveService); document.getElementById('addServiceButton')?.addEventListener('click', () => openServiceModal()); document.getElementById('closeServiceModalButton')?.addEventListener('click', closeServiceModal); document.getElementById('cancelServiceButton')?.addEventListener('click', closeServiceModal); document.getElementById('serviceName')?.addEventListener('blur', e => { const input = document.getElementById('serviceSlug'); if (!input.value.trim()) input.value = slugifyService(e.target.value); }); loadAdminServices().then(renderServiceCategoryOptions); })();
(function loadUnifiedTicketModule() { if (!document.getElementById('dashboardPage')) return; const script = document.createElement('script'); script.src = 'ticket-section.js'; script.defer = false; document.body.appendChild(script); })();

// Load About/Business inside the existing Admin dashboard.
async function loadAdminPageInline(page, sectionId, scriptName) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.toggle('hidden', s !== section));

    if (section.dataset.loaded === 'true') return;

    section.innerHTML = '<div class="tour-section" style="padding:40px;text-align:center">Đang tải...</div>';

    try {
        const response = await fetch(page, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Không thể tải ${page}`);

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const sourceMain = doc.querySelector('main.dashboard-container');
        if (!sourceMain) throw new Error(`Không tìm thấy nội dung ${page}`);

        doc.querySelectorAll('style').forEach((style, index) => {
            const styleId = `inline-${page.replace(/[^a-z0-9]/gi, '-')}-${index}`;
            if (!document.getElementById(styleId)) {
                const newStyle = document.createElement('style');
                newStyle.id = styleId;
                newStyle.textContent = style.textContent;
                document.head.appendChild(newStyle);
            }
        });

        section.innerHTML = sourceMain.innerHTML;
        section.dataset.loaded = 'true';

        if (!document.querySelector(`script[data-inline-admin-script="${scriptName}"]`)) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptName;
                script.dataset.inlineAdminScript = scriptName;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Không thể tải ${scriptName}`));
                document.body.appendChild(script);
            });
        }
    } catch (error) {
        console.error('Inline admin page error:', error);
        section.innerHTML = `<div class="tour-section" style="padding:40px"><h2>Không thể tải trang</h2><p>${escServiceAdmin(error.message)}</p></div>`;
    }
}

// Use the same navigation model as admin.js for every menu, including About/Business.
(function unifyAdminNavigation() {
    const sidebar = document.querySelector('.admin-sidebar');
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (!sidebar || !dashboardContainer) return;

    ['About', 'Business'].forEach(name => {
        const id = `adminSection${name}`;
        if (!document.getElementById(id)) {
            const section = document.createElement('section');
            section.id = id;
            section.className = 'admin-content-section hidden';
            dashboardContainer.appendChild(section);
        }
    });

    const ticketsLink = sidebar.querySelector('a[href="tickets.html"]');

    const createDynamicLink = (type, text) => {
        const attr = type === 'about' ? 'data-about-link' : 'data-business-link';
        let link = sidebar.querySelector(`[${attr}="true"]`);
        if (!link) {
            link = document.createElement('a');
            link.href = `#${type}`;
            link.className = 'admin-nav-link';
            link.textContent = text;
            if (ticketsLink) ticketsLink.insertAdjacentElement('beforebegin', link); else sidebar.appendChild(link);
        }
        link.dataset.section = type;
        return link;
    };

    const aboutLink = createDynamicLink('about', '🏆 Về chúng tôi');
    const businessLink = createDynamicLink('business', '🏢 Doanh nghiệp');
    if (aboutLink.nextElementSibling !== businessLink) aboutLink.insertAdjacentElement('afterend', businessLink);

    // admin.js owns the active state for normal menus. Extend that same function
    // so About/Business are handled by the exact same active class mechanism.
    window.showAdminSection = function(sectionName, updateHash = true) {
        const sectionMap = {
            dashboard: 'adminSectionDashboard',
            tours: 'adminSectionTours',
            bookings: 'adminSectionBookings',
            destinations: 'adminSectionDestinations',
            services: 'adminSectionServices',
            tickets: 'adminSectionTickets',
            about: 'adminSectionAbout',
            business: 'adminSectionBusiness'
        };

        const targetId = sectionMap[sectionName] || sectionMap.dashboard;
        document.querySelectorAll('.admin-content-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== targetId);
        });
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionName);
        });

        if (updateHash) {
            const newHash = `#${sectionName}`;
            if (window.location.hash !== newHash) history.replaceState(null, '', newHash);
        }

        if (sectionName === 'about') loadAdminPageInline('about.html', 'adminSectionAbout', 'about-admin.js');
        if (sectionName === 'business') loadAdminPageInline('business.html', 'adminSectionBusiness', 'business-admin.js');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    aboutLink.onclick = event => {
        event.preventDefault();
        window.showAdminSection('about');
    };
    businessLink.onclick = event => {
        event.preventDefault();
        window.showAdminSection('business');
    };
})();
