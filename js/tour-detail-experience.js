/* ANNLETRAVEL — tour-detail progressive enhancement
 * Enhances the existing Supabase-rendered detail page without replacing
 * its itinerary, lightbox, policy renderer or atomic booking flow.
 */
(function () {
  "use strict";

  const container = document.getElementById("tourDetail");
  if (!container) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
  const money = value => new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "đ";

  function getTour() {
    const id = new URLSearchParams(window.location.search).get("id");
    try {
      if (typeof tours !== "undefined" && Array.isArray(tours)) {
        return tours.find(item => String(item.id) === String(id)) || null;
      }
    } catch (_) {}
    return null;
  }

  function addAnchorNav() {
    if (container.querySelector(".tour-experience-nav")) return;
    const hero = container.querySelector(".detail-hero");
    const detail = container.querySelector(".detail-grid");
    if (!hero || !detail) return;

    const gallery = container.querySelector(".tour-gallery");
    const itinerary = container.querySelector("#tourItinerary");
    const policy = container.querySelector(".tour-information-sections");
    detail.id = "tourOverview";
    if (gallery) gallery.id = "tourGallerySection";
    if (itinerary) itinerary.id = "tourItinerary";
    if (policy) policy.id = "tourPolicySections";

    const nav = document.createElement("nav");
    nav.className = "tour-experience-nav";
    nav.setAttribute("aria-label", "Điều hướng nội dung tour");
    nav.innerHTML = [
      '<a href="#tourOverview">Tổng quan</a>',
      '<a href="#tourItinerary">Lịch trình</a>',
      gallery ? '<a href="#tourGallerySection">Hình ảnh</a>' : "",
      '<a href="#tourPolicySections">Chính sách</a>'
    ].filter(Boolean).join("");
    hero.insertAdjacentElement("afterend", nav);

    nav.addEventListener("click", event => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      const target = container.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function enhanceHero() {
    const hero = container.querySelector(".detail-hero");
    const image = hero?.querySelector(".detail-image");
    const detail = container.querySelector(".detail-grid");
    const left = detail?.firstElementChild;
    if (!hero || !image || !left || hero.querySelector(".experience-hero-copy")) return;

    const eyebrow = left.querySelector(".section-label");
    const heading = left.querySelector("h1");
    const lead = left.querySelector(".lead");
    if (!heading) return;

    const copy = document.createElement("div");
    copy.className = "experience-hero-copy";
    if (eyebrow) {
      eyebrow.classList.add("experience-eyebrow");
      copy.appendChild(eyebrow);
    }
    copy.appendChild(heading);
    if (lead) copy.appendChild(lead);

    const tour = getTour();
    const meta = document.createElement("div");
    meta.className = "experience-hero-meta";
    const dateText = tour?.is_daily ? "Khởi hành hằng ngày" :
      (tour?.displayDate ? "Khởi hành " + tour.displayDate : "");
    const destinationText = tour?.destination || eyebrow?.textContent || "";
    const seatText = tour?.unlimited_seats ? "Không giới hạn chỗ" :
      (Number.isFinite(Number(tour?.seats)) ? "Còn " + (Number(tour?.seats) || 0) + " chỗ" : "");
    [destinationText, dateText, seatText].filter(Boolean).forEach((label, index) => {
      const chip = document.createElement("span");
      chip.className = "experience-meta-chip";
      chip.textContent = (index === 0 ? "⌖  " : index === 1 ? "◷  " : "♧  ") + label;
      meta.appendChild(chip);
    });
    copy.appendChild(meta);
    hero.appendChild(copy);
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", "Mở thư viện ảnh tour");
    image.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && event.target === image) {
        event.preventDefault();
        if (typeof openTourLightbox === "function") openTourLightbox(0);
      }
    });
  }

  function enhanceBooking() {
    if (document.querySelector(".tour-mobile-booking")) return;
    const tour = getTour();
    if (!tour) return;
    const bar = document.createElement("div");
    bar.className = "tour-mobile-booking";
    bar.innerHTML = `
      <div class="tour-mobile-booking-inner">
        <div class="tour-mobile-price"><small>Giá từ / khách</small><strong>${esc(money(tour.price))}</strong></div>
        <button type="button" aria-label="Đăng ký tour này">Đăng ký ngay <span aria-hidden="true">→</span></button>
      </div>`;
    bar.querySelector("button").addEventListener("click", () => {
      if (typeof registerTour === "function") registerTour(tour.id);
    });
    document.body.appendChild(bar);
    document.body.classList.add("tour-mobile-cta-visible");
  }

  function enhance() {
    if (!container.querySelector(".detail-grid")) return;
    enhanceHero();
    addAnchorNav();
    enhanceBooking();
    const policy = container.querySelector(".tour-information-sections");
    if (policy && !policy.id) policy.id = "tourPolicySections";
  }

  const observer = new MutationObserver(() => {
    if (!container.querySelector(".detail-grid")) return;
    enhance();
  });
  observer.observe(container, { childList: true, subtree: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance, { once: true });
  } else {
    enhance();
  }
})();
