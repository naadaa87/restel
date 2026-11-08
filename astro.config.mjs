// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// 대표 주소(canonical·사이트맵·OG·RSS에 쓰임). 기본값은 공식 도메인 restel.kr.
// 다른 주소로 시험 배포할 때만 Cloudflare > restel > Settings > Builds > Variables에 SITE_URL을 넣는다.
const SITE_URL = (process.env.SITE_URL || 'https://restel.kr').replace(/\/+$/, '');

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
