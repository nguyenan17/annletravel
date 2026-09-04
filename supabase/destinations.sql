-- ANNLETRAVEL - DESTINATIONS
-- Run this script in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.destinations (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    country text NOT NULL DEFAULT 'Vietnam',
    region text NOT NULL DEFAULT 'domestic' CHECK (region IN ('domestic', 'international')),
    description text NOT NULL DEFAULT '',
    image text NOT NULL DEFAULT '',
    featured boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS destinations_region_idx
    ON public.destinations(region);

CREATE INDEX IF NOT EXISTS destinations_featured_idx
    ON public.destinations(featured);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view destinations" ON public.destinations;
CREATE POLICY "Public can view destinations"
    ON public.destinations
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can insert destinations" ON public.destinations;
CREATE POLICY "Admins can insert destinations"
    ON public.destinations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can update destinations" ON public.destinations;
CREATE POLICY "Admins can update destinations"
    ON public.destinations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can delete destinations" ON public.destinations;
CREATE POLICY "Admins can delete destinations"
    ON public.destinations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    );

INSERT INTO public.destinations (id, name, slug, country, region, description, featured, sort_order)
VALUES
    ('vn-ha-giang', 'Hà Giang', 'ha-giang', 'Việt Nam', 'domestic', 'Cao nguyên đá, đèo Mã Pí Lèng và những cung đường vùng Đông Bắc.', true, 10),
    ('vn-sapa', 'Sapa', 'sapa', 'Việt Nam', 'domestic', 'Thị trấn mây núi với ruộng bậc thang, Fansipan và văn hóa bản địa.', true, 20),
    ('vn-ha-long', 'Hạ Long', 'ha-long', 'Việt Nam', 'domestic', 'Vịnh biển nổi tiếng với hàng nghìn đảo đá và trải nghiệm du thuyền.', true, 30),
    ('vn-da-nang', 'Đà Nẵng', 'da-nang', 'Việt Nam', 'domestic', 'Biển đẹp, ẩm thực hấp dẫn và điểm đến nổi bật miền Trung.', false, 40),
    ('vn-hoi-an', 'Hội An', 'hoi-an', 'Việt Nam', 'domestic', 'Phố cổ, đèn lồng và những trải nghiệm văn hóa đặc trưng.', false, 50),
    ('kr-seoul', 'Seoul', 'seoul', 'Hàn Quốc', 'international', 'Thủ đô năng động với văn hóa, mua sắm và ẩm thực Hàn Quốc.', true, 110),
    ('jp-tokyo', 'Tokyo', 'tokyo', 'Nhật Bản', 'international', 'Đô thị hiện đại kết hợp truyền thống, ẩm thực và mua sắm.', true, 120),
    ('th-bangkok', 'Bangkok', 'bangkok', 'Thái Lan', 'international', 'Thành phố sôi động với chùa chiền, ẩm thực đường phố và mua sắm.', true, 130),
    ('sg-singapore', 'Singapore', 'singapore', 'Singapore', 'international', 'Điểm đến hiện đại, sạch đẹp với nhiều trải nghiệm gia đình.', false, 140),
    ('id-bali', 'Bali', 'bali', 'Indonesia', 'international', 'Đảo nhiệt đới nổi tiếng với biển, resort và văn hóa đặc sắc.', false, 150)
ON CONFLICT (id) DO NOTHING;
