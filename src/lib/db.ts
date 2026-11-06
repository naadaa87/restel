// D1 데이터 계층 — 스키마 자동 초기화(+누락 열 마이그레이션) + 쿼리 함수
import { nowIso, randomCode } from './text';

export type HostStatus = 'pending' | 'approved' | 'suspended';
export type HostRow = {
  id: number; email: string; password_hash: string; name: string; phone: string; company: string; status: HostStatus; created_at: string; last_login_at: string | null;
  // 2차(호스트 기능 확장)
  biz_type: string; biz_no: string; biz_address: string; space_kind: string; region: string;
  pledge_json: string; profile_json: string; payment_json: string; bank_json: string; admin_note: string; approved_at: string | null;
};
export type SpaceStatus = 'draft' | 'submitted' | 'published' | 'hidden' | 'rejected';
export type SpaceRow = {
  id: number; host_id: number; slug: string; status: SpaceStatus;
  region: string; address: string; lat: number | null; lng: number | null;
  name_json: string; tagline_json: string; desc_json: string; features_json: string; rules_json: string; directions_json: string;
  photos_json: string; sessions_json: string; hours_json: string; capacity_base: number; capacity_max: number; area: string;
  admin_note: string; created_at: string; updated_at: string; host_name?: string; host_email?: string;
  // 2차
  blocked_json: string; entry_json: string; compliance_json: string; buffer_min: number;
};
export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'noshow' | 'declined' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'awaiting' | 'paid' | 'refunded';
export type BookingRow = {
  id: number; code: string; space_slug: string; space_name: string; host_id: number | null; session_code: string; date: string; start_time: string;
  people: number; name: string; phone: string; email: string; lang: string; note: string; status: BookingStatus;
  est_amount: number; contact_key: string; created_at: string; updated_at: string;
  // 2차
  payment_status: PaymentStatus; payment_method: string; amount_due: number; paid_amount: number; paid_at: string | null;
  refund_amount: number; payment_note: string; entry_sent_at: string | null; host_memo: string; settlement_id: number | null; last_sender: string;
};
export type MessageRow = { id: number; booking_id: number; sender: 'customer' | 'host' | 'admin'; body: string; created_at: string };
export type InquiryRow = { id: number; kind: string; name: string; email: string; phone: string; topic: string; message: string; status: 'new' | 'replied' | 'closed'; reply: string; created_at: string; host_id: number | null; replied_at: string | null };
export type NoticeRow = { id: number; title: string; body: string; audience: 'host' | 'all'; pinned: number; created_at: string; updated_at: string };
export type SettlementRow = { id: number; host_id: number; period: string; gross: number; commission_rate: number; commission: number; net: number; booking_count: number; booking_ids_json: string; status: 'issued' | 'paid'; note: string; created_at: string; paid_at: string | null; host_name?: string; host_email?: string };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, last_login_at TEXT,
  biz_type TEXT NOT NULL DEFAULT '', biz_no TEXT NOT NULL DEFAULT '', biz_address TEXT NOT NULL DEFAULT '', space_kind TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '',
  pledge_json TEXT NOT NULL DEFAULT '{}', profile_json TEXT NOT NULL DEFAULT '{}', payment_json TEXT NOT NULL DEFAULT '{}', bank_json TEXT NOT NULL DEFAULT '{}',
  admin_note TEXT NOT NULL DEFAULT '', approved_at TEXT
);
CREATE TABLE IF NOT EXISTS spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT, host_id INTEGER NOT NULL REFERENCES hosts(id), slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', region TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', lat REAL, lng REAL,
  name_json TEXT NOT NULL DEFAULT '{}', tagline_json TEXT NOT NULL DEFAULT '{}', desc_json TEXT NOT NULL DEFAULT '{}',
  features_json TEXT NOT NULL DEFAULT '[]', rules_json TEXT NOT NULL DEFAULT '{}', directions_json TEXT NOT NULL DEFAULT '{}',
  photos_json TEXT NOT NULL DEFAULT '[]', sessions_json TEXT NOT NULL DEFAULT '[]', hours_json TEXT NOT NULL DEFAULT '{}',
  capacity_base INTEGER NOT NULL DEFAULT 2, capacity_max INTEGER NOT NULL DEFAULT 4, area TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  blocked_json TEXT NOT NULL DEFAULT '{}', entry_json TEXT NOT NULL DEFAULT '{}', compliance_json TEXT NOT NULL DEFAULT '{}', buffer_min INTEGER NOT NULL DEFAULT 60
);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, space_slug TEXT NOT NULL, space_name TEXT NOT NULL DEFAULT '',
  host_id INTEGER, session_code TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, people INTEGER NOT NULL DEFAULT 2,
  name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', lang TEXT NOT NULL DEFAULT 'ko',
  note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'requested', est_amount INTEGER NOT NULL DEFAULT 0,
  contact_key TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid', payment_method TEXT NOT NULL DEFAULT '', amount_due INTEGER NOT NULL DEFAULT 0, paid_amount INTEGER NOT NULL DEFAULT 0, paid_at TEXT,
  refund_amount INTEGER NOT NULL DEFAULT 0, payment_note TEXT NOT NULL DEFAULT '', entry_sent_at TEXT, host_memo TEXT NOT NULL DEFAULT '', settlement_id INTEGER, last_sender TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(code);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, booking_id INTEGER NOT NULL REFERENCES bookings(id), sender TEXT NOT NULL,
  body TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL DEFAULT 'contact', name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '', topic TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new',
  reply TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, host_id INTEGER, replied_at TEXT
);
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', audience TEXT NOT NULL DEFAULT 'host',
  pinned INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT, host_id INTEGER NOT NULL, period TEXT NOT NULL, gross INTEGER NOT NULL DEFAULT 0,
  commission_rate INTEGER NOT NULL DEFAULT 15, commission INTEGER NOT NULL DEFAULT 0, net INTEGER NOT NULL DEFAULT 0, booking_count INTEGER NOT NULL DEFAULT 0,
  booking_ids_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'issued', note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, paid_at TEXT,
  UNIQUE(host_id, period)
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_secrets (key TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '', at TEXT NOT NULL
);
`;

// 이미 만들어진 테이블에 나중에 추가된 열. PRAGMA로 없는 열만 ALTER 한다.
const MIGRATIONS: { table: string; column: string; ddl: string }[] = [
  { table: 'hosts', column: 'biz_type', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'biz_no', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'biz_address', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'space_kind', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'region', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'pledge_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'hosts', column: 'profile_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'hosts', column: 'payment_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'hosts', column: 'bank_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'hosts', column: 'admin_note', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'hosts', column: 'approved_at', ddl: 'TEXT' },
  { table: 'spaces', column: 'blocked_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'spaces', column: 'entry_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'spaces', column: 'compliance_json', ddl: "TEXT NOT NULL DEFAULT '{}'" },
  { table: 'spaces', column: 'buffer_min', ddl: 'INTEGER NOT NULL DEFAULT 60' },
  { table: 'bookings', column: 'payment_status', ddl: "TEXT NOT NULL DEFAULT 'unpaid'" },
  { table: 'bookings', column: 'payment_method', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'bookings', column: 'amount_due', ddl: 'INTEGER NOT NULL DEFAULT 0' },
  { table: 'bookings', column: 'paid_amount', ddl: 'INTEGER NOT NULL DEFAULT 0' },
  { table: 'bookings', column: 'paid_at', ddl: 'TEXT' },
  { table: 'bookings', column: 'refund_amount', ddl: 'INTEGER NOT NULL DEFAULT 0' },
  { table: 'bookings', column: 'payment_note', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'bookings', column: 'entry_sent_at', ddl: 'TEXT' },
  { table: 'bookings', column: 'host_memo', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'bookings', column: 'settlement_id', ddl: 'INTEGER' },
  { table: 'bookings', column: 'last_sender', ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: 'inquiries', column: 'host_id', ddl: 'INTEGER' },
  { table: 'inquiries', column: 'replied_at', ddl: 'TEXT' },
];

let schemaDone = false;

export function getDB(locals: any): D1Database | null {
  try { return locals?.runtime?.env?.DB ?? null; } catch { return null; }
}

/** 테이블이 없으면 만들고, 빠진 열은 추가한다. isolate당 1회만 실행 */
export async function ensureSchema(db: D1Database) {
  if (schemaDone) return;
  const stmts = SCHEMA.split(';').map((s) => s.trim()).filter(Boolean);
  await db.batch(stmts.map((s) => db.prepare(s)));
  for (const table of [...new Set(MIGRATIONS.map((m) => m.table))]) {
    const cols = ((await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>()).results || []).map((r) => r.name);
    const missing = MIGRATIONS.filter((m) => m.table === table && !cols.includes(m.column));
    for (const m of missing) await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${m.column} ${m.ddl}`).run();
  }
  schemaDone = true;
}

