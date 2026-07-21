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

### Phase 2 — 구조화데이터(JSON-LD) 확장 (P1) — **1 PR**
- [ ] `index.html` LocalBusiness 보강: `aggregateRating`(리뷰 집계), `sameAs`(SNS/블로그/지도), `priceRange`, `areaServed`(전국/시군구), `hasOfferCatalog`, 보증(`15년`) 명시
- [ ] **Service/Product/Offer** 추가: "창호 교체 시공" 서비스 + 로이유리 단열수치 등 스펙을 `additionalProperty`로
- [ ] `FAQPage` JSON-LD를 **초기 HTML에 고정**(현재는 클라이언트 lazy 주입) — Phase 4 렌더링과 연계
- [ ] `BreadcrumbList` — FAQ·리뷰 등 서브페이지
- [ ] `Organization`에 `foundingDate`, `numberOfEmployees`, `award` 등 보강
- **산출물:** 확장 JSON-LD (검증 통과)
- **검증:** Rich Results Test, Schema Validator, 오류 0
- **위험:** 낮음(마크업만)

### Phase 3 — 라우트별 메타데이터 (P1) — **1 PR**
- [ ] 경량 head 관리 도입(`react-helmet-async` 또는 자체 `useHead` 훅)
- [ ] 각 공개 라우트에 고유 `title`·`description`·`canonical`·`og:*` 지정
  - `/faq`(업체 선택 가이드), `/faq/general`(자주 묻는 질문), `/review`(시공 후기·평점), `/review/:id`(개별 후기), `/partners`
- [ ] 관리자·감사 페이지 `noindex` 확인/보강
- **산출물:** 라우트별 메타
- **검증:** 각 라우트 렌더 후 `document.title`/메타 확인(초기 HTML 반영은 Phase 4에서 완성)
- **위험:** 낮음

### Phase 4 — 핵심 페이지 프리렌더 / 서버 주입 (P0, 최대 효과) — **1 PR (가장 큰 작업)**
- [ ] 방식 결정: **(A) Cloudflare Pages Functions/`_middleware`로 핵심 라우트 HTML에 본문 요약 + 전체 JSON-LD + 라우트 메타를 서버 주입** (권장, 현 구조 적합) vs (B) 빌드타임 프리렌더(react-snap/puppeteer)
- [ ] 대상: `/`, `/faq`, `/faq/general`, `/review`(+ 승인 `/review/:id`)
- [ ] 리뷰 `AggregateRating`+`Review` JSON-LD 서버 주입 (집계는 `functions/api/review/list.ts`에 이미 존재)
- [ ] 초기 HTML에 **크롤러용 본문 요약 블록**(핵심 팩트·FAQ 질문·후기 요지) 삽입 — 사용자에겐 hydration 후 정상 화면
- **산출물:** AI 크롤러가 보는 HTML에 실제 콘텐츠+구조화데이터 존재
- **검증:** `curl -A GPTBot`로 본문/JSON-LD 확인, Rich Results Test 통과, 실제 화면 회귀 없음(Chrome)
- **위험:** 중(렌더 파이프라인 변경) → 캐시/폴백 신중, 회귀 테스트 필수

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
