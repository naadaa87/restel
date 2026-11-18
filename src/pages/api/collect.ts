// 방문 통계 수집 (홈페이지 방문자 브라우저 → 여기). 응답은 항상 204
import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { collect } from '@/lib/analytics';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const text = (await request.text()).slice(0, 4001); // 본문은 응답 전에 읽어 둔다
    const d = await db(locals);
    if (d) {
      const task = collect(d, request, locals, text).catch((e) => console.error('collect', e));
      const ctx = (locals as any)?.runtime?.ctx;
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
    }
  } catch (e) { console.error('collect', e); }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};

export const GET: APIRoute = () => new Response(null, { status: 405 });
