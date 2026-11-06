// 호스트·관리자 포털 공통 유틸 (폼 파싱, 리다이렉트, 공간 폼 ↔ DB 변환, 상태 라벨, 달력)
import { locales } from '@/config/site';
import { slugify } from './text';
import { parseJson, type SpaceRow, type HostRow, type BookingRow } from './db';

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
export const num = (fd: FormData, k: string, def = 0) => { const v = Number(String(fd.get(k) ?? '').replace(/[,\s원₩]/g, '')); return Number.isFinite(v) ? v : def; };

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

// ---------- 라벨 ----------
export const STATUS_KO: Record<string, string> = {
  pending: '승인 대기', approved: '승인됨', suspended: '정지', draft: '작성 중', submitted: '검토 요청', published: '공개 중', hidden: '숨김', rejected: '보완 요청',
  requested: '접수', confirmed: '확정', declined: '불가', cancelled: '취소', completed: '이용 완료', noshow: '노쇼', new: '새 문의', replied: '답변 완료', closed: '종료',
  issued: '정산서 발행', paid: '지급 완료',
};
export const PAYMENT_KO: Record<string, string> = { unpaid: '결제 전', awaiting: '입금 대기', paid: '결제 완료', refunded: '환불' };
export const METHOD_KO: Record<string, string> = { '': '미정', transfer: '계좌이체', onsite: '현장 결제', card: '카드(온라인)' };
export const BOOKING_STATUSES = ['requested', 'confirmed', 'completed', 'noshow', 'declined', 'cancelled'];

export const BIZ_TYPES = [
  { code: 'individual', label: '개인 (사업자 미등록)' },
  { code: 'sole', label: '개인사업자' },
  { code: 'corp', label: '법인' },
];
export const SPACE_KINDS = [
  { code: 'partyroom', label: '파티룸·모임 공간' },
  { code: 'studio', label: '스튜디오·렌탈 공간' },
  { code: 'cafe', label: '카페·라운지' },
  { code: 'office', label: '사무실·회의실' },
  { code: 'vacant', label: '비어 있는 상가·공실' },
  { code: 'wellness', label: '요가·명상·웰니스 공간' },
  { code: 'other', label: '기타' },
];
export const HEARD_FROM = ['검색', '인스타그램·SNS', '지인 소개', '쏘플파티룸 안내', '레스텔 신촌 방문', '기타'];

/** 가입 시 서약하는 레스텔 운영 기준. key는 저장 키, 모두 필수 */
export const PLEDGES = [
  { key: 'rest_only', text: '레스텔 공간은 숙박시설이 아닌 "휴식 공간대여"로만 운영합니다. 세션은 시간 단위이며 자정 전에 끝납니다.' },
  { key: 'no_beds', text: '침대를 두지 않습니다. 접이식 매트·소파베드와 담요·개인 커버만 둡니다.' },
  { key: 'no_overnight', text: '1박·올나이트 요금을 만들지 않고, 샤워·세탁 같은 설비를 상품으로 내세우지 않습니다.' },
  { key: 'no_lodging_words', text: '안내문·광고·SNS에 숙박 어휘(1박·체크인·객실·침대·호텔식 등)를 쓰지 않습니다.' },
  { key: 'adults_only', text: '이용자는 19세 이상 성인으로 제한하고, 필요 시 본인확인을 합니다.' },
  { key: 'safety', text: '소화기·비상등·피난안내도를 갖추고, 관할 소방서의 다중이용업(수면방업) 안내를 따릅니다.' },
  { key: 'no_dual_listing', text: '같은 공간을 숙박 플랫폼에 숙박 상품으로 동시에 올리지 않습니다.' },
];

