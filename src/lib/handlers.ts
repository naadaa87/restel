// 공개 페이지의 폼 처리(예약 요청·문의·요청 조회)
import type { Locale } from '@/config/site';
import { site } from '@/config/site';
import { localizePath } from '@/i18n';
import { db, createBooking, createInquiry, getBookingByCode, listMessages, addMessage, updateBookingStatus, normalizeContact, getHost, audit } from './db';
import { estimate, type SpaceView } from './spaces';
import { sendMail, notifyAdmin, bookingSummaryText } from './email';
import { sameOrigin } from './auth';

export type BookResult = { errors: string[]; values: Record<string, string>; dbUnavailable?: boolean };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export async function verifyTurnstile(env: any, request: Request, fd: FormData): Promise<boolean> {
  if (!env?.TURNSTILE_SECRET) return true;
  const token = str(fd, 'cf-turnstile-response');
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') }),
    });
    const j: any = await r.json();
    return !!j.success;
  } catch { return false; }
}

export async function handleBookingPost(ctx: { request: Request; locals: any; redirect: (url: string, status?: number) => Response }, lang: Locale, space: SpaceView, t: any): Promise<BookResult | Response> {
  const env = ctx.locals?.runtime?.env || {};
  const fd = await ctx.request.formData();
  const values: Record<string, string> = {};
  for (const k of ['session', 'date', 'start', 'people', 'name', 'contact', 'email', 'lang', 'note']) values[k] = str(fd, k);
  const errors: string[] = [];
  if (!sameOrigin(ctx.request)) errors.push('Invalid origin');
  if (!(await verifyTurnstile(env, ctx.request, fd))) errors.push('Bot check failed');
  if (fd.get('website')) errors.push('spam'); // honeypot
  const ses = space.sessions.find((s) => s.code === values.session);
  if (!ses) errors.push(t.book.session);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.push(t.book.date);
  if (!/^\d{2}:\d{2}$/.test(values.start)) errors.push(t.book.start);
  const people = Math.max(1, Math.min(Number(values.people || 2), space.capacityMax));
  if (!values.name) errors.push(t.book.name);
  if (!values.contact && !values.email) errors.push(t.book.contactOrEmail);
  if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.push(t.book.email);
  if (!fd.get('consent1') || !fd.get('consent2') || !fd.get('consent3')) errors.push(t.book.consent1);
  if (errors.length) return { errors, values };

  const d = await db(ctx.locals);
  if (!d) return { errors: [t.book.dbUnavailable], values, dbUnavailable: true };
  const est = ses ? estimate(space, ses.code, people, values.date) : 0;
  const { code } = await createBooking(d, {
    space_slug: space.slug, space_name: space.name, host_id: space.hostId, session_code: values.session, date: values.date, start_time: values.start,
    people, name: values.name.slice(0, 80), phone: values.contact.slice(0, 40), email: values.email.slice(0, 120), lang: values.lang || lang, note: values.note.slice(0, 1000), est_amount: est,
  });
  await audit(d, 'customer', 'booking.request', code, `${space.slug} ${values.date} ${values.start}`);
  // 알림: 운영자 + 호스트(파트너) + 고객(이메일이 있을 때)
  const summary = bookingSummaryText({ code, space_name: space.name, session_code: values.session, date: values.date, start_time: values.start, people, name: values.name, phone: values.contact, email: values.email, note: values.note, lang: values.lang || lang }, env.SITE_URL || site.url);
  const tasks: Promise<any>[] = [notifyAdmin(env, `새 예약 요청 ${code} · ${space.name}`, summary)];
  if (space.hostId) {
    const h = await getHost(d, space.hostId);
    if (h?.email) tasks.push(sendMail(env, { to: h.email, subject: `[RESTEL] 새 예약 요청 ${code} · ${space.name}`, text: summary + '\n\n호스트 포털: ' + (env.SITE_URL || site.url) + '/host/bookings' }));
  }
  if (values.email) {
    tasks.push(sendMail(env, { to: values.email, subject: `RESTEL · ${t.book.done.title} (${code})`, text: `${t.book.done.body.replace('{code}', code)}\n\n${(env.SITE_URL || site.url)}${localizePath('/my', lang)}?code=${code}\n\n${t.common.notLodging}` }));
  }
  await Promise.allSettled(tasks);
  return ctx.redirect(localizePath(`/book/done/${code}`, lang), 303);
}

