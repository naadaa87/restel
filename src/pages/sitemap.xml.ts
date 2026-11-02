export const prerender = false;
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { locales, localizePath, localeMeta, defaultLocale } from '@/i18n';
import { getAllSpaces } from '@/lib/spaces';

const STATIC = ['/', '/about', '/sessions', '/spaces', '/krest', '/guide', '/faq', '/hosts', '/contact', '/terms', '/privacy', '/refund'];

export const GET: APIRoute = async ({ locals }) => {
  const base = (locals as any)?.runtime?.env?.SITE_URL || site.url;
  const paths = [...STATIC];
  try { (await getAllSpaces(locals, defaultLocale)).forEach((s) => paths.push(`/spaces/${s.slug}`)); } catch {}
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths.map((p) => {
    const alts = locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${localeMeta[l].hreflang}" href="${base}${localizePath(p, l)}"/>`).join('\n');
    return locales.map((l) => `  <url>\n    <loc>${base}${localizePath(p, l)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${p === '/' ? '1.0' : p.startsWith('/spaces') ? '0.9' : '0.7'}</priority>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${localizePath(p, defaultLocale)}"/>\n  </url>`).join('\n');
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
