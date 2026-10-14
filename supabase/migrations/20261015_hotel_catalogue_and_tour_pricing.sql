-- ANNLETRAVEL hotel catalogue and tour accommodation pricing.
-- Run once in Supabase SQL Editor before using the hotel management screens.

CREATE TABLE IF NOT EXISTS public.hotels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    destination text NOT NULL DEFAULT '',
    address text NOT NULL DEFAULT '',
    star_rating integer NOT NULL DEFAULT 0 CHECK (star_rating BETWEEN 0 AND 5),
    short_description text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    cover_image text NOT NULL DEFAULT '',
    gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
    amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
    breakfast_included boolean NOT NULL DEFAULT false,
    breakfast_description text NOT NULL DEFAULT '',
    phone text NOT NULL DEFAULT '',
    website text NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT true,
    featured boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hotel_room_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    bed_type text NOT NULL DEFAULT '',
    max_guests integer NOT NULL DEFAULT 2 CHECK (max_guests > 0),
    room_size_m2 numeric,
    amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_hotel_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id text NOT NULL,
    hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_type_id uuid REFERENCES public.hotel_room_types(id) ON DELETE SET NULL,
    pricing_mode text NOT NULL DEFAULT 'INCLUDED' CHECK (pricing_mode IN ('INCLUDED', 'ADD_ON')),
    price_per_person numeric NOT NULL DEFAULT 0 CHECK (price_per_person >= 0),
    room_price_per_night numeric NOT NULL DEFAULT 0 CHECK (room_price_per_night >= 0),
    max_guests_per_room integer NOT NULL DEFAULT 2 CHECK (max_guests_per_room > 0),
    nights integer NOT NULL DEFAULT 1 CHECK (nights > 0),
    package_price_per_person numeric CHECK (package_price_per_person IS NULL OR package_price_per_person >= 0),
    label text NOT NULL DEFAULT '',
    note text NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS hotel_option_id uuid REFERENCES public.tour_hotel_options(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS hotel_name_snapshot text,
    ADD COLUMN IF NOT EXISTS room_type_snapshot text,
    ADD COLUMN IF NOT EXISTS pricing_mode_snapshot text,
    ADD COLUMN IF NOT EXISTS hotel_amount_snapshot numeric,
    ADD COLUMN IF NOT EXISTS total_amount_snapshot numeric;

CREATE INDEX IF NOT EXISTS idx_hotels_active_sort ON public.hotels(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel ON public.hotel_room_types(hotel_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tour_hotel_options_tour ON public.tour_hotel_options(tour_id, active, sort_order);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_hotel_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active hotels" ON public.hotels;
CREATE POLICY "Public can read active hotels" ON public.hotels
    FOR SELECT TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Authenticated can manage hotels" ON public.hotels;
CREATE POLICY "Authenticated can manage hotels" ON public.hotels
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can read active hotel rooms" ON public.hotel_room_types;
CREATE POLICY "Public can read active hotel rooms" ON public.hotel_room_types
    FOR SELECT TO anon, authenticated USING (
        active = true AND EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.active = true)
    );

DROP POLICY IF EXISTS "Authenticated can manage hotel rooms" ON public.hotel_room_types;
CREATE POLICY "Authenticated can manage hotel rooms" ON public.hotel_room_types
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read active tour hotel options" ON public.tour_hotel_options;
CREATE POLICY "Public can read active tour hotel options" ON public.tour_hotel_options
    FOR SELECT TO anon, authenticated USING (
        active = true AND EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.active = true)
    );

DROP POLICY IF EXISTS "Authenticated can manage tour hotel options" ON public.tour_hotel_options;
CREATE POLICY "Authenticated can manage tour hotel options" ON public.tour_hotel_options
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.hotels IS 'Reusable hotel catalogue shared by the hotel landing page and tour options.';
COMMENT ON TABLE public.tour_hotel_options IS 'Accommodation choices and pricing for a specific tour. INCLUDED means package price is used; ADD_ON means lodging is added to the base tour price.';
COMMENT ON COLUMN public.bookings.hotel_name_snapshot IS 'Hotel name captured at booking time; independent of later catalogue edits.';
