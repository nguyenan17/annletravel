-- ANNLETRAVEL
-- Atomic booking status management
-- PENDING/CONFIRMED reserve seats. CANCELLED releases them.
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
    v_tour_seats integer;
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
        RETURN json_build_object(
            'success', true,
            'booking_id', v_booking.id,
            'status', v_old_status,
            'seat_change', 0
        );
    END IF;

    -- PENDING and CONFIRMED both hold seats.
    v_old_reserved := v_old_status IN ('PENDING', 'CONFIRMED');
    v_new_reserved := p_new_status IN ('PENDING', 'CONFIRMED');

    IF v_booking.tour_id IS NULL OR trim(v_booking.tour_id) = '' THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    -- Lock the tour so status changes cannot race with new bookings.
    SELECT seats
    INTO v_tour_seats
    FROM public.tours
    WHERE id = v_booking.tour_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    IF v_old_reserved AND NOT v_new_reserved THEN
        -- Active -> CANCELLED: release the held seats.
        v_seat_delta := v_booking.people;

        UPDATE public.tours
        SET
            seats = COALESCE(seats, 0) + v_booking.people,
            updated_at = now()
        WHERE id = v_booking.tour_id;

    ELSIF NOT v_old_reserved AND v_new_reserved THEN
        -- CANCELLED -> active: reserve the seats again.
        IF COALESCE(v_tour_seats, 0) < v_booking.people THEN
            RAISE EXCEPTION 'NOT_ENOUGH_SEATS';
        END IF;

        v_seat_delta := -v_booking.people;

        UPDATE public.tours
        SET
            seats = seats - v_booking.people,
            updated_at = now()
        WHERE id = v_booking.tour_id;
    END IF;

    UPDATE public.bookings
    SET
        status = p_new_status,
        updated_at = now()
    WHERE id = p_booking_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'old_status', v_old_status,
        'status', p_new_status,
        'seat_change', v_seat_delta,
        'remaining_seats', CASE
            WHEN v_old_reserved AND NOT v_new_reserved
                THEN v_tour_seats + v_booking.people
            WHEN NOT v_old_reserved AND v_new_reserved
                THEN v_tour_seats - v_booking.people
            ELSE v_tour_seats
        END
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_booking_status(uuid, text)
TO authenticated;


-- Delete a booking safely. If the booking still holds seats,
-- release those seats before deleting the booking.
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

    IF v_booking.status IN ('PENDING', 'CONFIRMED') THEN
        IF NOT EXISTS (
            SELECT 1
            FROM public.tours
            WHERE id = v_booking.tour_id
        ) THEN
            RAISE EXCEPTION 'TOUR_NOT_FOUND';
        END IF;

        UPDATE public.tours
        SET
            seats = COALESCE(seats, 0) + v_booking.people,
            updated_at = now()
        WHERE id = v_booking.tour_id;

        v_released_seats := v_booking.people;
    END IF;

    DELETE FROM public.bookings
    WHERE id = p_booking_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'released_seats', v_released_seats
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_booking(uuid)
TO authenticated;
