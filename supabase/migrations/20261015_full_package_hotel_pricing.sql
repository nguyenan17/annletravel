-- Treat each hotel choice as a full tour package price, including the hotel.
-- Preserve configured package prices; initialize missing package prices from the current tour price.
UPDATE public.tour_hotel_options o
SET pricing_mode = 'INCLUDED',
    package_price_per_person = COALESCE(
        o.package_price_per_person,
        (SELECT t.price FROM public.tours t WHERE t.id::text = o.tour_id),
        0
    ),
    price_per_person = 0,
    room_price_per_night = 0,
    updated_at = now();

COMMENT ON COLUMN public.tour_hotel_options.package_price_per_person
IS 'Full package price per person, including tour activities and the selected hotel.';
