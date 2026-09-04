-- ANNLETRAVEL - NORMALIZED TICKET CATALOG
-- Structure: Brand -> Location -> Ticket product
-- Run this after supabase/services.sql

CREATE TABLE IF NOT EXISTS public.ticket_brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    logo text DEFAULT '',
    description text DEFAULT '',
    sort_order integer NOT NULL DEFAULT 100,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_locations (
    id text PRIMARY KEY,
    brand_id text NOT NULL REFERENCES public.ticket_brands(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    destination text NOT NULL DEFAULT '',
    country text NOT NULL DEFAULT 'Việt Nam',
    description text DEFAULT '',
    image text DEFAULT '',
    sort_order integer NOT NULL DEFAULT 100,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tickets (
    id text PRIMARY KEY,
    location_id text NOT NULL REFERENCES public.ticket_locations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    ticket_type text NOT NULL DEFAULT 'attraction',
    short text DEFAULT '',
    description text DEFAULT '',
    image text DEFAULT '',
    price_from numeric NOT NULL DEFAULT 0,
    featured boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 100,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_locations_brand ON public.ticket_locations(brand_id);
CREATE INDEX IF NOT EXISTS idx_tickets_location ON public.tickets(location_id);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON public.tickets(ticket_type);

ALTER TABLE public.ticket_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active ticket brands" ON public.ticket_brands;
CREATE POLICY "Public can view active ticket brands" ON public.ticket_brands FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admin can manage ticket brands" ON public.ticket_brands;
CREATE POLICY "Admin can manage ticket brands" ON public.ticket_brands FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active ticket locations" ON public.ticket_locations;
CREATE POLICY "Public can view active ticket locations" ON public.ticket_locations FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admin can manage ticket locations" ON public.ticket_locations;
CREATE POLICY "Admin can manage ticket locations" ON public.ticket_locations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active tickets" ON public.tickets;
CREATE POLICY "Public can view active tickets" ON public.tickets FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admin can manage tickets" ON public.tickets;
CREATE POLICY "Admin can manage tickets" ON public.tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

INSERT INTO public.ticket_brands (id, name, slug, description, sort_order)
VALUES
('sun-world', 'Sun World', 'sun-world', 'Hệ thống khu vui chơi và điểm đến giải trí Sun World.', 10),
('vinwonders', 'VinWonders', 'vinwonders', 'Hệ thống công viên giải trí VinWonders tại nhiều điểm đến.', 20),
('independent', 'Điểm tham quan & vui chơi', 'independent', 'Các điểm tham quan, khu vui chơi và trải nghiệm khác.', 30)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

INSERT INTO public.ticket_locations (id, brand_id, name, slug, destination, country, description, sort_order)
VALUES
('sun-ba-na-hills', 'sun-world', 'Sun World Ba Na Hills', 'sun-world-ba-na-hills', 'Đà Nẵng', 'Việt Nam', 'Khu du lịch trên núi nổi tiếng với Cầu Vàng và hệ thống cáp treo.', 10),
('sun-fansipan', 'sun-world', 'Sun World Fansipan Legend', 'sun-world-fansipan', 'Sapa', 'Việt Nam', 'Khu du lịch Fansipan Legend với cáp treo lên nóc nhà Đông Dương.', 20),
('sun-ha-long', 'sun-world', 'Sun World Ha Long', 'sun-world-ha-long', 'Hạ Long', 'Việt Nam', 'Tổ hợp vui chơi giải trí tại Hạ Long.', 30),
('sun-hon-thom', 'sun-world', 'Sun World Hon Thom', 'sun-world-hon-thom', 'Phú Quốc', 'Việt Nam', 'Cáp treo Hòn Thơm và các trải nghiệm vui chơi tại Phú Quốc.', 40),
('vin-phu-quoc', 'vinwonders', 'VinWonders Phú Quốc', 'vinwonders-phu-quoc', 'Phú Quốc', 'Việt Nam', 'Công viên chủ đề quy mô lớn tại Phú Quốc.', 10),
('vin-nha-trang', 'vinwonders', 'VinWonders Nha Trang', 'vinwonders-nha-trang', 'Nha Trang', 'Việt Nam', 'Tổ hợp vui chơi và trải nghiệm tại Nha Trang.', 20),
('vin-nam-hoi-an', 'vinwonders', 'VinWonders Nam Hội An', 'vinwonders-nam-hoi-an', 'Hội An', 'Việt Nam', 'Công viên giải trí kết hợp văn hóa và trải nghiệm.', 30),
('ba-na-hills', 'independent', 'Bà Nà Hills', 'ba-na-hills-location', 'Đà Nẵng', 'Việt Nam', 'Điểm đến nghỉ dưỡng và vui chơi nổi tiếng tại Đà Nẵng.', 40),
('fansipan', 'independent', 'Fansipan', 'fansipan-location', 'Sapa', 'Việt Nam', 'Trải nghiệm chinh phục Fansipan và khám phá Sapa.', 50)
ON CONFLICT (id) DO UPDATE SET brand_id=EXCLUDED.brand_id, name=EXCLUDED.name, slug=EXCLUDED.slug, destination=EXCLUDED.destination, country=EXCLUDED.country, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

INSERT INTO public.tickets (id, location_id, name, slug, ticket_type, short, description, price_from, featured, sort_order)
VALUES
('ticket-sun-ba-na-cable', 'sun-ba-na-hills', 'Vé cáp treo Sun World Ba Na Hills', 've-cap-treo-sun-world-ba-na-hills', 'amusement', 'Vé tham quan và sử dụng hệ thống cáp treo Ba Na Hills.', 'Tư vấn loại vé theo ngày đi và nhu cầu tham quan.', 0, true, 10),
('ticket-sun-fansipan-cable', 'sun-fansipan', 'Vé cáp treo Fansipan', 've-cap-treo-fansipan', 'attraction', 'Trải nghiệm cáp treo lên đỉnh Fansipan.', 'Tư vấn vé theo lịch trình Sapa và tình hình vận hành.', 0, true, 20),
('ticket-sun-ha-long', 'sun-ha-long', 'Vé Sun World Ha Long', 've-sun-world-ha-long', 'amusement', 'Vé vui chơi tại Sun World Ha Long.', 'Tư vấn khu vui chơi và combo phù hợp.', 0, false, 30),
('ticket-sun-hon-thom', 'sun-hon-thom', 'Vé cáp treo Hòn Thơm', 've-cap-treo-hon-thom', 'amusement', 'Trải nghiệm cáp treo Hòn Thơm tại Phú Quốc.', 'Tư vấn vé và combo theo lịch trình Phú Quốc.', 0, false, 40),
('ticket-vin-phu-quoc', 'vin-phu-quoc', 'Vé VinWonders Phú Quốc', 've-vinwonders-phu-quoc', 'amusement', 'Vé công viên chủ đề VinWonders Phú Quốc.', 'Tư vấn vé và lựa chọn phù hợp với lịch trình.', 0, true, 50),
('ticket-vin-nha-trang', 'vin-nha-trang', 'Vé VinWonders Nha Trang', 've-vinwonders-nha-trang', 'amusement', 'Vé vui chơi VinWonders Nha Trang.', 'Tư vấn vé theo ngày và nhu cầu trải nghiệm.', 0, true, 60),
('ticket-vin-nam-hoi-an', 'vin-nam-hoi-an', 'Vé VinWonders Nam Hội An', 've-vinwonders-nam-hoi-an', 'amusement', 'Vé công viên và trải nghiệm văn hóa tại Nam Hội An.', 'Tư vấn vé và lịch trình tham quan.', 0, false, 70),
('ticket-ba-na-combo', 'ba-na-hills', 'Vé combo Bà Nà Hills', 've-combo-ba-na-hills', 'amusement', 'Combo vé phù hợp cho chuyến đi Bà Nà Hills.', 'Tư vấn combo theo ngày đi và nhu cầu.', 0, true, 80),
('ticket-fansipan-experience', 'fansipan', 'Vé trải nghiệm Fansipan', 've-trai-nghiem-fansipan', 'experience', 'Lựa chọn vé và trải nghiệm tại Fansipan.', 'Tư vấn các lựa chọn phù hợp với hành trình Sapa.', 0, false, 90)
ON CONFLICT (id) DO UPDATE SET location_id=EXCLUDED.location_id, name=EXCLUDED.name, slug=EXCLUDED.slug, ticket_type=EXCLUDED.ticket_type, short=EXCLUDED.short, description=EXCLUDED.description, price_from=EXCLUDED.price_from, featured=EXCLUDED.featured, sort_order=EXCLUDED.sort_order, updated_at=now();
