-- SiteForge Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Add SiteForge columns to existing profiles table (skip if they already exist)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text not null default 'caller' check (role in ('designer', 'caller', 'both'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
end $$;

-- Templates table
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  designer_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  niche text not null,
  description text not null default '',
  preview_image_url text,
  html_content text not null,
  fields jsonb not null default '[]'::jsonb,
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  downloads integer not null default 0,
  rating numeric(3,2) not null default 0,
  created_at timestamptz default now() not null
);

alter table public.templates enable row level security;

create policy "Anyone can view active templates"
  on public.templates for select using (is_active = true);

create policy "Designers can view their own templates"
  on public.templates for select using (auth.uid() = designer_id);

create policy "Designers can insert templates"
  on public.templates for insert with check (auth.uid() = designer_id);

create policy "Designers can update their own templates"
  on public.templates for update using (auth.uid() = designer_id);

-- Previews table
create table public.previews (
  id uuid default uuid_generate_v4() primary key,
  caller_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete cascade not null,
  slug text not null unique,
  field_values jsonb not null default '{}'::jsonb,
  html_snapshot text not null,
  prospect_name text,
  created_at timestamptz default now() not null,
  expires_at timestamptz
);

alter table public.previews enable row level security;

create policy "Anyone can view previews by slug"
  on public.previews for select using (true);

create policy "Callers can insert previews"
  on public.previews for insert with check (auth.uid() = caller_id);

create policy "Callers can view their own previews"
  on public.previews for select using (auth.uid() = caller_id);

-- Purchases table
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  caller_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete cascade not null,
  amount numeric(10,2) not null,
  stripe_payment_id text,
  created_at timestamptz default now() not null
);

alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select using (auth.uid() = caller_id);

create policy "Users can insert their own purchases"
  on public.purchases for insert with check (auth.uid() = caller_id);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  caller_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz default now() not null,
  unique(caller_id, template_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select using (true);

create policy "Callers can insert reviews"
  on public.reviews for insert with check (auth.uid() = caller_id);

create policy "Callers can update their own reviews"
  on public.reviews for update using (auth.uid() = caller_id);

-- Create storage bucket for template images and uploads
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "Anyone can view uploads"
  on storage.objects for select using (bucket_id = 'uploads');

create policy "Authenticated users can upload"
  on storage.objects for insert with check (
    bucket_id = 'uploads' and auth.role() = 'authenticated'
  );
