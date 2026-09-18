-- ANNLETRAVEL
-- Campaign metadata for tours.
-- Run this file once in Supabase SQL Editor.

ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS campaign_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_type text NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS campaign_start_at timestamptz,
ADD COLUMN IF NOT EXISTS campaign_end_at timestamptz,
ADD COLUMN IF NOT EXISTS sale_price numeric,
ADD COLUMN IF NOT EXISTS experience_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS seasonal_tag text;

ALTER TABLE public.tours
DROP CONSTRAINT IF EXISTS tours_campaign_type_check;

ALTER TABLE public.tours
ADD CONSTRAINT tours_campaign_type_check
CHECK (campaign_type IN ('none','promotion','seasonal','experience'));

CREATE INDEX IF NOT EXISTS idx_tours_campaign_enabled
ON public.tours(campaign_enabled, campaign_start_at, campaign_end_at);

CREATE INDEX IF NOT EXISTS idx_tours_campaign_type
ON public.tours(campaign_type);

