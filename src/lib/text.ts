/** "{name}" 형태의 자리표시자를 치환 */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return String(template ?? '').replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'space';
}

export function nowIso() { return new Date().toISOString(); }

export function fmtDate(iso: string | null | undefined, lang = 'ko') {
  if (!iso) return '';
  try {
    const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + (iso.length <= 10 ? 'T00:00:00' : ''));
    return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : lang, { dateStyle: 'medium', timeStyle: iso.length > 10 ? 'short' : undefined, timeZone: 'Asia/Seoul' }).format(d);
  } catch { return iso; }
}

export function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const arr = new Uint8Array(len); crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}
