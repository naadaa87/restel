# 레스텔 RESTEL — 휴식 공간대여 플랫폼

**쉬러 가는 곳, 레스텔.** 시간 단위로 빌리는 한국식 휴식 공간대여(낮잠·명상·힐링·리프레시) 브랜드 사이트이자 예약 요청·호스트 입점·관리자 플랫폼입니다. 숙박시설이 아닌 "휴식 공간대여"라는 정체성을 모든 화면과 문구에 반영했습니다.

- 공개 사이트: 12개 언어(한국어·영어·일본어·중국어 번체/간체·태국어·베트남어·인도네시아어·러시아어·스페인어·프랑스어·독일어), SEO(hreflang·사이트맵·구조화 데이터), 예약 요청, 요청 조회·메시지, 문의
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

> 대표 주소: **https://restel.kr** (2026-11 도메인 구매). 보조 주소 https://restel.naadaa87.workers.dev 도 계속 열리지만 검색엔진에는 noindex로 숨깁니다. main 브랜치에 커밋이 올라가면 자동으로 다시 배포됩니다.

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

### 1-3. 도메인 연결 (restel.kr)
코드는 이미 `https://restel.kr`을 대표 주소로 쓰도록 바뀌어 있습니다(canonical·hreflang·사이트맵·RSS·OG·알림 메일 링크). `SITE_URL` 빌드 변수는 넣지 않아도 됩니다.
1. 도메인 등록 업체(가비아 등)에서 restel.kr의 **네임서버**를 Cloudflare가 알려 준 두 개로 바꿉니다. Cloudflare 화면의 도메인 상태가 **Active**가 될 때까지 기다립니다(보통 수십 분~몇 시간).
2. Worker `restel` → **Settings → Domains & Routes → Add → Custom domain** → `restel.kr` 추가. 같은 방법으로 `www.restel.kr`도 추가합니다.
3. https://restel.kr 이 열리는지 확인합니다. `www.restel.kr`과 workers.dev 주소는 열리긴 하지만 `X-Robots-Tag: noindex`가 붙어 검색 결과에 나오지 않고, 동적 페이지는 www에서 restel.kr로 넘어갑니다.
4. (선택) www를 완전히 넘기려면 Cloudflare → restel.kr → **Rules → Redirect Rules → 템플릿 "Redirect from WWW to root"** 를 켭니다.
5. (선택) **Email Routing**에서 `hello@restel.kr` → 대표 메일로 전달을 켜 두면 사이트 연락처를 도메인 메일로 바꿀 수 있습니다(`src/config/site.ts`의 `contact.email`).

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
| 사이트 문구·번역 | `src/i18n/locales/ko.json` 등 12개 파일 (키 이름은 같게 유지, 빠진 키는 영어로 표시) |
| 레스텔 스테이(1박2일, 오픈 준비) 안내 문구 | `src/i18n/stay/<언어>.json` — 사전 알림 신청은 `/admin/inquiries`에 "레스텔 스테이" 주제로 들어옴 |
| 신촌 사진 교체 | `public/images/sinchon/` (가로 1400px WebP 권장) |
| 가이드 명상 오디오 | `public/audio/meditation-10-ko.mp3` 형식 (`public/audio/README.md`) |
| 레스텔 저널(읽을거리) 글 추가·수정 | `src/content/journal/<언어>/<슬러그>.md` (아래 3-1 참고) |
| 페이지별 검색 제목·설명·키워드 | `src/i18n/locales/*.json`의 `seo` 항목 |
| 검색엔진에 새 글 알리기 | `/admin/settings` → "검색엔진에 알리기 (IndexNow)" |
| 방문자·페이지·유입 경로·국가·전환 등 KPI | `/admin/analytics` (아래 "KPI 화면 보는 법") |

GitHub 웹에서 파일을 열어 연필 아이콘으로 수정하고 **Commit changes**를 누르면 1~3분 뒤 사이트에 반영됩니다. 잘못 바꿨다면 GitHub의 커밋 기록에서 되돌리거나 Cloudflare **Deployments**에서 이전 버전으로 롤백할 수 있습니다.

