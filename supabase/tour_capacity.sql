-- ANNLETRAVEL
-- Separate total tour capacity from remaining seats.
-- Run this file in Supabase SQL Editor.

ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS capacity integer;

-- Existing tours: assume the current remaining seats were the original capacity.
UPDATE public.tours
SET capacity = COALESCE(capacity, seats, 0)
WHERE capacity IS NULL;

ALTER TABLE public.tours
ALTER COLUMN capacity SET DEFAULT 0;

ALTER TABLE public.tours
ADD CONSTRAINT tours_capacity_non_negative
CHECK (capacity >= 0);

CREATE OR REPLACE FUNCTION public.update_tour_capacity(
    p_tour_id text,
    p_capacity integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour public.tours%ROWTYPE;
    v_reserved integer;
    v_available integer;
BEGIN
    IF auth.uid() IS NULL
       OR NOT EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE user_id = auth.uid()
       ) THEN
        RAISE EXCEPTION 'ADMIN_ONLY';
    END IF;

    IF p_capacity IS NULL OR p_capacity < 0 THEN
        RAISE EXCEPTION 'INVALID_CAPACITY';
    END IF;

    SELECT *
    INTO v_tour
    FROM public.tours
    WHERE id = p_tour_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOUR_NOT_FOUND';
    END IF;

    SELECT COALESCE(SUM(people), 0)::integer
    INTO v_reserved
    FROM public.bookings
    WHERE tour_id = p_tour_id
      AND status IN ('PENDING', 'CONFIRMED');

    IF p_capacity < v_reserved THEN
        RAISE EXCEPTION 'CAPACITY_BELOW_RESERVED';
    END IF;

    v_available := p_capacity - v_reserved;

    UPDATE public.tours
    SET
        capacity = p_capacity,
        seats = v_available,
        updated_at = now()
    WHERE id = p_tour_id;

    RETURN json_build_object(
        'success', true,
        'tour_id', p_tour_id,
        'capacity', p_capacity,
        'reserved_seats', v_reserved,
        'remaining_seats', v_available
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_tour_capacity(text, integer)
TO authenticated;
