const BLOG_LIMIT = 12;

function blogEscape(value) {
    return String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
}

function blogFormatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value));
}

function blogCard(post) {
    const image = post.cover_image || 'images/hero-placeholder.jpg';
    return `<article class="blog-card">
        <a class="blog-card-image" href="blog-detail.html?slug=${encodeURIComponent(post.slug)}" style="background-image:url('${blogEscape(image)}')">
            <span>${blogEscape(post.category || 'Kinh nghiệm du lịch')}</span>
        </a>
        <div class="blog-card-body">
            <div class="blog-card-date">${blogFormatDate(post.published_at || post.created_at)}</div>
            <h2><a href="blog-detail.html?slug=${encodeURIComponent(post.slug)}">${blogEscape(post.title)}</a></h2>
            <p>${blogEscape(post.excerpt || '')}</p>
            ${post.destination ? `<a class="blog-destination" href="destination.html?slug=${encodeURIComponent(String(post.destination).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))}">📍 ${blogEscape(post.destination)}</a>` : ''}
            <a class="blog-read-more" href="blog-detail.html?slug=${encodeURIComponent(post.slug)}">Đọc bài viết →</a>
        </div>
    </article>`;
}

async function loadBlogPosts() {
    const { data, error } = await supabaseClient.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false }).order('created_at', { ascending: false }).limit(BLOG_LIMIT);
    if (error) { console.error('BLOG LOAD ERROR:', error); return []; }
    return data || [];
}

async function renderBlogList() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    const posts = await loadBlogPosts();
    grid.innerHTML = posts.length ? posts.map(blogCard).join('') : `<div class="blog-empty">Chưa có bài viết. Hãy quay lại sau.</div>`;
}

function updateBlogSeo(post) {
    const title = post.seo_title || `${post.title} | ANNLETRAVEL`;
    const description = post.seo_description || post.excerpt || `Kinh nghiệm du lịch ${post.title} cùng ANNLETRAVEL.`;
    document.title = title;
    const setMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
        el.content = content;
    };
    const setProperty = (property, content) => {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
        el.content = content;
    };
    setMeta('description', description);
    setProperty('og:title', title); setProperty('og:description', description);
    setProperty('og:type', 'article'); setProperty('og:url', location.href);
    if (post.cover_image) setProperty('og:image', post.cover_image);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://annletravel.com/blog-detail.html?slug=${encodeURIComponent(post.slug)}`;
    const schema = { '@context':'https://schema.org', '@type':'BlogPosting', headline:post.title, description, datePublished:post.published_at || post.created_at, dateModified:post.updated_at || post.created_at, mainEntityOfPage:location.href, publisher:{'@type':'Organization',name:'ANNLETRAVEL',url:'https://annletravel.com'} };
    if (post.cover_image) schema.image = [post.cover_image];
    let ld = document.getElementById('blogSchema');
    if (!ld) { ld = document.createElement('script'); ld.id='blogSchema'; ld.type='application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(schema);
}

async function renderBlogDetail() {
    const root = document.getElementById('blogDetail');
    if (!root) return;
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) { root.innerHTML = '<div class="blog-empty">Không tìm thấy bài viết.</div>'; return; }
    const { data: post, error } = await supabaseClient.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle();
    if (error || !post) { root.innerHTML = '<div class="blog-empty">Bài viết không tồn tại hoặc chưa được xuất bản.</div>'; return; }
    updateBlogSeo(post);
    const image = post.cover_image || 'images/hero-placeholder.jpg';
    root.innerHTML = `<article class="blog-article">
        <div class="blog-article-meta"><span>${blogEscape(post.category || 'Kinh nghiệm du lịch')}</span> · ${blogFormatDate(post.published_at || post.created_at)}</div>
        <h1>${blogEscape(post.title)}</h1>
        ${post.excerpt ? `<p class="blog-article-lead">${blogEscape(post.excerpt)}</p>` : ''}
        <img class="blog-article-cover" src="${blogEscape(image)}" alt="${blogEscape(post.title)}">
        <div class="blog-article-content">${post.content}</div>
        <div class="blog-article-links">
            ${post.destination ? `<a href="tours.html?destination=${encodeURIComponent(post.destination)}">Xem tour ${blogEscape(post.destination)} →</a>` : ''}
            <a href="blog.html">← Xem thêm kinh nghiệm du lịch</a>
        </div>
    </article>`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderBlogList();
    renderBlogDetail();
});
