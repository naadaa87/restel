// 레스텔 사이트 기본 설정 — 운영자가 GitHub에서 직접 수정해도 되는 값들입니다.
export const site = {
  name: 'RESTEL',
  nameKo: '레스텔',
  // 대표 주소: 공식 도메인 restel.kr (astro.config.mjs의 SITE_URL). 검색엔진에는 이 주소만 노출한다.
  url: String(import.meta.env.SITE || 'https://restel.kr').replace(/\/+$/, ''),
  domain: 'restel.kr',
  // 같은 사이트가 열리지만 검색에는 잡히지 않아야 하는 보조 주소(noindex 처리)
  secondaryHosts: ['www.restel.kr', 'restel.naadaa87.workers.dev'],
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
    naver: '1d3fe7f97742a1820db1f753c40de67d649976c9', // 네이버 서치어드바이저 HTML 태그 (2026-11-16)
    bing: '',      // Bing 웹마스터 도구 (msvalidate.01). 구글 서치콘솔에서 가져오기를 쓰면 비워 둬도 된다
    yandex: '',    // Yandex Webmaster (러시아어권) — yandex-verification 값
    baidu: '',     // Baidu 站长平台 (중국 본토) — baidu-site-verification 값
    daum: '',      // Daum 웹마스터도구 PIN 줄 전체 (예: '#DaumWebMasterTool:abcd...:userid') → robots.txt에 들어감
  },
  // IndexNow 키 — 네이버·빙에 새 글·수정 사항을 바로 알릴 때 쓴다. public/<키>.txt 파일과 짝을 이룬다(바꾸지 마세요)
  indexNowKey: '3d57aa9b549fbab261e74a73c9b2f2ca',
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

export type Locale = 'ko' | 'en' | 'ja' | 'zh-tw' | 'zh-cn' | 'th' | 'vi' | 'id' | 'ru' | 'es' | 'fr' | 'de';
// 방한객 상위 국가 기준 12개 언어 (2026-11: 인도네시아어·러시아어·스페인어·프랑스어·독일어 추가)
export const locales: Locale[] = ['ko', 'en', 'ja', 'zh-tw', 'zh-cn', 'th', 'vi', 'id', 'ru', 'es', 'fr', 'de'];
export const defaultLocale: Locale = 'ko';

export const localeMeta: Record<Locale, { label: string; native: string; hreflang: string; htmlLang: string; ogLocale: string; font?: string }> = {
  ko: { label: 'Korean', native: '한국어', hreflang: 'ko', htmlLang: 'ko', ogLocale: 'ko_KR' },
  en: { label: 'English', native: 'English', hreflang: 'en', htmlLang: 'en', ogLocale: 'en_US' },
  ja: { label: 'Japanese', native: '日本語', hreflang: 'ja', htmlLang: 'ja', ogLocale: 'ja_JP', font: 'Noto+Sans+JP:wght@400;500;700' },
  'zh-tw': { label: 'Chinese (Traditional)', native: '繁體中文', hreflang: 'zh-Hant', htmlLang: 'zh-Hant', ogLocale: 'zh_TW', font: 'Noto+Sans+TC:wght@400;500;700' },
  'zh-cn': { label: 'Chinese (Simplified)', native: '简体中文', hreflang: 'zh-Hans', htmlLang: 'zh-Hans', ogLocale: 'zh_CN', font: 'Noto+Sans+SC:wght@400;500;700' },
  th: { label: 'Thai', native: 'ไทย', hreflang: 'th', htmlLang: 'th', ogLocale: 'th_TH', font: 'Noto+Sans+Thai:wght@400;500;700' },
  vi: { label: 'Vietnamese', native: 'Tiếng Việt', hreflang: 'vi', htmlLang: 'vi', ogLocale: 'vi_VN', font: 'Noto+Sans:wght@400;500;700' },
  id: { label: 'Indonesian', native: 'Bahasa Indonesia', hreflang: 'id', htmlLang: 'id', ogLocale: 'id_ID' },
  ru: { label: 'Russian', native: 'Русский', hreflang: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU' },
  es: { label: 'Spanish', native: 'Español', hreflang: 'es', htmlLang: 'es', ogLocale: 'es_ES' },
  fr: { label: 'French', native: 'Français', hreflang: 'fr', htmlLang: 'fr', ogLocale: 'fr_FR' },
  de: { label: 'German', native: 'Deutsch', hreflang: 'de', htmlLang: 'de', ogLocale: 'de_DE' },
};