export async function db(locals: any): Promise<D1Database | null> {
  const d = getDB(locals);
  if (!d) return null;
  try { await ensureSchema(d); return d; } catch (e) { console.error('schema error', e); return null; }
}

export function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export function normalizeContact(s: string) {
  return (s || '').toLowerCase().replace(/[\s\-().]/g, '');
}

// ---------- 호스트 ----------
export async function createHost(d: D1Database, h: { email: string; password_hash: string; name: string; phone: string; company: string; biz_type?: string; biz_no?: string; biz_address?: string; space_kind?: string; region?: string; pledge_json?: string; profile_json?: string }) {
  const r = await d.prepare('INSERT INTO hosts (email, password_hash, name, phone, company, status, created_at, biz_type, biz_no, biz_address, space_kind, region, pledge_json, profile_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(h.email.toLowerCase(), h.password_hash, h.name, h.phone, h.company, 'pending', nowIso(), h.biz_type ?? '', h.biz_no ?? '', h.biz_address ?? '', h.space_kind ?? '', h.region ?? '', h.pledge_json ?? '{}', h.profile_json ?? '{}').run();
  return r.meta.last_row_id as number;
}
export async function getHostByEmail(d: D1Database, email: string) {
  return (await d.prepare('SELECT * FROM hosts WHERE email = ?').bind(email.toLowerCase()).first<HostRow>()) || null;
}
export async function getHost(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM hosts WHERE id = ?').bind(id).first<HostRow>()) || null;
}
export async function listHosts(d: D1Database) {
  return (await d.prepare('SELECT h.*, (SELECT COUNT(*) FROM spaces s WHERE s.host_id = h.id) AS space_count, (SELECT COUNT(*) FROM bookings b WHERE b.host_id = h.id) AS booking_count FROM hosts h ORDER BY h.created_at DESC').all<HostRow & { space_count: number; booking_count: number }>()).results;
}
export async function updateHostStatus(d: D1Database, id: number, status: string, adminNote?: string) {
  const approvedAt = status === 'approved' ? nowIso() : null;
  if (adminNote !== undefined) await d.prepare('UPDATE hosts SET status = ?, admin_note = ?, approved_at = COALESCE(?, approved_at) WHERE id = ?').bind(status, adminNote, approvedAt, id).run();
  else await d.prepare('UPDATE hosts SET status = ?, approved_at = COALESCE(?, approved_at) WHERE id = ?').bind(status, approvedAt, id).run();
}
export async function updateHostProfile(d: D1Database, id: number, p: { name: string; phone: string; company: string; biz_type?: string; biz_no?: string; biz_address?: string; space_kind?: string; region?: string; profile_json?: string }) {
  await d.prepare('UPDATE hosts SET name = ?, phone = ?, company = ?, biz_type = ?, biz_no = ?, biz_address = ?, space_kind = ?, region = ?, profile_json = ? WHERE id = ?')
    .bind(p.name, p.phone, p.company, p.biz_type ?? '', p.biz_no ?? '', p.biz_address ?? '', p.space_kind ?? '', p.region ?? '', p.profile_json ?? '{}', id).run();
}
export async function updateHostPayment(d: D1Database, id: number, paymentJson: string, bankJson: string) {
  await d.prepare('UPDATE hosts SET payment_json = ?, bank_json = ? WHERE id = ?').bind(paymentJson, bankJson, id).run();
}
export async function updateHostPledge(d: D1Database, id: number, pledgeJson: string) {
  await d.prepare('UPDATE hosts SET pledge_json = ? WHERE id = ?').bind(pledgeJson, id).run();
}
export async function updateHostPassword(d: D1Database, id: number, hash: string) {
  await d.prepare('UPDATE hosts SET password_hash = ? WHERE id = ?').bind(hash, id).run();
}
export async function touchHostLogin(d: D1Database, id: number) {
  await d.prepare('UPDATE hosts SET last_login_at = ? WHERE id = ?').bind(nowIso(), id).run();
}

// ---------- 공간 ----------
export async function listPublishedSpaces(d: D1Database) {
  return (await d.prepare("SELECT s.*, h.name AS host_name FROM spaces s JOIN hosts h ON h.id = s.host_id WHERE s.status = 'published' AND h.status = 'approved' ORDER BY s.updated_at DESC").all<SpaceRow>()).results;
}
export async function getPublishedSpaceBySlug(d: D1Database, slug: string) {
  return (await d.prepare("SELECT s.*, h.name AS host_name, h.email AS host_email FROM spaces s JOIN hosts h ON h.id = s.host_id WHERE s.slug = ? AND s.status = 'published' AND h.status = 'approved'").bind(slug).first<SpaceRow>()) || null;
}
export async function getSpace(d: D1Database, id: number) {
  return (await d.prepare('SELECT s.*, h.name AS host_name, h.email AS host_email FROM spaces s JOIN hosts h ON h.id = s.host_id WHERE s.id = ?').bind(id).first<SpaceRow>()) || null;
}
export async function getSpaceBySlugAny(d: D1Database, slug: string) {
  return (await d.prepare('SELECT * FROM spaces WHERE slug = ?').bind(slug).first<SpaceRow>()) || null;
}
export async function listSpacesByHost(d: D1Database, hostId: number) {
  return (await d.prepare('SELECT * FROM spaces WHERE host_id = ? ORDER BY updated_at DESC').bind(hostId).all<SpaceRow>()).results;
}
export async function listAllSpaces(d: D1Database) {
  return (await d.prepare('SELECT s.*, h.name AS host_name, h.email AS host_email FROM spaces s JOIN hosts h ON h.id = s.host_id ORDER BY s.updated_at DESC').all<SpaceRow>()).results;
}
export async function slugExists(d: D1Database, slug: string, exceptId?: number) {
  const r = await d.prepare('SELECT id FROM spaces WHERE slug = ? AND id != ?').bind(slug, exceptId ?? -1).first();
  return !!r;
}
export async function createSpace(d: D1Database, hostId: number, data: Partial<SpaceRow>) {
  const now = nowIso();
  const r = await d.prepare(`INSERT INTO spaces (host_id, slug, status, region, address, lat, lng, name_json, tagline_json, desc_json, features_json, rules_json, directions_json, photos_json, sessions_json, hours_json, capacity_base, capacity_max, area, created_at, updated_at, blocked_json, entry_json, compliance_json, buffer_min)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(hostId, data.slug, 'draft', data.region ?? '', data.address ?? '', data.lat ?? null, data.lng ?? null, data.name_json ?? '{}', data.tagline_json ?? '{}', data.desc_json ?? '{}', data.features_json ?? '[]', data.rules_json ?? '{}', data.directions_json ?? '{}', data.photos_json ?? '[]', data.sessions_json ?? '[]', data.hours_json ?? '{}', data.capacity_base ?? 2, data.capacity_max ?? 4, data.area ?? '', now, now, data.blocked_json ?? '{}', data.entry_json ?? '{}', data.compliance_json ?? '{}', data.buffer_min ?? 60).run();
  return r.meta.last_row_id as number;
}
export async function updateSpace(d: D1Database, id: number, data: Partial<SpaceRow>) {
  await d.prepare(`UPDATE spaces SET slug=?, region=?, address=?, lat=?, lng=?, name_json=?, tagline_json=?, desc_json=?, features_json=?, rules_json=?, directions_json=?, sessions_json=?, hours_json=?, capacity_base=?, capacity_max=?, area=?, blocked_json=?, entry_json=?, compliance_json=?, buffer_min=?, updated_at=? WHERE id=?`)
    .bind(data.slug, data.region ?? '', data.address ?? '', data.lat ?? null, data.lng ?? null, data.name_json ?? '{}', data.tagline_json ?? '{}', data.desc_json ?? '{}', data.features_json ?? '[]', data.rules_json ?? '{}', data.directions_json ?? '{}', data.sessions_json ?? '[]', data.hours_json ?? '{}', data.capacity_base ?? 2, data.capacity_max ?? 4, data.area ?? '', data.blocked_json ?? '{}', data.entry_json ?? '{}', data.compliance_json ?? '{}', data.buffer_min ?? 60, nowIso(), id).run();
}
export async function updateSpaceStatus(d: D1Database, id: number, status: string, adminNote?: string) {
  if (adminNote !== undefined) await d.prepare('UPDATE spaces SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?').bind(status, adminNote, nowIso(), id).run();
  else await d.prepare('UPDATE spaces SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();
}
export async function updateSpacePhotos(d: D1Database, id: number, photosJson: string) {
  await d.prepare('UPDATE spaces SET photos_json = ?, updated_at = ? WHERE id = ?').bind(photosJson, nowIso(), id).run();
}
export async function updateSpaceBlocked(d: D1Database, id: number, blockedJson: string) {
  await d.prepare('UPDATE spaces SET blocked_json = ?, updated_at = ? WHERE id = ?').bind(blockedJson, nowIso(), id).run();
}
export async function deleteSpace(d: D1Database, id: number) {
  await d.prepare('DELETE FROM spaces WHERE id = ?').bind(id).run();
}

// ---------- 예약 요청 ----------
export async function createBooking(d: D1Database, b: { space_slug: string; space_name: string; host_id: number | null; session_code: string; date: string; start_time: string; people: number; name: string; phone: string; email: string; lang: string; note: string; est_amount: number }) {
  const now = nowIso();
  for (let i = 0; i < 5; i++) {
    const code = 'RT-' + randomCode(6);
    try {
      const r = await d.prepare(`INSERT INTO bookings (code, space_slug, space_name, host_id, session_code, date, start_time, people, name, phone, email, lang, note, status, est_amount, amount_due, contact_key, created_at, updated_at, last_sender)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(code, b.space_slug, b.space_name, b.host_id, b.session_code, b.date, b.start_time, b.people, b.name, b.phone, b.email, b.lang, b.note, 'requested', b.est_amount, b.est_amount, [normalizeContact(b.phone), normalizeContact(b.email)].filter(Boolean).join('|'), now, now, 'customer').run();
      return { id: r.meta.last_row_id as number, code };
    } catch (e: any) {
      if (!String(e?.message || '').includes('UNIQUE')) throw e;
    }
  }
  throw new Error('code collision');
}
export async function getBookingByCode(d: D1Database, code: string) {
  return (await d.prepare('SELECT * FROM bookings WHERE code = ?').bind(code.toUpperCase().trim()).first<BookingRow>()) || null;
}
export async function getBooking(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<BookingRow>()) || null;
}
export async function listBookingsForHost(d: D1Database, hostId: number) {
  return (await d.prepare('SELECT * FROM bookings WHERE host_id = ? ORDER BY created_at DESC LIMIT 500').bind(hostId).all<BookingRow>()).results;
}
export async function listBookingsForHostByDateRange(d: D1Database, hostId: number, from: string, to: string) {
  return (await d.prepare('SELECT * FROM bookings WHERE host_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, start_time ASC').bind(hostId, from, to).all<BookingRow>()).results;
}
export async function listBookingsForSpaceDate(d: D1Database, slug: string, date: string) {
  return (await d.prepare("SELECT * FROM bookings WHERE space_slug = ? AND date = ? AND status IN ('requested','confirmed') ORDER BY start_time ASC").bind(slug, date).all<BookingRow>()).results;
}
export async function listAllBookings(d: D1Database, status?: string) {
  if (status) return (await d.prepare('SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC LIMIT 500').bind(status).all<BookingRow>()).results;
  return (await d.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500').all<BookingRow>()).results;
}
export async function updateBookingStatus(d: D1Database, id: number, status: string) {
  await d.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();
}
export async function updateBookingPayment(d: D1Database, id: number, p: Partial<Pick<BookingRow, 'payment_status' | 'payment_method' | 'amount_due' | 'paid_amount' | 'paid_at' | 'refund_amount' | 'payment_note'>>) {
  const cur = await getBooking(d, id);
  if (!cur) return;
  const n = { ...cur, ...p };
  await d.prepare('UPDATE bookings SET payment_status = ?, payment_method = ?, amount_due = ?, paid_amount = ?, paid_at = ?, refund_amount = ?, payment_note = ?, updated_at = ? WHERE id = ?')
    .bind(n.payment_status, n.payment_method, n.amount_due, n.paid_amount, n.paid_at, n.refund_amount, n.payment_note, nowIso(), id).run();
}
export async function updateBookingMemo(d: D1Database, id: number, memo: string) {
  await d.prepare('UPDATE bookings SET host_memo = ? WHERE id = ?').bind(memo, id).run();
}
export async function markEntrySent(d: D1Database, id: number) {
  await d.prepare('UPDATE bookings SET entry_sent_at = ?, updated_at = ? WHERE id = ?').bind(nowIso(), nowIso(), id).run();
}
export async function listMessages(d: D1Database, bookingId: number) {
  return (await d.prepare('SELECT * FROM messages WHERE booking_id = ? ORDER BY created_at ASC').bind(bookingId).all<MessageRow>()).results;
}
export async function addMessage(d: D1Database, bookingId: number, sender: MessageRow['sender'], body: string) {
  await d.prepare('INSERT INTO messages (booking_id, sender, body, created_at) VALUES (?,?,?,?)').bind(bookingId, sender, body, nowIso()).run();
  await d.prepare('UPDATE bookings SET updated_at = ?, last_sender = ? WHERE id = ?').bind(nowIso(), sender, bookingId).run();
}

// ---------- 정산 ----------
/** 호스트의 월별 정산 집계(완료+결제 기준). period = YYYY-MM */
export async function settlementRollup(d: D1Database, hostId: number) {
  const rows = (await d.prepare("SELECT substr(date,1,7) AS period, COUNT(*) AS n, SUM(paid_amount) AS gross, SUM(refund_amount) AS refunds FROM bookings WHERE host_id = ? AND status = 'completed' GROUP BY period ORDER BY period DESC").bind(hostId).all<{ period: string; n: number; gross: number; refunds: number }>()).results;
  return rows.map((r) => ({ period: r.period, count: Number(r.n || 0), gross: Number(r.gross || 0) - Number(r.refunds || 0) }));
}
export async function listCompletedBookingsForPeriod(d: D1Database, hostId: number, period: string) {
  return (await d.prepare("SELECT * FROM bookings WHERE host_id = ? AND status = 'completed' AND substr(date,1,7) = ? ORDER BY date ASC, start_time ASC").bind(hostId, period).all<BookingRow>()).results;
}
export async function listSettlementsForHost(d: D1Database, hostId: number) {
  return (await d.prepare('SELECT * FROM settlements WHERE host_id = ? ORDER BY period DESC').bind(hostId).all<SettlementRow>()).results;
}
export async function listAllSettlements(d: D1Database) {
  return (await d.prepare('SELECT s.*, h.name AS host_name, h.email AS host_email FROM settlements s JOIN hosts h ON h.id = s.host_id ORDER BY s.period DESC, s.id DESC').all<SettlementRow>()).results;
}
export async function getSettlement(d: D1Database, id: number) {
  return (await d.prepare('SELECT s.*, h.name AS host_name, h.email AS host_email FROM settlements s JOIN hosts h ON h.id = s.host_id WHERE s.id = ?').bind(id).first<SettlementRow>()) || null;
}
export async function upsertSettlement(d: D1Database, s: { host_id: number; period: string; gross: number; commission_rate: number; booking_ids: number[]; note: string }) {
  const commission = Math.round(s.gross * s.commission_rate / 100);
  const net = s.gross - commission;
  await d.prepare(`INSERT INTO settlements (host_id, period, gross, commission_rate, commission, net, booking_count, booking_ids_json, status, note, created_at)
    VALUES (?,?,?,?,?,?,?,?,'issued',?,?)
    ON CONFLICT(host_id, period) DO UPDATE SET gross = excluded.gross, commission_rate = excluded.commission_rate, commission = excluded.commission, net = excluded.net, booking_count = excluded.booking_count, booking_ids_json = excluded.booking_ids_json, note = excluded.note, status = 'issued', paid_at = NULL`)
    .bind(s.host_id, s.period, s.gross, s.commission_rate, commission, net, s.booking_ids.length, JSON.stringify(s.booking_ids), s.note, nowIso()).run();
  const row = await d.prepare('SELECT id FROM settlements WHERE host_id = ? AND period = ?').bind(s.host_id, s.period).first<{ id: number }>();
  if (row && s.booking_ids.length) await d.prepare(`UPDATE bookings SET settlement_id = ? WHERE id IN (${s.booking_ids.map(() => '?').join(',')})`).bind(row.id, ...s.booking_ids).run();
  return row?.id ?? 0;
}
export async function markSettlementPaid(d: D1Database, id: number, note: string) {
  await d.prepare("UPDATE settlements SET status = 'paid', paid_at = ?, note = ? WHERE id = ?").bind(nowIso(), note, id).run();
}

// ---------- 문의 ----------
export async function createInquiry(d: D1Database, q: { kind: string; name: string; email: string; phone: string; topic: string; message: string; host_id?: number | null }) {
  const r = await d.prepare('INSERT INTO inquiries (kind, name, email, phone, topic, message, status, created_at, host_id) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(q.kind, q.name, q.email, q.phone, q.topic, q.message, 'new', nowIso(), q.host_id ?? null).run();
  return r.meta.last_row_id as number;
}
export async function listInquiries(d: D1Database) {
  return (await d.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500').all<InquiryRow>()).results;
}
export async function listInquiriesForHost(d: D1Database, hostId: number) {
  return (await d.prepare('SELECT * FROM inquiries WHERE host_id = ? ORDER BY created_at DESC LIMIT 200').bind(hostId).all<InquiryRow>()).results;
}
export async function getInquiry(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first<InquiryRow>()) || null;
}
export async function updateInquiry(d: D1Database, id: number, status: string, reply: string) {
  await d.prepare('UPDATE inquiries SET status = ?, reply = ?, replied_at = CASE WHEN ? != \'\' THEN ? ELSE replied_at END WHERE id = ?').bind(status, reply, reply, nowIso(), id).run();
}

// ---------- 공지 ----------
export async function listNotices(d: D1Database, audience?: 'host' | 'all') {
  if (audience) return (await d.prepare("SELECT * FROM notices WHERE audience IN (?, 'all') ORDER BY pinned DESC, created_at DESC LIMIT 100").bind(audience).all<NoticeRow>()).results;
  return (await d.prepare('SELECT * FROM notices ORDER BY pinned DESC, created_at DESC LIMIT 200').all<NoticeRow>()).results;
}
export async function getNotice(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM notices WHERE id = ?').bind(id).first<NoticeRow>()) || null;
}
export async function createNotice(d: D1Database, n: { title: string; body: string; audience: string; pinned: number }) {
  const now = nowIso();
  const r = await d.prepare('INSERT INTO notices (title, body, audience, pinned, created_at, updated_at) VALUES (?,?,?,?,?,?)').bind(n.title, n.body, n.audience, n.pinned, now, now).run();
  return r.meta.last_row_id as number;
}
export async function updateNotice(d: D1Database, id: number, n: { title: string; body: string; audience: string; pinned: number }) {
  await d.prepare('UPDATE notices SET title = ?, body = ?, audience = ?, pinned = ?, updated_at = ? WHERE id = ?').bind(n.title, n.body, n.audience, n.pinned, nowIso(), id).run();
}
export async function deleteNotice(d: D1Database, id: number) {
  await d.prepare('DELETE FROM notices WHERE id = ?').bind(id).run();
}

// ---------- 설정 ----------
export async function getSettings(d: D1Database) {
  const rows = (await d.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>()).results;
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}
export async function setSetting(d: D1Database, key: string, value: string) {
  await d.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind(key, value, nowIso()).run();
}

// ---------- 감사 로그 ----------
export async function audit(d: D1Database, actor: string, action: string, target = '', detail = '') {
  try { await d.prepare('INSERT INTO audit_logs (actor, action, target, detail, at) VALUES (?,?,?,?,?)').bind(actor, action, target, detail, nowIso()).run(); } catch {}
}
export async function listAudit(d: D1Database) {
  return (await d.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200').all<{ id: number; actor: string; action: string; target: string; detail: string; at: string }>()).results;
}
export async function listAuditForTarget(d: D1Database, target: string) {
  return (await d.prepare('SELECT * FROM audit_logs WHERE target = ? ORDER BY id ASC LIMIT 100').bind(target).all<{ id: number; actor: string; action: string; target: string; detail: string; at: string }>()).results;
}

// ---------- 통계 ----------
export async function adminStats(d: D1Database) {
  const q = async (sql: string) => ((await d.prepare(sql).first<{ n: number }>())?.n ?? 0);
  return {
    hostsPending: await q("SELECT COUNT(*) n FROM hosts WHERE status='pending'"),
    hostsApproved: await q("SELECT COUNT(*) n FROM hosts WHERE status='approved'"),
    spacesSubmitted: await q("SELECT COUNT(*) n FROM spaces WHERE status='submitted'"),
    spacesPublished: await q("SELECT COUNT(*) n FROM spaces WHERE status='published'"),
    bookingsRequested: await q("SELECT COUNT(*) n FROM bookings WHERE status='requested'"),
    bookingsConfirmed: await q("SELECT COUNT(*) n FROM bookings WHERE status='confirmed'"),
    inquiriesNew: await q("SELECT COUNT(*) n FROM inquiries WHERE status='new' AND kind != 'host'"),
    hostInquiriesNew: await q("SELECT COUNT(*) n FROM inquiries WHERE status='new' AND kind = 'host'"),
    settlementsIssued: await q("SELECT COUNT(*) n FROM settlements WHERE status='issued'"),
    unsettled: await q("SELECT COUNT(*) n FROM bookings WHERE status='completed' AND host_id IS NOT NULL AND settlement_id IS NULL AND paid_amount > 0"),
  };
}
export async function hostStats(d: D1Database, hostId: number) {
  const q = async (sql: string, ...args: any[]) => ((await d.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0);
  const month = new Date().toISOString().slice(0, 7);
  return {
    requested: await q("SELECT COUNT(*) n FROM bookings WHERE host_id = ? AND status='requested'", hostId),
    confirmed: await q("SELECT COUNT(*) n FROM bookings WHERE host_id = ? AND status='confirmed'", hostId),
    awaitingPayment: await q("SELECT COUNT(*) n FROM bookings WHERE host_id = ? AND status='confirmed' AND payment_status IN ('unpaid','awaiting')", hostId),
    unanswered: await q("SELECT COUNT(*) n FROM bookings WHERE host_id = ? AND last_sender = 'customer' AND status IN ('requested','confirmed')", hostId),
    monthCompleted: await q("SELECT COUNT(*) n FROM bookings WHERE host_id = ? AND status='completed' AND substr(date,1,7) = ?", hostId, month),
    monthGross: await q("SELECT COALESCE(SUM(paid_amount - refund_amount),0) n FROM bookings WHERE host_id = ? AND status='completed' AND substr(date,1,7) = ?", hostId, month),
  };
}
