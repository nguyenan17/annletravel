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
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can read active tour hotel options" ON public.tour_hotel_options;
CREATE POLICY "Public can read active tour hotel options" ON public.tour_hotel_options
    FOR SELECT TO anon, authenticated USING (
        active = true AND EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.active = true)
    );

DROP POLICY IF EXISTS "Authenticated can manage tour hotel options" ON public.tour_hotel_options;
CREATE POLICY "Authenticated can manage tour hotel options" ON public.tour_hotel_options
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));


DROP POLICY IF EXISTS "Admins can read all hotels" ON public.hotels;
CREATE POLICY "Admins can read all hotels" ON public.hotels
    FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all hotel rooms" ON public.hotel_room_types;
CREATE POLICY "Admins can read all hotel rooms" ON public.hotel_room_types
    FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all tour hotel options" ON public.tour_hotel_options;
CREATE POLICY "Admins can read all tour hotel options" ON public.tour_hotel_options
    FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

COMMENT ON TABLE public.hotels IS 'Reusable hotel catalogue shared by the hotel landing page and tour options.';
COMMENT ON TABLE public.tour_hotel_options IS 'Accommodation choices and pricing for a specific tour. INCLUDED means package price is used; ADD_ON means lodging is added to the base tour price.';
COMMENT ON COLUMN public.bookings.hotel_name_snapshot IS 'Hotel name captured at booking time; independent of later catalogue edits.';

-- Atomic booking RPCs: validate the selected option and save immutable price snapshots.
-- Replace the older 5-argument signatures so PostgREST has no ambiguous overloads.
DROP FUNCTION IF EXISTS public.create_booking(text, text, text, integer, text);
DROP FUNCTION IF EXISTS public.create_booking_unlimited(text, text, text, integer, text);

