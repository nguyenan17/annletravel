-- AnnLeTravel: structured tour information and reusable policy template.
-- Safe to run more than once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.tour_policy_templates (
    template_key text PRIMARY KEY,
    title text NOT NULL DEFAULT 'Chính sách chung',
    price_note text NOT NULL DEFAULT 'Áp dụng cho khách lẻ ghép đoàn',
    child_price_percent numeric NOT NULL DEFAULT 75 CHECK (child_price_percent >= 0 AND child_price_percent <= 100),
    infant_surcharge numeric NOT NULL DEFAULT 200000 CHECK (infant_surcharge >= 0),
    included text NOT NULL DEFAULT '',
    excluded text NOT NULL DEFAULT '',
    age_policy text NOT NULL DEFAULT '',
    child_policy text NOT NULL DEFAULT '',
    general_notes text NOT NULL DEFAULT '',
    customer_responsibility text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tour_policy_templates (template_key, title)
VALUES ('default', 'Chính sách chung')
ON CONFLICT (template_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tour_information (
    tour_id text PRIMARY KEY,
    price_note text NOT NULL DEFAULT '',
    child_price_percent numeric NOT NULL DEFAULT 75 CHECK (child_price_percent >= 0 AND child_price_percent <= 100),
    infant_surcharge numeric NOT NULL DEFAULT 200000 CHECK (infant_surcharge >= 0),
    included text NOT NULL DEFAULT '',
    excluded text NOT NULL DEFAULT '',
    age_policy text NOT NULL DEFAULT '',
    child_policy text NOT NULL DEFAULT '',
    general_notes text NOT NULL DEFAULT '',
    customer_responsibility text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_policy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_information ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tour policy templates" ON public.tour_policy_templates;
CREATE POLICY "Public can read tour policy templates"
ON public.tour_policy_templates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage tour policy templates" ON public.tour_policy_templates;
CREATE POLICY "Authenticated can manage tour policy templates"
ON public.tour_policy_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read tour information" ON public.tour_information;
CREATE POLICY "Public can read tour information"
ON public.tour_information FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage tour information" ON public.tour_information;
CREATE POLICY "Authenticated can manage tour information"
ON public.tour_information FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.tour_policy_templates, public.tour_information TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tour_policy_templates, public.tour_information TO authenticated;
