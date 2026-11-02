import { locales, defaultLocale, localeMeta, type Locale } from '@/config/site';
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zhTw from './locales/zh-tw.json';
import zhCn from './locales/zh-cn.json';
import th from './locales/th.json';
import vi from './locales/vi.json';

export type Dict = typeof ko;
const dicts: Record<Locale, any> = { ko, en, ja, 'zh-tw': zhTw, 'zh-cn': zhCn, th, vi };

export { locales, defaultLocale, localeMeta };
export type { Locale };

export function isLocale(x: string | undefined): x is Locale {
  return !!x && (locales as string[]).includes(x);
}

/** URL 경로에서 언어 추출 (/en/spaces → en, /spaces → ko) */
export function langFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return isLocale(seg) ? seg : defaultLocale;
}

/** 깊은 병합: 번역 누락 키는 영어 → 한국어 순으로 대체 */
function deepMerge(base: any, over: any): any {
  if (Array.isArray(base) || Array.isArray(over) || typeof over !== 'object' || over === null) return over ?? base;
  const out: any = { ...base };
  for (const k of Object.keys(over)) out[k] = k in base ? deepMerge(base[k], over[k]) : over[k];
  return out;
}

const merged: Partial<Record<Locale, Dict>> = {};
export function getDict(lang: Locale): Dict {
  if (!merged[lang]) {
    if (lang === 'ko') merged[lang] = ko;
    else if (lang === 'en') merged[lang] = deepMerge(ko, en);
    else merged[lang] = deepMerge(deepMerge(ko, en), dicts[lang]);
  }
  return merged[lang]!;
}

/** 해당 언어의 경로 만들기: localizePath('/spaces', 'en') → '/en/spaces' */
export function localizePath(path: string, lang: Locale): string {
  const clean = path.startsWith('/') ? path : '/' + path;
  if (lang === defaultLocale) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** 현재 경로에서 언어 접두어를 제거한 "기본 경로" */
export function stripLang(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest === '' ? '/' : rest;
  }
  return pathname || '/';
}

/** hreflang 대체 링크 목록 */
export function alternates(basePath: string, siteUrl: string) {
  const list = locales.map((l) => ({ lang: l, hreflang: localeMeta[l].hreflang, href: siteUrl + localizePath(basePath, l) }));
  list.push({ lang: 'x-default' as any, hreflang: 'x-default', href: siteUrl + localizePath(basePath, defaultLocale) });
  return list;
}

/** 정적 페이지용 getStaticPaths: 기본 언어를 제외한 언어들 */
export function nonDefaultLocalePaths() {
  return locales.filter((l) => l !== defaultLocale).map((lang) => ({ params: { lang } }));
}

export const localeList = locales.map((l) => ({ code: l, ...localeMeta[l] }));

/** 통화 참고 환산 (표시용. 결제는 KRW) */
const refRates: Record<Locale, { cur: string; rate: number; fmt: (n: number) => string } | null> = {
  ko: null,
  en: { cur: 'USD', rate: 1 / 1400, fmt: (n) => `≈ $${n.toFixed(0)}` },
  ja: { cur: 'JPY', rate: 1 / 9.3, fmt: (n) => `≈ ¥${Math.round(n).toLocaleString('ja-JP')}` },
  'zh-tw': { cur: 'TWD', rate: 1 / 43, fmt: (n) => `≈ NT$${Math.round(n).toLocaleString('zh-TW')}` },
  'zh-cn': { cur: 'CNY', rate: 1 / 195, fmt: (n) => `≈ ¥${Math.round(n)}` },
  th: { cur: 'THB', rate: 1 / 40, fmt: (n) => `≈ ฿${Math.round(n).toLocaleString('th-TH')}` },
  vi: { cur: 'VND', rate: 18.5, fmt: (n) => `≈ ${Math.round(n / 1000) * 1000} ₫`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') },
};
export function formatKRW(n: number) {
  return `₩${n.toLocaleString('ko-KR')}`;
}
export function refPrice(krw: number, lang: Locale): string | null {
  const r = refRates[lang];
  return r ? r.fmt(krw * r.rate) : null;
}