export async function handleContactPost(ctx: { request: Request; locals: any }, t: any): Promise<{ done: boolean; error?: string; values: Record<string, string> }> {
  const env = ctx.locals?.runtime?.env || {};
  const fd = await ctx.request.formData();
  const values: Record<string, string> = {};
  for (const k of ['name', 'email', 'phone', 'topic', 'message']) values[k] = str(fd, k);
  if (!sameOrigin(ctx.request) || fd.get('website') || !(await verifyTurnstile(env, ctx.request, fd))) return { done: false, error: t.book.error, values };
  if (!values.name || !values.message || (!values.email && !values.phone)) return { done: false, error: t.book.contactOrEmail, values };
  const d = await db(ctx.locals);
  if (!d) return { done: false, error: t.book.dbUnavailable, values };
  await createInquiry(d, { kind: 'contact', name: values.name.slice(0, 80), email: values.email.slice(0, 120), phone: values.phone.slice(0, 40), topic: values.topic.slice(0, 40), message: values.message.slice(0, 3000) });
  await notifyAdmin(env, `새 문의 (${values.topic || 'contact'}) · ${values.name}`, `${values.name} / ${values.email} / ${values.phone}\n\n${values.message}`);
  return { done: true, values: {} };
}

export async function handleMyRequest(ctx: { request: Request; locals: any; url: URL }, t: any) {
  const d = await db(ctx.locals);
  let code = ctx.url.searchParams.get('code') || '';
  let contact = ctx.url.searchParams.get('contact') || '';
  let action = '';
  let body = '';
  if (ctx.request.method === 'POST') {
    const fd = await ctx.request.formData();
    code = str(fd, 'code') || code; contact = str(fd, 'contact') || contact; action = str(fd, 'action'); body = str(fd, 'body');
    if (!sameOrigin(ctx.request)) action = '';
  }
  const out: any = { code, contact, booking: null, messages: [], notFound: false, dbUnavailable: !d, posted: false };
  if (!d || !code) return out;
  const b = await getBookingByCode(d, code);
  if (!b) { out.notFound = true; return out; }
  // 연락처 확인: 조회 링크(이메일로 받은 code만)로도 열리도록 contact가 비어 있으면 허용하되, 메시지·취소는 contact 일치 필요
  const key = normalizeContact(contact);
  const matches = key && b.contact_key.split('|').includes(key);
  if (contact && !matches) { out.notFound = true; return out; }
  if (action === 'message' && body && matches) {
    await addMessage(d, b.id, 'customer', body.slice(0, 2000));
    out.posted = true;
    const env = ctx.locals?.runtime?.env || {};
    await notifyAdmin(env, `고객 메시지 ${b.code}`, body);
    if (b.host_id) { const h = await getHost(d, b.host_id); if (h?.email) await sendMail(env, { to: h.email, subject: `[RESTEL] 고객 메시지 ${b.code}`, text: body + `\n\n${site.url}/host/bookings/${b.id}` }); }
  }
  if (action === 'cancel' && matches && (b.status === 'requested' || b.status === 'confirmed')) {
    await updateBookingStatus(d, b.id, 'cancelled');
    await addMessage(d, b.id, 'customer', '[cancelled by customer]');
    await audit(d, 'customer', 'booking.cancel', b.code);
    b.status = 'cancelled';
  }
  out.booking = b; out.messages = await listMessages(d, b.id); out.canAct = !!matches;
  return out;
}
