-- =====================================================================
-- TeklifPro — Customers table + RLS
-- Run this in Supabase Dashboard > SQL Editor (one-time)
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- Table
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  company_name  text not null,
  contact_name  text,
  phone         text,
  email         text,
  tax_office    text,
  tax_number    text,
  address       text,
  city          text,
  district      text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists customers_owner_id_idx  on public.customers(owner_id);
create index if not exists customers_created_at_idx on public.customers(created_at desc);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.customers enable row level security;

drop policy if exists "Users can view own customers"  on public.customers;
drop policy if exists "Users can insert own customers" on public.customers;
drop policy if exists "Users can update own customers" on public.customers;
drop policy if exists "Users can delete own customers" on public.customers;

create policy "Users can view own customers"
  on public.customers for select
  using (auth.uid() = owner_id);

create policy "Users can insert own customers"
  on public.customers for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own customers"
  on public.customers for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete own customers"
  on public.customers for delete
  using (auth.uid() = owner_id);
