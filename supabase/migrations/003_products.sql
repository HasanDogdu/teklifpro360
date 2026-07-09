-- =====================================================================
-- TeklifPro — Products table + RLS
-- Run this in Supabase Dashboard > SQL Editor (one-time)
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  product_code  text,
  product_name  text not null,
  unit          text not null default 'adet',
  unit_price    numeric(15,2) not null default 0,
  vat_rate      numeric(5,2)  not null default 20,
  description   text,
  is_favorite   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_owner_id_idx   on public.products(owner_id);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_favorite_idx   on public.products(owner_id) where is_favorite = true;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

alter table public.products enable row level security;

drop policy if exists "Users can view own products"   on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;

create policy "Users can view own products"
  on public.products for select using (auth.uid() = owner_id);
create policy "Users can insert own products"
  on public.products for insert with check (auth.uid() = owner_id);
create policy "Users can update own products"
  on public.products for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users can delete own products"
  on public.products for delete using (auth.uid() = owner_id);
