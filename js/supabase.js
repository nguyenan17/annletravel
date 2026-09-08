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

    // Load the language system only after the shared header has been rendered.
    // This keeps the selector consistent on every public page and avoids
    // i18n.js running before .language-switcher exists.
    script.onload = function () {
        const loadScript = (src, callback) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                if (callback) callback();
                return;
            }

            const languageScript = document.createElement("script");
            languageScript.src = src;
            languageScript.defer = false;
            languageScript.onload = callback || null;
            document.body.appendChild(languageScript);
        };

        loadScript("js/i18n.js", function () {
            loadScript("js/i18n-multi.js");
        });
    };

    document.body.appendChild(script);
})();