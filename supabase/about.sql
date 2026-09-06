-- ANNLETRAVEL - ABOUT US
-- Run this script in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.about_company (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hero_title text NOT NULL DEFAULT 'Về ANNLETRAVEL',
    hero_subtitle text NOT NULL DEFAULT 'Niềm tin trên mọi hành trình',
    hero_image text NOT NULL DEFAULT '',
    introduction text NOT NULL DEFAULT '',
    vision text NOT NULL DEFAULT '',
    mission text NOT NULL DEFAULT '',
    values text NOT NULL DEFAULT '',
    stats jsonb NOT NULL DEFAULT '{"years":0,"customers":0,"tours":0,"destinations":0}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_awards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    organization text NOT NULL DEFAULT '',
    year text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    image text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    customer_title text NOT NULL DEFAULT 'Khách hàng',
    content text NOT NULL,
    rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    avatar text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_gallery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL DEFAULT '',
    image text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view about company" ON public.about_company;
CREATE POLICY "Public can view about company" ON public.about_company FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert about company" ON public.about_company;
CREATE POLICY "Admins can insert about company" ON public.about_company FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can update about company" ON public.about_company;
CREATE POLICY "Admins can update about company" ON public.about_company FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view about awards" ON public.about_awards;
CREATE POLICY "Public can view about awards" ON public.about_awards FOR SELECT TO anon, authenticated USING (visible = true OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can insert about awards" ON public.about_awards;
CREATE POLICY "Admins can insert about awards" ON public.about_awards FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can update about awards" ON public.about_awards;
CREATE POLICY "Admins can update about awards" ON public.about_awards FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can delete about awards" ON public.about_awards;
CREATE POLICY "Admins can delete about awards" ON public.about_awards FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view about reviews" ON public.about_reviews;
CREATE POLICY "Public can view about reviews" ON public.about_reviews FOR SELECT TO anon, authenticated USING (visible = true OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can insert about reviews" ON public.about_reviews;
CREATE POLICY "Admins can insert about reviews" ON public.about_reviews FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can update about reviews" ON public.about_reviews;
CREATE POLICY "Admins can update about reviews" ON public.about_reviews FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can delete about reviews" ON public.about_reviews;
CREATE POLICY "Admins can delete about reviews" ON public.about_reviews FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view about gallery" ON public.about_gallery;
CREATE POLICY "Public can view about gallery" ON public.about_gallery FOR SELECT TO anon, authenticated USING (visible = true OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can insert about gallery" ON public.about_gallery;
CREATE POLICY "Admins can insert about gallery" ON public.about_gallery FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can update about gallery" ON public.about_gallery;
CREATE POLICY "Admins can update about gallery" ON public.about_gallery FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can delete about gallery" ON public.about_gallery;
CREATE POLICY "Admins can delete about gallery" ON public.about_gallery FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

INSERT INTO public.about_company (id, hero_title, hero_subtitle, introduction, vision, mission, values, stats)
VALUES (1, 'Về ANNLETRAVEL', 'Niềm tin trên mọi hành trình', 'ANNLETRAVEL đồng hành cùng khách hàng trong những chuyến đi đáng nhớ, với lịch trình rõ ràng, chi phí minh bạch và dịch vụ tận tâm.', 'Trở thành thương hiệu du lịch được khách hàng tin tưởng khi lựa chọn hành trình trong nước và quốc tế.', 'Mang đến những chuyến đi thuận tiện, an toàn và nhiều trải nghiệm đáng nhớ.', 'Tận tâm • Minh bạch • Chuyên nghiệp • Đồng hành', '{"years":1,"customers":0,"tours":0,"destinations":0}'::jsonb)
ON CONFLICT (id) DO NOTHING;
