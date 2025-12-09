import './tiktok-bridge';

declare global {
  interface Window {
    __ttIntelLoaded?: boolean;
  }
}

if (!window.__ttIntelLoaded) {
  window.__ttIntelLoaded = true;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/injected/intercept.js');
  (document.head || document.documentElement).appendChild(script);
}
