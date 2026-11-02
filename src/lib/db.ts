// D1 데이터 계층 — 스키마 자동 초기화 + 쿼리 함수
import { nowIso, randomCode } from './text';

export type HostRow = { id: number; email: string; password_hash: string; name: string; phone: string; company: string; status: 'pending' | 'approved' | 'suspended'; created_at: string; last_login_at: string | null };
export type SpaceRow = {
  id: number; host_id: number; slug: string; status: 'draft' | 'submitted' | 'published' | 'hidden' | 'rejected';
  region: string; address: string; lat: number | null; lng: number | null;
  name_json: string; tagline_json: string; desc_json: string; features_json: string; rules_json: string; directions_json: string;
  photos_json: string; sessions_json: string; hours_json: string; capacity_base: number; capacity_max: number; area: string;
  admin_note: string; created_at: string; updated_at: string; host_name?: string; host_email?: string;
};
export type BookingRow = {
  id: number; code: string; space_slug: string; space_name: string; host_id: number | null; session_code: string; date: string; start_time: string;
  people: number; name: string; phone: string; email: string; lang: string; note: string; status: 'requested' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  est_amount: number; contact_key: string; created_at: string; updated_at: string;
};
export type MessageRow = { id: number; booking_id: number; sender: 'customer' | 'host' | 'admin'; body: string; created_at: string };
export type InquiryRow = { id: number; kind: string; name: string; email: string; phone: string; topic: string; message: string; status: 'new' | 'replied' | 'closed'; reply: string; created_at: string };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT, host_id INTEGER NOT NULL REFERENCES hosts(id), slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', region TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', lat REAL, lng REAL,
  name_json TEXT NOT NULL DEFAULT '{}', tagline_json TEXT NOT NULL DEFAULT '{}', desc_json TEXT NOT NULL DEFAULT '{}',
  features_json TEXT NOT NULL DEFAULT '[]', rules_json TEXT NOT NULL DEFAULT '{}', directions_json TEXT NOT NULL DEFAULT '{}',
  photos_json TEXT NOT NULL DEFAULT '[]', sessions_json TEXT NOT NULL DEFAULT '[]', hours_json TEXT NOT NULL DEFAULT '{}',
  capacity_base INTEGER NOT NULL DEFAULT 2, capacity_max INTEGER NOT NULL DEFAULT 4, area TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, space_slug TEXT NOT NULL, space_name TEXT NOT NULL DEFAULT '',
  host_id INTEGER, session_code TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, people INTEGER NOT NULL DEFAULT 2,
  name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', lang TEXT NOT NULL DEFAULT 'ko',
  note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'requested', est_amount INTEGER NOT NULL DEFAULT 0,
  contact_key TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(code);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, booking_id INTEGER NOT NULL REFERENCES bookings(id), sender TEXT NOT NULL,
  body TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL DEFAULT 'contact', name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '', topic TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new',
  reply TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '', at TEXT NOT NULL
);
`;

let schemaReady: WeakSet<object> = new WeakSet();

export function getDB(locals: any): D1Database | null {
  try { return locals?.runtime?.env?.DB ?? null; } catch { return null; }
}

/** 테이블이 없으면 만든다. isolate당 1회만 실행 */
export async function ensureSchema(db: D1Database) {
  if (schemaReady.has(db)) return;
  const stmts = SCHEMA.split(';').map((s) => s.trim()).filter(Boolean);
  await db.batch(stmts.map((s) => db.prepare(s)));
  schemaReady.add(db);
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
export async function createHost(d: D1Database, h: { email: string; password_hash: string; name: string; phone: string; company: string }) {
  const r = await d.prepare('INSERT INTO hosts (email, password_hash, name, phone, company, status, created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(h.email.toLowerCase(), h.password_hash, h.name, h.phone, h.company, 'pending', nowIso()).run();
  return r.meta.last_row_id as number;
}
export async function getHostByEmail(d: D1Database, email: string) {
  return (await d.prepare('SELECT * FROM hosts WHERE email = ?').bind(email.toLowerCase()).first<HostRow>()) || null;
}
export async function getHost(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM hosts WHERE id = ?').bind(id).first<HostRow>()) || null;
}
export async function listHosts(d: D1Database) {
  return (await d.prepare('SELECT h.*, (SELECT COUNT(*) FROM spaces s WHERE s.host_id = h.id) AS space_count FROM hosts h ORDER BY h.created_at DESC').all<HostRow & { space_count: number }>()).results;
}
export async function updateHostStatus(d: D1Database, id: number, status: string) {
  await d.prepare('UPDATE hosts SET status = ? WHERE id = ?').bind(status, id).run();
}
export async function updateHostProfile(d: D1Database, id: number, p: { name: string; phone: string; company: string }) {
  await d.prepare('UPDATE hosts SET name = ?, phone = ?, company = ? WHERE id = ?').bind(p.name, p.phone, p.company, id).run();
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
  const r = await d.prepare(`INSERT INTO spaces (host_id, slug, status, region, address, lat, lng, name_json, tagline_json, desc_json, features_json, rules_json, directions_json, photos_json, sessions_json, hours_json, capacity_base, capacity_max, area, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(hostId, data.slug, 'draft', data.region ?? '', data.address ?? '', data.lat ?? null, data.lng ?? null, data.name_json ?? '{}', data.tagline_json ?? '{}', data.desc_json ?? '{}', data.features_json ?? '[]', data.rules_json ?? '{}', data.directions_json ?? '{}', data.photos_json ?? '[]', data.sessions_json ?? '[]', data.hours_json ?? '{}', data.capacity_base ?? 2, data.capacity_max ?? 4, data.area ?? '', now, now).run();
  return r.meta.last_row_id as number;
}
export async function updateSpace(d: D1Database, id: number, data: Partial<SpaceRow>) {
  await d.prepare(`UPDATE spaces SET slug=?, region=?, address=?, lat=?, lng=?, name_json=?, tagline_json=?, desc_json=?, features_json=?, rules_json=?, directions_json=?, photos_json=?, sessions_json=?, hours_json=?, capacity_base=?, capacity_max=?, area=?, updated_at=? WHERE id=?`)
    .bind(data.slug, data.region ?? '', data.address ?? '', data.lat ?? null, data.lng ?? null, data.name_json ?? '{}', data.tagline_json ?? '{}', data.desc_json ?? '{}', data.features_json ?? '[]', data.rules_json ?? '{}', data.directions_json ?? '{}', data.photos_json ?? '[]', data.sessions_json ?? '[]', data.hours_json ?? '{}', data.capacity_base ?? 2, data.capacity_max ?? 4, data.area ?? '', nowIso(), id).run();
}
export async function updateSpaceStatus(d: D1Database, id: number, status: string, adminNote?: string) {
  if (adminNote !== undefined) await d.prepare('UPDATE spaces SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?').bind(status, adminNote, nowIso(), id).run();
  else await d.prepare('UPDATE spaces SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();
}
export async function updateSpacePhotos(d: D1Database, id: number, photosJson: string) {
  await d.prepare('UPDATE spaces SET photos_json = ?, updated_at = ? WHERE id = ?').bind(photosJson, nowIso(), id).run();
}
export async function deleteSpace(d: D1Database, id: number) {
  await d.prepare('DELETE FROM spaces WHERE id = ?').bind(id).run();
}

// ---------- 예약 요청 ----------
export async function createBooking(d: D1Database, b: Omit<BookingRow, 'id' | 'code' | 'created_at' | 'updated_at' | 'contact_key' | 'status'>) {
  const now = nowIso();
  for (let i = 0; i < 5; i++) {
    const code = 'RT-' + randomCode(6);
    try {
      const r = await d.prepare(`INSERT INTO bookings (code, space_slug, space_name, host_id, session_code, date, start_time, people, name, phone, email, lang, note, status, est_amount, contact_key, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(code, b.space_slug, b.space_name, b.host_id, b.session_code, b.date, b.start_time, b.people, b.name, b.phone, b.email, b.lang, b.note, 'requested', b.est_amount, [normalizeContact(b.phone), normalizeContact(b.email)].filter(Boolean).join('|'), now, now).run();
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
  return (await d.prepare('SELECT * FROM bookings WHERE host_id = ? ORDER BY created_at DESC LIMIT 300').bind(hostId).all<BookingRow>()).results;
}
export async function listAllBookings(d: D1Database, status?: string) {
  if (status) return (await d.prepare('SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC LIMIT 500').bind(status).all<BookingRow>()).results;
  return (await d.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500').all<BookingRow>()).results;
}
export async function updateBookingStatus(d: D1Database, id: number, status: string) {
  await d.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();
}
export async function listMessages(d: D1Database, bookingId: number) {
  return (await d.prepare('SELECT * FROM messages WHERE booking_id = ? ORDER BY created_at ASC').bind(bookingId).all<MessageRow>()).results;
}
export async function addMessage(d: D1Database, bookingId: number, sender: MessageRow['sender'], body: string) {
  await d.prepare('INSERT INTO messages (booking_id, sender, body, created_at) VALUES (?,?,?,?)').bind(bookingId, sender, body, nowIso()).run();
  await d.prepare('UPDATE bookings SET updated_at = ? WHERE id = ?').bind(nowIso(), bookingId).run();
}

// ---------- 문의 ----------
export async function createInquiry(d: D1Database, q: { kind: string; name: string; email: string; phone: string; topic: string; message: string }) {
  const r = await d.prepare('INSERT INTO inquiries (kind, name, email, phone, topic, message, status, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(q.kind, q.name, q.email, q.phone, q.topic, q.message, 'new', nowIso()).run();
  return r.meta.last_row_id as number;
}
export async function listInquiries(d: D1Database) {
  return (await d.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500').all<InquiryRow>()).results;
}
export async function getInquiry(d: D1Database, id: number) {
  return (await d.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first<InquiryRow>()) || null;
}
export async function updateInquiry(d: D1Database, id: number, status: string, reply: string) {
  await d.prepare('UPDATE inquiries SET status = ?, reply = ? WHERE id = ?').bind(status, reply, id).run();
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
    inquiriesNew: await q("SELECT COUNT(*) n FROM inquiries WHERE status='new'"),
  };
}
