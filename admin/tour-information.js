/* AnnLeTravel - structured tour information admin */
(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const modal = $("tourInformationModal");
  const form = $("tourInformationForm");
  const status = $("tourInformationStatus");
  if (!modal || !form) return;

  const fields = {
    price_note: "tiPriceNote",
    child_price_percent: "tiChildPercent",
    infant_surcharge: "tiInfantSurcharge",
    included: "tiIncluded",
    excluded: "tiExcluded",
    age_policy: "tiAgePolicy",
    child_policy: "tiChildPolicy",
    general_notes: "tiGeneralNotes",
    customer_responsibility: "tiCustomerResponsibility"
  };
  let activeTourId = null;
  let activeTourName = "";

  function setStatus(message, isError) {
    status.textContent = message || "";
    status.style.color = isError ? "#c0392b" : "#567080";
  }

  function readFields() {
    const data = {};
    Object.entries(fields).forEach(([key, id]) => {
      const el = $(id);
      data[key] = key === "child_price_percent" || key === "infant_surcharge"
        ? Number(el.value || 0)
        : el.value.trim();
    });
    return data;
  }

  function fillFields(data) {
    Object.entries(fields).forEach(([key, id]) => {
      const el = $(id);
      if (el) el.value = data?.[key] == null
        ? (key === "child_price_percent" ? "75" : key === "infant_surcharge" ? "200000" : "")
        : String(data[key]);
    });
  }

  async function getTemplate() {
    const { data, error } = await supabaseClient
      .from("tour_policy_templates")
      .select("*")
      .eq("template_key", "default")
      .maybeSingle();
    if (error) throw error;
    return data || {};
  }

  async function openEditor(tourId) {
    const tour = (window.tours || []).find(item => String(item.id) === String(tourId));
    // tours is a top-level lexical variable in admin.js; the fallback reads the table if it is not exposed.
    let tourName = tour?.name || "";
    if (!tourName) {
      const { data, error } = await supabaseClient.from("tours").select("name").eq("id", tourId).maybeSingle();
      if (error) throw error;
      tourName = data?.name || "Tour";
    }
    activeTourId = String(tourId);
    activeTourName = tourName;
    $("tourInformationTourId").value = activeTourId;
    $("tourInformationTourName").textContent = tourName;
    $("tiSaveAsTemplate").checked = false;
    setStatus("Đang tải chính sách…", false);

    const [specific, template] = await Promise.all([
      supabaseClient.from("tour_information").select("*").eq("tour_id", activeTourId).maybeSingle(),
      getTemplate()
    ]);
    if (specific.error) throw specific.error;
    fillFields(specific.data || template);
    setStatus(specific.data ? "Đang sửa chính sách riêng của tour này." : "Tour này đang dùng chính sách mẫu chung; lưu sẽ tạo bản riêng.", false);
    modal.classList.remove("hidden");
  }

  async function applyTemplate() {
    try {
      const template = await getTemplate();
      fillFields(template);
      setStatus("Đã nạp nội dung từ mẫu chung. Nhấn Lưu chính sách để áp dụng cho tour.", false);
    } catch (error) {
      console.error("Load tour policy template error:", error);
      setStatus("Không tải được mẫu chung. Hãy kiểm tra migration Supabase đã chạy chưa.", true);
    }
  }

  function closeEditor() {
    modal.classList.add("hidden");
    activeTourId = null;
    activeTourName = "";
    form.reset();
  }

  $("closeTourInformationModal")?.addEventListener("click", closeEditor);
  $("cancelTourInformationModal")?.addEventListener("click", closeEditor);
  $("tiApplyTemplate")?.addEventListener("click", applyTemplate);
  modal.addEventListener("click", event => { if (event.target === modal) closeEditor(); });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!activeTourId) return;
    const saveButton = $("saveTourInformation");
    saveButton.disabled = true;
    saveButton.textContent = "Đang lưu…";
    setStatus("Đang lưu chính sách…", false);
    const payload = { tour_id: activeTourId, ...readFields(), updated_at: new Date().toISOString() };
    try {
      const { error } = await supabaseClient.from("tour_information").upsert(payload, { onConflict: "tour_id" });
      if (error) throw error;

      if ($("tiSaveAsTemplate").checked) {
        const templatePayload = { template_key: "default", title: "Chính sách chung", ...readFields(), updated_at: new Date().toISOString() };
        const { error: templateError } = await supabaseClient.from("tour_policy_templates").upsert(templatePayload, { onConflict: "template_key" });
        if (templateError) throw templateError;
      }
      setStatus($("tiSaveAsTemplate").checked
        ? "Đã lưu chính sách cho tour và cập nhật mẫu chung."
        : "Đã lưu chính sách riêng cho tour.", false);
      alert($("tiSaveAsTemplate").checked
        ? "Đã lưu chính sách của tour và mẫu chung."
        : "Đã lưu chính sách riêng của tour.");
      closeEditor();
    } catch (error) {
      console.error("Save tour information error:", error);
      setStatus("Lưu thất bại: " + (error?.message || "Lỗi không xác định") + ". Hãy kiểm tra migration và quyền Supabase.", true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Lưu chính sách";
    }
  });

  function addPolicyButtons() {
    const body = $("tourTableBody");
    if (!body) return;
    body.querySelectorAll("tr").forEach(row => {
      const actions = row.querySelector(".action-buttons");
      if (!actions || actions.querySelector(".tour-information-button")) return;
      const itineraryButton = actions.querySelector('button[onclick*="manageItinerary"]');
      const match = itineraryButton?.getAttribute("onclick")?.match(/manageItinerary\('([^']+)'\)/);
      const editButton = actions.querySelector('button[onclick*="editTour"]');
      const editMatch = editButton?.getAttribute("onclick")?.match(/editTour\('([^']+)'\)/);
      const id = match?.[1] || editMatch?.[1];
      if (!id) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "edit-button tour-information-button";
      button.textContent = "Chính sách";
      button.addEventListener("click", () => openEditor(id).catch(error => {
        console.error("Open tour information error:", error);
        alert("Không thể mở chính sách tour. Hãy kiểm tra migration Supabase đã chạy chưa.\n\n" + (error?.message || ""));
      }));
      actions.insertBefore(button, itineraryButton?.nextSibling || null);
    });
  }

  const body = $("tourTableBody");
  if (body) new MutationObserver(addPolicyButtons).observe(body, { childList: true, subtree: true });
  addPolicyButtons();
})();
