-- ANNLETRAVEL BLOG / KINH NGHIEM DU LICH
create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text not null default '',
    cover_image text,
    seo_title text,
    seo_description text,
    category text default 'Kinh nghiệm du lịch',
    destination text,
    published boolean not null default false,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);
create index if not exists blog_posts_destination_idx on public.blog_posts (destination);

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
    on public.blog_posts for select
    using (published = true);

drop policy if exists "Admins can read all blog posts" on public.blog_posts;
create policy "Admins can read all blog posts"
    on public.blog_posts for select
    to authenticated
    using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can insert blog posts" on public.blog_posts;
create policy "Admins can insert blog posts"
    on public.blog_posts for insert
    to authenticated
    with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts"
    on public.blog_posts for update
    to authenticated
    using (exists (select 1 from public.admin_users where user_id = auth.uid()))
    with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts"
    on public.blog_posts for delete
    to authenticated
    using (exists (select 1 from public.admin_users where user_id = auth.uid()));
