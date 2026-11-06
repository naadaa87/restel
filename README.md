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

> 현재 배포 주소: **https://restel.naadaa87.workers.dev** (2026-11 연결 완료). main 브랜치에 커밋이 올라가면 자동으로 다시 배포됩니다.

> D1 데이터베이스(`restel-db`)와 R2 버킷(`restel-media`)은 `wrangler.jsonc`에 ID 없이 선언되어 있어 **첫 배포 때 Wrangler가 자동으로 만들어 연결**합니다. 대시보드에서 따로 만들 필요가 없습니다. 테이블은 첫 요청 때 앱이 스스로 생성합니다.

### 1-2. 시크릿(비밀값) 등록 — 관리자 로그인에 필요
Worker → **Settings** → **Variables and Secrets** → **Add** (Type: Secret)

| 이름 | 값 | 필수 |
|---|---|---|
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | 필수 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (12자 이상 권장) | 필수 |
| `SESSION_SECRET` | 임의의 긴 문자열. 넣지 않으면 첫 로그인 때 무작위 키를 만들어 D1에 보관합니다 | 선택 |
| `RESEND_API_KEY` | [Resend](https://resend.com) API 키 — 예약·승인 알림 메일 발송 | 선택 |
| `MAIL_FROM` | 발신 주소, 예: `RESTEL <hello@restel.kr>` (Resend에서 도메인 인증 후) | 선택 |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` | Cloudflare Turnstile 봇 차단 키 | 선택 |

대시보드에서 시크릿을 저장하면 그 자리에서 새 버전이 배포되므로 따로 재배포할 필요는 없습니다. 시크릿은 이후 GitHub 자동 배포 때도 그대로 유지됩니다.

> 시크릿은 **Secret** 타입으로 넣어야 합니다. 일반 Variable(Text) 타입으로 넣으면 다음 GitHub 자동 배포 때 `wrangler.jsonc`에 없는 값으로 간주되어 지워집니다.

### 1-3. 도메인 연결
1. 도메인을 Cloudflare에 추가합니다(도메인의 네임서버가 Cloudflare여야 합니다). 2026-11 기준 restel.kr은 이 계정에 없습니다.
2. Worker → **Domains** 탭 → **Add Domain** → 예: `restel.kr`
3. Worker → **Settings** → **Build** → **Variables and secrets** → **Add** → 이름 `SITE_URL`, 값 `https://restel.kr`
4. **Deployments**에서 최신 빌드 → **Retry build**. canonical·사이트맵·OG·robots.txt·알림 메일 링크가 모두 새 주소로 바뀝니다. 코드 수정은 필요 없습니다.
5. 새 주소가 열리는 것을 확인한 뒤 **Domains** 탭에서 workers.dev 주소를 꺼 두면 검색엔진에 주소가 둘로 잡히지 않습니다.

### 1-4. 첫 로그인
- 관리자: `https://도메인/admin/login` — 1-2에서 등록한 이메일·비밀번호
- 호스트: `https://도메인/host/register` 에서 가입 → 관리자가 `/admin/hosts`에서 승인

---

## 2. 운영 방법

| 하고 싶은 것 | 어디서 |
|---|---|
| 예약 확인·확정·결제·입장 안내·고객 메시지 | 파트너 호스트는 `/host/bookings` (달력 `/host/bookings/calendar`), 직영·전체는 `/admin/bookings` |
| 호스트 심사(사업 정보·서약·결제 계좌) 승인 | `/admin/hosts` → 호스트 → 심사 결정 |
| 호스트가 올린 공간 검토·공개 | `/admin/spaces` → 공간 → 자가 점검 결과 확인 → 상태를 "공개 중"으로 |
| 월별 정산서 발행·지급 완료 | `/admin/settlements` (완료된 세션 매출 × 수수료율) |
| 호스트 공지 작성 | `/admin/notices` (호스트 대시보드·호스트 센터에 표시) |
| 고객 문의·호스트 1:1 문의 답변 | `/admin/inquiries` (호스트 문의 탭) |
| 공지 배너·수수료율 | `/admin/settings` |
| 직영 신촌 지점 소개·가격·운영시간 | GitHub → `src/data/flagship.ts` 수정 후 커밋 (자동 배포) |
| 연락처·사업자 정보·검색 인증 코드·애널리틱스 | `src/config/site.ts` |
| 사이트 문구·번역 | `src/i18n/locales/ko.json` 등 7개 파일 (키 이름은 같게 유지) |
| 신촌 사진 교체 | `public/images/sinchon/` (가로 1400px WebP 권장) |
| 가이드 명상 오디오 | `public/audio/meditation-10-ko.mp3` 형식 (`public/audio/README.md`) |

GitHub 웹에서 파일을 열어 연필 아이콘으로 수정하고 **Commit changes**를 누르면 1~3분 뒤 사이트에 반영됩니다. 잘못 바꿨다면 GitHub의 커밋 기록에서 되돌리거나 Cloudflare **Deployments**에서 이전 버전으로 롤백할 수 있습니다.

### 예약 흐름 (파트너 호스트)
고객 **요청** → 호스트가 24시간 안에 **확정**(금액·결제 방법 지정, 고객 언어 안내문 자동 작성) 또는 불가 → **결제 안내** 발송(계좌이체) 또는 현장 결제 예정 → **입금 확인** → **입장 안내**(주소·도어락, 공간 설정의 입장 안내문 자동 삽입) → 세션 → **이용 완료**(현장 결제는 이 때 금액 입력) → 월별 **정산**. 고객은 `/my`에서 요청번호+연락처로 상태·결제 안내·메시지를 확인합니다. 온라인 카드 결제(토스페이먼츠)·스마트락 자동화는 Phase 2 범위이며, 결제 방법 선택지에 "카드(온라인)"이 준비되어 있습니다.

### 호스트 기능 한눈에
- **가입(4단계)**: 계정 → 사업·공간 정보 → 레스텔 운영 기준 7개 서약(모두 필수) → 가입. 승인 대기 중에도 공간 등록·사진·세션·기준 점검을 끝낼 수 있고, 대시보드의 "시작하기" 진행도가 안내합니다.
- **공간**: 기본 정보 / 7개 언어 소개 / 세션·요금 / 운영·안내(휴무 요일·휴무일·정리 시간·입장 안내문) / 레스텔 기준 자가 점검(필수 ● 항목 미충족 시 검토 요청 불가) / 사진(3장 이상).
- **예약**: 상태·결제 필터, 답장 필요·결제 미완료·입장 안내 전·지난 세션 처리 필터, 월 달력(휴무일 빗금), 요청별 단계형 처리 화면과 7개 언어 메시지 템플릿, 내부 메모, 진행 기록.
- **정산**: 월별 완료 매출·수수료·정산액, 세션별 내역, 정산서 상태. 설정에서 고객 결제 방법(계좌이체·현장)·입금 계좌·입금 기한·환불 규정·정산 계좌·세금 처리를 등록.
- **호스트 센터**: 운영 가이드(기준·공간 구성·세션 운영·안전·사진·응대·정산·FAQ), 공지, 1:1 문의, 자료실(로고, 인쇄용 공간 안내문·일일 점검표·안전 점검표).

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
  data/messageTemplates.ts 호스트→고객 안내 템플릿(7개 언어)
  data/hostGuide.ts       호스트 센터 운영 가이드 본문
  lib/db.ts               D1 스키마(자동 생성·누락 열 자동 추가)·쿼리
  lib/portal.ts           포털 공통(상태 라벨·서약/점검 항목·달력·폼 변환)
  lib/auth.ts             비밀번호 해시·서명 쿠키 세션
  lib/handlers.ts         예약 요청·문의·조회 처리
  lib/spaces.ts           직영/파트너 공간 통합 모델
public/                   로고·사진·OG 이미지·robots·_headers
scripts/check-forbidden-words.mjs  숙박 어휘 검사
scripts/i18n-hosts-patch.py        호스트 안내 문구 7개 언어 일괄 반영(1회성, 재실행 시 같은 키를 덮어씀)
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
