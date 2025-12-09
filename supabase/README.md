# Supabase 后端配置

该目录包含 Supabase 项目的核心表结构与 Edge Function，实现与扩展、Dashboard 的最小可用链路。

## 使用步骤
1. 安装 Supabase CLI，并在仓库根目录执行 `supabase start` 拉起本地实例。
2. 运行迁移：
   ```bash
   supabase migration up
   ```
3. 部署或本地调试 Edge Functions：
   ```bash
   supabase functions serve collect-video-events
   supabase functions serve sourcing-search
   ```
4. 将 `.env` 中的 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY` 设置到 Edge Function 环境或 Vite 前端。

## 新增迁移说明
- `supabase/migrations/0002_views_and_sample.sql`：
  - 为 `videos` 补充 `title`/`hashtags`/`music_id` 元数据列并开放 Select 策略，扩展上报后 Dashboard 可直接读取；
  - 构建 `video_latest_stats`、`video_growth_signals`、`video_overview` 视图，汇总最新快照与播放速度，避免前端自行聚合；
  - 注入示例视频、快照、趋势与货源数据，便于本地启动后立即看到完整链路，可按需删除。

## 功能对照
- `supabase/migrations/0001_init.sql`：创建视频、趋势、搜同款候选与日志表，并开放匿名只读策略供 Dashboard 使用，同时为 `videos`、`video_stats_snapshot` 添加入库策略便于扩展写入。
- `functions/collect-video-events`：从扩展/任务推送视频播放/互动快照，写入 `video_stats_snapshot`。
- `functions/sourcing-search`：接收图搜请求，记录日志并返回 `product_candidates` 中的结果，可对接 1688/AliExpress 图搜处理。
