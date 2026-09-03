const SUPABASE_URL =
    "https://dhnjsgetgvkwtoclapvu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9R_mdwBF9kPyS182epm0OA_M-39q7Qf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );