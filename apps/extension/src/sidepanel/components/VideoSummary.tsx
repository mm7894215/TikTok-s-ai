import type { NormalizedVideo } from '../../services/protobuf-decoder';
import type { useVideoMetrics } from '../hooks/useVideoMetrics';

interface Props {
  video: NormalizedVideo | null;
  metrics: ReturnType<typeof useVideoMetrics>;
}

export default function VideoSummary({ video, metrics }: Props) {
  return (
    <div className="card" style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>当前视频</div>
          <div className="text-subtle" style={{ fontSize: 13 }}>
            {video ? `#${video.id.slice(0, 6)} · 发布于 ${new Date(video.publishTime * 1000).toLocaleString()}` : '等待捕获 TikTok 视频'}
          </div>
        </div>
        {video?.isAd && <span className="badge">广告素材</span>}
      </div>
      <div className="divider" />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {renderStat('播放', video?.stats.views)}
        {renderStat('点赞', video?.stats.likes)}
        {renderStat('评论', video?.stats.comments)}
        {renderStat('分享', video?.stats.shares)}
        {renderStat('收藏', video?.stats.saves)}
      </div>
      {metrics && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge">爆款速度 {metrics.viralIndex}</span>
          <span className="badge">互动分 {metrics.engagementScore}</span>
          <span className="badge">商业潜力 {metrics.commercialScore}</span>
        </div>
      )}
    </div>
  );
}

function renderStat(label: string, value?: number) {
  return (
    <div style={{ minWidth: 80 }}>
      <div className="text-subtle" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{value ?? '—'}</div>
    </div>
  );
}
