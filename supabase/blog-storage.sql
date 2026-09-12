-- ANNLETRAVEL - Blog image storage
-- Run this once in Supabase SQL Editor before using direct image upload in Blog Admin.

-- Public bucket so published blog images can be rendered on the public website.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Admins can upload blog images.
drop policy if exists "Blog admins can upload images" on storage.objects;
create policy "Blog admins can upload images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'blog-images'
    and exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
    )
);

-- Admins can update their blog image objects if needed.
drop policy if exists "Blog admins can update images" on storage.objects;
create policy "Blog admins can update images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'blog-images'
    and exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
    )
)
with check (
    bucket_id = 'blog-images'
    and exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
    )
);

-- Admins can remove old blog image objects later when content is cleaned up.
drop policy if exists "Blog admins can delete images" on storage.objects;
create policy "Blog admins can delete images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'blog-images'
    and exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
    )
);
