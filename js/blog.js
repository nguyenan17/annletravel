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

function blogAbsoluteUrl(path) {
    try { return new URL(path, location.origin).href; } catch (_) { return path; }
}

function blogSlugify(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function updateBlogSeo(post) {
    const title = String(post.seo_title || `${post.title} | ANNLETRAVEL`).trim();
    const description = String(post.seo_description || post.excerpt || `Kinh nghiệm du lịch ${post.title} cùng ANNLETRAVEL.`).trim();
    const canonicalUrl = `https://annletravel.com/blog-detail.html?slug=${encodeURIComponent(post.slug)}`;
    const imageUrl = post.cover_image ? blogAbsoluteUrl(post.cover_image) : blogAbsoluteUrl('images/hero-placeholder.jpg');
    const publishedDate = post.published_at || post.created_at;
    const modifiedDate = post.updated_at || publishedDate;
    const category = String(post.category || 'Kinh nghiệm du lịch').trim();
    const destination = String(post.destination || '').trim();
    const keywords = [post.title, category, destination, 'kinh nghiệm du lịch', 'du lịch', 'ANNLETRAVEL'].filter(Boolean).join(', ');

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
    setMeta('keywords', keywords);
    setMeta('author', 'ANNLETRAVEL');
    setMeta('robots', 'index,follow,max-image-preview:large');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);
    setProperty('og:site_name', 'ANNLETRAVEL');
    setProperty('og:title', title);
    setProperty('og:description', description);
    setProperty('og:type', 'article');
    setProperty('og:url', canonicalUrl);
    setProperty('og:image', imageUrl);
    setProperty('og:image:alt', post.title);
    setProperty('article:published_time', publishedDate || '');
    setProperty('article:modified_time', modifiedDate || '');
    setProperty('article:section', category);
    if (destination) setProperty('article:tag', destination);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        headline: post.title,
        description,
        url: canonicalUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        datePublished: publishedDate,
        dateModified: modifiedDate,
        author: { '@type': 'Organization', name: 'ANNLETRAVEL', url: 'https://annletravel.com' },
        publisher: { '@type': 'Organization', name: 'ANNLETRAVEL', url: 'https://annletravel.com', logo: { '@type': 'ImageObject', url: blogAbsoluteUrl('images/logo.png') } },
        image: [imageUrl],
        articleSection: category,
        keywords
    };
    if (destination) schema.about = { '@type': 'Place', name: destination };

    let ld = document.getElementById('blogSchema');
    if (!ld) { ld = document.createElement('script'); ld.id = 'blogSchema'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(schema);

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://annletravel.com/' },
            { '@type': 'ListItem', position: 2, name: 'Kinh nghiệm du lịch', item: 'https://annletravel.com/blog.html' },
            { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl }
        ]
    };
    let breadcrumbLd = document.getElementById('blogBreadcrumbSchema');
    if (!breadcrumbLd) { breadcrumbLd = document.createElement('script'); breadcrumbLd.id = 'blogBreadcrumbSchema'; breadcrumbLd.type = 'application/ld+json'; document.head.appendChild(breadcrumbLd); }
    breadcrumbLd.textContent = JSON.stringify(breadcrumb);
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
        <img class="blog-article-cover" src="${blogEscape(image)}" alt="${blogEscape(post.title)}" loading="eager">
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
