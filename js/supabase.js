const SUPABASE_URL =
    "https://dhnjsgetgvkwtoclapvu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9R_mdwBF9kPyS182epm0OA_M-39q7Qf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// Shared public header/footer. Admin pages are excluded by shared-layout.js.
(function loadSharedLayout() {
    if (window.location.pathname.includes("/admin/")) return;
    const script = document.createElement("script");
    script.src = "js/shared-layout.js";
    script.defer = false;
    document.body.appendChild(script);
})();
