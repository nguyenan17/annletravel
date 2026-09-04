-- ANNLETRAVEL
-- Atomic public booking RPC
-- Run this file in Supabase SQL Editor before enabling the new booking flow.

CREATE OR REPLACE FUNCTION public.create_booking(
    p_tour_id text,
    p_customer_name text,
    p_phone text,
    p_people integer,
    p_note text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour public.tours%ROWTYPE;
    v_booking public.bookings%ROWTYPE;
    v_remaining_seats integer;
BEGIN
    IF p_tour_id IS NULL OR trim(p_tour_id) = '' THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'INVALID_CUSTOMER_NAME';
    END IF;

    IF p_phone IS NULL OR trim(p_phone) = '' THEN
        RAISE EXCEPTION 'INVALID_PHONE';
    END IF;

    IF p_people IS NULL OR p_people <= 0 THEN
        RAISE EXCEPTION 'INVALID_PEOPLE';
    END IF;

    -- Serialize bookings for the same tour.
    SELECT *
    INTO v_tour
    FROM public.tours
    WHERE id = p_tour_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    IF COALESCE(v_tour.seats, 0) < p_people THEN
        RAISE EXCEPTION 'NOT_ENOUGH_SEATS';
    END IF;

    v_remaining_seats := v_tour.seats - p_people;

    INSERT INTO public.bookings (
        tour_id,
        customer_name,
        phone,
        people,
        note,
        status
    )
    VALUES (
        p_tour_id,
        trim(p_customer_name),
        trim(p_phone),
        p_people,
        COALESCE(trim(p_note), ''),
        'PENDING'
    )
    RETURNING * INTO v_booking;

    UPDATE public.tours
    SET
        seats = v_remaining_seats,
        updated_at = now()
    WHERE id = p_tour_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', v_booking.id,
        'tour_id', p_tour_id,
        'people', p_people,
        'remaining_seats', v_remaining_seats
    );
END;
$$;

-- Public visitors use the RPC instead of inserting directly into bookings.
GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, integer, text)
TO anon, authenticated;
