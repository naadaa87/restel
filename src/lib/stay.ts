// 레스텔 스테이(1박2일, 숙박업 등록 지점 전용 트랙) 안내 문구
// 시간제 휴식 공간(레스텔)과 다른 트랙이라 숙박 어휘 검사 대상(src/i18n/locales)과 분리해 src/i18n/stay/에 둔다.
import type { Locale } from '@/config/site';

const files = import.meta.glob('../i18n/stay/*.json', { eager: true }) as Record<string, { default: any }>;
const byLang: Record<string, any> = {};
for (const [path, mod] of Object.entries(files)) byLang[path.split('/').pop()!.replace('.json', '')] = mod.default;

export function getStay(lang: Locale) {
  return { ...byLang.en, ...(byLang[lang] || {}), form: { ...byLang.en.form, ...((byLang[lang] || {}).form || {}) } };
}
