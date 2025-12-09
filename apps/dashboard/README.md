# TikTok Shop 情报 Dashboard (Vite + shadcn/ui)

基于 Vite + React + Tailwind + shadcn/ui 的 SaaS 控制台前端，默认通过 Supabase 读取趋势、视频与搜同款结果。

## 本地开发
1. 安装依赖（建议在仓库根目录使用 npm workspace）：
   ```bash
   npm install
   npm run dev:dashboard
   ```
2. 复制 `.env.example` 为 `.env`，填入 Supabase 项目 URL 与匿名 KEY。
3. 访问 `http://localhost:4173` 查看页面。

## 结构
- `src/App.tsx`：主页面布局，展示趋势榜、搜同款、潜力视频表格。
- `src/lib/supabaseClient.ts`：Supabase 浏览器客户端封装。
- `src/components/sections/*`：页面分区组件。
- `src/components/ui/*`：shadcn 风格的基础 UI 组件。

## 与扩展/后端的联动
- TrendBoard 默认读取 Supabase `trend_signals` 表，可与离线任务、Edge Functions 同步。
- SourcingSearch 调用 Supabase `product_candidates` 表，承接扩展端「搜同款」上传结果。
- VideoTable 直接消费 Supabase `video_overview` 视图（由最新快照与播放速度拼装），开箱即可看到示例数据，也可换成 REST API。