CREATE OR REPLACE FUNCTION public.create_booking(
    p_tour_id text,
    p_customer_name text,
    p_phone text,
    p_people integer,
    p_note text DEFAULT '',
    p_hotel_option_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour public.tours%ROWTYPE;
    v_booking public.bookings%ROWTYPE;
    v_option public.tour_hotel_options%ROWTYPE;
    v_hotel_name text;
    v_room_snapshot text;
    v_pricing_mode text;
    v_hotel_amount numeric := 0;
    v_total_amount numeric := 0;
    v_remaining_seats integer;
BEGIN
    IF COALESCE(trim(p_tour_id), '') = '' THEN RAISE EXCEPTION 'TOUR_NOT_FOUND'; END IF;
    IF COALESCE(trim(p_customer_name), '') = '' THEN RAISE EXCEPTION 'INVALID_CUSTOMER_NAME'; END IF;
    IF COALESCE(trim(p_phone), '') = '' THEN RAISE EXCEPTION 'INVALID_PHONE'; END IF;
    IF p_people IS NULL OR p_people <= 0 THEN RAISE EXCEPTION 'INVALID_PEOPLE'; END IF;

    SELECT * INTO v_tour FROM public.tours WHERE id::text = p_tour_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'TOUR_NOT_FOUND'; END IF;
    IF COALESCE(v_tour.unlimited_seats, false) THEN RAISE EXCEPTION 'TOUR_IS_UNLIMITED'; END IF;
    IF COALESCE(v_tour.seats, 0) < p_people THEN RAISE EXCEPTION 'NOT_ENOUGH_SEATS'; END IF;

    IF p_hotel_option_id IS NOT NULL THEN
        SELECT o.* INTO v_option
        FROM public.tour_hotel_options o
        JOIN public.hotels h ON h.id = o.hotel_id
        WHERE o.id = p_hotel_option_id
          AND o.tour_id = p_tour_id
          AND o.active = true
          AND h.active = true
        FOR SHARE OF o, h;
        IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_HOTEL_OPTION'; END IF;

        SELECT name INTO v_hotel_name FROM public.hotels WHERE id = v_option.hotel_id;
        v_room_snapshot := COALESCE(NULLIF(trim(v_option.label), ''), 'Gói lưu trú');
        v_pricing_mode := v_option.pricing_mode;
        IF v_option.pricing_mode = 'INCLUDED' THEN
            v_total_amount := COALESCE(v_option.package_price_per_person, v_tour.price, 0) * p_people;
        ELSE
            v_hotel_amount := (COALESCE(v_option.price_per_person, 0) * p_people)
                + (CEIL(p_people::numeric / GREATEST(v_option.max_guests_per_room, 1))
                    * COALESCE(v_option.room_price_per_night, 0) * GREATEST(v_option.nights, 1));
            v_total_amount := COALESCE(v_tour.price, 0) * p_people + v_hotel_amount;
        END IF;
    ELSE
        v_total_amount := COALESCE(v_tour.price, 0) * p_people;
    END IF;

    v_remaining_seats := v_tour.seats - p_people;
    INSERT INTO public.bookings (
        tour_id, customer_name, phone, people, note, status,
        hotel_option_id, hotel_name_snapshot, room_type_snapshot,
        pricing_mode_snapshot, hotel_amount_snapshot, total_amount_snapshot
    ) VALUES (
        v_tour.id, trim(p_customer_name), trim(p_phone), p_people, COALESCE(trim(p_note), ''), 'PENDING',
        p_hotel_option_id, v_hotel_name, v_room_snapshot, v_pricing_mode, v_hotel_amount, v_total_amount
    ) RETURNING * INTO v_booking;

    UPDATE public.tours SET seats = v_remaining_seats, updated_at = now() WHERE id::text = p_tour_id;
    RETURN json_build_object('success', true, 'booking_id', v_booking.id, 'tour_id', p_tour_id,
        'people', p_people, 'remaining_seats', v_remaining_seats, 'total_amount', v_total_amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_booking_unlimited(
    p_tour_id text,
    p_customer_name text,
    p_phone text,
    p_people integer,
    p_note text DEFAULT '',
    p_hotel_option_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour public.tours%ROWTYPE;
    v_booking public.bookings%ROWTYPE;
    v_option public.tour_hotel_options%ROWTYPE;
    v_hotel_name text;
    v_room_snapshot text;
    v_pricing_mode text;
    v_hotel_amount numeric := 0;
    v_total_amount numeric := 0;
BEGIN
    IF p_people IS NULL OR p_people <= 0 THEN RAISE EXCEPTION 'INVALID_PEOPLE'; END IF;
    IF COALESCE(trim(p_customer_name), '') = '' OR COALESCE(trim(p_phone), '') = '' THEN
        RAISE EXCEPTION 'MISSING_CUSTOMER_DETAILS';
    END IF;

    SELECT * INTO v_tour FROM public.tours WHERE id::text = p_tour_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'TOUR_NOT_FOUND'; END IF;
    IF COALESCE(v_tour.unlimited_seats, false) IS NOT TRUE THEN RAISE EXCEPTION 'TOUR_NOT_UNLIMITED'; END IF;

    IF p_hotel_option_id IS NOT NULL THEN
        SELECT o.* INTO v_option
        FROM public.tour_hotel_options o
        JOIN public.hotels h ON h.id = o.hotel_id
        WHERE o.id = p_hotel_option_id AND o.tour_id = p_tour_id AND o.active = true AND h.active = true
        FOR SHARE OF o, h;
        IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_HOTEL_OPTION'; END IF;
        SELECT name INTO v_hotel_name FROM public.hotels WHERE id = v_option.hotel_id;
        v_room_snapshot := COALESCE(NULLIF(trim(v_option.label), ''), 'Gói lưu trú');
        v_pricing_mode := v_option.pricing_mode;
        IF v_option.pricing_mode = 'INCLUDED' THEN
            v_total_amount := COALESCE(v_option.package_price_per_person, v_tour.price, 0) * p_people;
        ELSE
            v_hotel_amount := (COALESCE(v_option.price_per_person, 0) * p_people)
                + (CEIL(p_people::numeric / GREATEST(v_option.max_guests_per_room, 1))
                    * COALESCE(v_option.room_price_per_night, 0) * GREATEST(v_option.nights, 1));
            v_total_amount := COALESCE(v_tour.price, 0) * p_people + v_hotel_amount;
        END IF;
    ELSE
        v_total_amount := COALESCE(v_tour.price, 0) * p_people;
    END IF;

    INSERT INTO public.bookings (
        tour_id, customer_name, phone, people, note, status,
        hotel_option_id, hotel_name_snapshot, room_type_snapshot,
        pricing_mode_snapshot, hotel_amount_snapshot, total_amount_snapshot
    ) VALUES (
        v_tour.id, trim(p_customer_name), trim(p_phone), p_people, COALESCE(trim(p_note), ''), 'PENDING',
        p_hotel_option_id, v_hotel_name, v_room_snapshot, v_pricing_mode, v_hotel_amount, v_total_amount
    ) RETURNING * INTO v_booking;

    RETURN jsonb_build_object('success', true, 'booking_id', v_booking.id, 'tour_id', p_tour_id,
        'people', p_people, 'unlimited_seats', true, 'total_amount', v_total_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, integer, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_unlimited(text, text, text, integer, text, uuid) TO anon, authenticated;
