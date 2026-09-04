-- ANNLETRAVEL
-- Repair remaining seats for ALL tours.
--
-- Rule:
--   seats = capacity - SUM(people of PENDING/CONFIRMED bookings)
--
-- This script is intentionally safe:
-- 1. It checks every tour first.
-- 2. If any tour has no capacity or has more active reservations than capacity,
--    the repair is aborted so no partial update is made.
-- 3. Otherwise all tour seats are recalculated from the booking table.
--
-- Run this file once in Supabase SQL Editor after tour_capacity.sql.

BEGIN;

-- ============================================================
-- 1. PREVIEW CURRENT DATA
-- ============================================================
-- Run this SELECT first if you want to see which tours are wrong.

SELECT
    t.id,
    t.name,
    t.capacity,
    t.seats AS current_seats,
    COALESCE(r.reserved_seats, 0) AS reserved_seats,
    CASE
        WHEN t.capacity IS NULL THEN NULL
        ELSE t.capacity - COALESCE(r.reserved_seats, 0)
    END AS expected_seats,
    CASE
        WHEN t.capacity IS NULL THEN 'MISSING_CAPACITY'
        WHEN t.capacity < COALESCE(r.reserved_seats, 0) THEN 'CAPACITY_BELOW_RESERVED'
        WHEN t.seats IS DISTINCT FROM t.capacity - COALESCE(r.reserved_seats, 0)
            THEN 'NEEDS_REPAIR'
        ELSE 'OK'
    END AS repair_status
FROM public.tours AS t
LEFT JOIN (
    SELECT
        tour_id,
        SUM(people)::integer AS reserved_seats
    FROM public.bookings
    WHERE status IN ('PENDING', 'CONFIRMED')
    GROUP BY tour_id
) AS r
    ON r.tour_id = t.id
ORDER BY t.id;

-- ============================================================
-- 2. SAFETY CHECK
-- ============================================================
-- Abort the whole transaction if the data cannot be repaired safely.

DO $$
DECLARE
    v_invalid_capacity integer;
    v_over_reserved integer;
BEGIN
    SELECT COUNT(*)
    INTO v_invalid_capacity
    FROM public.tours
    WHERE capacity IS NULL;

    IF v_invalid_capacity > 0 THEN
        RAISE EXCEPTION
            'REPAIR_ABORTED: % tour(s) have NULL capacity. Set their total capacity before running the repair.',
            v_invalid_capacity;
    END IF;

    SELECT COUNT(*)
    INTO v_over_reserved
    FROM public.tours AS t
    LEFT JOIN (
        SELECT
            tour_id,
            SUM(people)::integer AS reserved_seats
        FROM public.bookings
        WHERE status IN ('PENDING', 'CONFIRMED')
        GROUP BY tour_id
    ) AS r
        ON r.tour_id = t.id
    WHERE t.capacity < COALESCE(r.reserved_seats, 0);

    IF v_over_reserved > 0 THEN
        RAISE EXCEPTION
            'REPAIR_ABORTED: % tour(s) have active reservations greater than their capacity. Fix capacity/booking data first.',
            v_over_reserved;
    END IF;
END;
$$;

-- ============================================================
-- 3. RECALCULATE ALL TOUR SEATS
-- ============================================================
-- seats is NOT incremented/decremented here.
-- It is rebuilt from the source of truth:
-- total capacity minus active reservations.

UPDATE public.tours AS t
SET
    seats = t.capacity - COALESCE((
        SELECT SUM(b.people)::integer
        FROM public.bookings AS b
        WHERE b.tour_id = t.id
          AND b.status IN ('PENDING', 'CONFIRMED')
    ), 0),
    updated_at = now();

-- ============================================================
-- 4. VERIFY THE RESULT
-- ============================================================

DO $$
DECLARE
    v_wrong integer;
BEGIN
    SELECT COUNT(*)
    INTO v_wrong
    FROM public.tours AS t
    WHERE t.seats IS DISTINCT FROM t.capacity - COALESCE((
        SELECT SUM(b.people)::integer
        FROM public.bookings AS b
        WHERE b.tour_id = t.id
          AND b.status IN ('PENDING', 'CONFIRMED')
    ), 0);

    IF v_wrong > 0 THEN
        RAISE EXCEPTION
            'REPAIR_ABORTED: verification failed for % tour(s).',
            v_wrong;
    END IF;
END;
$$;

COMMIT;

-- Final result after repair.
SELECT
    t.id,
    t.name,
    t.capacity,
    t.seats AS remaining_seats,
    COALESCE((
        SELECT SUM(b.people)::integer
        FROM public.bookings AS b
        WHERE b.tour_id = t.id
          AND b.status IN ('PENDING', 'CONFIRMED')
    ), 0) AS reserved_seats
FROM public.tours AS t
ORDER BY t.id;
