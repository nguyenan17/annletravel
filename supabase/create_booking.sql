-- ANNLETRAVEL atomic booking RPC with optional hotel selection.
-- Run after 20261015_hotel_catalogue_and_tour_pricing.sql.
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

GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, integer, text, uuid) TO anon, authenticated;
