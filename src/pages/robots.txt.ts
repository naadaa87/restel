import type { APIRoute } from 'astro';
import { site } from '@/config/site';

export const prerender = true;

// 검색엔진·AI 검색 모두 공개 페이지는 허용. 관리·개인 조회 화면만 막는다.
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /host',
      'Disallow: /api',
      'Disallow: /my',
      'Disallow: /*/my',
      'Disallow: /book/done',
      'Disallow: /*/book/done',
      '',
      `Sitemap: ${site.url}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
