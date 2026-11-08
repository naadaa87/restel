// 페이지별 검색 노출 문구(제목·설명·키워드)를 언어 파일의 seo 항목에서 꺼낸다.
// 값이 없으면 각 페이지가 원래 쓰던 제목·설명으로 돌아간다.
export type SeoKey = 'home' | 'about' | 'sessions' | 'spaces' | 'krest' | 'guide' | 'faq' | 'hosts' | 'contact' | 'journal' | 'sinchon';

export function pageSeo(t: any, key: SeoKey): { fullTitle?: string; description?: string; keywords?: string } {
  const s = t?.seo?.[key];
  if (!s) return {};
  return {
    fullTitle: s.title || undefined,
    description: s.description || undefined,
    keywords: Array.isArray(s.keywords) ? s.keywords.join(', ') : s.keywords || undefined,
  };
}
