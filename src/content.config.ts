// 레스텔 저널(읽을거리) — 검색 유입용 글 모음
// 글은 src/content/journal/<언어>/<슬러그>.md 에 둔다. 같은 글의 언어별 버전은 슬러그를 똑같이 맞춘다.
// 숙박 어휘 금지 원칙은 글에도 똑같이 적용된다(npm run check:words).
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),                       // 본문 제목(H1)
    seoTitle: z.string().optional(),         // 검색 결과 제목(없으면 title)
    description: z.string(),                 // 검색 결과 설명(80~160자)
    keywords: z.array(z.string()).default([]),
    category: z.enum(['guide', 'area', 'travel', 'culture', 'brand']),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    hero: z.string(),                        // /images/... 경로
    heroAlt: z.string(),
    summary: z.array(z.string()).default([]), // 글머리 요약(3줄 안팎)
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    related: z.array(z.string()).default([]), // 함께 읽을 글 슬러그
    cta: z.enum(['sessions', 'krest', 'book', 'spaces', 'guide']).default('book'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal };
