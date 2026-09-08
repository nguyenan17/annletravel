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

    // The shared header must exist before the language selector is initialized.
    script.onload = function () {
        const loadScript = (src, callback) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
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
            loadScript("js/i18n-multi.js", function () {
                // Re-install after shared-layout replaced the header.
                window.AnnLeMultiI18n?.install?.();
            });
        });

        // If both language scripts were already present on the page,
        // still initialize the newly-rendered shared selector.
        if (window.AnnLeMultiI18n?.install) {
            window.AnnLeMultiI18n.install();
        }
    };

    document.body.appendChild(script);
})();