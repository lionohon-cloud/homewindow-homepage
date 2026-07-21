# 청암홈윈도우 AI 검색 최적화(GEO/AEO) 실행계획서

작성일: 2026-07-21 · 대상: homewindow.kr (React SPA · Vite · react-router · Cloudflare Pages + Functions)

---

## 0. 목표와 배경

**목표:** ChatGPT/Perplexity/Google AI Overviews/네이버 등 **AI 검색·답변 엔진이 청암홈윈도우를 정확히 이해하고, 답변에 인용**하도록 사이트를 최적화한다.

**핵심 진단:** 콘텐츠(38,000평 공장·15년 무상보증·로이유리 단열수치·SGI 서울보증·LX/KCC 정품 등)는 인용가치가 매우 높으나, **CSR SPA라 JS를 실행하지 않는 AI 크롤러에게는 본문이 빈 페이지로 보인다.** 또한 모든 공개 페이지가 홈과 동일한 메타를 공유하고, 구조화데이터가 홈 수준·클라이언트 렌더에 머문다.

**AI 크롤러 참고(주요 User-Agent):** `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`(OpenAI) · `ClaudeBot`, `Claude-SearchBot`, `Claude-User`(Anthropic) · `PerplexityBot`, `Perplexity-User` · `Google-Extended`, `Googlebot`(AI Overviews) · `Bingbot`(Copilot) · `Applebot-Extended` · `CCBot`.

---

## 1. 원칙

1. **작게, 자주, 검증하며 배포** — 단계별 PR, 실제 Chrome/크롤러 시뮬레이션으로 검증 후 머지.
2. **되돌리기 쉬운 순서** — 저위험 발견성(P2) → 구조화데이터(P1) → 라우트 메타(P1) → 렌더링(P0) → 콘텐츠(P2) → 검증.
3. **AI가 "보는" HTML을 기준으로 판단** — `curl -A GPTBot`로 초기 HTML을 직접 확인하며 진행.
4. **비즈니스 결정은 분리** — 리뷰 섹션 노출 on/off, SNS 계정 등은 부사장님 확인 후 반영.

---

## ⚠️ 최우선(P-1) — Cloudflare AI 봇 차단 해제 (부사장님 대시보드 조치)

**측정 결과(2026-07-21):** Cloudflare 엣지가 AI 크롤러를 **403으로 전면 차단** 중.
- ⛔ 차단: GPTBot·OAI-SearchBot·ChatGPT-User(OpenAI), ClaudeBot·Claude-SearchBot·Claude-User(Anthropic), PerplexityBot·Perplexity-User, CCBot
- ✅ 허용: Googlebot·Google-Extended, Bingbot, Applebot-Extended
- 저장소 코드엔 차단 로직 없음 → **Cloudflare 대시보드 "AI 봇 차단" 기능**이 원인. 코드로 우회 불가.

**결정(부사장님):** 전부 허용 (AI 답변 인용 최대화).

**조치(대시보드):** Cloudflare → homewindow.kr 선택 → **Security → Bots**(또는 Security → Settings에서 "AI" 검색) → **"Block AI bots / AI Scrapers and Crawlers" 토글 OFF**. WAF 커스텀 룰로 막고 있다면 해당 룰 비활성화.
**검증:** 해제 후 `curl -A "GPTBot/1.1" https://homewindow.kr/` → 200 확인(현재 403).

> 이 차단이 풀리기 전엔 아래 Phase 1~6(코드 최적화)의 효과가 ChatGPT/Claude/Perplexity엔 나타나지 않음. 단, 코드 작업은 병행 진행 가능(구글·Bing·네이버엔 즉시 유효).

---

## 2. 단계별 계획 (각 단계 = 1 PR)

### Phase 0 — 기준선 측정 (검증 도구 세팅)  ✅ 완료
- [ ] `curl -A "GPTBot"`로 `/`, `/faq`, `/faq/general`, `/review` 초기 HTML 스냅샷 저장 → "지금 AI가 보는 것" 기록
- [ ] Google Rich Results Test · Schema.org Validator로 현재 JSON-LD 상태 캡처
- **산출물:** 기준선 리포트(문서) — 개선 전/후 비교 근거
- **위험:** 없음(읽기 전용)

### Phase 1 — 발견성 퀵윈 (P2, 무렌더링·저위험) — **1 PR** ✅ 완료
- [x] `robots.txt`: 주요 AI 봇 13종 명시적 `Allow` + `/admin` `Disallow` + sitemap
- [x] `sitemap.xml` 확장: 홈 + `/faq` + `/faq/general` + `/partners` (리뷰는 플래그 확정 후 추가)
- [x] `llms.txt` 신설: 회사 요약·핵심 팩트·주요 페이지·대표 Q&A
- [x] `llms-full.txt`: 전체 FAQ 원문·완성창 정의·스펙
- **산출물:** 확장 robots/sitemap, 신규 llms.txt/llms-full.txt
- **검증:** sitemap 유효 XML ✓, robots 14 UA 그룹 ✓ (배포 후 200 접근 확인 예정)
- **위험:** 낮음

### Phase 2 — 구조화데이터(JSON-LD) 확장 (P1) — **1 PR** ✅ 완료(사이트 공통)
- [x] `index.html` LocalBusiness 보강: `aggregateRating`(4.9/68건 스냅샷), `sameAs`(유튜브·인스타·네이버블로그), `award`(LH·국토부장관상), `knowsAbout`, `makesOffer`, `hasOfferCatalog`, `vatID`, `slogan`
- [x] **Service** 블록 추가: "창호 교체 시공" + 스펙(15년보증·원데이·SGI보증·로이유리 39%/44%·그린리모델링)을 `additionalProperty`로
- [x] `Organization`·`WebSite` 보강(@id·sameAs·publisher·inLanguage)
- [→] `FAQPage` 초기 HTML 고정 + `BreadcrumbList`(서브페이지) → **Phase 4(서버 주입)로 이관** (페이지별 HTML 필요)
- **산출물:** 4개 JSON-LD(HomeAndConstructionBusiness·Organization·Service·WebSite) — 전부 valid ✓
- **검증:** JSON 파싱 4/4 ✓, 빌드 통과 ✓ (배포 후 Rich Results Test 예정)
- **참고:** aggregateRating은 현재 정적 스냅샷 → Phase 4에서 리뷰 API 값 동적 주입

