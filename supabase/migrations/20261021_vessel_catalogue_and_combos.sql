-- ANNLETRAVEL shared vessel catalogue and reusable vessel packages.
-- Additive migration: does not modify or delete existing ticket, hotel, or tour records.

CREATE TABLE IF NOT EXISTS public.vessels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    vessel_type text NOT NULL DEFAULT 'day_cruise'
        CHECK (vessel_type IN ('day_cruise','overnight_cruise','speedboat','ferry','traditional_boat','other')),
    destination text NOT NULL DEFAULT '',
    route text NOT NULL DEFAULT '',
    capacity integer CHECK (capacity IS NULL OR capacity > 0),
    star_rating integer NOT NULL DEFAULT 0 CHECK (star_rating BETWEEN 0 AND 5),
    short_description text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    cover_image text NOT NULL DEFAULT '',
    gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(gallery_images) = 'array'),
    amenities jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(amenities) = 'array'),
    translations jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(translations) = 'object'),
    active boolean NOT NULL DEFAULT true,
    featured boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vessel_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE RESTRICT,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    package_type text NOT NULL DEFAULT 'ticket'
        CHECK (package_type IN ('ticket','meal_combo','overnight','private_charter','tour_combo','other')),
    duration text NOT NULL DEFAULT '',
    meal_plan text NOT NULL DEFAULT '',
    inclusions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(inclusions) = 'array'),
    exclusions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(exclusions) = 'array'),
    price_from numeric NOT NULL DEFAULT 0 CHECK (price_from >= 0),
    child_price numeric CHECK (child_price IS NULL OR child_price >= 0),
    note text NOT NULL DEFAULT '',
    translations jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(translations) = 'object'),
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_vessel_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id text NOT NULL REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE,
    vessel_package_id uuid NOT NULL REFERENCES public.vessel_packages(id) ON DELETE RESTRICT,
    pricing_mode text NOT NULL DEFAULT 'INCLUDED' CHECK (pricing_mode IN ('INCLUDED','ADD_ON')),
    price_per_person numeric CHECK (price_per_person IS NULL OR price_per_person >= 0),
    label text NOT NULL DEFAULT '',
    note text NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tour_id, vessel_package_id)
);

CREATE INDEX IF NOT EXISTS idx_vessels_active_sort ON public.vessels(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_vessel_packages_vessel ON public.vessel_packages(vessel_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tour_vessel_options_tour ON public.tour_vessel_options(tour_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tour_vessel_options_package ON public.tour_vessel_options(vessel_package_id);

ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_vessel_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active vessels" ON public.vessels;
CREATE POLICY "Public can read active vessels" ON public.vessels
    FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins can manage vessels" ON public.vessels;
CREATE POLICY "Admins can manage vessels" ON public.vessels
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));
DROP POLICY IF EXISTS "Public can read active vessel packages" ON public.vessel_packages;
CREATE POLICY "Public can read active vessel packages" ON public.vessel_packages
    FOR SELECT TO anon, authenticated USING (
        active = true AND EXISTS (SELECT 1 FROM public.vessels v WHERE v.id = vessel_id AND v.active = true)
    );
DROP POLICY IF EXISTS "Admins can manage vessel packages" ON public.vessel_packages;
CREATE POLICY "Admins can manage vessel packages" ON public.vessel_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));
DROP POLICY IF EXISTS "Public can read active tour vessel options" ON public.tour_vessel_options;
CREATE POLICY "Public can read active tour vessel options" ON public.tour_vessel_options
    FOR SELECT TO anon, authenticated USING (
        active = true AND EXISTS (SELECT 1 FROM public.vessel_packages p JOIN public.vessels v ON v.id = p.vessel_id
          WHERE p.id = vessel_package_id AND p.active = true AND v.active = true)
    );
DROP POLICY IF EXISTS "Admins can manage tour vessel options" ON public.tour_vessel_options;
CREATE POLICY "Admins can manage tour vessel options" ON public.tour_vessel_options
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

COMMENT ON TABLE public.vessels IS 'Reusable boat and cruise catalogue shared by public services and tours.';
COMMENT ON TABLE public.vessel_packages IS 'Reusable vessel tickets and combos; prices and inclusions belong to each package.';
COMMENT ON TABLE public.tour_vessel_options IS 'Associates reusable vessel packages with a tour and stores tour-specific pricing mode/overrides.';
COMMENT ON COLUMN public.vessels.translations IS 'Optional locale-keyed fields, e.g. {"en":{"name":"...","description":"..."}}.';
