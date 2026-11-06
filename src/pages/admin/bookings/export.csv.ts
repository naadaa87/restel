export const prerender = false;
import type { APIRoute } from 'astro';
import { db, listAllBookings } from '@/lib/db';

export const GET: APIRoute = async ({ locals }) => {
  if (!(locals as any).admin) return new Response('Unauthorized', { status: 401 });
  const d = await db(locals);
  if (!d) return new Response('DB unavailable', { status: 503 });
  const rows = await listAllBookings(d);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['code', 'status', 'payment_status', 'payment_method', 'space_slug', 'space_name', 'host_id', 'session_code', 'date', 'start_time', 'people', 'name', 'phone', 'email', 'lang', 'est_amount', 'amount_due', 'paid_amount', 'paid_at', 'refund_amount', 'settlement_id', 'note', 'created_at'];
  const csv = '﻿' + [head.join(','), ...rows.map((r: any) => head.map((h) => esc(r[h])).join(','))].join('\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="restel-bookings-${new Date().toISOString().slice(0, 10)}.csv"` } });
};