### 예약 흐름 (파트너 호스트)
고객 **요청** → 호스트가 24시간 안에 **확정**(금액·결제 방법 지정, 고객 언어 안내문 자동 작성) 또는 불가 → **결제 안내** 발송(계좌이체) 또는 현장 결제 예정 → **입금 확인** → **입장 안내**(주소·도어락, 공간 설정의 입장 안내문 자동 삽입) → 세션 → **이용 완료**(현장 결제는 이 때 금액 입력) → 월별 **정산**. 고객은 `/my`에서 요청번호+연락처로 상태·결제 안내·메시지를 확인합니다. 온라인 카드 결제(토스페이먼츠)·스마트락 자동화는 Phase 2 범위이며, 결제 방법 선택지에 "카드(온라인)"이 준비되어 있습니다.

### KPI 화면 보는 법 (`/admin/analytics`)
관리자 상단 메뉴 **KPI**. 기간(오늘·어제·7일·30일·90일·이번 달·직접 지정)을 고르면 직전 같은 길이의 기간과 비교해 보여 줍니다. 한국 시간 기준입니다.

| 묶음 | 보는 것 |
|---|---|
| 핵심 지표 | 방문자, 방문 수, 페이지뷰, 방문당 페이지, 평균 방문 시간, 이탈률, 클릭 수, 예약 요청 전환율 (직전 기간 대비 ▲▼) |
| 추이 | 일별(하루만 고르면 시간대별) 방문자·페이지뷰·방문 수·평균 체류. "표로 보기"로 숫자 확인 |
| 이번 달 목표 | 월 방문자·예약 요청·전환율 목표를 입력하면 달성률과 월말 예상치를 보여 줌 |
| 전환·퍼널 | 예약 요청(확정 포함)·문의·스테이 알림·호스트 가입 수, 방문 → 상품 정보 → 예약 작성 → 예약 완료 단계별 비율 |
| 콘텐츠 | 인기 페이지(언어 통합), 정보 종류별 조회, 저널 글 순위(평균 체류·끝까지 읽은 비율·읽힌 언어), 404 주소 |
| 방문자 | 국가·도시, 사이트 언어·브라우저 언어, 기기·운영체제·브라우저(카카오톡·네이버 앱 인앱 구분), 시간대·요일 |
| 유입 | 검색(네이버·구글·빙·다음·얀덱스·바이두)·SNS·AI 검색·지도·다른 사이트·직접 방문, UTM 캠페인 |
| 행동 | 많이 누른 버튼·링크, 첫 페이지(진입)와 이탈률, 마지막 페이지 |

- **CSV 내려받기**: 일별 방문자·방문·페이지뷰·체류·클릭·전환을 엑셀로 엽니다.
- **집계 방식**: 쿠키 없이 익명 집계(방문자 구분값은 매일 바뀌고 IP는 저장 안 함), 관리자·호스트로 로그인한 브라우저와 검색 로봇 제외, 약 13개월 보관. 개인정보처리방침에 해당 문구를 넣어 두었습니다.
- **내 방문 빼기**: 로그인하지 않은 개인 기기에서 KPI 화면을 열고 "이 브라우저 집계 제외"를 누르면 그 브라우저는 집계하지 않습니다.
- **캠페인 링크**: 인스타그램·네이버 플레이스·제휴 글에는 `https://restel.kr/?utm_source=instagram&utm_medium=profile&utm_campaign=open`처럼 꼬리표를 붙이면 유입 경로에서 따로 보입니다.
- 검색어(어떤 단어로 찾아왔는지)는 네이버 서치어드바이저·구글 서치콘솔에서 확인합니다.

