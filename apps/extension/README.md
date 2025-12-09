# TikTok Intel Extension

基于 Vite + React + CRXJS 的 MV3 扩展，覆盖注入脚本、Content Script、Background Service Worker 与 Side Panel HUD。

## 快速开始
1. 复制 `.env.example` → `.env`，填入 Supabase 项目 URL 与 anon key。
2. 安装依赖并构建：
   ```bash
   npm install
   npm run build:extension
   ```
3. 在 Chrome 中打开 `chrome://extensions`，开启「开发者模式」，点击「加载已解压的扩展程序」，选择 `apps/extension/dist` 目录。

## 模块说明
- `src/injected/intercept.ts`：在 main world 包装 `fetch`，把视频/直播接口响应通过 `TT_Data_Intercept` 事件抛给 Content Script。
- `src/content/tiktok-bridge.ts`：解析事件负载，调用 `decodeFeedResponse` 转成标准化视频结构后通过 `chrome.runtime.sendMessage` 传给后台。
- `src/background/index.ts`：写入 `chrome.storage` 保留最近的视频，并把数据同步到 Supabase `videos` 与 `video_stats_snapshot` 表。
- `src/sidepanel/*`：React HUD，展示实时指标、趋势雷达，以及调用 Supabase Edge Functions 的「搜同款」按钮。

更多接口契约可参考 `docs/implementation.md`。
