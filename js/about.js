async function loadAboutPage() {
    const companyResult = await supabaseClient.from('about_company').select('*').eq('id', 1).maybeSingle();
    const awardsResult = await supabaseClient.from('about_awards').select('*').eq('visible', true).order('sort_order', { ascending: true });
    const reviewsResult = await supabaseClient.from('about_reviews').select('*').eq('visible', true).order('sort_order', { ascending: true });
    const galleryResult = await supabaseClient.from('about_gallery').select('*').eq('visible', true).order('sort_order', { ascending: true });

    if (companyResult.error) throw companyResult.error;
    const company = companyResult.data || {};
    const stats = company.stats || {};

    setText('aboutHeroTitle', company.hero_title || 'Về ANNLETRAVEL');
    setText('aboutHeroSubtitle', company.hero_subtitle || 'Niềm tin trên mọi hành trình');
    setText('aboutIntroduction', company.introduction);
    setText('aboutVision', company.vision);
    setText('aboutMission', company.mission);
    setText('aboutValues', company.values);
    setText('statYears', stats.years || 0);
    setText('statCustomers', stats.customers || 0);
    setText('statTours', stats.tours || 0);
    setText('statDestinations', stats.destinations || 0);

    if (company.hero_image) document.getElementById('aboutHeroImage').style.backgroundImage = `url('${safeUrl(company.hero_image)}')`;

    const awards = awardsResult.data || [];
    document.getElementById('awardsGrid').innerHTML = awards.length ? awards.map(item => `
        <article class="about-award-card">
            ${item.image ? `<img src="${safeUrl(item.image)}" alt="${escapeHtml(item.title)}">` : '<div class="about-award-icon">🏆</div>'}
            <div><span>${escapeHtml(item.year)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.organization)}</p><p>${escapeHtml(item.description)}</p></div>
        </article>`).join('') : '<p class="about-empty">Thành tựu đang được cập nhật.</p>';

    const reviews = reviewsResult.data || [];
    document.getElementById('reviewsGrid').innerHTML = reviews.length ? reviews.map(item => `
        <article class="about-review-card">
            <div class="review-stars">${'★'.repeat(Number(item.rating || 5))}${'☆'.repeat(5 - Number(item.rating || 5))}</div>
            <p>“${escapeHtml(item.content)}”</p>
            <div class="review-author">${item.avatar ? `<img src="${safeUrl(item.avatar)}" alt="${escapeHtml(item.customer_name)}">` : '<div class="review-avatar">' + escapeHtml((item.customer_name || '?').charAt(0)) + '</div>'}<div><strong>${escapeHtml(item.customer_name)}</strong><span>${escapeHtml(item.customer_title)}</span></div></div>
        </article>`).join('') : '<p class="about-empty">Chưa có đánh giá.</p>';

    const gallery = galleryResult.data || [];
    document.getElementById('aboutGallery').innerHTML = gallery.map(item => `<figure><img src="${safeUrl(item.image)}" alt="${escapeHtml(item.title || 'ANNLETRAVEL')}"><figcaption>${escapeHtml(item.title)}</figcaption></figure>`).join('');
}

function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value || ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function safeUrl(value) { return String(value || '').replace(/'/g, '%27'); }

document.addEventListener('DOMContentLoaded', () => loadAboutPage().catch(error => {
    console.error('About page error:', error);
    document.querySelectorAll('.about-empty').forEach(el => el.textContent = 'Không thể tải nội dung hiện tại.');
}));
