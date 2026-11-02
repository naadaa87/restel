# 레스텔 RESTEL — 휴식 공간대여 플랫폼

**쉬러 가는 곳, 레스텔.** 시간 단위로 빌리는 한국식 휴식 공간대여(낮잠·명상·힐링·리프레시) 브랜드 사이트이자 예약 요청·호스트 입점·관리자 플랫폼입니다. 숙박시설이 아닌 "휴식 공간대여"라는 정체성을 모든 화면과 문구에 반영했습니다.

- 공개 사이트: 7개 언어(한국어·영어·일본어·중국어 번체/간체·태국어·베트남어), SEO(hreflang·사이트맵·구조화 데이터), 예약 요청, 요청 조회·메시지, 문의
- 호스트 포털(`/host`): 가입 → 공간 등록(다국어·세션·요금·사진) → 검토 요청 → 예약 요청 처리·고객 메시지
- 총괄 관리자(`/admin`): 호스트 승인, 공간 검토·공개, 예약 요청 전체 관리, 문의 답변, 설정, 변경 기록, CSV 내보내기
- 기술: Astro 5 + Cloudflare Workers(정적 자산) + D1(데이터베이스) + R2(사진). 서버 없이 GitHub → Cloudflare 자동 배포.

---

## 1. 처음 배포하기 (브라우저만으로, 약 15분)

