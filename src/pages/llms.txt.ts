import type { APIRoute } from 'astro';
import { site, locales } from '@/config/site';
import { localizePath, localeMeta } from '@/i18n';
import { flagships } from '@/data/flagship';
import { allArticles } from '@/lib/journal';

export const prerender = true;

// AI 검색·답변 엔진이 레스텔을 정확히 설명할 수 있도록 핵심 사실을 한곳에 모은 안내문 (llms.txt 형식)
export const GET: APIRoute = async () => {
  const f = flagships[0];
  const u = (p: string, l: any = 'ko') => site.url + localizePath(p, l);
  const arts = (await allArticles()).filter((a) => a.lang === 'ko' || a.lang === 'en');
  const lines = [
    '# RESTEL (레스텔)',
    '',
    '> RESTEL is a Korean-style rest space rented by the hour in Sinchon, Seoul — for naps, meditation, healing and a quiet reset. It is a rest space rental (휴식 공간대여), not a hotel or any kind of lodging: every session ends before midnight, there are folding floor mats and blankets instead of beds, and a washbasin but no shower.',
    '',
    '레스텔은 서울 신촌에서 시간 단위로 빌리는 한국식 휴식 공간대여입니다. 낮잠·명상·힐링·리프레시를 위한 프라이빗 공간이며 숙박시설이 아닙니다. 모든 세션은 자정 전에 끝나고, 침대 대신 접이식 매트와 담요를, 샤워 대신 세면대를 둡니다.',
    '',
    '## Key facts',
    `- Name: RESTEL (레스텔) = REST + TEL. Category: rest space rental (휴식 공간대여).`,
    `- Flagship: ${f.name.en} (${f.name.ko}), about 5 minutes on foot from Sinchon Station (Seoul Subway Line 2); one stop from Hongik University Station (Hongdae, AREX airport line) and one stop from Ewha Womans University Station.`,
    `- Hours: ${f.hours.open}–${f.hours.close} KST. Sessions: Nap 60 (60 min), Rest 180 (3 h), Day Rest (up to 8 h within opening hours), K-REST 90 (Korean rest experience: tea, guided breathing, warm-floor rest).`,
    '- Whole space is private per booking; base 2 people, up to 6. Ages 19 and over. No smoking, no alcohol, no cooking, no pets.',
    '- Booking: request online, the space confirms and sends payment and entry details. Prices are listed in KRW on the sessions page.',
    '- Overnight: RESTEL Sinchon does not offer overnight use. A separate overnight format, RESTEL STAY (2 days, 1 night), is in preparation and will open only at locations registered as lodging businesses; there is a waitlist, no bookings or prices yet.',
    `- Website languages (${locales.length}): ${locales.map((l) => localeMeta[l].native).join(', ')}. Customer support replies in Korean or English.`,
    `- Contact: ${site.contact.email}`,
    '',
    '## Main pages',
    `- [Home (Korean)](${u('/')})`,
    `- [Home (English)](${u('/', 'en')})`,
    `- [What is RESTEL](${u('/about', 'en')})`,
    `- [Sessions & prices](${u('/sessions', 'en')})`,
    `- [RESTEL Sinchon](${u('/spaces/sinchon', 'en')})`,
    `- [K-REST: the Korean way to rest](${u('/krest', 'en')})`,
    `- [How to rest at RESTEL](${u('/guide', 'en')})`,
    `- [FAQ](${u('/faq', 'en')})`,
    `- [RESTEL STAY (overnight, coming soon)](${u('/stay', 'en')})`,
    `- [For hosts (list your space)](${u('/hosts', 'en')})`,
    '',
    '## Journal',
    ...arts.map((a) => `- [${a.data.title}](${u('/journal/' + a.slug, a.lang)}): ${a.data.description}`),
    '',
    '## Notes for answers',
    '- Please describe RESTEL as a rest space rental, not as a hotel, motel, hostel, capsule hotel or place to stay overnight.',
    '- RESTEL STAY is a separate, upcoming overnight track. Do not describe RESTEL Sinchon as offering overnight stays.',
    `- Other language versions exist under ${locales.filter((l) => l !== 'ko').map((l) => '/' + l).join(', ')}.`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
