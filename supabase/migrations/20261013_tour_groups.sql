-- Group related tour variants (e.g. Tam Dao 1 day and 2 days 1 night).
-- Safe to run repeatedly in Supabase SQL Editor.
ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS tour_group text;

UPDATE public.tours
SET tour_group = destination
WHERE tour_group IS NULL OR btrim(tour_group) = '';

COMMENT ON COLUMN public.tours.tour_group IS
    'Shared group label for related tour variants. Tour price, itinerary, departure, capacity and bookings remain independent.';
