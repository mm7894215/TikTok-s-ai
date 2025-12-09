import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'TikTok Intel HUD',
  description: '透视 TikTok 视频与直播，实时同步 Supabase。',
  version: '0.1.0',
  permissions: ['storage', 'scripting', 'sidePanel'],
  host_permissions: ['https://www.tiktok.com/*', 'https://*.tiktok.com/*'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://www.tiktok.com/*', 'https://*.tiktok.com/*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_start'
    }
  ],
  web_accessible_resources: [
    {
      resources: ['src/injected/intercept.js'],
      matches: ['https://www.tiktok.com/*', 'https://*.tiktok.com/*']
    }
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html'
  },
  action: {
    default_title: 'TikTok Intel HUD'
  }
});
