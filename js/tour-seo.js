(function () {
    function updateMeta(selector, value) {
        const element = document.querySelector(selector);
        if (element && value) element.setAttribute('content', value);
    }

    function escapeValue(value) {
        return String(value ?? '').replace(/[&<>'"]/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[char]));
    }

    async function enhanceTourSeo() {
        if (typeof loadTours !== 'function') return;
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) return;

        const data = await loadTours();
        const tour = data.find(item => String(item.id) === String(id));
        if (!tour) return;

        const name = String(tour.name || '').trim();
        const destinationName = String(tour.destination || '').trim();
        const description = String(tour.short || '').trim();
        const url = `https://annletravel.com/tour-detail.html?id=${encodeURIComponent(id)}`;
        const title = `${name} | Tour ${destinationName} | ANNLETRAVEL`;
        const metaDescription = description
            ? `${description} Xem lịch khởi hành, giá tour và thông tin hành trình tại ANNLETRAVEL.`
            : `Xem chi tiết tour ${name}, lịch khởi hành và giá tour ${destinationName} tại ANNLETRAVEL.`;

        document.title = title;
        updateMeta('meta[name="description"]', metaDescription);
        document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
        updateMeta('meta[property="og:title"]', title);
        updateMeta('meta[property="og:description"]', metaDescription);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
        updateMeta('meta[name="twitter:title"]', title);
        updateMeta('meta[name="twitter:description"]', metaDescription);

        let destination = null;
        if (typeof loadDestinations === 'function') {
            const destinations = await loadDestinations();
            destination = destinations.find(item => String(item.name || '').trim().toLowerCase() === destinationName.toLowerCase());
        }

        const destinationUrl = destination
            ? `destination.html?slug=${encodeURIComponent(destination.slug)}`
            : `tours.html?destination=${encodeURIComponent(destinationName)}`;

        const container = document.getElementById('tourDetail');
        if (container && destinationName && !container.querySelector('.tour-seo-destination')) {
            const section = document.createElement('section');
            section.className = 'section tour-seo-destination';
            section.innerHTML = `
                <div class="container">
                    <span class="section-label">ĐIỂM ĐẾN</span>
                    <h2>Khám phá ${escapeValue(destinationName)}</h2>
                    <p>Khám phá thêm thông tin về ${escapeValue(destinationName)}, trải nghiệm nổi bật và các tour đang được ANNLETRAVEL cung cấp.</p>
                    <a class="view-all" href="${destinationUrl}">Xem điểm đến ${escapeValue(destinationName)} →</a>
                </div>
            `;
            container.appendChild(section);
        }

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name,
            description: metaDescription,
            url,
            provider: {
                '@type': 'TravelAgency',
                name: 'ANNLETRAVEL',
                url: 'https://annletravel.com/'
            }
        };
        if (destinationName) {
            schema.itinerary = { '@type': 'Place', name: destinationName, url: destinationUrl };
        }

        let schemaElement = document.getElementById('tourSchema');
        if (!schemaElement) {
            schemaElement = document.createElement('script');
            schemaElement.id = 'tourSchema';
            schemaElement.type = 'application/ld+json';
            document.head.appendChild(schemaElement);
        }
        schemaElement.textContent = JSON.stringify(schema);
    }

    document.addEventListener('DOMContentLoaded', enhanceTourSeo);
})();
