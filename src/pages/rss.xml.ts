import type { APIRoute } from 'astro';
import { rssXml } from '@/lib/feeds';
export const prerender = true;
export const GET: APIRoute = async () => new Response(await rssXml('ko'), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