### 호스트 기능 한눈에
- **가입(4단계)**: 계정 → 사업·공간 정보 → 레스텔 운영 기준 7개 서약(모두 필수) → 가입. 승인 대기 중에도 공간 등록·사진·세션·기준 점검을 끝낼 수 있고, 대시보드의 "시작하기" 진행도가 안내합니다.
- **공간**: 기본 정보 / 12개 언어 소개 / 세션·요금 / 운영·안내(휴무 요일·휴무일·정리 시간·입장 안내문) / 레스텔 기준 자가 점검(필수 ● 항목 미충족 시 검토 요청 불가) / 사진(3장 이상).
- **예약**: 상태·결제 필터, 답장 필요·결제 미완료·입장 안내 전·지난 세션 처리 필터, 월 달력(휴무일 빗금), 요청별 단계형 처리 화면과 12개 언어 메시지 템플릿, 내부 메모, 진행 기록.
- **정산**: 월별 완료 매출·수수료·정산액, 세션별 내역, 정산서 상태. 설정에서 고객 결제 방법(계좌이체·현장)·입금 계좌·입금 기한·환불 규정·정산 계좌·세금 처리를 등록.
- **호스트 센터**: 운영 가이드(기준·공간 구성·세션 운영·안전·사진·응대·정산·FAQ), 공지, 1:1 문의, 자료실(로고, 인쇄용 공간 안내문·일일 점검표·안전 점검표).

---

## 3. SEO·검색 등록 체크리스트 (도메인 연결 후 한 번)
국내 포털과 외국인이 많이 쓰는 검색엔진을 순서대로 등록합니다. 사이트맵은 하나(`https://restel.kr/sitemap.xml`)에 12개 언어 주소가 모두 들어 있고, RSS는 언어별로 있습니다.

| 순서 | 검색엔진 | 누가 보나 | 할 일 |
|---|---|---|---|
| 1 | **네이버 서치어드바이저** | 국내 | 소유 확인 값은 이미 반영됨(메타 태그 + `naver89c45e2a1d9f32b8dff1556c96aabbda.html` 파일). 도메인이 열리면 **소유확인** 버튼 → **요청 > 사이트맵 제출** `https://restel.kr/sitemap.xml` → **RSS 제출** `https://restel.kr/rss.xml` → 웹 페이지 수집 요청에 홈·세션·신촌 페이지 |
| 2 | **Google Search Console** | 국내·해외 전체 | "도메인" 속성으로 `restel.kr` 추가 → Cloudflare DNS TXT로 소유 확인 → 사이트맵 제출. 국제 타기팅은 hreflang으로 처리되어 따로 설정할 것 없음 |
| 3 | **Bing 웹마스터** | 미국·유럽, ChatGPT 검색, DuckDuckGo·Yahoo | Search Console에서 가져오기로 등록(또는 `verification.bing`) → 사이트맵 제출 |
| 4 | **IndexNow** | 네이버·빙·얀덱스·Seznam | 소유 확인이 끝나면 `/admin/settings` → "지금 알리기". 새 글을 올릴 때마다 한 번 |
| 5 | **Yandex Webmaster** | 러시아·중앙아시아 | `webmaster.yandex.com` → 사이트 추가 → 메타 태그 값을 `verification.yandex`에 넣고 커밋 → 사이트맵 제출 |
| 6 | **다음 웹마스터도구** | 국내(다음·카카오) | `webmaster.daum.net` → 사이트 등록 → 발급된 PIN 줄 전체를 `verification.daum`에 넣고 커밋(robots.txt에 자동 추가) |
| 7 | **Baidu 站长平台** | 중국 본토 | 중국 휴대폰 인증이 필요해 선택 사항. 가능하면 `verification.baidu`에 메타 값 입력. 중화권 방문객은 구글·빙 비중도 높음 |
| 8 | **Google 비즈니스 프로필 / 네이버 스마트플레이스 / 카카오맵** | 지도 검색 | 카테고리는 "휴식 공간·공간대여"(숙박 아님), 사진 10장, 홈페이지 `https://restel.kr`, 예약 링크 `https://restel.kr/book/sinchon`. 구글 프로필 설명은 영어로도 |
| 9 | **Cloudflare Web Analytics** | — | 사이트 추가 → 토큰을 `cfAnalyticsToken`에 |

등록 후 `npm run check:words`로 숙박 어휘(1박·체크인·객실 등)가 설명 문장·저널 글에 섞이지 않았는지 확인합니다. "레스텔 스테이 / RESTEL STAY"가 들어간 줄은 예외로 둡니다(오픈 준비 중인 별도 트랙).

이미 적용된 것: 12개 언어 페이지와 언어별 `<title>`·설명·키워드(`seo` 항목), hreflang(ko/en/ja/zh-Hant/zh-Hans/th/vi/id/ru/es/fr/de/x-default, 글마다 실제 있는 언어만), 브라우저 언어 감지 배너, canonical, Open Graph·Twitter 카드, JSON-LD(Organization·WebSite·LocalBusiness·FAQPage·HowTo·BreadcrumbList·Service·BlogPosting·CollectionPage·WebPage), 이미지 포함 동적 사이트맵, 언어별 RSS(`/rss.xml`, `/en/rss.xml` …), AI 검색용 `/llms.txt`, IndexNow 키 파일, robots.txt, 보조 주소(www·workers.dev) noindex, 끝 슬래시 정리, `/ko/...` 리다이렉트, 네이버·구글·빙·얀덱스·바이두·다음 인증 칸.

### 3-1. 레스텔 저널(읽을거리) 글 쓰는 법
- 위치: `src/content/journal/<언어>/<슬러그>.md` — 언어는 `ko`·`en`·`ja`·`zh-tw`·`zh-cn`·`th`·`vi`·`id`·`ru`·`es`·`fr`·`de`. 같은 글의 언어별 버전은 **슬러그(파일 이름)를 똑같이** 맞춥니다. 일부 언어에만 있는 글도 됩니다(예: 한국어 전용 `campus-break-sinchon`).
- 맨 위 `---` 사이에 제목(`title`), 검색 제목(`seoTitle`), 설명(`description`, 80~160자), 키워드, 분류(`guide`·`area`·`travel`·`culture`·`brand`), 게시일, 대표 사진, 요약, FAQ, 함께 읽을 글, 하단 버튼(`cta`)을 적습니다. 기존 글 하나를 복사해서 고치는 것이 가장 쉽습니다.
- 본문은 마크다운(`##` 소제목, `-` 목록, 표)입니다. 다른 글 링크는 언어 경로를 붙여 씁니다(한국어 `/journal/...`, 영어 `/en/journal/...`).
- 저장하면 목록·사이트맵·RSS·hreflang이 자동으로 갱신됩니다. 배포 후 `/admin/settings`에서 IndexNow "지금 알리기"를 눌러 주세요.
- 효능 주장(수면 유도·불면 해소 등)과 숙박 어휘는 쓰지 않습니다.

---

## 4. 폴더 구조
```
src/
  config/site.ts          사이트 설정(연락처·사업자·인증 코드)
  data/flagship.ts        직영 지점(신촌) 데이터·가격
  i18n/locales/*.json     12개 언어 문구 (seo: 페이지별 검색 문구, journal: 저널 화면 문구)
  content/journal/<언어>/  레스텔 저널 글(마크다운) — content.config.ts에 형식 정의
  i18n/index.ts           언어 유틸(경로·hreflang·환산액)
  layouts/Base.astro      공개 페이지 레이아웃(SEO 포함)
  layouts/Portal.astro    호스트·관리자 레이아웃
  views/*.astro           공개 페이지 본문
  pages/                  라우트 (ko 기본, [lang]/ 다국어, host/, admin/, api)
  data/messageTemplates.ts 호스트→고객 안내 템플릿(12개 언어)
  data/hostGuide.ts       호스트 센터 운영 가이드 본문
  lib/db.ts               D1 스키마(자동 생성·누락 열 자동 추가)·쿼리
  lib/portal.ts           포털 공통(상태 라벨·서약/점검 항목·달력·폼 변환)
  lib/auth.ts             비밀번호 해시·서명 쿠키 세션
  lib/handlers.ts         예약 요청·문의·조회 처리
  lib/spaces.ts           직영/파트너 공간 통합 모델
  lib/journal.ts          저널 글 조회·언어별 버전
  lib/feeds.ts            사이트맵·RSS·IndexNow 주소 목록
  lib/seo.ts              페이지별 검색 문구 꺼내기
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
