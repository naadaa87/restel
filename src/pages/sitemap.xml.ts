export const prerender = false;
import type { APIRoute } from 'astro';
import { site, locales } from '@/config/site';
import { defaultLocale } from '@/i18n';
import { getAllSpaces } from '@/lib/spaces';
import { contentEntries, sitemapXml } from '@/lib/feeds';
import { isoDate } from '@/lib/journal';

export const GET: APIRoute = async ({ locals }) => {
  const entries = await contentEntries();
  try {
    const today = isoDate(new Date());
    (await getAllSpaces(locals, defaultLocale)).forEach((s) => entries.push({ path: `/spaces/${s.slug}`, locales: [...locales], lastmod: today, changefreq: 'weekly', priority: '0.9', image: s.photos?.[0]?.src?.startsWith('/') ? s.photos[0].src : undefined }));
  } catch {}
  return new Response(sitemapXml(entries, site.url), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
