# TikTok Social Commerce Intelligence

该仓库用于搭建 TikTok Shop 社交电商情报系统的项目骨架和实现。当前包含 Vite + shadcn/ui 的 Dashboard、Supabase 后端表结构与 Edge Function 示例，以及可运行的 MV3 浏览器扩展（Vite + React + CRXJS）。

## 仓库结构
- `docs/`：产品 PRD 与面向 AI Coding 的实现说明。
- `apps/`：多应用代码目录（扩展、SaaS 控制台、API、离线任务）。
  - `apps/dashboard/`：Vite + React + Tailwind + shadcn/ui 的 SaaS 控制台。
  - `apps/extension/`：MV3 浏览器扩展，含 injected/content/background/Side Panel HUD。
- `packages/`：共享类型与 UI 组件库等复用包。
- `infra/`：容器化与部署配置占位。
- `supabase/`：数据库迁移与 Edge Functions。

## 快速开始（Dashboard + Supabase）
1. 安装依赖并启动本地 Supabase：
   ```bash
   npm install
   supabase start
   supabase migration up
   ```
2. 复制 `apps/dashboard/.env.example` 为 `.env`，填入 Supabase URL 与匿名 Key。
3. 启动前端：
 ```bash
  npm run dev:dashboard
  ```
4. Edge Functions 本地调试：
   ```bash
   supabase functions serve collect-video-events
 supabase functions serve sourcing-search
  ```

## 快速开始（Chrome 扩展 HUD）
1. 复制 `apps/extension/.env.example` 为 `.env`，填入 Supabase URL 与匿名 Key。
2. 构建扩展：
   ```bash
   npm install
   npm run build:extension
   ```
3. 在 Chrome 中打开 `chrome://extensions`，开启「开发者模式」，点击「加载已解压的扩展程序」，指向 `apps/extension/dist`。
4. 打开任意 TikTok 页面，点击侧边栏 HUD，验证实时指标、趋势雷达与「搜同款」调用 Supabase Edge Functions。

## 状态
- Dashboard：包含趋势榜、搜同款表单、潜在爆款表格的初版 UI，默认读取 Supabase 表；可替换为真实数据源。
- Supabase：提供核心数据表、最小 RLS 策略与两个 Edge Function，用于收集视频事件与返回搜同款候选。
- Extension：注入脚本截获 TikTok 请求 → Content Script 转换 → Background 写入 Supabase → Side Panel HUD 展示实时指标并调用搜同款。
