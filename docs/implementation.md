# 面向 Cursor 的技术实现说明

> 目标：让 AI Coding 工具直接生成项目骨架与核心模块的 MVP 实现锚点。

## 1. 总体架构
- **前端 1：Chrome 扩展（MV3）** — TypeScript + React (Side Panel/Popup) + Vite + CRXJS。
- **前端 2：SaaS 控制台** — Next.js (App Router) + TypeScript + Tailwind。
- **后端** — 推荐 Node.js (NestJS/Fastify) 或 Go (Gin/Fiber)，负责用户管理、数据聚合、报表与计算任务。
- **数据层** — PostgreSQL；时序/日志 ClickHouse 或 Timescale（可延后）；缓存 Redis。
- **任务与算法** — Redis + BullMQ/RabbitMQ 队列；Python(FastAPI Worker)或 Node Worker 处理趋势与 AI 任务。

## 2. 仓库与目录结构（单仓 Monorepo 推荐）
```
tiktok-intel/
  apps/
    extension/          # Chrome 扩展
    dashboard/          # SaaS 控制台
    api/                # 主后端 API 服务
    jobs/               # 离线任务与算法服务
  packages/
    shared-types/       # 前后端共享 TypeScript 类型
    ui-kit/             # React UI 组件库
  infra/
    docker/             # 容器与本地环境
    k8s/                # 部署配置（可后置）
```

### apps/extension 关键目录
```
apps/extension/
  src/
    manifest.ts
    background/
      index.ts
    content/
      index.tsx
      tiktok-bridge.ts
    injected/
      intercept.ts
    sidepanel/
      App.tsx
      hooks/
      components/
    services/
      protobuf-decoder.ts
      backend-client.ts
      storage.ts
```

### apps/api 关键目录
```
apps/api/
  src/
    main.ts
    modules/
      auth/
      users/
      video/
      product/
      sourcing/
      trend/
    common/
      config/
      database/
      middleware/
```

### apps/jobs 关键目录
```
apps/jobs/
  src/
    workers/
      trend-calculator.ts
      comment-intent.ts
    queues/
      index.ts
```

## 3. 核心模块约束与接口
### 3.1 扩展端数据获取
- **injected/intercept.ts**：`document_start` 注入；包装 `window.fetch`/XHR，监听特征 URL（Feed/Live）。
- 通过 `window.dispatchEvent` 发送 `TT_Data_Intercept` 事件，统一 Payload：`{ url: string; body: ArrayBuffer | any; headers: Record<string,string> }`。
- **content/tiktok-bridge.ts**：订阅事件，调用 `protobuf-decoder` 解析为 `NormalizedVideo/NormalizedLive`，并通过 `chrome.runtime.sendMessage` 传递给 background。

### 3.2 Protobuf 解码
文件：`services/protobuf-decoder.ts`
- 暴露方法：`decodeFeedResponse(buffer: ArrayBuffer): NormalizedVideo[]`，`decodeLiveResponse(buffer: ArrayBuffer): NormalizedLive[]`。
- 维护 `fieldMapping` 配置以便 Schema 演化。
- `NormalizedVideo` 示例：
```ts
export interface NormalizedVideo {
  id: string;
  authorId: string;
  publishTime: number;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  musicId?: string;
  hashtags: string[];
  isAd: boolean;
  shop?: {
    productId?: string;
    price?: number;
    currency?: string;
  };
}
```

### 3.3 本地指标计算
- 文件：`sidepanel/hooks/useVideoMetrics.ts`
- 输入：`NormalizedVideo` + 本地缓存历史快照。
- 输出：`viralIndex`、`engagementScore`、`commercialScore`。
- 历史数据存储：`storage.ts` 封装 IndexedDB，使用 `videoId + timestampBucket` 作为主键。

### 3.4 搜同款流程
- 前端组件：`sidepanel/components/SourcingButton.tsx`，从 `<video>` 抽帧→Blob→Base64/直传，调用 `POST /api/sourcing/search-by-image`。
- 后端接口：`POST /sourcing/search-by-image`，请求 `{ imageBase64: string, videoId?: string }`，返回 `ProductCandidate[]`（包含 source、url、price、currency、moq、rating、estimatedGrossMargin）。

### 3.5 趋势与热榜
- Worker：`trend-calculator.ts` 定时拉取视频快照，计算 BGM/Hashtag 的速度与加速度，写入 `trend_signals` 表。
- API：`GET /trend/top-sounds`、`GET /trend/top-tags`；Dashboard `/trends` 展示榜单与折线图。

### 3.6 评论意图分析
- Worker：`comment-intent.ts` 消费 `comment_intent_analyze` 队列，调用 `IntentModelClient`（HTTP 或本地推理）分类，写入 `comment_intents` 并更新 `video_metrics.commercial_intent_score`。

## 4. 数据库核心表（简化）
- `videos`：`id, author_id, publish_time, country, is_ad, shop_product_id, …`
- `video_stats_snapshot`：`video_id, timestamp, views, likes, comments, shares, saves`
- `products`：平台无关商品基础信息。
- `product_sources`：供应链维度（1688 / AliExpress / Others）。
- `video_product_link`：视频与产品的映射与置信度。
- `trend_signals`：`entity_type`、`entity_id`、`window_start`、`velocity`、`acceleration`。
- `comment_intents`：`video_id, comment_id, intent, score`。

## 5. 主要 API（MVP）
- 扩展 → 后端：`POST /api/collect/video-events`，`POST /api/sourcing/search-by-image`，`GET /api/video/:id/analytics`。
- Dashboard：`GET /api/trend/top-videos`，`GET /api/trend/top-sounds`，`GET /api/trend/top-tags`，`GET /api/product/:id/summary`。

## 6. 本地开发流程
1. Docker Compose 启动数据库与 Redis。
2. `apps/api`：生成 ORM Schema 并迁移，暴露基础 Auth + Video 查询接口。
3. `apps/extension`：先实现静态 Side Panel UI，再打通主世界→Content→Background 的最小事件链路。
4. `apps/dashboard`：创建 `/trends`、`/videos` 页面，使用假数据对接 API 类型。
5. E2E（Playwright）：模拟打开 TikTok → 触发扩展面板 → 校验 UI 展示。

## 7. 安全与合规
- 仅处理用户正常浏览产生的公开信息，禁止自动化批量操作，UI 明示数据用途与隐私策略。
- 后端需做 IP/频率限制与敏感数据最小化存储。
