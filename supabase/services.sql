-- ANNLETRAVEL - SERVICES
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.service_categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    icon text DEFAULT '',
    description text DEFAULT '',
    sort_order integer NOT NULL DEFAULT 100,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
    id text PRIMARY KEY,
    category_id text NOT NULL REFERENCES public.service_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    short text DEFAULT '',
    description text DEFAULT '',
    image text DEFAULT '',
    price_from numeric DEFAULT 0,
    featured boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 100,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active service categories" ON public.service_categories;
CREATE POLICY "Public can view active service categories" ON public.service_categories FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admin can manage service categories" ON public.service_categories;
CREATE POLICY "Admin can manage service categories" ON public.service_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
CREATE POLICY "Admin can manage services" ON public.services FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()));

INSERT INTO public.service_categories (id, name, slug, icon, description, sort_order)
VALUES
('flights', 'Vé máy bay', 'flights', '✈️', 'Tìm và tư vấn vé máy bay trong nước, quốc tế.', 10),
('hotels', 'Khách sạn', 'hotels', '🏨', 'Đặt phòng khách sạn phù hợp với hành trình.', 20),
('visa', 'Visa', 'visa', '🛂', 'Tư vấn và hỗ trợ hồ sơ visa du lịch.', 30),
('passport', 'Hộ chiếu', 'passport', '🪪', 'Hỗ trợ tư vấn và thủ tục làm hộ chiếu.', 35),
('tickets', 'Vé vui chơi & tham quan', 'tickets', '🎟️', 'Đặt vé công viên, khu vui chơi, điểm tham quan và show.', 40),
('transport', 'Xe đưa đón', 'transport', '🚗', 'Dịch vụ xe sân bay và đưa đón theo yêu cầu.', 50),
('trains', 'Vé tàu', 'trains', '🚆', 'Đặt vé tàu cho các hành trình du lịch.', 60),
('insurance', 'Bảo hiểm du lịch', 'insurance', '🛡️', 'Bảo hiểm hỗ trợ an tâm trong chuyến đi.', 70)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, icon=EXCLUDED.icon, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

INSERT INTO public.services (id, category_id, name, slug, short, description, featured, sort_order)
VALUES
('sun-world', 'tickets', 'Vé Sun World', 'sun-world', 'Vé vui chơi Sun World tại các điểm đến nổi bật.', 'Hỗ trợ đặt vé Sun World, tư vấn loại vé và thời gian sử dụng phù hợp.', true, 10),
('ba-na-hills', 'tickets', 'Vé Bà Nà Hills', 'ba-na-hills', 'Khám phá Bà Nà Hills và Cầu Vàng.', 'Hỗ trợ đặt vé Bà Nà Hills và tư vấn thời gian tham quan phù hợp.', true, 20),
('fansipan', 'tickets', 'Vé Fansipan', 'fansipan', 'Vé cáp treo Fansipan tại Sapa.', 'Hỗ trợ vé Fansipan và tư vấn lịch trình Sapa.', true, 30),
('vinwonders', 'tickets', 'Vé VinWonders', 'vinwonders', 'Vé công viên giải trí VinWonders.', 'Hỗ trợ đặt vé VinWonders theo điểm đến và nhu cầu.', true, 40),
('show-tickets', 'tickets', 'Vé show & biểu diễn', 'show-tickets', 'Vé show, chương trình nghệ thuật và trải nghiệm.', 'Tư vấn và hỗ trợ đặt vé các show phù hợp với hành trình.', false, 50),
('attraction-tickets', 'tickets', 'Vé điểm tham quan', 'attraction-tickets', 'Vé bảo tàng, di tích và điểm tham quan nổi bật.', 'Đặt vé tham quan trước để chủ động lịch trình và hạn chế thời gian chờ.', false, 60),
('flight-domestic', 'flights', 'Vé máy bay nội địa', 'flight-domestic', 'Vé máy bay các chặng trong Việt Nam.', 'Tư vấn chuyến bay và hỗ trợ lựa chọn giờ bay phù hợp.', true, 10),
('flight-international', 'flights', 'Vé máy bay quốc tế', 'flight-international', 'Vé máy bay đi Hàn Quốc, Nhật Bản, Thái Lan và nhiều điểm đến.', 'Tư vấn hành trình bay quốc tế theo lịch tour hoặc nhu cầu riêng.', true, 20),
('hotel-booking', 'hotels', 'Đặt khách sạn', 'hotel-booking', 'Khách sạn từ phổ thông đến cao cấp.', 'Tư vấn và hỗ trợ đặt phòng theo ngân sách và lịch trình.', true, 10),
('visa-korea', 'visa', 'Visa Hàn Quốc', 'visa-korea', 'Hỗ trợ hồ sơ visa Hàn Quốc.', 'Tư vấn điều kiện và chuẩn bị hồ sơ visa du lịch Hàn Quốc.', false, 10),
('passport-service', 'passport', 'Làm hộ chiếu', 'passport-service', 'Tư vấn thủ tục và hỗ trợ làm hộ chiếu.', 'Hỗ trợ tư vấn hồ sơ, quy trình và các bước cần thiết để làm hoặc cấp lại hộ chiếu.', true, 10),
('airport-transfer', 'transport', 'Xe đưa đón sân bay', 'airport-transfer', 'Đưa đón sân bay riêng hoặc theo nhóm.', 'Đặt xe theo số lượng khách và lịch bay.', false, 10)
ON CONFLICT (id) DO UPDATE SET category_id=EXCLUDED.category_id, name=EXCLUDED.name, slug=EXCLUDED.slug, short=EXCLUDED.short, description=EXCLUDED.description, featured=EXCLUDED.featured, sort_order=EXCLUDED.sort_order, updated_at=now();
