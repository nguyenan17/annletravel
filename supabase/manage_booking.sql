-- ANNLETRAVEL
-- Atomic booking status management
-- PENDING/CONFIRMED reserve seats. CANCELLED releases them.
-- Seats are always recalculated from capacity - active reservations.
-- Run this file in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.update_booking_status(
    p_booking_id uuid,
    p_new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking public.bookings%ROWTYPE;
    v_old_status text;
    v_old_reserved boolean;
    v_new_reserved boolean;
    v_capacity integer;
    v_reserved_before integer;
    v_reserved_after integer;
    v_remaining_seats integer;
    v_seat_delta integer := 0;
BEGIN
    IF auth.uid() IS NULL
       OR NOT EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE user_id = auth.uid()
       ) THEN
        RAISE EXCEPTION 'ADMIN_ONLY';
    END IF;

    IF p_new_status NOT IN ('PENDING', 'CONFIRMED', 'CANCELLED') THEN
        RAISE EXCEPTION 'INVALID_STATUS';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND';
    END IF;

    v_old_status := COALESCE(v_booking.status, 'PENDING');

    IF v_old_status = p_new_status THEN
        SELECT seats
        INTO v_remaining_seats
        FROM public.tours
        WHERE id = v_booking.tour_id;

        RETURN json_build_object(
            'success', true,
            'booking_id', v_booking.id,
            'status', v_old_status,
            'seat_change', 0,
            'remaining_seats', v_remaining_seats
        );
    END IF;

    -- PENDING and CONFIRMED both hold seats.
    v_old_reserved := v_old_status IN ('PENDING', 'CONFIRMED');
    v_new_reserved := p_new_status IN ('PENDING', 'CONFIRMED');

    IF v_booking.tour_id IS NULL OR trim(v_booking.tour_id) = '' THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    -- Lock the tour so status changes cannot race with new bookings.
    SELECT capacity
    INTO v_capacity
    FROM public.tours
    WHERE id = v_booking.tour_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    -- Calculate the reservation total from the booking table instead of
    -- incrementing/decrementing seats blindly. This keeps:
    --     seats = capacity - PENDING/CONFIRMED people
    -- and prevents seats from ever becoming greater than capacity.
    SELECT COALESCE(SUM(people), 0)::integer
    INTO v_reserved_before
    FROM public.bookings
    WHERE tour_id = v_booking.tour_id
      AND status IN ('PENDING', 'CONFIRMED');

    v_reserved_after := v_reserved_before;

    IF v_old_reserved AND NOT v_new_reserved THEN
        v_reserved_after := v_reserved_after - v_booking.people;
        v_seat_delta := v_booking.people;
    ELSIF NOT v_old_reserved AND v_new_reserved THEN
        v_reserved_after := v_reserved_after + v_booking.people;
        v_seat_delta := -v_booking.people;
    END IF;

    IF v_reserved_after < 0 THEN
        v_reserved_after := 0;
    END IF;

    IF COALESCE(v_capacity, 0) < v_reserved_after THEN
        RAISE EXCEPTION 'NOT_ENOUGH_SEATS';
    END IF;

    v_remaining_seats := COALESCE(v_capacity, 0) - v_reserved_after;

    UPDATE public.bookings
    SET
        status = p_new_status,
        updated_at = now()
    WHERE id = p_booking_id;

    UPDATE public.tours
    SET
        seats = v_remaining_seats,
        updated_at = now()
    WHERE id = v_booking.tour_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'old_status', v_old_status,
        'status', p_new_status,
        'seat_change', v_seat_delta,
        'remaining_seats', v_remaining_seats
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_booking_status(uuid, text)
TO authenticated;


-- Delete a booking safely. Seats are recalculated from capacity and the
-- remaining active bookings after the booking is removed.
CREATE OR REPLACE FUNCTION public.delete_booking(
    p_booking_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking public.bookings%ROWTYPE;
    v_capacity integer;
    v_reserved_after integer;
    v_remaining_seats integer;
    v_released_seats integer := 0;
BEGIN
    IF auth.uid() IS NULL
       OR NOT EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE user_id = auth.uid()
       ) THEN
        RAISE EXCEPTION 'ADMIN_ONLY';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND';
    END IF;

    IF v_booking.tour_id IS NULL OR trim(v_booking.tour_id) = '' THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    -- Lock the tour before changing its seat count.
    SELECT capacity
    INTO v_capacity
    FROM public.tours
    WHERE id = v_booking.tour_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    IF v_booking.status IN ('PENDING', 'CONFIRMED') THEN
        v_released_seats := v_booking.people;
    END IF;

    -- Exclude the booking being deleted from the reservation total.
    SELECT COALESCE(SUM(people), 0)::integer
    INTO v_reserved_after
    FROM public.bookings
    WHERE tour_id = v_booking.tour_id
      AND id <> p_booking_id
      AND status IN ('PENDING', 'CONFIRMED');

    IF COALESCE(v_capacity, 0) < v_reserved_after THEN
        RAISE EXCEPTION 'CAPACITY_BELOW_RESERVED';
    END IF;

    v_remaining_seats := COALESCE(v_capacity, 0) - v_reserved_after;

    DELETE FROM public.bookings
    WHERE id = p_booking_id;

    UPDATE public.tours
    SET
        seats = v_remaining_seats,
        updated_at = now()
    WHERE id = v_booking.tour_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'released_seats', v_released_seats,
        'remaining_seats', v_remaining_seats
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_booking(uuid)
TO authenticated;
