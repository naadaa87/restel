import type { APIRoute } from 'astro';
import { rssXml } from '@/lib/feeds';
import { nonDefaultLocalePaths } from '@/i18n';
export const prerender = true;
export function getStaticPaths() { return nonDefaultLocalePaths(); }
export const GET: APIRoute = async ({ params }) => new Response(await rssXml(params.lang as any), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
