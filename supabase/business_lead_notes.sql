-- ANNLETRAVEL B2B - Customer care history
-- Run this script in Supabase SQL Editor after business.sql.

create table if not exists public.business_lead_notes (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.business_leads(id) on delete cascade,
    note text not null,
    note_type text not null default 'note' check (note_type in ('note','call','email','meeting','quote','follow_up')),
    follow_up_at timestamptz,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.business_lead_notes enable row level security;

drop policy if exists "Admins manage business lead notes" on public.business_lead_notes;
create policy "Admins manage business lead notes" on public.business_lead_notes for all
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create index if not exists idx_business_lead_notes_lead_created
on public.business_lead_notes (lead_id, created_at desc);
