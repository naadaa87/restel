// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// 대표 주소(canonical·사이트맵·OG에 쓰임). 도메인을 연결하면 Cloudflare > restel > Settings > Builds > Variables에
// SITE_URL=https://도메인 을 추가하고 다시 배포하면 된다.
const SITE_URL = (process.env.SITE_URL || 'https://restel.naadaa87.workers.dev').replace(/\/+$/, '');

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh-tw', 'zh-cn', 'th', 'vi'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  build: { inlineStylesheets: 'auto' },
  server: { port: 4321 },
});
