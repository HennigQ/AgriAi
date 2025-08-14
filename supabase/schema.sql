create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null,
  farm_name text not null,
  province text not null,
  location text,
  main_crops text[] default '{}',
  trial_end timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create type if not exists subscription_status as enum ('active','expired','canceled','past_due');
create type if not exists plan_type as enum ('monthly','yearly','trial');

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan plan_type not null,
  status subscription_status not null,
  start_date date not null,
  end_date date not null,
  amount numeric(12,2) not null,
  pf_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_prices (
  id bigserial primary key,
  crop text not null,
  province text not null,
  price_per_kg numeric(10,2) not null,
  price_unit text not null default 'ZAR/kg',
  date date not null,
  inserted_at timestamptz not null default now()
);
create index if not exists idx_daily_prices_lookup on public.daily_prices(crop, province, date);

create table if not exists public.weather_cache (
  id uuid primary key default uuid_generate_v4(),
  cache_key text unique not null,
  forecast_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_prices enable row level security;
alter table public.weather_cache enable row level security;

create policy if not exists "read own profile" on public.profiles
for select using (auth.uid() = id);

create policy if not exists "update own profile" on public.profiles
for update using (auth.uid() = id);

create policy if not exists "read own subscriptions" on public.subscriptions
for select using (auth.uid() = user_id);

create policy if not exists "read prices (all authed)" on public.daily_prices
for select using (auth.role() = 'authenticated');

create policy if not exists "read weather cache (all authed)" on public.weather_cache
for select using (auth.role() = 'authenticated');