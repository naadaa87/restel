// 이메일 알림 — RESEND_API_KEY 가 있으면 Resend로 발송, 없으면 로그만 남김
export async function sendMail(env: any, opts: { to: string | string[]; subject: string; text: string; html?: string; replyTo?: string }) {
  const to = (Array.isArray(opts.to) ? opts.to : [opts.to]).filter(Boolean);
  if (!to.length) return { ok: false, skipped: true };
  if (!env?.RESEND_API_KEY) { console.log('[mail skipped]', opts.subject, to.join(',')); return { ok: false, skipped: true }; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'RESTEL <onboarding@resend.dev>', to, subject: opts.subject, text: opts.text, html: opts.html, reply_to: opts.replyTo }),
    });
    if (!res.ok) { console.error('resend error', res.status, await res.text()); return { ok: false }; }
    return { ok: true };
  } catch (e) { console.error('mail error', e); return { ok: false }; }
}

export async function notifyAdmin(env: any, subject: string, text: string) {
  if (!env?.ADMIN_EMAIL) return;
  return sendMail(env, { to: env.ADMIN_EMAIL, subject: `[RESTEL] ${subject}`, text });
}

export function bookingSummaryText(b: { code: string; space_name: string; session_code: string; date: string; start_time: string; people: number; name: string; phone: string; email: string; note: string; lang: string }, siteUrl: string) {
  return [
    `요청 번호: ${b.code}`,
    `공간: ${b.space_name}`,
    `세션: ${b.session_code}`,
    `날짜/시작: ${b.date} ${b.start_time} (KST)`,
    `인원: ${b.people}`,
    `이름: ${b.name}`,
    `연락처: ${b.phone || '-'} / ${b.email || '-'}`,
    `언어: ${b.lang}`,
    `요청: ${b.note || '-'}`,
    '',
    `조회: ${siteUrl}/my?code=${b.code}`,
  ].join('\n');
}
