-- =====================================================================
-- TeklifPro — Company Settings table + Storage bucket + RLS
-- Run this in Supabase Dashboard > SQL Editor (one-time)
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =====================================================================
-- Table: company_settings
-- =====================================================================
create table if not exists public.company_settings (
  id                        uuid primary key default gen_random_uuid(),
  owner_id                  uuid not null unique references auth.users(id) on delete cascade,

  -- Firma bilgileri
  company_name              text not null default '',
  logo_url                  text,
  authorized_person         text,
  phone                     text,
  email                     text,
  website                   text,
  tax_office                text,
  tax_number                text,
  address                   text,
  city                      text,
  district                  text,
  iban                      text,

  -- Teklif varsayılanları
  default_currency          text    not null default 'TRY' check (default_currency in ('TRY','USD','EUR')),
  default_vat_rate          numeric(5,2) not null default 20.00,
  default_payment_terms     text,
  default_validity_days     integer not null default 30 check (default_validity_days >= 0),

  -- Teklif footer
  quotation_footer_notes    text,

  -- PDF ayarları
  show_logo                 boolean not null default true,
  show_signature            boolean not null default true,
  show_stamp                boolean not null default false,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- updated_at trigger (uses handle_updated_at from 001_customers.sql)
drop trigger if exists company_settings_set_updated_at on public.company_settings;
create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- Row Level Security — company_settings
-- =====================================================================
alter table public.company_settings enable row level security;

drop policy if exists "Users can view own company settings"   on public.company_settings;
drop policy if exists "Users can insert own company settings" on public.company_settings;
drop policy if exists "Users can update own company settings" on public.company_settings;
drop policy if exists "Users can delete own company settings" on public.company_settings;

create policy "Users can view own company settings"
  on public.company_settings for select
  using (auth.uid() = owner_id);

create policy "Users can insert own company settings"
  on public.company_settings for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own company settings"
  on public.company_settings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete own company settings"
  on public.company_settings for delete
  using (auth.uid() = owner_id);

-- =====================================================================
-- Supabase Storage — bucket for company logos
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  5242880,  -- 5 MB
  array['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies — users can only touch files inside their own uid folder
drop policy if exists "Company logos are publicly readable" on storage.objects;
drop policy if exists "Users can upload own company logo"   on storage.objects;
drop policy if exists "Users can update own company logo"   on storage.objects;
drop policy if exists "Users can delete own company logo"   on storage.objects;

create policy "Company logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'company-logos');

create policy "Users can upload own company logo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own company logo"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own company logo"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
