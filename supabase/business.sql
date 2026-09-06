-- ANNLETRAVEL B2B / DOANH NGHIEP
-- Run this script in Supabase SQL Editor.

create table if not exists public.business_services (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    short_description text,
    description text,
    icon text,
    image text,
    sort_order integer not null default 0,
    visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.business_leads (
    id uuid primary key default gen_random_uuid(),
    company_name text not null,
    contact_name text not null,
    phone text not null,
    email text,
    employee_count integer,
    service_interest text,
    departure text,
    destination text,
    departure_date date,
    return_date date,
    budget text,
    message text,
    status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.business_services enable row level security;
alter table public.business_leads enable row level security;

drop policy if exists "Public can view visible business services" on public.business_services;
create policy "Public can view visible business services"
on public.business_services for select
using (visible = true);

drop policy if exists "Anyone can submit business lead" on public.business_leads;
create policy "Anyone can submit business lead"
on public.business_leads for insert
with check (true);

drop policy if exists "Admins manage business services" on public.business_services;
create policy "Admins manage business services"
on public.business_services for all
using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins manage business leads" on public.business_leads;
create policy "Admins manage business leads"
on public.business_leads for all
using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

insert into public.business_services (title, short_description, description, icon, sort_order)
select * from (values
 ('Company Trip', 'Du lịch nghỉ dưỡng dành cho doanh nghiệp', 'Thiết kế chương trình company trip theo quy mô, ngân sách và văn hóa doanh nghiệp.', '🏝️', 1),
 ('Team Building', 'Gắn kết đội ngũ qua những trải nghiệm đáng nhớ', 'Tổ chức team building trọn gói với kịch bản, nhân sự, đạo cụ và địa điểm phù hợp.', '🤝', 2),
 ('MICE & Hội nghị', 'Kết hợp du lịch, hội nghị và sự kiện', 'Cung cấp giải pháp MICE từ hội nghị, gala dinner đến chương trình kết hợp nghỉ dưỡng.', '🎤', 3),
 ('Tour đoàn riêng', 'Lịch trình linh hoạt theo yêu cầu', 'Xây dựng tour riêng cho đoàn công ty với lịch trình và dịch vụ được cá nhân hóa.', '🚌', 4),
 ('Vé máy bay & Khách sạn', 'Dịch vụ đặt chỗ cho đoàn doanh nghiệp', 'Hỗ trợ vé máy bay, khách sạn và các dịch vụ hậu cần cho đoàn công tác, du lịch.', '✈️', 5),
 ('Xe & Dịch vụ mặt đất', 'Vận chuyển an toàn, đúng kế hoạch', 'Điều phối xe đưa đón, xe du lịch và dịch vụ mặt đất theo lịch trình của doanh nghiệp.', '🚐', 6)
) as v(title, short_description, description, icon, sort_order)
where not exists (select 1 from public.business_services);

create index if not exists idx_business_services_visible_order on public.business_services (visible, sort_order);
create index if not exists idx_business_leads_status_created on public.business_leads (status, created_at desc);
