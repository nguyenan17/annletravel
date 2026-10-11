/* AnnLeTravel - public tour pricing and policy sections */
(function () {
  "use strict";
  const escapeHtml = value => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const money = value => new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + " ₫";
  const lines = value => String(value || "").split(/\r?\n/)
    .map(line => line.trim().replace(/^[●•✔✓\-*]+\s*/, ""))
    .filter(Boolean);

  async function renderInformation() {
    const container = document.getElementById("tourDetail");
    if (!container || !window.supabaseClient) return;
    const tourId = new URLSearchParams(window.location.search).get("id");
    if (!tourId || container.dataset.policyLoadingFor === tourId || container.dataset.policyRenderedFor === tourId) return;
    if (!container.children.length) return;
    container.dataset.policyLoadingFor = tourId;
    try {
      const [specificResult, templateResult, tourResult] = await Promise.all([
        supabaseClient.from("tour_information").select("*").eq("tour_id", tourId).maybeSingle(),
        supabaseClient.from("tour_policy_templates").select("*").eq("template_key", "default").maybeSingle(),
        supabaseClient.from("tours").select("price").eq("id", tourId).maybeSingle()
      ]);
      if (specificResult.error) throw specificResult.error;
      if (templateResult.error) throw templateResult.error;
      if (tourResult.error) throw tourResult.error;
      const info = specificResult.data || templateResult.data;
      if (!info) return;

      const adultPrice = Number(tourResult.data?.price) || 0;
      const childPercent = Number(info.child_price_percent ?? 75);
      const infantSurcharge = Number(info.infant_surcharge ?? 200000);
      const childPrice = Math.round(adultPrice * childPercent / 100);
      const included = lines(info.included);
      const excluded = lines(info.excluded);
      const hasContent = Boolean(info.price_note || included.length || excluded.length || info.age_policy || info.child_policy || info.general_notes || info.customer_responsibility);
      if (!hasContent) return;

      const listHtml = items => items.length
        ? '<ul>' + items.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul>'
        : '<p class="tour-information-text">Thông tin đang được cập nhật.</p>';
      const textBlock = value => value
        ? '<p class="tour-information-text">' + escapeHtml(value) + '</p>'
        : '<p class="tour-information-text">Thông tin đang được cập nhật.</p>';

      const section = document.createElement("section");
      section.className = "tour-information-sections";
      section.innerHTML = `
        <section class="tour-information-block">
          <h2>Giá tour & chính sách giá</h2>
          ${info.price_note ? '<p class="tour-information-text">' + escapeHtml(info.price_note) + '</p>' : ''}
          <div class="tour-information-pricing">
            <div class="tour-information-price-item"><span>Người lớn</span><strong>${money(adultPrice)}</strong></div>
            <div class="tour-information-price-item"><span>Trẻ em (5–9 tuổi, ${escapeHtml(childPercent)}%)</span><strong>${money(childPrice)}</strong></div>
            <div class="tour-information-price-item"><span>Trẻ miễn phí (1–4 tuổi)</span><strong>Phụ thu ${money(infantSurcharge)}</strong></div>
          </div>
          ${info.age_policy ? '<h3 style="margin-top:18px">Quy định tính tuổi</h3>' + textBlock(info.age_policy) : ''}
        </section>
        <section class="tour-information-block"><h2>Giá tour bao gồm</h2>${listHtml(included)}</section>
        <section class="tour-information-block"><h2>Không bao gồm</h2>${listHtml(excluded)}</section>
        <section class="tour-information-block"><h2>Chính sách trẻ em</h2>${textBlock(info.child_policy)}</section>
        <section class="tour-information-block"><h2>Lưu ý chung</h2>${textBlock(info.general_notes)}</section>
        <section class="tour-information-block"><h2>Trách nhiệm khách hàng</h2>${textBlock(info.customer_responsibility)}</section>
      `;
      if (container.dataset.policyLoadingFor !== tourId) return;
      container.appendChild(section);
      container.dataset.policyRenderedFor = tourId;
    } catch (error) {
      console.warn("Tour information not available; detail page continues without policy section.", error);
    } finally {
      if (container.dataset.policyLoadingFor === tourId) delete container.dataset.policyLoadingFor;
    }
  }

  function watchDetail() {
    const container = document.getElementById("tourDetail");
    if (!container) return;
    const observer = new MutationObserver(() => {
      const currentId = new URLSearchParams(window.location.search).get("id");
      if (container.dataset.policyRenderedFor && container.dataset.policyRenderedFor !== currentId) {
        delete container.dataset.policyRenderedFor;
      }
      renderInformation();
    });
    observer.observe(container, { childList: true, subtree: false });
    renderInformation();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchDetail);
  else watchDetail();
})();
