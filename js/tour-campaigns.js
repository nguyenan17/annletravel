/* ANNLETRAVEL - TIME-LIMITED TOUR CAMPAIGNS */
(function () {
  "use strict";

  const SEASONAL = {
    spring: { title: "Du xuân", label: "MÙA XUÂN", description: "Hành trình đầu năm, lễ hội, văn hóa và những chuyến đi khởi đầu một năm mới.", months: [1, 2, 3], icon: "🌸" },
    summer: { title: "Mùa biển & nghỉ dưỡng", label: "MÙA HÈ", description: "Biển xanh, nghỉ dưỡng và những chuyến đi dành cho gia đình, bạn bè.", months: [4, 5, 6, 7, 8], icon: "☀️" },
    autumn: { title: "Mùa thu & trải nghiệm", label: "MÙA THU", description: "Không khí se lạnh, mùa lúa chín, lá vàng và những cung đường đầy cảm hứng.", months: [9, 10, 11], icon: "🍁" },
    winter: { title: "Mùa hoa & tuyết", label: "MÙA ĐÔNG", description: "Săn tuyết, ngắm hoa và chuẩn bị cho những hành trình cuối năm – đầu năm.", months: [12], icon: "❄️" }
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>\"']/g, function (c) {
      var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      };
      return map[c] || c;
    });
  }

  function date(v) {
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatCampaignPrice(v) {
    return Number(v || 0).toLocaleString("vi-VN") + "đ";
  }

  function renderPromotions(data) {
    var host = document.getElementById("limitedPromotionTours");
    if (!host) return;

    var now = new Date();
    var items = (Array.isArray(data) ? data : []).filter(function (t) {
      var s = date(t.campaign_start_at);
      var e = date(t.campaign_end_at);
      return t.campaign_enabled === true &&
        t.campaign_type === "promotion" &&
        s && e &&
        now >= s &&
        now <= e;
    });

    if (!items.length) {
      var section = host.closest(".campaign-section");
      if (section) section.remove();
      return;
    }

    host.innerHTML = items.slice(0, 3).map(function (t) {
      var image = String(t.image || "").replace(/'/g, "%27");
      var href = "tour-detail.html?id=" + encodeURIComponent(t.id);

      return [
        '<article class="campaign-tour-card">',
          '<a class="campaign-tour-image" href="', href, '" style="background-image:url(', "'", image, "'", ')">',
            '<span class="campaign-badge">🔥 ƯU ĐÃI CÓ HẠN</span>',
          '</a>',
          '<div class="campaign-tour-body">',
            '<p class="campaign-tour-destination">', esc(t.destination), '</p>',
            '<h3>', esc(t.name), '</h3>',
            '<p>', esc(t.short), '</p>',
            '<div class="campaign-tour-bottom">',
              '<strong>', (t.sale_price ? formatCampaignPrice(t.sale_price) : formatCampaignPrice(t.price)), '</strong>',
              '<a href="', href, '">Xem tour →</a>',
            '</div>',
          '</div>',
        '</article>'
      ].join("");
    }).join("");

    var first = items[0];
    var title = document.getElementById("promotionCampaignTitle");
    var desc = document.getElementById("promotionCampaignDescription");

    if (title) title.textContent = "Ưu đãi đang diễn ra";
    if (desc) desc.textContent = "Ưu đãi có thời hạn cho những hành trình đang mở bán.";

    document.querySelectorAll("[data-countdown-end]").forEach(function (node) {
      node.dataset.countdownEnd = first.campaign_end_at;
    });
  }

  function updateCountdowns() {
    document.querySelectorAll("[data-countdown-end]").forEach(function (node) {
      var end = date(node.dataset.countdownEnd);
      if (!end) return;

      var diff = Math.max(0, end.getTime() - Date.now());
      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var mins = Math.floor((totalSeconds % 3600) / 60);
      var secs = totalSeconds % 60;

      if (!diff) {
        node.textContent = "Ưu đãi đã kết thúc";
        return;
      }

      node.innerHTML =
        "<span><b>" + String(days).padStart(2, "0") + "</b><small>Ngày</small></span>" +
        "<i>:</i>" +
        "<span><b>" + String(hours).padStart(2, "0") + "</b><small>Giờ</small></span>" +
        "<i>:</i>" +
        "<span><b>" + String(mins).padStart(2, "0") + "</b><small>Phút</small></span>" +
        "<i>:</i>" +
        "<span><b>" + String(secs).padStart(2, "0") + "</b><small>Giây</small></span>";
    });
  }

  function season() {
    var month = new Date().getMonth() + 1;
    return Object.keys(SEASONAL).find(function (key) {
      return SEASONAL[key].months.includes(month);
    }) || "spring";
  }

  function renderSeasonal() {
    var host = document.getElementById("seasonalCampaigns");
    if (!host) return;

    var keys = Object.keys(SEASONAL);
    var current = season();
    var start = keys.indexOf(current);

    var selected = [0, 1, 2].map(function (i) {
      return keys[(start + i) % keys.length];
    });

    host.innerHTML = selected.map(function (key, index) {
      var item = SEASONAL[key];
      return '<a class="season-campaign-card ' + (index === 0 ? "current" : "") + '" href="tours.html?season=' + key + '">' +
        '<span class="season-campaign-icon">' + item.icon + '</span>' +
        '<span class="season-campaign-label">' + item.label + '</span>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.description + '</p>' +
        '<span class="season-campaign-link">Khám phá hành trình →</span>' +
      '</a>';
    }).join("");
  }

  function renderExperiences() {
    var host = document.getElementById("experienceTours");
    if (!host) return;

    var items = Array.isArray(window.__annleCampaignTours) ? window.__annleCampaignTours : [];
    var experienceItems = items.filter(function (t) {
      return t.experience_enabled === true;
    }).slice(0, 3);

    host.innerHTML = experienceItems.map(function (t) {
      return '<a class="experience-card" href="tour-detail.html?id=' + encodeURIComponent(t.id) + '">' +
        '<span class="experience-icon">🌿</span>' +
        '<div><h3>' + esc(t.name) + '</h3><p>' + esc(t.short) + '</p><span>Xem hành trình →</span></div>' +
      '</a>';
    }).join("");
  }

  async function init() {
    if (typeof window.loadTours !== "function") return;

    var data = await window.loadTours();
    window.__annleCampaignTours = Array.isArray(data) ? data : [];

    renderPromotions(window.__annleCampaignTours);
    renderSeasonal();
    renderExperiences();
    updateCountdowns();

    if (window.__annleCampaignTimer) {
      clearInterval(window.__annleCampaignTimer);
    }

    window.__annleCampaignTimer = setInterval(updateCountdowns, 1000);
  }

  window.AnnLeCampaigns = {
    seasonal: SEASONAL
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();