### 1-1. Cloudflare에 저장소 연결
1. [Cloudflare 대시보드](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Import a repository**
2. GitHub 계정을 연결하고 `naadaa87/restel` 저장소를 선택
3. 빌드 설정
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/` (기본값)
4. **Save and Deploy** → 1~3분 뒤 `restel.<계정>.workers.dev` 주소가 생깁니다.

> D1 데이터베이스(`restel-db`)와 R2 버킷(`restel-media`)은 `wrangler.jsonc`에 ID 없이 선언되어 있어 **첫 배포 때 Wrangler가 자동으로 만들어 연결**합니다. 대시보드에서 따로 만들 필요가 없습니다. 테이블은 첫 요청 때 앱이 스스로 생성합니다.

### 1-2. 시크릿(비밀값) 등록 — 관리자 로그인에 필요
Worker → **Settings** → **Variables and Secrets** → **Add** (Type: Secret)

| 이름 | 값 | 필수 |
|---|---|---|
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | 필수 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (12자 이상 권장) | 필수 |
| `SESSION_SECRET` | 임의의 긴 문자열 (40자 이상, 아무 글자나) | 필수 |
| `RESEND_API_KEY` | [Resend](https://resend.com) API 키 — 예약·승인 알림 메일 발송 | 선택 |
| `MAIL_FROM` | 발신 주소, 예: `RESTEL <hello@restel.kr>` (Resend에서 도메인 인증 후) | 선택 |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` | Cloudflare Turnstile 봇 차단 키 | 선택 |

등록 후 **Deployments → 최신 배포 → Retry** 또는 GitHub에 아무 커밋을 올리면 반영됩니다.

### 1-3. 도메인 연결
Worker → **Settings** → **Domains & Routes** → **Add** → Custom domain → `restel.kr` (도메인의 네임서버가 Cloudflare여야 합니다).
그 다음 `wrangler.jsonc`의 `SITE_URL`과 `src/config/site.ts`의 `url`을 실제 도메인으로 바꿔 커밋하세요.

### 1-4. 첫 로그인
- 관리자: `https://도메인/admin/login` — 1-2에서 등록한 이메일·비밀번호
- 호스트: `https://도메인/host/register` 에서 가입 → 관리자가 `/admin/hosts`에서 승인

---

## 2. 운영 방법

| 하고 싶은 것 | 어디서 |
|---|---|
| 예약 요청 확인·확정·고객 메시지 | `/admin/bookings` (직영+파트너 전체), 파트너 호스트는 `/host/bookings` |
| 호스트 승인 | `/admin/hosts` |
| 호스트가 올린 공간 검토·공개 | `/admin/spaces` → 공간 → 상태를 "공개 중"으로 |
| 문의 답변 | `/admin/inquiries` |
| 호스트 공지·수수료율 | `/admin/settings` |
| 직영 신촌 지점 소개·가격·운영시간 | GitHub → `src/data/flagship.ts` 수정 후 커밋 (자동 배포) |
| 연락처·사업자 정보·검색 인증 코드·애널리틱스 | `src/config/site.ts` |
| 사이트 문구·번역 | `src/i18n/locales/ko.json` 등 7개 파일 (키 이름은 같게 유지) |
| 신촌 사진 교체 | `public/images/sinchon/` (가로 1400px WebP 권장) |
| 가이드 명상 오디오 | `public/audio/meditation-10-ko.mp3` 형식 (`public/audio/README.md`) |

GitHub 웹에서 파일을 열어 연필 아이콘으로 수정하고 **Commit changes**를 누르면 1~3분 뒤 사이트에 반영됩니다. 잘못 바꿨다면 GitHub의 커밋 기록에서 되돌리거나 Cloudflare **Deployments**에서 이전 버전으로 롤백할 수 있습니다.

### 예약 흐름
고객이 세션·날짜·시간을 골라 **예약 요청** → 관리자(직영) 또는 호스트(파트너)가 확인 후 상태를 **확정**으로 바꾸고 결제·입장 안내를 메시지로 전달 → 고객은 `/my`에서 요청번호+연락처로 상태와 메시지를 확인합니다. 온라인 결제·스마트락 자동화는 개발기획서의 Phase 2 범위입니다.

---

## 3. SEO 체크리스트 (배포 후 한 번)
1. **Google Search Console**: 도메인 등록 → 소유 확인 메타 값을 `src/config/site.ts`의 `verification.google`에 넣고 커밋 → 사이트맵 `https://도메인/sitemap.xml` 제출
2. **네이버 서치어드바이저**: 동일하게 `verification.naver` → 사이트맵 제출
3. **Bing 웹마스터**: `verification.bing`
4. **Google 비즈니스 프로필 / 네이버 스마트플레이스**: 카테고리는 "휴식 공간·공간대여"(숙박 아님), 사진 10장, 예약 링크 `https://도메인/book/sinchon`
5. **Cloudflare Web Analytics**: 대시보드에서 사이트 추가 → 토큰을 `cfAnalyticsToken`에 넣기
6. `npm run check:words` — 숙박 어휘(1박·체크인·객실 등)가 설명 문장에 섞이지 않았는지 검사

이미 적용된 것: 언어별 `<title>`·설명·키워드, hreflang(ko/en/ja/zh-Hant/zh-Hans/th/vi/x-default), canonical, Open Graph·Twitter 카드, JSON-LD(Organization·WebSite·LocalBusiness·FAQPage·HowTo·BreadcrumbList·Service), 동적 사이트맵, robots.txt, 끝 슬래시 정리, `/ko/...` 리다이렉트.

---

## 4. 폴더 구조
```
src/
  config/site.ts          사이트 설정(연락처·사업자·인증 코드)
  data/flagship.ts        직영 지점(신촌) 데이터·가격
  i18n/locales/*.json     7개 언어 문구
  i18n/index.ts           언어 유틸(경로·hreflang·환산액)
  layouts/Base.astro      공개 페이지 레이아웃(SEO 포함)
  layouts/Portal.astro    호스트·관리자 레이아웃
  views/*.astro           공개 페이지 본문
  pages/                  라우트 (ko 기본, [lang]/ 다국어, host/, admin/, api)
  lib/db.ts               D1 스키마(자동 생성)·쿼리
  lib/auth.ts             비밀번호 해시·서명 쿠키 세션
  lib/handlers.ts         예약 요청·문의·조회 처리
  lib/spaces.ts           직영/파트너 공간 통합 모델
public/                   로고·사진·OG 이미지·robots·_headers
scripts/check-forbidden-words.mjs  숙박 어휘 검사
wrangler.jsonc            Cloudflare 설정(D1·R2 자동 프로비저닝)
```

## 5. 로컬에서 실행 (개발자용, 선택)
```bash
npm install
cp .dev.vars.example .dev.vars   # 관리자 계정 등 입력
npm run build && npm run preview  # http://127.0.0.1:8788  (로컬 D1/R2 자동 생성)
```

## 6. 주의
- 이 사이트의 모든 문구는 "숙박시설이 아닌 휴식 공간대여" 원칙을 따릅니다. 상품명·안내문을 바꿀 때 1박·체크인·객실·침대 같은 단어를 쓰지 마세요(`npm run check:words`로 검사).
- `ADMIN_PASSWORD`, `SESSION_SECRET`은 절대 저장소에 커밋하지 않습니다(`.dev.vars`는 .gitignore에 포함).
- 가격·운영시간·취소 규정은 `src/data/flagship.ts`와 `src/i18n/locales/*.json`(sessions.rules, legal.refund)을 함께 맞춰 주세요.
