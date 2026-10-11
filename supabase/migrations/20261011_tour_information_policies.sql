-- AnnLeTravel: structured tour information and reusable policy template.
-- Safe to run more than once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.tour_policy_templates (
    template_key text PRIMARY KEY,
    title text NOT NULL DEFAULT 'Chính sách chung',
    price_note text NOT NULL DEFAULT 'Áp dụng cho khách lẻ ghép đoàn',
    child_price_percent numeric NOT NULL DEFAULT 75 CHECK (child_price_percent >= 0 AND child_price_percent <= 100),
    infant_surcharge numeric NOT NULL DEFAULT 200000 CHECK (infant_surcharge >= 0),
    included text NOT NULL DEFAULT '',
    excluded text NOT NULL DEFAULT '',
    age_policy text NOT NULL DEFAULT '',
    child_policy text NOT NULL DEFAULT '',
    general_notes text NOT NULL DEFAULT '',
    customer_responsibility text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tour_policy_templates (
    template_key, title, price_note, child_price_percent, infant_surcharge,
    included, excluded, age_policy, child_policy, general_notes, customer_responsibility
) VALUES (
    'default',
    'Chính sách chung',
    'Giá áp dụng cho khách lẻ ghép đoàn.',
    75,
    200000,
    E'Xe ô tô 7 đến 29 chỗ (tùy số lượng khách) vận chuyển theo chương trình\\n01 bữa ăn trưa tiêu chuẩn theo chương trình\\nVé tham quan các điểm có trong chương trình (theo mô tả từng tour)\\nHướng dẫn viên phục vụ theo chương trình\\nNước uống phục vụ trên xe theo chương trình',
    E'Hóa đơn thuế GTGT (nếu không ghi rõ đã bao gồm)\\nĐồ uống trong bữa ăn và chi phí cá nhân không đề cập trong tour\\nCác dịch vụ, chi phí không đề cập trong chương trình\\nTiền tip cho lái xe và hướng dẫn viên (không bắt buộc; nếu khách muốn thưởng, mức tham khảo từ 50.000đ/khách/ngày)\\nKhách nước ngoài: tip tham khảo 3 USD/khách/ngày',
    'Vui lòng xác nhận quy tắc tính tuổi áp dụng cho từng tour trước khi công bố. Tuổi và điều kiện vé có thể phụ thuộc quy định của điểm tham quan.',
    E'Trẻ 1–4 tuổi: miễn phí dịch vụ, có thể thu phụ thu ghế xe theo chính sách tour. Bố mẹ tự chi trả các chi phí phát sinh. Hai người lớn kèm tối đa một trẻ miễn phí; trẻ thứ hai áp dụng mức giá trẻ em. Một người lớn đi cùng một trẻ nhỏ có thể phải áp dụng giá trẻ em theo chính sách tour.\\nTrẻ 5–9 tuổi: áp dụng mức giá trẻ em theo phần trăm giá người lớn; tiêu chuẩn ăn, vé và ghế xe theo mô tả tour.\\nTrẻ từ 10 tuổi: áp dụng giá người lớn.\\nNếu vé tại điểm tham quan được tính theo chiều cao và trẻ phải mua vé người lớn, phụ huynh thanh toán phần chênh lệch theo thông báo của hướng dẫn viên.',
    E'Mang giấy tờ tùy thân hợp lệ theo quy định hiện hành; kiểm tra giấy tờ cần thiết cho trẻ em trước ngày đi.\\nKhách ăn chay nên báo trước để xác nhận khả năng phục vụ; nếu cần, chủ động chuẩn bị đồ ăn phù hợp.\\nDịch vụ không sử dụng không được hoàn tiền nếu không do lỗi của đơn vị tổ chức.\\nHướng dẫn viên có thể đổi thứ tự điểm tham quan theo tình hình thực tế nhưng vẫn bảo đảm các điểm trong chương trình.\\nTrong một số trường hợp đoàn ít khách hoặc sử dụng xe nhỏ, lái xe có thể kiêm hướng dẫn viên.',
    E'Khách hàng tự chịu trách nhiệm về tình trạng sức khỏe của mình và cần thông báo trước cho đơn vị tổ chức về tình trạng bệnh lý liên quan để được tư vấn.\\nKhách hàng tự bảo quản tiền bạc, giấy tờ và tài sản cá nhân trong suốt chuyến đi; đơn vị tổ chức không chịu trách nhiệm với mất mát tài sản cá nhân ngoài phạm vi trách nhiệm theo quy định pháp luật.'
)
ON CONFLICT (template_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tour_information (
    tour_id text PRIMARY KEY,
    price_note text NOT NULL DEFAULT '',
    child_price_percent numeric NOT NULL DEFAULT 75 CHECK (child_price_percent >= 0 AND child_price_percent <= 100),
    infant_surcharge numeric NOT NULL DEFAULT 200000 CHECK (infant_surcharge >= 0),
    included text NOT NULL DEFAULT '',
    excluded text NOT NULL DEFAULT '',
    age_policy text NOT NULL DEFAULT '',
    child_policy text NOT NULL DEFAULT '',
    general_notes text NOT NULL DEFAULT '',
    customer_responsibility text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_policy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_information ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tour policy templates" ON public.tour_policy_templates;
CREATE POLICY "Public can read tour policy templates"
ON public.tour_policy_templates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage tour policy templates" ON public.tour_policy_templates;
CREATE POLICY "Authenticated can manage tour policy templates"
ON public.tour_policy_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read tour information" ON public.tour_information;
CREATE POLICY "Public can read tour information"
ON public.tour_information FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage tour information" ON public.tour_information;
CREATE POLICY "Authenticated can manage tour information"
ON public.tour_information FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.tour_policy_templates, public.tour_information TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tour_policy_templates, public.tour_information TO authenticated;
