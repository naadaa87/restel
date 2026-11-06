// 레스텔 사이트 기본 설정 — 운영자가 GitHub에서 직접 수정해도 되는 값들입니다.
export const site = {
  name: 'RESTEL',
  nameKo: '레스텔',
  // 대표 주소: Cloudflare 빌드 변수 SITE_URL로 바꾼다(도메인 연결 전에는 workers.dev 주소). astro.config.mjs 참고
  url: String(import.meta.env.SITE || 'https://restel.naadaa87.workers.dev').replace(/\/+$/, ''),
  // 연락처 (공개)
  contact: {
    email: 'spaceblank0100@gmail.com',
    phone: '010-2384-9580',
    kakao: 'https://pf.kakao.com/_mufLd',
    instagram: 'https://www.instagram.com/',
  },
  // 사업자 표시 (전자상거래법) — 운영 법인 확정 후 채워 주세요
  business: {
    company: '',            // 예: 주식회사 블랭크
    ceo: '',                // 대표자
    regNo: '',              // 사업자등록번호
    mailOrderNo: '',        // 통신판매업신고번호
    address: '서울특별시 서대문구 (신촌)',
  },
  // 검색엔진 소유 확인 메타 태그 값 (없으면 비워 두세요)
  verification: {
    google: '',
    naver: '',
    bing: '',
  },
  // Cloudflare Web Analytics 토큰 (대시보드 → Analytics & Logs → Web Analytics)
  cfAnalyticsToken: '',
  // 플래그십 지점 좌표 (지도 링크용)
  flagship: {
    slug: 'sinchon',
    lat: 37.5559,
    lng: 126.9368,
  },
  defaultOg: '/og/default.png',
};

export type Locale = 'ko' | 'en' | 'ja' | 'zh-tw' | 'zh-cn' | 'th' | 'vi';
export const locales: Locale[] = ['ko', 'en', 'ja', 'zh-tw', 'zh-cn', 'th', 'vi'];
export const defaultLocale: Locale = 'ko';

export const localeMeta: Record<Locale, { label: string; native: string; hreflang: string; htmlLang: string; ogLocale: string; font?: string }> = {
  ko: { label: 'Korean', native: '한국어', hreflang: 'ko', htmlLang: 'ko', ogLocale: 'ko_KR' },
  en: { label: 'English', native: 'English', hreflang: 'en', htmlLang: 'en', ogLocale: 'en_US' },
  ja: { label: 'Japanese', native: '日本語', hreflang: 'ja', htmlLang: 'ja', ogLocale: 'ja_JP', font: 'Noto+Sans+JP:wght@400;500;700' },
  'zh-tw': { label: 'Chinese (Traditional)', native: '繁體中文', hreflang: 'zh-Hant', htmlLang: 'zh-Hant', ogLocale: 'zh_TW', font: 'Noto+Sans+TC:wght@400;500;700' },
  'zh-cn': { label: 'Chinese (Simplified)', native: '简体中文', hreflang: 'zh-Hans', htmlLang: 'zh-Hans', ogLocale: 'zh_CN', font: 'Noto+Sans+SC:wght@400;500;700' },
  th: { label: 'Thai', native: 'ไทย', hreflang: 'th', htmlLang: 'th', ogLocale: 'th_TH', font: 'Noto+Sans+Thai:wght@400;500;700' },
  vi: { label: 'Vietnamese', native: 'Tiếng Việt', hreflang: 'vi', htmlLang: 'vi', ogLocale: 'vi_VN', font: 'Noto+Sans:wght@400;500;700' },
};
