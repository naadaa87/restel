export const prerender = false;
import type { APIRoute } from 'astro';
import { db, getSpace, updateSpacePhotos, parseJson, audit } from '@/lib/db';
import { redirectWith, str, readUpload, extOf } from '@/lib/portal';
import { sameOrigin } from '@/lib/auth';
import { randomCode } from '@/lib/text';

export const POST: APIRoute = async ({ params, request, locals }) => {
  const me = (locals as any).host;
  const id = Number(params.id);
  const back = `/host/spaces/${id}`;
  const d = await db(locals);
  if (!d || !me) return redirectWith('/host/login');
  const space = await getSpace(d, id);
  if (!space || space.host_id !== me.id) return redirectWith('/host/spaces', undefined, '공간을 찾을 수 없습니다.');
  if (!sameOrigin(request)) return redirectWith(back, undefined, '잘못된 요청입니다.');
  const fd = await request.formData();
  const op = str(fd, 'op');
  const photos = parseJson<any[]>(space.photos_json, []);
  if (op === 'delete') {
    const i = Number(str(fd, 'index'));
    if (i >= 0 && i < photos.length) { photos.splice(i, 1); await updateSpacePhotos(d, id, JSON.stringify(photos)); }
    return redirectWith(back, '사진을 삭제했습니다.');
  }
  if (op === 'url') {
    const url = str(fd, 'url');
    if (!/^https?:\/\//.test(url)) return redirectWith(back, undefined, 'http(s)로 시작하는 이미지 URL을 입력해 주세요.');
    photos.push({ src: url, sm: url, alt: '' }); await updateSpacePhotos(d, id, JSON.stringify(photos));
    return redirectWith(back, '사진 URL을 추가했습니다.');
  }
  if (op === 'upload') {
    const bucket = (locals as any).runtime?.env?.MEDIA as R2Bucket | undefined;
    if (!bucket) return redirectWith(back, undefined, 'R2 저장소가 연결되지 않아 파일 업로드를 사용할 수 없습니다. URL 추가를 이용해 주세요.');
    const files = await readUpload(fd, 'photos');
    if (!files.length) return redirectWith(back, undefined, '업로드할 파일을 선택해 주세요.');
    let added = 0;
    for (const f of files.slice(0, 10)) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > 5 * 1024 * 1024) continue;
      const key = `spaces/${id}/${Date.now()}-${randomCode(5).toLowerCase()}.${extOf(f)}`;
      await bucket.put(key, f.stream(), { httpMetadata: { contentType: f.type } });
      photos.push({ src: `/media/${key}`, sm: `/media/${key}`, alt: '' }); added++;
    }
    if (photos.length > 12) photos.length = 12;
    await updateSpacePhotos(d, id, JSON.stringify(photos));
    await audit(d, `host:${me.email}`, 'space.photos', String(id), `+${added}`);
    return redirectWith(back, added ? `${added}장의 사진을 올렸습니다.` : undefined, added ? undefined : '올릴 수 있는 이미지가 없습니다(5MB 이하 이미지 파일만).');
  }
  return redirectWith(back);
};
