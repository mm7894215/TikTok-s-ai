-- Add richer metadata for videos
alter table public.videos
  add column if not exists title text,
  add column if not exists hashtags text[],
  add column if not exists music_id text;

-- Allow dashboard reads
create policy if not exists "Allow anon read videos" on public.videos
  for select using (true);
create policy if not exists "Allow anon read stats" on public.video_stats_snapshot
  for select using (true);

-- Latest snapshot per video
create or replace view public.video_latest_stats as
select distinct on (video_id)
  video_id,
  snapshot_time,
  views,
  likes,
  comments,
  shares,
  saves
from public.video_stats_snapshot
order by video_id, snapshot_time desc;

-- Velocity derived from latest and previous snapshot
create or replace view public.video_growth_signals as
with ranked as (
  select
    video_id,
    snapshot_time,
    views,
    likes,
    comments,
    shares,
    saves,
    row_number() over (partition by video_id order by snapshot_time desc) as rn,
    lag(views) over (partition by video_id order by snapshot_time desc) as prev_views,
    lag(snapshot_time) over (partition by video_id order by snapshot_time desc) as prev_snapshot_time
  from public.video_stats_snapshot
)
select
  video_id,
  snapshot_time,
  views,
  likes,
  comments,
  shares,
  saves,
  case
    when prev_snapshot_time is null then null
    else (views - prev_views) / greatest(extract(epoch from snapshot_time - prev_snapshot_time) / 3600, 0.0167)
  end as views_per_hour
from ranked
where rn = 1;

-- Combine metadata + latest stats + velocity for dashboard consumption
create or replace view public.video_overview as
select
  v.id,
  coalesce(v.title, '未命名') as title,
  v.author_id,
  v.country,
  v.is_ad,
  v.hashtags,
  v.music_id,
  ls.snapshot_time,
  ls.views,
  ls.likes,
  ls.comments,
  ls.shares,
  ls.saves,
  gs.views_per_hour,
  coalesce((ls.likes * 2 + ls.comments * 3 + ls.shares * 4 + ls.saves) / greatest(ls.views, 1), 0)::numeric as commercial_score
from public.videos v
left join public.video_latest_stats ls on ls.video_id = v.id
left join public.video_growth_signals gs on gs.video_id = v.id;

-- Seed demo rows for dashboard preview (idempotent)
insert into public.videos (id, author_id, publish_time, country, is_ad, shop_product_id, title, hashtags, music_id)
select * from (values
  ('7234567890', 'beauty_lab', now() - interval '1 day', 'US', false, null, '可拆卸收纳化妆包', array['makeup','organizer','travel'], 'sound_1'),
  ('7234567891', 'fitgear', now() - interval '20 hours', 'UK', false, null, '迷你筋膜枪评测', array['fitness','recovery','gift'], 'sound_2')
) as v(id, author_id, publish_time, country, is_ad, shop_product_id, title, hashtags, music_id)
where not exists (select 1 from public.videos existing where existing.id = v.id);

insert into public.video_stats_snapshot (video_id, snapshot_time, views, likes, comments, shares, saves)
select * from (values
  ('7234567890', now() - interval '2 hour', 360000, 16500, 2950, 2100, 8000),
  ('7234567890', now(), 389000, 18000, 3200, 2400, 8800),
  ('7234567891', now() - interval '2 hour', 198000, 8700, 1180, 820, 4100),
  ('7234567891', now(), 210000, 9200, 1300, 900, 4300)
) as s(video_id, snapshot_time, views, likes, comments, shares, saves)
where not exists (
  select 1
  from public.video_stats_snapshot existing
  where existing.video_id = s.video_id
    and existing.snapshot_time = s.snapshot_time
);

insert into public.trend_signals (entity_type, entity_id, window_start, velocity, acceleration)
select * from (values
  ('sound', 'Get It Right', now() - interval '1 hour', 12.5, 3.1),
  ('tag', '#summeroutfit', now() - interval '30 minute', 10.2, 2.4),
  ('sound', 'Happy Vibes', now() - interval '2 hour', 8.9, 1.8)
) as t(entity_type, entity_id, window_start, velocity, acceleration)
where not exists (
  select 1 from public.trend_signals existing where existing.entity_id = t.entity_id and existing.entity_type = t.entity_type
);

insert into public.product_candidates (video_id, source, url, price, currency, moq, rating, estimated_gross_margin)
select * from (values
  ('7234567890', 'AliExpress', 'https://www.aliexpress.com/item/example', 12.3, 'USD', 2, 4.8, 38),
  ('7234567890', '1688', 'https://detail.1688.com/item/example', 6.5, 'CNY', 10, 4.6, 55)
) as pc(video_id, source, url, price, currency, moq, rating, estimated_gross_margin)
where not exists (
  select 1 from public.product_candidates existing where existing.video_id = pc.video_id and existing.url = pc.url
);
