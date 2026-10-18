-- Merch store orders. Run once in Supabase: Dashboard → SQL Editor → paste → Run.
--
-- To confirm a manual M-Pesa payment: Table Editor → orders → filter
-- status = awaiting_confirmation → check mpesa_code against your M-Pesa
-- messages → set status to paid (and paid_at to now).
--
-- Row-level security is on with no policies, so these tables are reachable only
-- with the service-role key used by the site's server routes. Nothing here is
-- readable from the browser.

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  -- pending → (manual M-Pesa: awaiting_confirmation once the buyer submits a code) → paid → fulfilled
  status          text not null default 'pending' check (status in ('pending', 'awaiting_confirmation', 'paid', 'failed', 'fulfilled', 'cancelled')),
  payment_method  text not null default 'manual_mpesa' check (payment_method in ('manual_mpesa', 'paystack')),
  -- Manual M-Pesa: the confirmation code the buyer typed in. Unique so one payment can't be claimed twice.
  mpesa_code      text unique,
  mpesa_code_submitted_at timestamptz,
  customer_name   text not null,
  email           text not null,
  phone           text not null,
  address         text not null,
  town            text not null,
  notes           text,
  subtotal        integer not null check (subtotal >= 0),
  delivery_fee    integer not null default 0 check (delivery_fee >= 0),
  total           integer not null check (total > 0),
  currency        text not null default 'KES',
  paystack_status text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  title        text not null,
  size         text,
  unit_price   integer not null check (unit_price > 0),
  quantity     integer not null check (quantity > 0),
  line_total   integer not null check (line_total > 0)
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
