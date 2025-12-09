import { useEffect, useState } from 'react';
import type { NormalizedVideo } from '../services/protobuf-decoder';
import { useVideoMetrics } from './hooks/useVideoMetrics';
import VideoSummary from './components/VideoSummary';
import SourcingButton from './components/SourcingButton';
import TrendSpark from './components/TrendSpark';

export default function App() {
  const [video, setVideo] = useState<NormalizedVideo | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PULL_LATEST_VIDEO' }, (res) => {
      setVideo(res?.video ?? null);
    });

    const handler = (msg: any) => {
      if (msg?.type === 'VIDEO_BROADCAST') {
        setVideo(msg.video ?? null);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const metrics = useVideoMetrics(video);

  return (
    <div className="grid" style={{ padding: 12, minWidth: 360 }}>
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>TikTok Intel HUD</div>
          <div className="text-subtle" style={{ fontSize: 13 }}>实时同步视频指标 · 搜同款 · 预估转化</div>
        </div>
        <span className="badge">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          监听中
        </span>
      </header>

      <VideoSummary video={video} metrics={metrics} />
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600 }}>搜同款 & 毛利估算</div>
          <div className="text-subtle" style={{ fontSize: 13 }}>一键截图发往 Supabase Edge Function 返回货源</div>
        </div>
        <SourcingButton videoId={video?.id} />
      </div>

      <TrendSpark />
    </div>
  );
}
