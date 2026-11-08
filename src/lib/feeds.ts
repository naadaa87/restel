// RSS(네이버 서치어드바이저 RSS 제출용)와 사이트맵·IndexNow가 함께 쓰는 주소 목록
import { site, locales, defaultLocale, type Locale } from '@/config/site';
import { localizePath, localeMeta, getDict } from '@/i18n';
import { allArticles, articlesFor, isoDate } from '@/lib/journal';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function rssXml(lang: Locale, base = site.url) {
  const t = getDict(lang);
  const list = await articlesFor(lang);
  const self = base + (lang === defaultLocale ? '/rss.xml' : `/${lang}/rss.xml`);
  const items = list.map((a) => {
    const link = base + localizePath('/journal/' + a.slug, lang);
    return `    <item>
      <title>${esc(a.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(a.data.description)}</description>
      <category>${esc((t.journal.categories as any)[a.data.category] || a.data.category)}</category>
      <pubDate>${a.data.published.toUTCString()}</pubDate>
    </item>`;
  }).join('\n');
  const last = list[0]?.data.updated || list[0]?.data.published || new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(t.journal.title.includes('RESTEL') ? t.journal.title : 'RESTEL ' + t.journal.title)}</title>
    <link>${base + localizePath('/journal', lang)}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <description>${esc(t.journal.lead)}</description>
    <language>${localeMeta[lang].htmlLang}</language>
    <lastBuildDate>${new Date(last).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

export const STATIC_PATHS = ['/', '/about', '/sessions', '/spaces', '/krest', '/guide', '/journal', '/faq', '/hosts', '/contact', '/terms', '/privacy', '/refund'];

export type SitemapEntry = { path: string; locales: Locale[]; lastmod: string; changefreq: string; priority: string; image?: string };

/** 사이트맵에 올릴 페이지 목록. 공개된 공간 경로는 호출하는 쪽에서 더한다. */
export async function contentEntries(): Promise<SitemapEntry[]> {
  const today = isoDate(new Date());
  const out: SitemapEntry[] = STATIC_PATHS.map((p) => ({
    path: p,
    locales: [...locales],
    lastmod: today,
    changefreq: p === '/' || p === '/journal' ? 'weekly' : ['/terms', '/privacy', '/refund'].includes(p) ? 'yearly' : 'monthly',
    priority: p === '/' ? '1.0' : ['/sessions', '/krest', '/journal'].includes(p) ? '0.8' : ['/terms', '/privacy', '/refund'].includes(p) ? '0.3' : '0.7',
  }));
  const bySlug = new Map<string, { locales: Locale[]; lastmod: string; image: string }>();
  for (const a of await allArticles()) {
    const cur = bySlug.get(a.slug) || { locales: [], lastmod: '1970-01-01', image: a.data.hero };
    cur.locales.push(a.lang);
    const d = isoDate(a.data.updated || a.data.published);
    if (d > cur.lastmod) cur.lastmod = d;
    bySlug.set(a.slug, cur);
  }
  for (const [slug, v] of bySlug) {
    out.push({ path: '/journal/' + slug, locales: locales.filter((l) => v.locales.includes(l)), lastmod: v.lastmod, changefreq: 'monthly', priority: '0.7', image: v.image });
  }
  return out;
}

export function sitemapXml(entries: SitemapEntry[], base = site.url) {
  const urls = entries.map((e) => {
    const def = e.locales.includes(defaultLocale) ? defaultLocale : e.locales.includes('en') ? 'en' : e.locales[0];
    const alts = e.locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${localeMeta[l].hreflang}" href="${base}${localizePath(e.path, l)}"/>`).join('\n');
    return e.locales.map((l) => `  <url>
    <loc>${base}${localizePath(e.path, l)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${localizePath(e.path, def)}"/>${e.image ? `\n    <image:image><image:loc>${base}${e.image}</image:loc></image:image>` : ''}
  </url>`).join('\n');
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

/** IndexNow로 보낼 전체 주소 */
export function flatUrls(entries: SitemapEntry[], base = site.url) {
  return entries.flatMap((e) => e.locales.map((l) => base + localizePath(e.path, l)));
}
