create table if not exists public.videos (
  id text primary key,
  author_id text not null,
  publish_time timestamptz not null,
  country text,
  is_ad boolean default false,
  shop_product_id text
);

create table if not exists public.video_stats_snapshot (
  video_id text references public.videos(id) on delete cascade,
  snapshot_time timestamptz default now(),
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  saves bigint default 0
);

create table if not exists public.trend_signals (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id text not null,
  window_start timestamptz default now(),
  velocity numeric,
  acceleration numeric
);

create table if not exists public.product_candidates (
  id uuid default gen_random_uuid() primary key,
  video_id text,
  source text,
  url text,
  price numeric,
  currency text,
  moq integer,
  rating numeric,
  estimated_gross_margin numeric
);

create table if not exists public.sourcing_search_logs (
  id uuid default gen_random_uuid() primary key,
  video_id text,
  image_base64 text,
  created_at timestamptz default now()
);

alter table public.videos enable row level security;
alter table public.video_stats_snapshot enable row level security;
alter table public.trend_signals enable row level security;
alter table public.product_candidates enable row level security;
alter table public.sourcing_search_logs enable row level security;

create policy "Allow anon ingest videos" on public.videos
  for insert with check (true);

create policy "Allow anon ingest stats" on public.video_stats_snapshot
  for insert with check (true);

create policy "Allow anon read for dashboard" on public.trend_signals
  for select using (true);

create policy "Allow anon read for sourcing" on public.product_candidates
  for select using (true);
