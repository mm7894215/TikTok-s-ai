import { decodeFeedResponse } from '../services/protobuf-decoder';

declare global {
  interface WindowEventMap {
    TT_Data_Intercept: CustomEvent;
  }
}

type InterceptPayload = { url: string; body: ArrayBuffer | any; headers: Record<string, string> };

window.addEventListener('TT_Data_Intercept', (event) => {
  const { detail } = event as CustomEvent<InterceptPayload>;
  if (!detail?.body || typeof detail.body === 'string') return;

  try {
    const normalized = decodeFeedResponse(detail.body);
    if (!normalized.length) return;

    normalized.forEach((video) => {
      void chrome.runtime.sendMessage({ type: 'VIDEO_INTERCEPTED', video });
    });
  } catch (err) {
    console.warn('decode failed', err);
  }
});