/** 공간별 레스텔 기준 자가 점검. required=true 항목은 검토 요청 전에 모두 체크되어야 함 */
export const COMPLIANCE = [
  { key: 'enclosed', group: '공간', text: '구획된 전용 공간 10㎡ 이상, 창 또는 환기 설비로 환기 가능', required: true },
  { key: 'mats', group: '공간', text: '침대 없음 — 접이식 매트·소파베드, 담요, 베개(1인 1매트 간격)', required: true },
  { key: 'lighting', group: '공간', text: '암막과 조명 3단계(밝음·은은함·어둠)', required: true },
  { key: 'quiet', group: '공간', text: '소음 관리(흡음재·문 닫힘·백색소음 중 하나 이상)', required: false },
  { key: 'tea', group: '공간', text: '세면대 접근 가능, 차림 코너(정수기 또는 차)', required: false },
  { key: 'sessions', group: '운영', text: '시간 단위 세션만 판매, 마지막 세션은 자정 전 종료', required: true },
  { key: 'no_overnight', group: '운영', text: '1박·올나이트·새벽 요금 없음, 샤워 설비를 상품 요소로 안내하지 않음', required: true },
  { key: 'cleaning', group: '운영', text: '세션 사이 정리 시간 확보, 매트 커버·담요 교체', required: true },
  { key: 'adults', group: '운영', text: '19세 이상만 이용, 미성년자 단독 이용 불가 안내', required: true },
  { key: 'words', group: '운영', text: '안내문·사진·광고에 숙박 어휘 없음(사진에 침대·호텔식 침구가 보이지 않음)', required: true },
  { key: 'extinguisher', group: '안전', text: '소화기(점검표 부착)·비상등·피난안내도 비치', required: true },
  { key: 'alarm', group: '안전', text: '화재감지기·경보 설비 작동 확인', required: true },
  { key: 'insurance', group: '안전', text: '화재배상책임보험 가입(또는 가입 진행 중)', required: false },
  { key: 'fire_cert', group: '안전', text: '다중이용업(수면방업) 안전시설 완비증명 보유 또는 관할 소방서 확인 완료', required: false },
];

export const MSG_TEMPLATE_KEYS = [
  { key: 'confirm', label: '확정 안내' },
  { key: 'payment', label: '결제 안내' },
  { key: 'entry', label: '입장 안내 (도어락·주소)' },
  { key: 'reminder', label: '전날 리마인더' },
  { key: 'decline', label: '불가 안내' },
  { key: 'cancel', label: '취소 안내' },
  { key: 'thanks', label: '이용 후 감사' },
];

