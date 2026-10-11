-- AnnLeTravel: daily departures and unlimited-seat tours
-- Run this migration in Supabase SQL Editor before using the new Admin fields.

ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS is_daily boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS unlimited_seats boolean NOT NULL DEFAULT false;

-- A daily tour has no single departure date. Existing date-based tours remain unchanged.
ALTER TABLE public.tours
    ALTER COLUMN departure DROP NOT NULL;

-- Unlimited-seat bookings are inserted atomically without decrementing the numeric seats field.
-- The function only accepts tours explicitly marked unlimited_seats = true.
CREATE OR REPLACE FUNCTION public.create_booking_unlimited(
    p_tour_id text,
    p_customer_name text,
    p_phone text,
    p_people integer,
    p_note text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour public.tours%ROWTYPE;
BEGIN
    IF p_people IS NULL OR p_people <= 0 THEN
        RAISE EXCEPTION 'INVALID_PEOPLE';
    END IF;

    IF COALESCE(trim(p_customer_name), '') = '' OR COALESCE(trim(p_phone), '') = '' THEN
        RAISE EXCEPTION 'MISSING_CUSTOMER_DETAILS';
    END IF;

    SELECT *
      INTO v_tour
      FROM public.tours
     WHERE id::text = p_tour_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    IF COALESCE(v_tour.unlimited_seats, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'TOUR_NOT_UNLIMITED';
    END IF;

    INSERT INTO public.bookings (
        tour_id,
        customer_name,
        phone,
        people,
        note,
        status
    )
    VALUES (
        v_tour.id,
        trim(p_customer_name),
        trim(p_phone),
        p_people,
        COALESCE(trim(p_note), ''),
        'PENDING'
    );

    RETURN jsonb_build_object('unlimited_seats', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_unlimited(text, text, text, integer, text) TO anon, authenticated;
