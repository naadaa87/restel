// 방문 통계(KPI) — 쿠키·저장소 없이 익명으로 집계한다.
// 방문자 구분값(vid)은 "날마다 바뀌는 비밀 값 + IP + 브라우저 정보"의 해시라서 하루가 지나면 이어 붙일 수 없고, IP는 저장하지 않는다.
import { locales, type Locale } from '@/config/site';
import { cookieName } from './auth';

const DAY_MS = 86400000;
const KST_MS = 9 * 3600000;
const SESSION_GAP_MS = 30 * 60000;
const KEEP_DAYS = 400; // 약 13개월 보관

// ---------- 날짜 ----------
export function kstDay(ts = Date.now()) { return new Date(ts + KST_MS).toISOString().slice(0, 10); }
export function addDays(day: string, n: number) { return new Date(Date.parse(day + 'T00:00:00Z') + n * DAY_MS).toISOString().slice(0, 10); }
export function daysBetween(a: string, b: string) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY_MS) + 1; }

// ---------- 경로 정리 ----------
const LANGS = new Set<string>(locales);
export function normalizePath(raw: string) {
  let p = String(raw || '/').split(/[?#]/)[0].slice(0, 200) || '/';
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  p = p.replace(/\/book\/done\/[^/]+$/, '/book/done'); // 예약 코드는 남기지 않는다
  const seg = p.split('/')[1] || '';
  const lang = LANGS.has(seg) && seg !== 'ko' ? seg : 'ko';
  const key = lang === 'ko' ? p : p.slice(seg.length + 1) || '/';
  return { path: p, key, lang };
}

/** 페이지 묶음(정보 종류) */
export function sectionOf(key: string, notFound = false) {
  if (notFound) return 'notfound';
  const [, a = '', b = ''] = key.split('/');
  const map: Record<string, string> = {
    '': 'home', about: 'about', sessions: 'sessions', krest: 'krest', stay: 'stay', guide: 'guide', faq: 'faq',
    contact: 'contact', hosts: 'hosts', my: 'my', terms: 'legal', privacy: 'legal', refund: 'legal',
  };
  if (a === 'spaces') return b ? 'space' : 'spaces';
  if (a === 'journal') return b ? 'journal_post' : 'journal';
  if (a === 'book') return b === 'done' ? 'book_done' : 'book';
  return map[a] ?? 'other';
}
export const SECTION_KO: Record<string, string> = {
  home: '홈', about: '레스텔이란', sessions: '세션·요금', spaces: '공간 목록', space: '공간 상세(신촌 등)', krest: 'K-REST', stay: '레스텔 스테이',
  guide: '이용 안내', faq: 'FAQ', journal: '저널 목록', journal_post: '저널 글', book: '예약 요청 작성', book_done: '예약 요청 완료',
  my: '내 요청 조회', contact: '문의', hosts: '호스트 입점 안내', legal: '약관·정책', notfound: '없는 페이지(404)', other: '기타',
};

// ---------- 유입 경로 ----------
const SOURCES: [RegExp, string, string][] = [
  [/(^|\.)map\.naver\.com$|naver\.me$/, 'Naver 지도', 'map'],
  [/(^|\.)map\.kakao\.com$|kko\.to$/, '카카오맵', 'map'],
  [/chatgpt\.com$|openai\.com$/, 'ChatGPT', 'ai'],
  [/perplexity\.ai$/, 'Perplexity', 'ai'],
  [/gemini\.google\.com$/, 'Gemini', 'ai'],
  [/claude\.ai$|copilot\.microsoft\.com$|you\.com$/, '기타 AI', 'ai'],
  [/google\.[a-z.]+$/, 'Google', 'search'], // maps.google 은 아래에서 따로 처리
  [/(^|\.)blog\.naver\.com$|(^|\.)cafe\.naver\.com$/, 'Naver 블로그·카페', 'social'],
  [/naver\.com$/, 'Naver', 'search'],
  [/(^|\.)daum\.net$/, 'Daum', 'search'],
  [/(^|\.)bing\.com$/, 'Bing', 'search'],
  [/yandex\.[a-z.]+$|ya\.ru$/, 'Yandex', 'search'],
  [/(^|\.)baidu\.com$/, 'Baidu', 'search'],
  [/duckduckgo\.com$/, 'DuckDuckGo', 'search'],
  [/(^|\.)yahoo\.(co\.jp|com)$|search\.yahoo/, 'Yahoo', 'search'],
  [/ecosia\.org$|seznam\.cz$|naver\.jp$|coccoc\.com$/, '기타 검색', 'search'],
  [/instagram\.com$|l\.instagram\.com$/, 'Instagram', 'social'],
  [/facebook\.com$|fb\.me$/, 'Facebook', 'social'],
  [/threads\.(net|com)$/, 'Threads', 'social'],
  [/(^|\.)x\.com$|twitter\.com$|t\.co$/, 'X(Twitter)', 'social'],
  [/youtube\.com$|youtu\.be$/, 'YouTube', 'social'],
  [/tiktok\.com$/, 'TikTok', 'social'],
  [/kakao\.com$|kakaocdn\.net$/, '카카오', 'social'],
  [/line\.me$/, 'LINE', 'social'],
  [/xiaohongshu\.com$|xhslink\.com$/, '샤오홍슈', 'social'],
  [/weibo\.(com|cn)$/, 'Weibo', 'social'],
  [/reddit\.com$/, 'Reddit', 'social'],
  [/tripadvisor\.|klook\.com$|kkday\.com$|trip\.com$|myrealtrip\.com$/, '여행 플랫폼', 'referral'],
];
export function classifySource(refHost: string, utmSource: string, ownHost: string) {
  const h = refHost.toLowerCase().replace(/^www\./, '');
  if (utmSource) {
    const u = utmSource.toLowerCase();
    const hit = SOURCES.find(([re]) => re.test(u) || re.test(u + '.com'));
    return { source: hit ? hit[1] : utmSource.slice(0, 40), kind: 'campaign' };
  }
  if (!h) return { source: '직접 방문', kind: 'direct' };
  if (h === ownHost || h === 'restel.kr' || h.endsWith('.workers.dev')) return { source: '사이트 내부', kind: 'internal' };
  if (/maps\.google\.|google\.[a-z.]+\/maps/.test(h)) return { source: 'Google 지도', kind: 'map' };
  const hit = SOURCES.find(([re]) => re.test(h));
  return hit ? { source: hit[1], kind: hit[2] } : { source: h.slice(0, 60), kind: 'referral' };
}
export const KIND_KO: Record<string, string> = { search: '검색', social: 'SNS·커뮤니티', ai: 'AI 검색', map: '지도', referral: '다른 사이트', campaign: '캠페인(UTM)', direct: '직접 방문', internal: '사이트 내부' };

// ---------- 기기 ----------
const BOT_RE = /bot\b|bot\/|crawl|spider|slurp|yeti|daumoa|bingpreview|facebookexternalhit|embedly|whatsapp|telegram|kakaotalk-scrap|headless|lighthouse|pagespeed|gtmetrix|python|curl|wget|axios|node-fetch|go-http|java\/|okhttp|httpclient|preview|uptime|monitor|scanner|phantom|selenium|puppeteer|playwright/i;
export function isBot(ua: string) { return !ua || BOT_RE.test(ua); }
export function parseUA(ua: string, width = 0) {
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'mobile' : width && width < 600 ? 'mobile' : 'desktop';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : '기타';
  const browser = /KAKAOTALK/i.test(ua) ? '카카오톡 인앱' : /NAVER\(inapp|NAVER/.test(ua) ? '네이버 앱' : /Instagram/.test(ua) ? '인스타그램 인앱' : /FBAN|FBAV/.test(ua) ? '페이스북 인앱'
    : /Line\//.test(ua) ? 'LINE 인앱' : /MicroMessenger/.test(ua) ? 'WeChat 인앱' : /Whale\//.test(ua) ? '네이버 웨일' : /SamsungBrowser/.test(ua) ? '삼성 인터넷' : /Edg\//.test(ua) ? 'Edge'
    : /YaBrowser/.test(ua) ? 'Yandex' : /OPR\//.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '기타';
  return { device, os, browser };
}
export const DEVICE_KO: Record<string, string> = { mobile: '모바일', tablet: '태블릿', desktop: 'PC' };

// ---------- 수집 ----------
let saltCache: string | null = null;
async function analyticsSalt(d: D1Database) {
  if (saltCache) return saltCache;
  const read = async () => ((await d.prepare("SELECT value FROM app_secrets WHERE key = 'analytics_salt'").first()) as { value?: string } | null)?.value || null;
  let v = await read();
  if (!v) {
    const a = new Uint8Array(32); crypto.getRandomValues(a);
    await d.prepare("INSERT INTO app_secrets (key, value, created_at) VALUES ('analytics_salt', ?, ?) ON CONFLICT(key) DO NOTHING").bind(Array.from(a, (b) => b.toString(16).padStart(2, '0')).join(''), new Date().toISOString()).run();
    v = await read();
  }
  saltCache = v;
  return v || 'restel';
}
async function sha16(s: string) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}
function rid() { const a = new Uint8Array(8); crypto.getRandomValues(a); return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join(''); }
const clip = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

/** /api/collect 처리. 항상 204로 응답한다(실패해도 방문자 화면에는 영향 없음) */
export async function collect(d: D1Database, request: Request, locals: any, text: string) {
  const ua = request.headers.get('user-agent') || '';
  if (isBot(ua)) return;
  const cookie = request.headers.get('cookie') || '';
  // 관리자·호스트로 로그인한 브라우저는 집계하지 않는다
  if (cookie.includes(cookieName('admin') + '=') || cookie.includes(cookieName('host') + '=')) return;
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return;
  if (!text || text.length > 4000) return;
  let b: any; try { b = JSON.parse(text); } catch { return; }
  const t = String(b?.t || '');
  const now = Date.now();

  // 체류 시간·스크롤: 해당 페이지뷰 행을 갱신
  if (t === 'en') {
    const id = clip(b.id, 20); if (!id) return;
    const dur = Math.max(0, Math.min(1800, Math.round(Number(b.d) / 1000) || 0));
    const sc = Math.max(0, Math.min(100, Math.round(Number(b.s)) || 0));
    await d.prepare("UPDATE analytics_events SET duration = MAX(COALESCE(duration, 0), ?), scroll = MAX(COALESCE(scroll, 0), ?) WHERE pvid = ? AND type = 'pageview'").bind(dur, sc, id).run();
    return;
  }
  const type = t === 'pv' ? 'pageview' : t === 'ck' ? 'click' : t === 'cv' ? 'convert' : '';
  if (!type) return;

  const day = kstDay(now);
  const kst = new Date(now + KST_MS);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  const vid = await sha16(`${await analyticsSalt(d)}|${day}|${ip}|${ua}`);
  const last = await d.prepare('SELECT sid FROM analytics_events WHERE vid = ? AND ts > ? ORDER BY ts DESC LIMIT 1').bind(vid, now - SESSION_GAP_MS).first<{ sid: string }>();
  const sid = last?.sid || rid();
  const entry = !last && type === 'pageview' ? 1 : 0;
  // 같은 방문(세션)에서 같은 전환은 한 번만 (완료 화면 새로고침 대비)
  if (type === 'convert' && last && (await d.prepare("SELECT 1 x FROM analytics_events WHERE sid = ? AND type = 'convert' AND label = ? LIMIT 1").bind(sid, clip(b.lb, 80)).first())) return;

  const { path, key, lang } = normalizePath(b.p);
  const section = sectionOf(key, !!b.nf);
  let refHost = '';
  try { if (b.r) refHost = new URL(String(b.r)).hostname.toLowerCase().replace(/^www\./, ''); } catch {}
  const src = classifySource(refHost, clip(b.us, 60), url.hostname.replace(/^www\./, ''));
  const cf = locals?.runtime?.cf || (request as any).cf || {};
  let country = (request.headers.get('cf-ipcountry') || cf.country || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || country === 'XX' || country === 'T1') country = '';
  const { device, os, browser } = parseUA(ua, Number(b.w) || 0);
  const bl = clip(b.l, 16).toLowerCase();
  const blang = bl.startsWith('zh') ? (/tw|hk|mo|hant/.test(bl) ? 'zh-tw' : 'zh-cn') : bl.split('-')[0];
  let target = clip(b.hr, 200);
  if (target.startsWith(url.origin)) target = target.slice(url.origin.length) || '/';
  if (target.startsWith('/')) target = target.split(/[?#]/)[0];

  await d.prepare(`INSERT INTO analytics_events (ts, day, hour, dow, type, vid, sid, pvid, entry, host, path, page_key, lang, section, title,
    ref_host, ref_source, ref_kind, utm_source, utm_medium, utm_campaign, country, city, device, os, browser, blang, label, target, zone)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    now, day, kst.getUTCHours(), kst.getUTCDay(), type, vid, sid, clip(b.id, 20), entry, url.hostname, path, key, lang, section, type === 'pageview' ? clip(b.ti, 140) : '',
    type === 'pageview' ? refHost : '', type === 'pageview' ? src.source : '', type === 'pageview' ? src.kind : '',
    clip(b.us, 60), clip(b.um, 60), clip(b.uc, 80), country, clip(cf.city, 60), device, os, browser, blang,
    clip(b.lb, 80), target, clip(b.z, 12),
  ).run();

  // 오래된 기록 정리(가끔 한 번)
  if (Math.random() < 0.005) await d.prepare('DELETE FROM analytics_events WHERE ts < ?').bind(now - KEEP_DAYS * DAY_MS).run();
}

// ---------- 보고서 ----------
export type Range = { key: string; from: string; to: string; label: string; days: number; prevFrom: string; prevTo: string; hourly: boolean };
export function resolveRange(params: URLSearchParams): Range {
  const today = kstDay();
  const r = params.get('range') || '7d';
  let from = addDays(today, -6), to = today, label = '최근 7일';
  if (r === 'today') { from = to = today; label = '오늘'; }
  else if (r === 'yesterday') { from = to = addDays(today, -1); label = '어제'; }
  else if (r === '30d') { from = addDays(today, -29); label = '최근 30일'; }
  else if (r === '90d') { from = addDays(today, -89); label = '최근 90일'; }
  else if (r === 'month') { from = today.slice(0, 8) + '01'; label = '이번 달'; }
  else if (r === 'custom') {
    const f = params.get('from') || '', t = params.get('to') || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(f) && /^\d{4}-\d{2}-\d{2}$/.test(t) && f <= t) { from = f; to = t > today ? today : t; label = `${from} ~ ${to}`; }
  }
  const days = daysBetween(from, to);
  return { key: r, from, to, label, days, prevFrom: addDays(from, -days), prevTo: addDays(from, -1), hourly: days === 1 };
}

type Row = Record<string, any>;
export async function kpiReport(d: D1Database, R: Range) {
  const PV = "type = 'pageview' AND day BETWEEN ?1 AND ?2";
  const q = (sql: string, from = R.from, to = R.to) => d.prepare(sql).bind(from, to);
  const totalsSql = `SELECT COUNT(*) pv, COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions, AVG(duration) avg_dur FROM analytics_events WHERE ${PV}`;
  const sessSql = `SELECT COUNT(*) sessions, SUM(CASE WHEN n = 1 THEN 1 ELSE 0 END) bounces, AVG(dur) avg_sess FROM (SELECT sid, COUNT(*) n, SUM(COALESCE(duration, 0)) dur FROM analytics_events WHERE ${PV} GROUP BY sid)`;
  const clickSql = "SELECT COUNT(*) n FROM analytics_events WHERE type = 'click' AND day BETWEEN ?1 AND ?2";
  const convSql = "SELECT label, COUNT(*) n, COUNT(DISTINCT sid) s FROM analytics_events WHERE type = 'convert' AND day BETWEEN ?1 AND ?2 GROUP BY label";
  const kstDate = (col: string) => `date(datetime(${col}, '+9 hours'))`;
  const stmts = [
    q(totalsSql), q(sessSql), q(clickSql), q(convSql), // 0-3
    q(totalsSql, R.prevFrom, R.prevTo), q(sessSql, R.prevFrom, R.prevTo), q(clickSql, R.prevFrom, R.prevTo), q(convSql, R.prevFrom, R.prevTo), // 4-7
    q(R.hourly
      ? `SELECT hour k, COUNT(*) pv, COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions, AVG(duration) dur FROM analytics_events WHERE ${PV} GROUP BY hour`
      : `SELECT day k, COUNT(*) pv, COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions, AVG(duration) dur FROM analytics_events WHERE ${PV} GROUP BY day`), // 8
    q(`SELECT page_key, COALESCE(MAX(CASE WHEN lang = 'ko' THEN title END), MAX(title)) title, MAX(section) section, COUNT(*) pv, COUNT(DISTINCT vid) visitors, AVG(duration) dur, AVG(scroll) sc, COUNT(DISTINCT lang) langs FROM analytics_events WHERE ${PV} GROUP BY page_key ORDER BY pv DESC LIMIT 20`), // 9
    q(`SELECT section, COUNT(*) pv, COUNT(DISTINCT vid) visitors, AVG(duration) dur FROM analytics_events WHERE ${PV} GROUP BY section ORDER BY pv DESC`), // 10
    q(`SELECT page_key, COALESCE(MAX(CASE WHEN lang = 'ko' THEN title END), MAX(title)) title, COUNT(*) pv, COUNT(DISTINCT vid) visitors, AVG(duration) dur, AVG(CASE WHEN scroll >= 75 THEN 1.0 ELSE 0 END) read_rate, GROUP_CONCAT(DISTINCT lang) langs FROM analytics_events WHERE ${PV} AND section = 'journal_post' GROUP BY page_key ORDER BY pv DESC LIMIT 15`), // 11
    q(`SELECT country, COUNT(DISTINCT vid) visitors, COUNT(*) pv, AVG(duration) dur FROM analytics_events WHERE ${PV} GROUP BY country ORDER BY visitors DESC LIMIT 20`), // 12
    q(`SELECT lang, COUNT(DISTINCT vid) visitors, COUNT(*) pv FROM analytics_events WHERE ${PV} GROUP BY lang ORDER BY pv DESC`), // 13
    q(`SELECT blang, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY blang ORDER BY visitors DESC LIMIT 12`), // 14
    q(`SELECT ref_kind, ref_source, COUNT(*) sessions FROM analytics_events WHERE ${PV} AND entry = 1 GROUP BY ref_kind, ref_source ORDER BY sessions DESC LIMIT 20`), // 15
    q(`SELECT ref_kind, COUNT(*) sessions FROM analytics_events WHERE ${PV} AND entry = 1 GROUP BY ref_kind ORDER BY sessions DESC`), // 16
    q(`SELECT utm_source, utm_medium, utm_campaign, COUNT(*) sessions FROM analytics_events WHERE ${PV} AND entry = 1 AND utm_source <> '' GROUP BY 1, 2, 3 ORDER BY sessions DESC LIMIT 15`), // 17
    q(`SELECT device, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY device ORDER BY visitors DESC`), // 18
    q(`SELECT os, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY os ORDER BY visitors DESC`), // 19
    q(`SELECT browser, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY browser ORDER BY visitors DESC LIMIT 10`), // 20
    q(`SELECT hour, COUNT(*) pv, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY hour`), // 21
    q(`SELECT dow, COUNT(*) pv, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} GROUP BY dow`), // 22
    q(`SELECT label, target, MAX(zone) zone, COUNT(*) n, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE type = 'click' AND day BETWEEN ?1 AND ?2 GROUP BY label, target ORDER BY n DESC LIMIT 20`), // 23
    q(`SELECT e.page_key, COUNT(*) n, SUM(CASE WHEN s.n = 1 THEN 1 ELSE 0 END) bounces FROM analytics_events e JOIN (SELECT sid, COUNT(*) n FROM analytics_events WHERE ${PV} GROUP BY sid) s ON s.sid = e.sid WHERE e.type = 'pageview' AND e.day BETWEEN ?1 AND ?2 AND e.entry = 1 GROUP BY e.page_key ORDER BY n DESC LIMIT 12`), // 24
    q(`SELECT page_key, COUNT(*) n FROM (SELECT page_key, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY ts DESC) rn FROM analytics_events WHERE ${PV}) WHERE rn = 1 GROUP BY page_key ORDER BY n DESC LIMIT 12`), // 25
    q(`SELECT COUNT(DISTINCT sid) all_s, COUNT(DISTINCT CASE WHEN section IN ('sessions', 'space', 'spaces', 'krest', 'stay') THEN sid END) offer_s, COUNT(DISTINCT CASE WHEN section = 'book' THEN sid END) book_s FROM analytics_events WHERE ${PV}`), // 26
    q(`SELECT path, COUNT(*) n FROM analytics_events WHERE ${PV} AND section = 'notfound' GROUP BY path ORDER BY n DESC LIMIT 10`), // 27
    q(`SELECT COUNT(*) n, SUM(CASE WHEN status IN ('confirmed', 'completed') THEN 1 ELSE 0 END) confirmed FROM bookings WHERE ${kstDate('created_at')} BETWEEN ?1 AND ?2`), // 28
    q(`SELECT topic, COUNT(*) n FROM inquiries WHERE kind = 'contact' AND ${kstDate('created_at')} BETWEEN ?1 AND ?2 GROUP BY topic`), // 29
    q(`SELECT COUNT(*) n FROM hosts WHERE ${kstDate('created_at')} BETWEEN ?1 AND ?2`), // 30
    q(`SELECT lang, COUNT(*) n FROM bookings WHERE ${kstDate('created_at')} BETWEEN ?1 AND ?2 GROUP BY lang ORDER BY n DESC`), // 31
    q(`SELECT COUNT(*) n FROM bookings WHERE ${kstDate('created_at')} BETWEEN ?1 AND ?2`, R.prevFrom, R.prevTo), // 32
    q(`SELECT city, country, COUNT(DISTINCT vid) visitors FROM analytics_events WHERE ${PV} AND city <> '' GROUP BY city, country ORDER BY visitors DESC LIMIT 10`), // 33
  ];
  const res = await d.batch(stmts);
  const all = (i: number) => (res[i]?.results || []) as Row[];
  const one = (i: number) => (all(i)[0] || {}) as Row;
  const conv = (rows: Row[]) => Object.fromEntries(rows.map((r) => [r.label, { n: r.n, s: r.s }]));
  const pack = (t: Row, s: Row, c: Row, cv: Row[]) => {
    const sessions = s.sessions || 0;
    const convMap = conv(cv);
    const bookingSess = convMap.booking?.s || 0;
    return {
      pv: t.pv || 0, visitors: t.visitors || 0, sessions,
      pagesPerSession: sessions ? (t.pv || 0) / sessions : 0,
      avgSession: s.avg_sess || 0, avgPage: t.avg_dur || 0,
      bounceRate: sessions ? (s.bounces || 0) / sessions : 0,
      clicks: c.n || 0, conv: convMap,
      convTotal: Object.values(convMap).reduce((a: number, v: any) => a + v.n, 0),
      bookingRate: sessions ? bookingSess / sessions : 0,
    };
  };
  return {
    cur: pack(one(0), one(1), one(2), all(3)),
    prev: pack(one(4), one(5), one(6), all(7)),
    series: all(8), pages: all(9), sections: all(10), journal: all(11), countries: all(12), langs: all(13), blangs: all(14),
    sources: all(15), kinds: all(16), utm: all(17), devices: all(18), oses: all(19), browsers: all(20), hours: all(21), dows: all(22),
    clicks: all(23), entries: all(24), exits: all(25), funnel: one(26), notFound: all(27),
    db: { bookings: one(28).n || 0, confirmed: one(28).confirmed || 0, inquiries: all(29), hostSignups: one(30).n || 0, bookingLangs: all(31), prevBookings: one(32).n || 0 },
    cities: all(33),
  };
}
export type KpiReport = Awaited<ReturnType<typeof kpiReport>>;

/** 최근 30분 실시간 */
export async function realtime(d: D1Database) {
  const since = Date.now() - 30 * 60000;
  const [a, b] = await d.batch([
    d.prepare("SELECT COUNT(DISTINCT vid) v, COUNT(*) pv FROM analytics_events WHERE type = 'pageview' AND ts > ?").bind(since),
    d.prepare("SELECT page_key, COALESCE(MAX(CASE WHEN lang = 'ko' THEN title END), MAX(title)) title, COUNT(DISTINCT vid) v FROM analytics_events WHERE type = 'pageview' AND ts > ? GROUP BY page_key ORDER BY v DESC LIMIT 5").bind(since),
  ]);
  return { visitors: (a.results?.[0] as Row)?.v || 0, pv: (a.results?.[0] as Row)?.pv || 0, pages: (b.results || []) as Row[] };
}

/** 이번 달 목표 대비 진행 */
export async function monthProgress(d: D1Database) {
  const today = kstDay(), from = today.slice(0, 8) + '01';
  const [a, b, c] = await d.batch([
    d.prepare("SELECT COUNT(DISTINCT vid) v, COUNT(DISTINCT sid) s FROM analytics_events WHERE type = 'pageview' AND day BETWEEN ? AND ?").bind(from, today),
    d.prepare("SELECT COUNT(DISTINCT sid) s FROM analytics_events WHERE type = 'convert' AND label = 'booking' AND day BETWEEN ? AND ?").bind(from, today),
    d.prepare("SELECT COUNT(*) n FROM bookings WHERE date(datetime(created_at, '+9 hours')) BETWEEN ? AND ?").bind(from, today),
  ]);
  const r = (x: any) => (x.results?.[0] || {}) as Row;
  const y = +today.slice(0, 4), m = +today.slice(5, 7);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate(), elapsed = +today.slice(8, 10);
  const sessions = r(a).s || 0;
  return { from, today, daysInMonth, elapsed, visitors: r(a).v || 0, sessions, bookings: r(c).n || 0, bookingRate: sessions ? (r(b).s || 0) / sessions : 0 };
}

/** 대시보드 홈용 요약(오늘·최근 7일) */
export async function kpiSnapshot(d: D1Database) {
  const today = kstDay(), from = addDays(today, -6);
  const [a, b, c] = await d.batch([
    d.prepare("SELECT COUNT(*) pv, COUNT(DISTINCT vid) v FROM analytics_events WHERE type = 'pageview' AND day = ?").bind(today),
    d.prepare("SELECT COUNT(*) pv, COUNT(DISTINCT vid) v, COUNT(DISTINCT sid) s FROM analytics_events WHERE type = 'pageview' AND day BETWEEN ? AND ?").bind(from, today),
    d.prepare("SELECT COUNT(*) n FROM analytics_events WHERE type = 'convert' AND day BETWEEN ? AND ?").bind(from, today),
  ]);
  const r = (x: any) => (x.results?.[0] || {}) as Row;
  return { todayVisitors: r(a).v || 0, todayPv: r(a).pv || 0, weekVisitors: r(b).v || 0, weekPv: r(b).pv || 0, weekSessions: r(b).s || 0, weekConv: r(c).n || 0 };
}

/** 일별 CSV */
export async function dailyRows(d: D1Database, from: string, to: string) {
  const [a, b, c] = await d.batch([
    d.prepare("SELECT day, COUNT(*) pv, COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions, SUM(entry) entries, AVG(duration) avg_dur FROM analytics_events WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY day").bind(from, to),
    d.prepare("SELECT day, COUNT(*) n FROM analytics_events WHERE type = 'click' AND day BETWEEN ? AND ? GROUP BY day").bind(from, to),
    d.prepare("SELECT day, label, COUNT(*) n FROM analytics_events WHERE type = 'convert' AND day BETWEEN ? AND ? GROUP BY day, label").bind(from, to),
  ]);
  const clicks = Object.fromEntries(((b.results || []) as Row[]).map((r) => [r.day, r.n]));
  const conv: Record<string, Record<string, number>> = {};
  for (const r of (c.results || []) as Row[]) (conv[r.day] ||= {})[r.label] = r.n;
  const byDay = Object.fromEntries(((a.results || []) as Row[]).map((r) => [r.day, r]));
  const out: Row[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const r = byDay[day] || {};
    out.push({ day, visitors: r.visitors || 0, sessions: r.sessions || 0, pv: r.pv || 0, avg_dur: Math.round(r.avg_dur || 0), clicks: clicks[day] || 0, booking: conv[day]?.booking || 0, contact: conv[day]?.contact || 0, stay: conv[day]?.stay || 0 });
  }
  return out;
}

// ---------- 표시 도우미 ----------
export function countryName(code: string) {
  if (!code) return '알 수 없음';
  try { return new Intl.DisplayNames(['ko'], { type: 'region' }).of(code) || code; } catch { return code; }
}
export function flag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
export function langName(code: string) {
  if (!code) return '알 수 없음';
  const c = code === 'zh-tw' ? 'zh-Hant' : code === 'zh-cn' ? 'zh-Hans' : code;
  try { return new Intl.DisplayNames(['ko'], { type: 'language' }).of(c) || code; } catch { return code; }
}
export function fmtDur(sec: number) {
  const s = Math.round(sec || 0);
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60), r = s % 60;
  return r ? `${m}분 ${r}초` : `${m}분`;
}
export function fmtNum(n: number) { return Math.round(n || 0).toLocaleString('ko-KR'); }
export function fmtPct(r: number, digits = 1) { return `${((r || 0) * 100).toFixed(digits)}%`; }
export const isLocale = (s: string): s is Locale => (locales as string[]).includes(s);
