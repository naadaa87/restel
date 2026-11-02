export const prerender = false;
import type { APIRoute } from 'astro';

// R2에 저장된 호스트 업로드 사진을 제공한다
export const GET: APIRoute = async ({ params, locals }) => {
  const bucket = (locals as any)?.runtime?.env?.MEDIA as R2Bucket | undefined;
  const key = params.key as string;
  if (!bucket || !key) return new Response('Not found', { status: 404 });
  const obj = await bucket.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (!headers.get('Content-Type')) headers.set('Content-Type', 'image/jpeg');
  return new Response(obj.body, { headers });
};