### Phase 3 — 라우트별 메타데이터 (P1) → **Phase 4에 흡수** ✅
- 서버 주입(Phase 4 미들웨어)이 라우트별 `title`·`description`·`canonical`·`og:*`를 초기 HTML에 직접 넣음 → 클라이언트 helmet 없이 크롤러·브라우저 모두 커버. 별도 helmet 도입 불필요.

### Phase 4 — 핵심 페이지 서버 주입 (P0, 최대 효과) — **1 PR** ✅ 완료 (방식 A)
- [x] `functions/_middleware.ts` 신설 — `HTMLRewriter`로 라우트별 `title`·`description`·`canonical`·`og:*` + JSON-LD(FAQPage·BreadcrumbList) 서버 주입. `/api`·`/admin`·정적자산·진짜 404는 미개입.
- [x] **[중대 버그 수정]** `/faq`·`/faq/general`이 `_redirects` 누락으로 **HTTP 404(404.html)** 서빙되던 문제 발견 → `_redirects`에 규칙 추가해 **200 index.html** 서빙. (크롤러가 FAQ를 404로 보던 문제 해결)
- [x] FAQ 데이터를 `src/app/data/faqData.ts`(순수 데이터)로 분리 → 화면·미들웨어 공유. 클라이언트측 FAQPage 중복 주입 제거.
- [→] 리뷰 `AggregateRating`+`Review` 서버 주입은 리뷰 섹션 노출(플래그) 확정 후 추가 예정.
- **검증(wrangler 로컬):** `/faq`·`/faq/general` HTTP 200 + 라우트 메타 + FAQPage/Breadcrumb/LocalBusiness JSON-LD 주입 확인 ✓ / 홈·파트너스 200 ✓ / 자산·관리자 미변경 ✓ / 미존재 라우트 404 유지 ✓ / 빌드 통과 ✓
- **참고:** 크롤러용 본문 블록은 JSON-LD가 실질 콘텐츠(FAQ 전문·스펙)를 이미 담으므로 생략(클로킹·플래시 회피).

### Phase 5 — 콘텐츠 형태 최적화 (P2) — **1 PR**
- [ ] H1 키워드 보강(현재 슬로건) — 회사·"창호 교체 시공" 엔티티 명시(슬로건 유지하되 접근성 텍스트/보조 heading 보강)
- [ ] `Navigation`에 `<nav>` 랜드마크, 리뷰/FAQ 항목 `<article>` 적용
- [ ] **직답형 Q&A·엔티티 정의문 확충**: "완성창이란", "창호 교체 비용", "이중창 vs 시스템창", "지역별 시공" 등 — AI가 그대로 인용할 구조의 콘텐츠
- **산출물:** 추출 친화적 콘텐츠
- **위험:** 낮음(콘텐츠는 마케팅 검수 필요)

### Phase 6 — 검증·모니터링·제출
- [ ] Rich Results / Schema Validator 최종 통과
- [ ] `curl -A GPTBot|ClaudeBot|PerplexityBot` 최종 확인
- [ ] Google Search Console·네이버 서치어드바이저에 sitemap 재제출
- [ ] (선택) 개선 전/후 요약 리포트

---

## 3. 부사장님 결정 필요 항목
1. **리뷰 섹션 노출**: `VITE_REVIEW_SECTION_LIVE` 플래그가 현재 OFF. 후기·평점은 AI 인용가치가 큼 → 켤지 여부.
2. **SNS/외부 프로필 URL**(`sameAs`): 인스타/블로그/유튜브/네이버플레이스 등 정식 URL 목록.
3. **Phase 4 방식**: (A) Functions 서버주입 vs (B) 빌드 프리렌더 — 기본 추천 (A).
4. **콘텐츠 신규 문구**(Phase 5): 비용/비교 등 신규 카피는 마케팅 검수 후 반영.

---

## 4. 진행 방식
- 각 Phase는 별도 PR → 실제 Chrome/크롤러 시뮬레이션 검증 → 부사장님 확인 후 운영(main) 머지.
- 이 문서는 진행에 따라 체크박스 갱신.

## 5. 진행 로그
- 2026-07-21: 계획 수립.
- 2026-07-21: **Phase 0 완료** — 기준선 측정. **[중대발견]** Cloudflare가 AI 크롤러(OpenAI/Anthropic/Perplexity/CCBot) 403 전면 차단 확인. 부사장님 결정: 전부 허용 → 대시보드 해제 대기(P-1). Phase 1(코드) 병행 착수.
- 2026-07-21: **Phase 1·2 완료·푸시**(PR #24) — robots/sitemap/llms.txt, JSON-LD 확장.
- 2026-07-21: **Phase 3·4 완료·푸시**(PR #24) — 서버 주입 미들웨어. **[중대발견2]** `/faq`·`/faq/general`이 `_redirects` 누락으로 HTTP 404 서빙되던 버그 수정. 미들웨어 fail-open 안전장치 추가. wrangler 로컬 검증 완료.
- 2026-07-21: Phase 5(콘텐츠) **보류**(부사장님). Cloudflare Pages 프리뷰에서 실환경 검증 후 머지 예정 → 이후 Phase 6.
