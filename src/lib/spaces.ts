// 플래그십(코드 데이터)과 파트너(D1) 공간을 같은 모양으로 맞춘다
import type { Locale } from '@/config/site';
import { flagships, type SessionDef } from '@/data/flagship';
import { db, listPublishedSpaces, getPublishedSpaceBySlug, parseJson, type SpaceRow } from './db';

export interface SpaceView {
  slug: string;
  type: 'flagship' | 'partner';
  region: string;
  name: string;
  tagline: string;
  description: string[];
  features: string[];
  rules: string[];
  directions: string[];
  address: string;
  lat: number | null;
  lng: number | null;
  photos: { src: string; sm: string; alt: string }[];
  sessions: (SessionDef & { customName?: string })[];
  hours: { open: string; close: string };
  capacityBase: number;
  capacityMax: number;
  area: string;
  operator: string;
  hostId: number | null;
  hostEmail?: string;
  blocked: { dates: string[]; weekdays: number[] };
  bufferMin: number;
}

export function pickI18n(obj: any, lang: Locale, fallback = ''): string {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.en || obj.ko || Object.values(obj).find((v) => typeof v === 'string' && v) as string || fallback;
}
export function pickI18nList(obj: any, lang: Locale): string[] {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj.filter(Boolean);
  const v = obj[lang] || obj.en || obj.ko || Object.values(obj).find((x) => Array.isArray(x) && x.length);
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') return v.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

export function flagshipToView(f: (typeof flagships)[number], lang: Locale): SpaceView {
  return {
    slug: f.slug, type: 'flagship', region: f.region[lang] || f.region.en, name: f.name[lang] || f.name.en, tagline: f.tagline[lang] || f.tagline.en,
    description: f.description[lang] || f.description.en, features: f.features[lang] || f.features.en, rules: f.rules[lang] || f.rules.en,
    directions: f.directions[lang] || f.directions.en, address: f.address[lang] || f.address.en, lat: f.lat, lng: f.lng,
    photos: f.photos.map((p) => ({ src: p.src, sm: p.sm, alt: p.alt[lang] || p.alt.en })),
    sessions: f.sessions, hours: f.hours, capacityBase: f.capacityBase, capacityMax: f.capacityMax, area: f.areaM2, operator: f.operator, hostId: null,
    blocked: { dates: [], weekdays: [] }, bufferMin: 60,
  };
}

export function rowToView(r: SpaceRow, lang: Locale): SpaceView {
  const photos = parseJson<any[]>(r.photos_json, []).map((p) => typeof p === 'string' ? { src: p, sm: p, alt: '' } : { src: p.src, sm: p.sm || p.src, alt: p.alt || '' });
  const sessions = parseJson<any[]>(r.sessions_json, []).map((s) => ({
    code: s.code || 'custom', customName: s.name || '', durationMin: Number(s.durationMin || 60), maxDurationMin: s.maxDurationMin ? Number(s.maxDurationMin) : undefined,
    priceWeekday: Number(s.priceWeekday || 0), priceWeekend: Number(s.priceWeekend || s.priceWeekday || 0), basePeople: Number(s.basePeople || 2), maxPeople: Number(s.maxPeople || r.capacity_max || 4),
    extraPersonPrice: Number(s.extraPersonPrice || 0), perPerson: !!s.perPerson, startWindow: s.startWindow || '',
  }));
  const hours = parseJson<any>(r.hours_json, {});
  const bl = parseJson<any>(r.blocked_json, {});
  return {
    slug: r.slug, type: 'partner', region: pickI18n(parseJson(r.region, r.region), lang, r.region), name: pickI18n(parseJson(r.name_json, {}), lang, r.slug),
    tagline: pickI18n(parseJson(r.tagline_json, {}), lang), description: pickI18nList(parseJson(r.desc_json, {}), lang), features: pickI18nList(parseJson(r.features_json, []), lang),
    rules: pickI18nList(parseJson(r.rules_json, {}), lang), directions: pickI18nList(parseJson(r.directions_json, {}), lang), address: r.address, lat: r.lat, lng: r.lng,
    photos, sessions, hours: { open: hours.open || '07:00', close: hours.close || '24:00' }, capacityBase: r.capacity_base, capacityMax: r.capacity_max, area: r.area,
    operator: r.host_name || 'Partner', hostId: r.host_id, hostEmail: r.host_email,
    blocked: { dates: Array.isArray(bl.dates) ? bl.dates : [], weekdays: Array.isArray(bl.weekdays) ? bl.weekdays : [] }, bufferMin: Number(r.buffer_min || 60),
  };
}

export async function getAllSpaces(locals: any, lang: Locale): Promise<SpaceView[]> {
  const out = flagships.map((f) => flagshipToView(f, lang));
  const d = await db(locals);
  if (d) {
    try { (await listPublishedSpaces(d)).forEach((r) => out.push(rowToView(r, lang))); } catch (e) { console.error(e); }
  }
  return out;
}

export async function getSpaceBySlug(locals: any, slug: string, lang: Locale): Promise<SpaceView | null> {
  const f = flagships.find((x) => x.slug === slug);
  if (f) return flagshipToView(f, lang);
  const d = await db(locals);
  if (!d) return null;
  try { const r = await getPublishedSpaceBySlug(d, slug); return r ? rowToView(r, lang) : null; } catch { return null; }
}

export function minPrice(s: SpaceView) {
  const prices = s.sessions.map((x) => x.priceWeekday).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

/** YYYY-MM-DD 의 요일 (0=일). 시간대 영향을 받지 않도록 UTC 자정으로 계산 */
export function weekdayOf(dateStr: string) {
  return new Date(dateStr + 'T00:00:00Z').getUTCDay();
}
export function isWeekend(dateStr: string) {
  const day = weekdayOf(dateStr);
  return day === 0 || day === 6;
}

export function estimate(s: SpaceView, code: string, people: number, dateStr: string) {
  const ses = s.sessions.find((x) => x.code === code);
  if (!ses) return 0;
  const base = isWeekend(dateStr) ? ses.priceWeekend : ses.priceWeekday;
  if (ses.perPerson) return base * Math.max(people, 1);
  const extra = Math.max(0, people - ses.basePeople) * ses.extraPersonPrice;
  return base + extra;
}

/** 휴무일·휴무 요일 여부 */
export function isClosedDate(s: SpaceView, dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  if (s.blocked.dates.includes(dateStr)) return true;
  return s.blocked.weekdays.includes(weekdayOf(dateStr));
}