// ---------- 공간 폼 ↔ DB ----------
export function spaceFromForm(fd: FormData): Partial<SpaceRow> & { slug: string } {
  const name: Record<string, string> = {}, tagline: Record<string, string> = {}, desc: Record<string, string[]> = {}, features: Record<string, string[]> = {}, rules: Record<string, string[]> = {}, directions: Record<string, string[]> = {}, region: Record<string, string> = {}, entry: Record<string, string> = {};
  for (const l of locales) {
    const n = str(fd, `name_${l}`); if (n) name[l] = n;
    const tg = str(fd, `tagline_${l}`); if (tg) tagline[l] = tg;
    const d = str(fd, `desc_${l}`); if (d) desc[l] = paragraphs(d);
    const f = str(fd, `features_${l}`); if (f) features[l] = lines(f);
    const r = str(fd, `rules_${l}`); if (r) rules[l] = lines(r);
    const dr = str(fd, `directions_${l}`); if (dr) directions[l] = lines(dr);
    const rg = str(fd, `region_${l}`); if (rg) region[l] = rg;
    const en = str(fd, `entry_${l}`); if (en) entry[l] = en;
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
  const blockedDates = lines(str(fd, 'blocked_dates')).map((s) => s.replace(/\./g, '-').replace(/\//g, '-')).filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)).sort();
  const weekdays = [0, 1, 2, 3, 4, 5, 6].filter((w) => !!fd.get(`closed_w${w}`));
  const compliance: Record<string, boolean | string> = {};
  for (const c of COMPLIANCE) compliance[c.key] = !!fd.get(`c_${c.key}`);
  compliance.note = str(fd, 'c_note');
  const slug = slugify(str(fd, 'slug') || name.en || name.ko || 'space');
  return {
    slug, region: JSON.stringify(region), address: str(fd, 'address'), lat: num(fd, 'lat') || null, lng: num(fd, 'lng') || null,
    name_json: JSON.stringify(name), tagline_json: JSON.stringify(tagline), desc_json: JSON.stringify(desc), features_json: JSON.stringify(features),
    rules_json: JSON.stringify(rules), directions_json: JSON.stringify(directions), sessions_json: JSON.stringify(sessions),
    hours_json: JSON.stringify({ open: str(fd, 'open') || '07:00', close: str(fd, 'close') || '24:00' }),
    capacity_base: num(fd, 'capacity_base', 2), capacity_max: num(fd, 'capacity_max', 4), area: str(fd, 'area'),
    blocked_json: JSON.stringify({ dates: blockedDates, weekdays }), entry_json: JSON.stringify(entry), compliance_json: JSON.stringify(compliance), buffer_min: num(fd, 'buffer_min', 60),
  };
}

export function spaceToForm(r: SpaceRow | null) {
  const j = (s: string | undefined, fb: any) => parseJson(s, fb);
  const listToText = (o: any, l: string) => { const v = o?.[l]; return Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''; };
  const paraToText = (o: any, l: string) => { const v = o?.[l]; return Array.isArray(v) ? v.join('\n\n') : typeof v === 'string' ? v : ''; };
  const name = j(r?.name_json, {}), tagline = j(r?.tagline_json, {}), desc = j(r?.desc_json, {}), features = j(r?.features_json, {}), rules = j(r?.rules_json, {}), directions = j(r?.directions_json, {}), entry = j(r?.entry_json, {});
  const region = r?.region ? (r.region.startsWith('{') ? j(r.region, {}) : { ko: r.region }) : {};
  const hours = j(r?.hours_json, {});
  const sessions = j(r?.sessions_json, []);
  const photos = j(r?.photos_json, []);
  const blocked = j(r?.blocked_json, {});
  const compliance = j(r?.compliance_json, {});
  return {
    slug: r?.slug || '', address: r?.address || '', lat: r?.lat ?? '', lng: r?.lng ?? '', capacity_base: r?.capacity_base ?? 2, capacity_max: r?.capacity_max ?? 4, area: r?.area || '',
    open: hours.open || '07:00', close: hours.close || '24:00', buffer_min: r?.buffer_min ?? 60,
    i18n: Object.fromEntries(locales.map((l) => [l, { name: name[l] || '', tagline: tagline[l] || '', desc: paraToText(desc, l), features: listToText(features, l), rules: listToText(rules, l), directions: listToText(directions, l), region: region[l] || '', entry: entry[l] || '' }])),
    sessions, photos,
    blockedDates: Array.isArray(blocked.dates) ? blocked.dates : [], closedWeekdays: Array.isArray(blocked.weekdays) ? blocked.weekdays : [],
    compliance,
  };
}

/** 검토 요청 전 필수 항목 점검. 비어 있으면 통과 */
export function spaceReadiness(r: SpaceRow) {
  const f = spaceToForm(r);
  const missing: string[] = [];
  if (!f.i18n.ko?.name) missing.push('한국어 공간 이름');
  if (!f.i18n.ko?.desc) missing.push('한국어 공간 소개');
  if (!f.i18n.en?.name) missing.push('영어 공간 이름(외국인 노출에 필요)');
  if (!f.address) missing.push('주소');
  if (!f.sessions.length) missing.push('세션·요금 1개 이상');
  if (f.photos.length < 3) missing.push(`사진 3장 이상 (현재 ${f.photos.length}장)`);
  const req = COMPLIANCE.filter((c) => c.required && !f.compliance[c.key]);
  if (req.length) missing.push(`레스텔 기준 점검 필수 항목 ${req.length}개`);
  const closeH = Number(String(f.close).split(':')[0] || 24);
  if (closeH > 24) missing.push('운영 종료 시각은 자정(24:00) 이전이어야 합니다');
  return missing;
}

export const SESSION_CODES = [
  { code: 'nap60', label: 'Nap 60 (낮잠 한 시간)' },
  { code: 'rest180', label: 'Rest 180 (쉼 세 시간)' },
  { code: 'dayrest', label: 'Day Rest (하루 쉼, 최대 8시간)' },
  { code: 'krest90', label: 'K-REST 90 (외국인 체험, 1인 가격)' },
  { code: 'custom', label: '직접 입력' },
];

// ---------- 호스트 설정 JSON ----------
export type HostPayment = { methods: string[]; bank: string; holder: string; account: string; deadlineHours: number; onsiteNote: string; refundPolicy: string };
export function hostPayment(h: HostRow | null): HostPayment {
  const p = parseJson<Partial<HostPayment>>(h?.payment_json, {});
  return { methods: Array.isArray(p.methods) ? p.methods : ['transfer'], bank: p.bank || '', holder: p.holder || '', account: p.account || '', deadlineHours: Number(p.deadlineHours || 24), onsiteNote: p.onsiteNote || '', refundPolicy: p.refundPolicy || '' };
}
export type HostBank = { bank: string; holder: string; account: string; taxType: string };
export function hostBank(h: HostRow | null): HostBank {
  const b = parseJson<Partial<HostBank>>(h?.bank_json, {});
  return { bank: b.bank || '', holder: b.holder || '', account: b.account || '', taxType: b.taxType || '' };
}
export function maskAccount(s: string) {
  const t = (s || '').replace(/\s/g, '');
  if (t.length <= 4) return t ? '****' : '';
  return '*'.repeat(Math.max(0, t.length - 4)).replace(/(\*{4})/g, '$1-') + t.slice(-4);
}

/** 온보딩 진행도(대시보드용) */
export function onboardingSteps(host: HostRow | null, spaces: SpaceRow[]) {
  const pay = hostPayment(host); const bank = hostBank(host);
  const anySpace = spaces[0] || null;
  const f = anySpace ? spaceToForm(anySpace) : null;
  return [
    { key: 'profile', label: '사업 정보 입력', done: !!(host?.biz_type && host?.company), href: '/host/settings' },
    { key: 'space', label: '첫 공간 등록', done: !!anySpace, href: anySpace ? `/host/spaces/${anySpace.id}` : '/host/spaces/new' },
    { key: 'photos', label: '사진 3장 이상', done: !!f && f.photos.length >= 3, href: anySpace ? `/host/spaces/${anySpace.id}` : '/host/spaces/new' },
    { key: 'sessions', label: '세션·요금 설정', done: !!f && f.sessions.length > 0, href: anySpace ? `/host/spaces/${anySpace.id}` : '/host/spaces/new' },
    { key: 'compliance', label: '레스텔 기준 점검', done: !!anySpace && spaceReadiness(anySpace).every((m) => !m.includes('기준 점검')), href: anySpace ? `/host/spaces/${anySpace.id}` : '/host/spaces/new' },
    { key: 'payment', label: '결제·정산 정보', done: !!(pay.methods.length && (pay.methods.includes('onsite') || pay.account) && bank.account), href: '/host/settings#payment' },
    { key: 'submit', label: '검토 요청', done: spaces.some((s) => s.status === 'submitted' || s.status === 'published'), href: anySpace ? `/host/spaces/${anySpace.id}` : '/host/spaces/new' },
    { key: 'approved', label: '승인·공개', done: spaces.some((s) => s.status === 'published') && host?.status === 'approved', href: '/host/spaces' },
  ];
}

// ---------- 달력 ----------
export function monthGrid(period: string) {
  const [y, m] = period.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const cells: ({ date: string; day: number; weekday: number } | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let dd = 1; dd <= daysInMonth; dd++) cells.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`, day: dd, weekday: (lead + dd - 1) % 7 });
  while (cells.length % 7) cells.push(null);
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  return { cells, prev, next, label: `${y}년 ${m}월`, from: cells.find(Boolean)!.date, to: `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}` };
}
export function todayKST() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()); // YYYY-MM-DD
}
export function addDaysKST(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00+09:00'); d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d);
}
export function bookingAmount(b: BookingRow) {
  return b.amount_due || b.est_amount || 0;
}

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
