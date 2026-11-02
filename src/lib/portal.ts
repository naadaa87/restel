// 호스트·관리자 포털 공통 유틸 (폼 파싱, 리다이렉트, 공간 폼 ↔ DB 변환)
import { locales } from '@/config/site';
import { slugify } from './text';
import { parseJson, type SpaceRow } from './db';

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
export const num = (fd: FormData, k: string, def = 0) => { const v = Number(str(fd, k)); return Number.isFinite(v) ? v : def; };

export function redirectWith(path: string, msg?: string, err?: string) {
  const u = new URL(path, 'http://x');
  if (msg) u.searchParams.set('msg', msg);
  if (err) u.searchParams.set('err', err);
  return new Response(null, { status: 303, headers: { Location: u.pathname + u.search } });
}

export function flash(url: URL) {
  return { msg: url.searchParams.get('msg'), err: url.searchParams.get('err') };
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const paragraphs = (s: string) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);

/** 공간 편집 폼 → DB 컬럼 */
export function spaceFromForm(fd: FormData): Partial<SpaceRow> & { slug: string } {
  const name: Record<string, string> = {}, tagline: Record<string, string> = {}, desc: Record<string, string[]> = {}, features: Record<string, string[]> = {}, rules: Record<string, string[]> = {}, directions: Record<string, string[]> = {}, region: Record<string, string> = {};
  for (const l of locales) {
    const n = str(fd, `name_${l}`); if (n) name[l] = n;
    const tg = str(fd, `tagline_${l}`); if (tg) tagline[l] = tg;
    const d = str(fd, `desc_${l}`); if (d) desc[l] = paragraphs(d);
    const f = str(fd, `features_${l}`); if (f) features[l] = lines(f);
    const r = str(fd, `rules_${l}`); if (r) rules[l] = lines(r);
    const dr = str(fd, `directions_${l}`); if (dr) directions[l] = lines(dr);
    const rg = str(fd, `region_${l}`); if (rg) region[l] = rg;
  }
  const sessions: any[] = [];
  for (let i = 0; i < 6; i++) {
    const code = str(fd, `s${i}_code`);
    if (!code) continue;
    const pw = num(fd, `s${i}_priceWeekday`);
    if (!pw) continue;
    sessions.push({
      code, name: str(fd, `s${i}_name`), durationMin: num(fd, `s${i}_durationMin`, 60), maxDurationMin: num(fd, `s${i}_maxDurationMin`) || undefined,
      priceWeekday: pw, priceWeekend: num(fd, `s${i}_priceWeekend`, pw) || pw, basePeople: num(fd, `s${i}_basePeople`, 2), maxPeople: num(fd, `s${i}_maxPeople`, 4),
      extraPersonPrice: num(fd, `s${i}_extraPersonPrice`, 0), perPerson: !!fd.get(`s${i}_perPerson`), startWindow: str(fd, `s${i}_startWindow`),
    });
  }
  const slug = slugify(str(fd, 'slug') || name.en || name.ko || 'space');
  return {
    slug, region: JSON.stringify(region), address: str(fd, 'address'), lat: num(fd, 'lat') || null, lng: num(fd, 'lng') || null,
    name_json: JSON.stringify(name), tagline_json: JSON.stringify(tagline), desc_json: JSON.stringify(desc), features_json: JSON.stringify(features),
    rules_json: JSON.stringify(rules), directions_json: JSON.stringify(directions), sessions_json: JSON.stringify(sessions),
    hours_json: JSON.stringify({ open: str(fd, 'open') || '07:00', close: str(fd, 'close') || '24:00' }),
    capacity_base: num(fd, 'capacity_base', 2), capacity_max: num(fd, 'capacity_max', 4), area: str(fd, 'area'),
  };
}

/** DB 행 → 폼 기본값 */
export function spaceToForm(r: SpaceRow | null) {
  const j = (s: string | undefined, fb: any) => parseJson(s, fb);
  const listToText = (o: any, l: string) => { const v = o?.[l]; return Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''; };
  const paraToText = (o: any, l: string) => { const v = o?.[l]; return Array.isArray(v) ? v.join('\n\n') : typeof v === 'string' ? v : ''; };
  const name = j(r?.name_json, {}), tagline = j(r?.tagline_json, {}), desc = j(r?.desc_json, {}), features = j(r?.features_json, {}), rules = j(r?.rules_json, {}), directions = j(r?.directions_json, {});
  const region = r?.region ? (r.region.startsWith('{') ? j(r.region, {}) : { ko: r.region }) : {};
  const hours = j(r?.hours_json, {});
  const sessions = j(r?.sessions_json, []);
  const photos = j(r?.photos_json, []);
  return {
    slug: r?.slug || '', address: r?.address || '', lat: r?.lat ?? '', lng: r?.lng ?? '', capacity_base: r?.capacity_base ?? 2, capacity_max: r?.capacity_max ?? 4, area: r?.area || '',
    open: hours.open || '07:00', close: hours.close || '24:00',
    i18n: Object.fromEntries(locales.map((l) => [l, { name: name[l] || '', tagline: tagline[l] || '', desc: paraToText(desc, l), features: listToText(features, l), rules: listToText(rules, l), directions: listToText(directions, l), region: region[l] || '' }])),
    sessions, photos,
  };
}

export const SESSION_CODES = [
  { code: 'nap60', label: 'Nap 60 (낮잠 한 시간)' },
  { code: 'rest180', label: 'Rest 180 (쉼 세 시간)' },
  { code: 'dayrest', label: 'Day Rest (하루 쉼, 최대 8시간)' },
  { code: 'krest90', label: 'K-REST 90 (외국인 체험, 1인 가격)' },
  { code: 'custom', label: '직접 입력' },
];

export const STATUS_KO: Record<string, string> = {
  pending: '승인 대기', approved: '승인됨', suspended: '정지', draft: '작성 중', submitted: '검토 요청', published: '공개 중', hidden: '숨김', rejected: '반려',
  requested: '접수', confirmed: '확정', declined: '불가', cancelled: '취소', completed: '완료', new: '새 문의', replied: '답변 완료', closed: '종료',
};

export async function readUpload(fd: FormData, field: string) {
  const files = fd.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  return files;
}

export function extOf(file: File) {
  const m = (file.name || '').match(/\.(jpe?g|png|webp|gif|avif)$/i);
  if (m) return m[1].toLowerCase().replace('jpeg', 'jpg');
  const t = file.type || '';
  if (t.includes('png')) return 'png'; if (t.includes('webp')) return 'webp'; if (t.includes('gif')) return 'gif'; if (t.includes('avif')) return 'avif';
  return 'jpg';
}
