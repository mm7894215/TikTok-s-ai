import { createClient } from '@supabase/supabase-js';
import type { NormalizedVideo } from '../services/protobuf-decoder';

type VideoPayload = {
  type: 'VIDEO_INTERCEPTED';
  video: NormalizedVideo;
};

type PanelRequest = { type: 'PULL_LATEST_VIDEO' };

type IncomingMessage = VideoPayload | PanelRequest;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

chrome.runtime.onMessage.addListener((message: IncomingMessage, sender, sendResponse) => {
  if (message?.type === 'VIDEO_INTERCEPTED') {
    void handleVideo(message.video);
    sendResponse({ ok: true });
    return;
  }

  if (message?.type === 'PULL_LATEST_VIDEO') {
    chrome.storage.local.get(['latestVideo']).then((res) => {
      sendResponse({ video: res.latestVideo ?? null });
    });
    return true;
  }
});

async function handleVideo(video: NormalizedVideo) {
  await chrome.storage.local.set({ latestVideo: video });
  chrome.runtime.sendMessage({ type: 'VIDEO_BROADCAST', video }).catch(() => undefined);

  if (!supabase) return;

  await supabase.from('videos').upsert(
    {
      id: video.id,
      author_id: video.authorId,
      publish_time: new Date(video.publishTime * 1000).toISOString(),
      country: video.country ?? null,
      is_ad: video.isAd,
      shop_product_id: video.shop?.productId ?? null,
      title: video.caption ?? null,
      hashtags: video.hashtags ?? [],
      music_id: video.musicId ?? null
    },
    { onConflict: 'id' }
  );

  await supabase.from('video_stats_snapshot').insert({
    video_id: video.id,
    views: video.stats.views,
    likes: video.stats.likes,
    comments: video.stats.comments,
    shares: video.stats.shares,
    saves: video.stats.saves,
    snapshot_time: new Date().toISOString()
  });
}
