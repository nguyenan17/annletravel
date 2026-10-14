-- Add a per-tour transport description for the admin and public tour pages.
ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS transport text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.tours.transport
IS 'Transport details for the tour, e.g. tourist coach, limousine, train, flight, boat or a combination.';
