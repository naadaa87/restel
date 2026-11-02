// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://restel.kr',
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
