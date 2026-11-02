import { defineMiddleware } from 'astro:middleware';
import { readSession, getCookie, cookieName } from '@/lib/auth';

// /host, /admin 보호. 로그인·가입·로그아웃은 예외
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const env = (context.locals as any)?.runtime?.env || {};
  // 끝 슬래시 제거 (정적 자산은 Cloudflare 설정이 처리)
  if (pathname.length > 1 && pathname.endsWith('/')) return context.redirect(pathname.slice(0, -1) + context.url.search, 301);
  // /ko/... → 접두어 없는 기본 경로로
  if (pathname === '/ko' || pathname.startsWith('/ko/')) return context.redirect(pathname.slice(3) || '/', 301);
  if (pathname === '/host' || pathname.startsWith('/host/')) {
    const open = ['/host/login', '/host/register', '/host/logout'];
    const s = await readSession(env, getCookie(context.request, cookieName('host')), 'host');
    if (s) (context.locals as any).host = { id: s.id, email: s.email, name: s.name || '' };
    if (!s && !open.includes(pathname)) return context.redirect('/host/login?next=' + encodeURIComponent(pathname), 302);
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const open = ['/admin/login', '/admin/logout'];
    const s = await readSession(env, getCookie(context.request, cookieName('admin')), 'admin');
    if (s) (context.locals as any).admin = { email: s.email };
    if (!s && !open.includes(pathname)) return context.redirect('/admin/login', 302);
  }
  return next();
});
