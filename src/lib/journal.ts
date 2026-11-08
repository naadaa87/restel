// 레스텔 저널 글 조회 도우미
import { getCollection, type CollectionEntry } from 'astro:content';
import { locales, defaultLocale, type Locale } from '@/config/site';

export type Article = CollectionEntry<'journal'> & { lang: Locale; slug: string };

function split(id: string): { lang: Locale; slug: string } | null {
  const [lang, ...rest] = id.split('/');
  if (!(locales as string[]).includes(lang) || !rest.length) return null;
  return { lang: lang as Locale, slug: rest.join('/') };
}

let cache: Article[] | null = null;
export async function allArticles(): Promise<Article[]> {
  if (cache) return cache;
  const entries = await getCollection('journal', (e) => !e.data.draft);
  cache = entries
    .map((e) => {
      const s = split(e.id);
      return s ? ({ ...e, ...s } as Article) : null;
    })
    .filter(Boolean) as Article[];
  cache.sort((a, b) => b.data.published.getTime() - a.data.published.getTime() || a.slug.localeCompare(b.slug));
  return cache;
}

export async function articlesFor(lang: Locale) {
  return (await allArticles()).filter((a) => a.lang === lang);
}

export async function articleFor(lang: Locale, slug: string) {
  return (await allArticles()).find((a) => a.lang === lang && a.slug === slug) || null;
}

/** 이 글이 번역되어 있는 언어 목록 (hreflang·사이트맵용) */
export async function localesOf(slug: string): Promise<Locale[]> {
  const set = new Set((await allArticles()).filter((a) => a.slug === slug).map((a) => a.lang));
  return locales.filter((l) => set.has(l));
}

/** 글 목록 페이지 기준 경로 */
export const journalBase = '/journal';

/** 본문 글자 수로 읽는 시간(분) 어림 */
export function readMinutes(body: string | undefined, lang: Locale) {
  const text = (body || '').replace(/[#>*_`\-\[\]()!|]/g, ' ');
  const cjk = ['ko', 'ja', 'zh-tw', 'zh-cn', 'th'].includes(lang);
  const n = cjk ? text.replace(/\s+/g, '').length / 400 : text.split(/\s+/).filter(Boolean).length / 220;
  return Math.max(2, Math.round(n));
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export { defaultLocale };
