-- =====================================================================
-- TeklifPro — Quotations + Quotation Items tables + RLS
-- Run this in Supabase Dashboard > SQL Editor (one-time)
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- Table: quotations
-- =====================================================================
create table if not exists public.quotations (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,

  -- Numbering
  quote_number        text not null,

  -- Customer link
  customer_id         uuid references public.customers(id) on delete set null,
  customer_snapshot   jsonb,

  -- Dates
  issue_date          date not null default current_date,
  valid_until         date,

  -- Status & currency
  status              text not null default 'draft'
                        check (status in ('draft','sent','accepted','rejected','expired')),
  currency            text not null default 'TRY'
                        check (currency in ('TRY','USD','EUR')),

  -- Defaults copied from company_settings at creation time
  vat_rate            numeric(5,2)  not null default 20,
  payment_terms       text,
  footer_notes        text,

  -- Totals (updated when items change — stored for fast list rendering)
  subtotal            numeric(15,2) not null default 0,
  vat_amount          numeric(15,2) not null default 0,
  discount_amount     numeric(15,2) not null default 0,
  total               numeric(15,2) not null default 0,

  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Each owner has unique quote numbers
  constraint quotations_owner_number_unique unique (owner_id, quote_number)
);

create index if not exists quotations_owner_id_idx      on public.quotations(owner_id);
create index if not exists quotations_customer_id_idx   on public.quotations(customer_id);
create index if not exists quotations_status_idx        on public.quotations(owner_id, status);
create index if not exists quotations_issue_date_idx    on public.quotations(owner_id, issue_date desc);

drop trigger if exists quotations_set_updated_at on public.quotations;
create trigger quotations_set_updated_at
  before update on public.quotations
  for each row execute function public.handle_updated_at();

-- RLS on quotations
alter table public.quotations enable row level security;

drop policy if exists "Users can view own quotations"   on public.quotations;
drop policy if exists "Users can insert own quotations" on public.quotations;
drop policy if exists "Users can update own quotations" on public.quotations;
drop policy if exists "Users can delete own quotations" on public.quotations;

create policy "Users can view own quotations"
  on public.quotations for select using (auth.uid() = owner_id);
create policy "Users can insert own quotations"
  on public.quotations for insert with check (auth.uid() = owner_id);
create policy "Users can update own quotations"
  on public.quotations for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users can delete own quotations"
  on public.quotations for delete using (auth.uid() = owner_id);

-- =====================================================================
-- Table: quotation_items (schema only, no UI yet)
-- =====================================================================
create table if not exists public.quotation_items (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  quotation_id    uuid not null references public.quotations(id) on delete cascade,

  -- Optional link to catalog product (null → free-text item)
  product_id      uuid references public.products(id) on delete set null,

  -- Ordering
  position        integer not null default 0,

  -- Line snapshot (so historical quotes stay stable if product changes)
  product_code    text,
  description     text not null default '',
  unit            text not null default 'adet',
  quantity        numeric(15,3) not null default 1,
  unit_price      numeric(15,2) not null default 0,
  discount_rate   numeric(5,2)  not null default 0,
  vat_rate        numeric(5,2)  not null default 20,
  line_total      numeric(15,2) not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists quotation_items_quotation_id_idx on public.quotation_items(quotation_id, position);
create index if not exists quotation_items_owner_id_idx     on public.quotation_items(owner_id);
create index if not exists quotation_items_product_id_idx   on public.quotation_items(product_id);

drop trigger if exists quotation_items_set_updated_at on public.quotation_items;
create trigger quotation_items_set_updated_at
  before update on public.quotation_items
  for each row execute function public.handle_updated_at();

-- RLS on quotation_items
alter table public.quotation_items enable row level security;

drop policy if exists "Users can view own quotation items"   on public.quotation_items;
drop policy if exists "Users can insert own quotation items" on public.quotation_items;
drop policy if exists "Users can update own quotation items" on public.quotation_items;
drop policy if exists "Users can delete own quotation items" on public.quotation_items;

create policy "Users can view own quotation items"
  on public.quotation_items for select using (auth.uid() = owner_id);
create policy "Users can insert own quotation items"
  on public.quotation_items for insert with check (auth.uid() = owner_id);
create policy "Users can update own quotation items"
  on public.quotation_items for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users can delete own quotation items"
  on public.quotation_items for delete using (auth.uid() = owner_id);
