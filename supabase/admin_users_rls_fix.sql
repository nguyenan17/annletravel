-- ANNLETRAVEL - FIX ADMIN AUTH CHECK
-- Cho phép user đã đăng nhập đọc đúng record admin_users của chính mình.
-- Điều này cần thiết vì frontend admin kiểm tra quyền bằng auth.uid().

alter table public.admin_users enable row level security;

drop policy if exists "Users can check own admin record" on public.admin_users;
create policy "Users can check own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());
