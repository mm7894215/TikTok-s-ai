const STORAGE_KEY = 'tt_intel_snapshots';

export async function saveSnapshot(videoId: string, stats: Record<string, number>) {
  const snapshots = await loadAll();
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const key = `${videoId}:${bucket}`;
  snapshots[key] = { ...stats, ts: Date.now() };
  await chrome.storage.local.set({ [STORAGE_KEY]: snapshots });
}

export async function loadRecent(videoId: string) {
  const snapshots = await loadAll();
  return Object.entries(snapshots)
    .filter(([k]) => k.startsWith(`${videoId}:`))
    .map(([, v]) => v as any);
}

async function loadAll(): Promise<Record<string, any>> {
  const stored = await chrome.storage.local.get([STORAGE_KEY]);
  return stored[STORAGE_KEY] ?? {};
}
