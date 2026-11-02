// 비밀번호 해시(PBKDF2) + 서명 쿠키 세션 (외부 서비스 불필요)
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$100000$${b64url(salt)}$${b64url(bits)}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, iterStr, saltB, hashB] = stored.split('$');
    if (algo !== 'pbkdf2') return false;
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromB64url(saltB), iterations: Number(iterStr), hash: 'SHA-256' }, key, 256);
    const a = new Uint8Array(bits), b = fromB64url(hashB);
    if (a.length !== b.length) return false;
    let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch { return false; }
}

export function sessionSecret(env: any): string {
  return env?.SESSION_SECRET || (env?.ADMIN_PASSWORD ? 'derived::' + env.ADMIN_PASSWORD : 'restel-dev-only-secret');
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export type Session = { t: 'host' | 'admin'; id?: number; email: string; name?: string; exp: number };

export async function signSession(env: any, s: Session): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify(s)));
  const sig = await hmac(sessionSecret(env), payload);
  return `${payload}.${sig}`;
}
export async function readSession(env: any, token: string | undefined | null, type: 'host' | 'admin'): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expect = await hmac(sessionSecret(env), payload);
  if (expect !== sig) return null;
  try {
    const s = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Session;
    if (s.t !== type || s.exp < Date.now()) return null;
    return s;
  } catch { return null; }
}

export function cookieName(type: 'host' | 'admin') { return type === 'host' ? 'restel_host' : 'restel_admin'; }

export function setCookieHeader(name: string, value: string, maxAgeSec: number, secure: boolean) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure ? '; Secure' : ''}`;
}
export function clearCookieHeader(name: string) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getCookie(request: Request, name: string): string | null {
  const c = request.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/** 같은 출처에서 온 POST인지 확인 (CSRF 완화) */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // 일부 브라우저·폼은 Origin을 보내지 않음
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export function adminCredsOk(env: any, email: string, password: string) {
  const e = (env?.ADMIN_EMAIL || '').toLowerCase().trim();
  const p = env?.ADMIN_PASSWORD || '';
  if (!e || !p) return { ok: false, reason: 'ADMIN_EMAIL / ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.' };
  return { ok: email.toLowerCase().trim() === e && password === p, reason: '' };
}
