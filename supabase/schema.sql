-- MODO CMS schema for Supabase Free.
-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  content_key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Admins can read own allowlist row" on public.admin_users;
create policy "Admins can read own allowlist row"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
  on public.site_content for insert to authenticated
  with check (exists (
    select 1 from public.admin_users au where au.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
  on public.site_content for update to authenticated
  using (exists (
    select 1 from public.admin_users au where au.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.admin_users au where au.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
  on public.site_content for delete to authenticated
  using (exists (
    select 1 from public.admin_users au where au.user_id = (select auth.uid())
  ));

grant select on public.admin_users to authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- Public bucket for portfolio/client media. Writes are restricted to allow-listed admins.
insert into storage.buckets (id, name, public)
values ('modo-media', 'modo-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view MODO media" on storage.objects;
create policy "Public can view MODO media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'modo-media');

drop policy if exists "Admins can upload MODO media" on storage.objects;
create policy "Admins can upload MODO media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'modo-media'
    and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );

drop policy if exists "Admins can update MODO media" on storage.objects;
create policy "Admins can update MODO media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'modo-media'
    and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  )
  with check (
    bucket_id = 'modo-media'
    and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );

drop policy if exists "Admins can delete MODO media" on storage.objects;
create policy "Admins can delete MODO media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'modo-media'
    and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );
