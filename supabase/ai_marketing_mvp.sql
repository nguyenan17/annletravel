-- AnnLeTravel AI Marketing MVP
-- Additive schema only: does not alter existing tours, bookings, blog_posts, tickets, hotels or vessels.
-- Apply manually in Supabase SQL Editor after reviewing the migration.

create extension if not exists pgcrypto;

create table if not exists public.marketing_content (
    id uuid primary key default gen_random_uuid(),
    title text not null default '',
    content_type text not null check (content_type in ('social_post', 'blog_article', 'video_script', 'video', 'campaign')),
    platforms text[] not null default '{}',
    brief text not null default '',
    content jsonb not null default '{}'::jsonb,
    assets jsonb not null default '[]'::jsonb,
    status text not null default 'draft'
        check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'published', 'failed')),
    scheduled_at timestamptz,
    approved_at timestamptz,
    approved_by uuid references auth.users(id) on delete set null,
    published_at timestamptz,
    publication_result jsonb not null default '{}'::jsonb,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists marketing_content_status_created_idx
    on public.marketing_content (status, created_at desc);
create index if not exists marketing_content_schedule_idx
    on public.marketing_content (scheduled_at)
    where status = 'scheduled';

create table if not exists public.marketing_jobs (
    id uuid primary key default gen_random_uuid(),
    job_type text not null check (job_type in ('generate_content', 'render_video')),
    status text not null default 'queued'
        check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    input jsonb not null default '{}'::jsonb,
    result jsonb not null default '{}'::jsonb,
    error_message text,
    attempts integer not null default 0 check (attempts >= 0),
    max_attempts integer not null default 3 check (max_attempts between 1 and 10),
    available_at timestamptz not null default now(),
    locked_at timestamptz,
    worker_id text,
    content_id uuid references public.marketing_content(id) on delete set null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists marketing_jobs_queue_idx
    on public.marketing_jobs (status, available_at, created_at)
    where status in ('queued', 'failed');
create index if not exists marketing_jobs_content_idx
    on public.marketing_jobs (content_id);

create or replace function public.set_marketing_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists marketing_content_updated_at on public.marketing_content;
create trigger marketing_content_updated_at
before update on public.marketing_content
for each row execute function public.set_marketing_updated_at();

drop trigger if exists marketing_jobs_updated_at on public.marketing_jobs;
create trigger marketing_jobs_updated_at
before update on public.marketing_jobs
for each row execute function public.set_marketing_updated_at();

alter table public.marketing_content enable row level security;
alter table public.marketing_jobs enable row level security;

drop policy if exists "Marketing admins can read content" on public.marketing_content;
create policy "Marketing admins can read content"
on public.marketing_content for select
to authenticated
using (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
));

drop policy if exists "Marketing admins can create content" on public.marketing_content;
create policy "Marketing admins can create content"
on public.marketing_content for insert
to authenticated
with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
    and (created_by is null or created_by = auth.uid())
    and status in ('draft', 'pending_approval')
);

drop policy if exists "Marketing admins can update content" on public.marketing_content;
create policy "Marketing admins can update content"
on public.marketing_content for update
to authenticated
using (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
))
with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Marketing admins can delete content" on public.marketing_content;
create policy "Marketing admins can delete content"
on public.marketing_content for delete
to authenticated
using (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
));

drop policy if exists "Marketing admins can read jobs" on public.marketing_jobs;
create policy "Marketing admins can read jobs"
on public.marketing_jobs for select
to authenticated
using (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
));

drop policy if exists "Marketing admins can create jobs" on public.marketing_jobs;
create policy "Marketing admins can create jobs"
on public.marketing_jobs for insert
to authenticated
with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
    and (created_by is null or created_by = auth.uid())
);

drop policy if exists "Marketing admins can update jobs" on public.marketing_jobs;
create policy "Marketing admins can update jobs"
on public.marketing_jobs for update
to authenticated
using (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
))
with check (exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
));

-- Deliberately no public read policy and no social-publishing trigger.
-- Only a trusted server-side function/worker may use privileged credentials.
