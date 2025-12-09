import { useEffect, useMemo, useState } from 'react';
import { loadRecent, saveSnapshot } from '../../services/storage';
import type { NormalizedVideo } from '../../services/protobuf-decoder';

export function useVideoMetrics(video: NormalizedVideo | null) {
  const [history, setHistory] = useState<{ ts: number; views: number; likes: number }[]>([]);

  useEffect(() => {
    if (!video) return;
    saveSnapshot(video.id, video.stats).catch(console.error);
    loadRecent(video.id).then(setHistory).catch(console.error);
  }, [video?.id]);

  const metrics = useMemo(() => {
    if (!video) return null;
    const last = history.at(-1);
    const deltaViews = last ? video.stats.views - last.views : video.stats.views;
    const deltaLikes = last ? video.stats.likes - last.likes : video.stats.likes;
    const viralIndex = Number(((deltaViews / 1000) + deltaLikes * 0.2).toFixed(2));
    const engagementScore = Number(((video.stats.likes + video.stats.comments * 2 + video.stats.shares * 3) / Math.max(video.stats.views, 1)).toFixed(3));
    const commercialScore = Number((engagementScore * 0.6 + (video.hashtags.includes('tiktokshop') ? 0.4 : 0)).toFixed(3));

    return { viralIndex, engagementScore, commercialScore };
  }, [video, history]);

  return metrics;
}
