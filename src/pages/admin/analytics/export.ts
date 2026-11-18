// KPI 일별 CSV (엑셀에서 바로 열리도록 BOM 포함)
import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { dailyRows, kstDay, addDays } from '@/lib/analytics';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  if (!(locals as any).admin) return new Response('Unauthorized', { status: 401 });
  const d = await db(locals);
  if (!d) return new Response('DB unavailable', { status: 503 });
  const ok = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const today = kstDay();
  let from = url.searchParams.get('from'), to = url.searchParams.get('to');
  if (!ok(from) || !ok(to) || from! > to!) { to = today; from = addDays(today, -29); }
  if (addDays(from!, 400) < to!) from = addDays(to!, -400);
  const rows = await dailyRows(d, from!, to!);
  const head = ['날짜', '방문자', '방문 수', '페이지뷰', '페이지 평균 체류(초)', '클릭', '예약 요청', '문의', '스테이 알림 신청'];
  const lines = [head.join(','), ...rows.map((r) => [r.day, r.visitors, r.sessions, r.pv, r.avg_dur, r.clicks, r.booking, r.contact, r.stay].join(','))];
  return new Response('﻿' + lines.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="restel-kpi-${from}_${to}.csv"`, 'Cache-Control': 'no-store' },
  });
};
