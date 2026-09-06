async function loadBusinessServices() {
    const grid = document.getElementById('businessServicesGrid');
    if (!grid || typeof supabaseClient === 'undefined') return;

    const { data, error } = await supabaseClient
        .from('business_services')
        .select('*')
        .eq('visible', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Business services error:', error);
        return;
    }

    grid.innerHTML = (data || []).map(item => `
        <article class="business-service-card">
            <div class="business-service-icon">${escapeBusinessHtml(item.icon || '✦')}</div>
            <div>
                <h3>${escapeBusinessHtml(item.title)}</h3>
                <p>${escapeBusinessHtml(item.short_description || item.description || '')}</p>
            </div>
            <span class="business-service-arrow">→</span>
        </article>
    `).join('');
}

async function submitBusinessLead(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const result = document.getElementById('businessFormMessage');

    const payload = {
        company_name: form.company_name.value.trim(),
        contact_name: form.contact_name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim() || null,
        employee_count: form.employee_count.value ? Number(form.employee_count.value) : null,
        service_interest: form.service_interest.value || null,
        departure: form.departure.value.trim() || null,
        destination: form.destination.value.trim() || null,
        departure_date: form.departure_date.value || null,
        return_date: form.return_date.value || null,
        budget: form.budget.value || null,
        message: form.message.value.trim() || null
    };

    button.disabled = true;
    button.textContent = 'Đang gửi...';
    if (result) result.textContent = '';

    try {
        const { error } = await supabaseClient.from('business_leads').insert(payload);
        if (error) throw error;
        form.reset();
        if (result) result.textContent = 'Đã gửi yêu cầu. ANNLETRAVEL sẽ liên hệ với doanh nghiệp sớm nhất.';
    } catch (error) {
        console.error('Business lead error:', error);
        if (result) result.textContent = 'Chưa thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp với chúng tôi.';
    } finally {
        button.disabled = false;
        button.textContent = 'Nhận tư vấn & báo giá';
    }
}

function escapeBusinessHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[c]));
}

document.addEventListener('DOMContentLoaded', loadBusinessServices);
