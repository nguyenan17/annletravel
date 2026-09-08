/* ANNLETRAVEL shared public header */
(function () {
  function currentPage() { return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase(); }
  function navItem(href, label, active) { return '<a href="' + href + '"' + (active ? ' class="active"' : '') + '>' + label + '</a>'; }
  function destinationDropdown(active) { return '<div class="nav-dropdown"><a href="destinations.html"' + (active ? ' class="active"' : '') + '>Điểm đến <span class="nav-chevron">▾</span></a><ul id="destinationMenu" class="dropdown-menu"></ul></div>'; }
  function serviceDropdown(active) {
    return '<div class="nav-dropdown"><a href="services.html"' + (active ? ' class="active"' : '') + '>Dịch vụ <span class="nav-chevron">▾</span></a><ul class="dropdown-menu service-menu">' +
      '<li><a href="services.html?category=flights">✈️ Vé máy bay</a></li><li><a href="services.html?category=hotels">🏨 Khách sạn</a></li><li><a href="services.html?category=visa">🛂 Visa</a></li><li><a href="services.html?category=passport">🪪 Hộ chiếu</a></li><li><a href="tickets.html">🎫 Vé vui chơi &amp; tham quan</a></li><li><a href="services.html?category=transport">🚗 Xe đưa đón</a></li><li><a href="services.html?category=trains">🚆 Vé tàu</a></li><li><a href="services.html?category=insurance">🛡️ Bảo hiểm du lịch</a></li>' +
      '</ul></div>';
  }
  function ensureAudienceCss() {
    if (!document.querySelector('link[href$="css/audience.css"]')) { var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'css/audience.css'; document.head.appendChild(link); }
  }
  function renderHeader() {
    var existing = document.querySelector('.header'); if (!existing) return;
    var page = currentPage();
    var isBusiness = document.body.classList.contains('business-page') || page === 'business.html';
    var isAbout = page === 'about.html', isTours = page === 'tours.html';
    var isDestinations = page === 'destinations.html' || page === 'destination.html';
    var isServices = page === 'services.html' || page === 'service-detail.html' || page === 'tickets.html' || page === 'ticket-detail.html';
    var homeHref = isBusiness ? 'business.html' : 'ca-nhan.html';
    var contactHref = isBusiness ? 'business.html#businessContact' : 'ca-nhan.html#contact';
    var menu = '';
    if (isBusiness) {
      menu += navItem('business.html', 'Trang chủ', page === 'business.html');
      menu += '<a href="business.html#businessServices">Giải pháp</a><a href="business.html#businessProcess">Quy trình</a>';
      menu += destinationDropdown(isDestinations);
      menu += navItem('about.html', 'Về chúng tôi', isAbout);
      menu += navItem(contactHref, 'Tư vấn', false);
    } else {
      menu += navItem(homeHref, 'Trang chủ', page === 'ca-nhan.html');
      menu += navItem('tours.html', 'Tour', isTours);
      menu += destinationDropdown(isDestinations);
      menu += serviceDropdown(isServices);
      menu += navItem('business.html', 'Doanh nghiệp', false);
      menu += navItem('about.html', 'Về chúng tôi', isAbout);
      menu += navItem(contactHref, 'Liên hệ', false);
    }
    existing.className = isBusiness ? 'header audience-header business-shared-header' : 'header audience-header personal-shared-header';
    existing.innerHTML = '<div class="container header-container"><a href="' + homeHref + '" class="logo"><img src="images/logo.png" alt="ANNLETRAVEL"></a><nav class="menu">' + menu + '</nav><a href="' + (isBusiness ? 'ca-nhan.html' : 'business.html') + '" class="audience-switch-btn">' + (isBusiness ? 'Cá nhân' : 'Doanh nghiệp') + '</a></div>';
    document.documentElement.dataset.audience = isBusiness ? 'business' : 'personal';
  }
  function init() { ensureAudienceCss(); renderHeader(); }
  if (document.querySelector('.header')) init(); else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
})();
