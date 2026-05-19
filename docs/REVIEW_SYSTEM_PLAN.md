# 후기 시스템 구축 계획 (homewindow-web)

## Context

**왜**: 후기 누적 → 자연스러운 ReviewSection 교체. 현재 ReviewSection은 하드코딩된 5줄 후기. 실제 시공 고객 후기를 수집·승인·노출하는 정식 시스템 필요.

**전략 (단계 분리)**
- **Stage 1 (지금 노출)**: EventSection 하단에 "후기 작성하기" CTA만 노출. 작성·승인·DB까지 전부 구축하되 **리스트/상세 페이지는 라우팅만 만들고 사이트 진입점 노출 안 함** (URL 직접 접근 가능, feature flag로 가드). **현 ReviewSection(하드코딩 5줄 후기)은 손대지 않고 그대로 유지**.
- **Stage 2 (후기 누적 후, 별도 PR)**: 환경 변수 `VITE_REVIEW_LIST_PUBLIC=1` 켜면 **ReviewSection 자체가 실후기 리스트로 확장 변환**. "더 많은 후기 보러가기" → 별도 페이지 이동 방식 아님. 섹션 자체가 커지면서:
  1. 상단: 평균 별점 요약 (예: 4.9 / 5.0, 총 N건) — 디자인 `screens.jsx:96-113` summary 패턴
  2. **프리미엄 리뷰 먼저** (large card, 사진 + 본문 + 스펙 테이블)
  3. **간편 리뷰 다음** (compact card, 별점 + 한 줄 + 태그)
  4. 하단: "전체 후기 보기 →" 버튼 → `/review` 풀 리스트 페이지 (SEO/페이지네이션용)

**디자인 출처**: `C:\Users\CA\Worksapce\homewindow-web\.tmp\review-design\` (제공받은 ZIP 추출본). 핵심: `홈윈도우 리뷰 시스템.html`(CSS 변수표), `screens.jsx`(모바일), `screens-pc.jsx`(PC), `event-section.jsx`(이벤트 CTA).

**아키텍처 결정**
- **백엔드**: Firebase Firestore. 호출 경로 = 홈페이지 → Cloudflare Functions(`/api/review/*`) → cahwindow-quote ERP(`/api/external/review-*`) → Firestore. AS create.ts 패턴 동일 (`functions/api/as/create.ts:80-101`).
- **본인 확인 (2026-05-18 변경)**: 팝빌 SMS 인증 폐기 → ERP에 이미 들어 있는 고객 데이터를 **"고객명 + 휴대전화 뒷 4자리"** 로 조회하는 방식. ERP가 매칭하면 JWT(30분) 발급. SMS 발송 비용/지연 없음. ERP에 신규 API `POST /api/external/customer-lookup` 1개만 필요.
- **사진 업로드**: 프리미엄만 필수 3장(최대 10장). Supabase Storage `reviews-photos` 버킷 (AS와 동일 패턴 — `functions/api/as/admin/photo-url.ts` 참조). Firestore에 photo path만 저장.

## ⚠️ 관리자 승인 워크플로 (핵심)

**원칙**: 고객이 후기를 작성/저장해도 **즉시 공개되지 않음**. 모든 후기는 반드시 관리자 승인을 거친 뒤에야 사이트에 노출됨.

| 단계 | status | 사이트 노출 | API 응답 |
|------|--------|-------------|----------|
| 고객 저장 직후 | `pending` | ❌ 안 됨 | 일반 list 쿼리에서 제외 |
| 관리자 거절 | `rejected` | ❌ 안 됨 | 영구 제외, 사유 기록 |
| 관리자 승인 | `approved` | ✅ 노출 | `publishedAt` 세팅 후 공개 |

- **공개용 API** (`GET /api/review/list`, `GET /api/review/:id`)는 서버에서 `status='approved'` 필터를 강제. 클라이언트가 어떻게 호출해도 pending은 절대 안 나옴.
- **관리자 API** (`GET /api/review/admin/list`)는 Cloudflare Access 헤더 검증 필수. 모든 status 보임.
- 저장 후 고객은 "관리자 확인 후 게시됩니다" 팝업으로 명시적 안내 → 홈으로 이동.
- (선택) 새 pending 후기 들어오면 관리자 텔레그램(@CAHwindow_bot) 또는 카카오 알림톡으로 자동 알림 — ERP 측 옵션.

---

## 데이터 모델 (Firestore — ERP 측 컬렉션)

`reviews` 컬렉션 문서 스키마:
```ts
{
  id: string,                   // auto
  tier: 'simple' | 'premium',
  phone: string,                // 010xxxxxxxx, hash 별도 보관
  phoneVerifiedAt: Timestamp,
  customerName: string,         // 고객명
  siteAddress: string,          // 현장주소 (시/구만 표시용)
  brand: 'LX' | '홈씨씨' | '홈윈도우',
  model: '프레스티지' | '시그니처' | '에코',
  rating: number,               // 1~5
  reviewText: string,           // simple ≤50자, premium ≥200자
  tags?: string[],              // simple만 (좋았던 부분)
  photos?: { path: string, mime: string, type?: 'before'|'after'|'other' }[],
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string,
  publishedAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  ip?: string,                  // 어뷰징 대응
  userAgent?: string,
}
```

`review_verifications` (SMS 코드 임시 저장, TTL 5분):
```ts
{
  phone: string,
  codeHash: string,             // bcrypt
  attempts: number,             // 5회 초과 시 잠금
  createdAt: Timestamp,
  expiresAt: Timestamp,
  consumedAt?: Timestamp,
}
```

**중복 방지**: `reviews.phone == X && status != 'rejected'` 존재하면 차단. 클라이언트 + 서버 양쪽 체크.

---

## 라우팅 추가 (`src/app/Router.tsx`)

기존 lazy import 패턴 그대로:
```tsx
{ path: 'review/new', lazy: () => import('./pages/ReviewNewPage') },           // 전화번호 입력 + SMS 인증
{ path: 'review/type', lazy: () => import('./pages/ReviewTypePage') },         // 간편/프리미엄 선택
{ path: 'review/write', lazy: () => import('./pages/ReviewWritePage') },       // 작성 폼
{ path: 'review/done', lazy: () => import('./pages/ReviewDonePage') },         // 완료 페이지
{ path: 'review', lazy: () => import('./pages/ReviewListPage') },              // 리스트 (Stage 2 노출)
{ path: 'review/:id', lazy: () => import('./pages/ReviewDetailPage') },        // 상세 (Stage 2 노출)
{ path: 'admin/reviews', lazy: () => import('./pages/AdminReviewListPage') },  // 관리자 (Cloudflare Access)
{ path: 'admin/reviews/:id', lazy: () => import('./pages/AdminReviewDetailPage') },
```

플로우 가드(세션):
- `review/type` 진입 시 `sessionStorage.hw_review_token` 없으면 → `review/new` 리다이렉트
- `review/write` 진입 시 `sessionStorage.hw_review_tier` 없으면 → `review/type` 리다이렉트
- 토큰은 ERP가 발급(JWT, 30분 TTL, phone 포함)

---

## 신규 컴포넌트 (`src/app/components/review/`)

디자인 토큰 매핑 (`tailwind.config.js`에 색상 추가 불필요 — 임의값 `[#xxxxxx]` 사용):
- `--brand: #952c2c`, `--gold: #b8945a`, `--gold-light: #d4b277`, `--premium-bg: #1a1210`, `--star: #c89545`, `--bg: #faf7f4`, `--line: #ebe5e0`, `--ink: #1c1614`

| 파일 | 역할 |
|------|------|
| `StarInput.tsx` | 별점 1~5 입력 (마우스 호버 라벨: "아쉬워요"~"최고예요") — `screens.jsx:421-439` 참조 |
| `StarsDisplay.tsx` | 별점 표시 (읽기 전용) |
| `TagPicker.tsx` | 태그 선택 — `screens.jsx:512-519` 참조 |
| `PhotoUploader.tsx` | 사진 4-col 그리드 (Before/After 라벨) — `screens.jsx:591-609` 참조 |
| `BrandModelSelect.tsx` | 브랜드(LX/홈씨씨/홈윈도우) → 모델(프레스티지/시그니처/에코) 라디오 카드 2단 |
| `ReviewPrivacyAccordion.tsx` | 개인정보 동의(전화번호 수집/SMS 발송) — `ConsultationModal.tsx:255-350` 패턴 복사 |
| `ConfirmModal.tsx` | "관리자 확인 후 게시됩니다" 팝업 — `ConsultationModal.tsx:369-403` AlertModal 재사용 |

---

## 페이지 상세

### `pages/ReviewNewPage.tsx` (전화 + SMS 인증)
- 전화번호 3분할 입력 (`ConsultationModal.tsx:136-174` 패턴)
- "인증번호 받기" → `POST /api/review/send-code` → 60초 카운트다운
- 6자리 코드 입력 → "확인" → `POST /api/review/verify-code` → 토큰 sessionStorage 저장 → `review/type` 이동
- 이미 작성한 번호: 서버에서 `phone_already_used` 응답 → "이미 후기를 작성하신 번호입니다" 알림
- 개인정보 동의 체크박스 (전화번호 수집 + SMS 발송 동의)

### `pages/ReviewTypePage.tsx` (간편/프리미엄 선택)
- 디자인 `screens.jsx:343-415` (TypePickerA) 그대로
- 간편 카드: 라이트 톤. 프리미엄 카드: `bg-[#1a1210] text-[#faf7f4]`, 골드 크레스트 아이콘
- 클릭 → `sessionStorage.hw_review_tier = 'simple'|'premium'` → `review/write` 이동

### `pages/ReviewWritePage.tsx` (작성 폼)
공통 필드 (tier 무관):
1. 별점 (StarInput, 필수)
2. 고객명 (text, 필수)
3. 현장주소 (text, 필수, 시/구만 노출 예정 안내)
4. 브랜드 (라디오, 필수)
5. 모델 (라디오, 필수)

**간편**: + 한 줄 후기 (textarea, 50자, 필수) + 좋았던 부분 태그 (선택)
- 태그 옵션: `거실, 주방, 안방, 베란다, 단열 만족, 소음 차단, 깔끔한 마감, 친절 응대, 빠른 시공`

**프리미엄**: + 사진 3장 이상 필수 (Before/After 라벨 지정 가능, 최대 10장) + 상세 후기 (textarea, 200자 이상 필수)
- 디자인 step indicator (`screens.jsx:551-557`)는 단순화 — 단일 페이지 스크롤로 처리 (Stage 1 빠른 출시 우선)

"저장하기" 클릭:
1. 검증 (클라이언트)
2. `POST /api/review/submit` (multipart: 사진 포함)
3. 성공 → `ConfirmModal` 띄움 → "관리자 확인 후 게시됩니다. 좋은 후기 남겨주셔서 감사합니다." → 확인 클릭 → `navigate('/', { replace: true })` + `sessionStorage` 정리

### `pages/ReviewDonePage.tsx`
- 누락 케이스 대응. 사용자가 새로고침 등으로 모달 놓쳤을 때 직접 진입 가능 (확정 메시지 + 홈으로 버튼)

### `pages/ReviewListPage.tsx` (Stage 2 노출)
- 디자인 `screens.jsx:87-189` (ListA) 그대로. 탭(간편/프리미엄), 필터칩, 정렬, 카드 리스트
- `GET /api/review/list?tier=&page=&part=` 호출
- **노출 가드**: `import.meta.env.VITE_REVIEW_LIST_PUBLIC !== '1'` 이면 → `<Navigate to="/" replace />`

### `pages/ReviewDetailPage.tsx` (Stage 2 노출)
- 디자인 `screens.jsx:273-337` (DetailA) 그대로
- 동일 노출 가드

### `pages/AdminReviewListPage.tsx` (Cloudflare Access)
- 테이블: 작성일 | 전화 | 고객명 | 브랜드/모델 | 별점 | 상태 (pending/approved/rejected)
- 필터: 상태별, 기간별
- 행 클릭 → 상세 페이지

### `pages/AdminReviewDetailPage.tsx`
- 전체 필드 + 사진 (signed URL) 미리보기
- 액션: "승인 후 게시" / "거절(사유 입력)" / "수정"
- `POST /api/review/admin/approve` / `reject` / `update`

---

## API 엔드포인트 (`functions/api/review/`)

각 파일은 `as/create.ts` 패턴: Honeypot 검사 → 입력 검증 → ERP forward → 응답.

| 파일 | 메서드 | 역할 |
|------|--------|------|
| `send-code.ts` | POST | phone → ERP `/api/external/sms-send-code` → 팝빌 SMS |
| `verify-code.ts` | POST | phone, code → ERP `/api/external/sms-verify-code` → 토큰 발급 |
| `submit.ts` | POST | multipart(token, tier, name, addr, brand, model, rating, text, tags, photos[]) → ERP `/api/external/review-create` → Firestore insert(status=pending) + Supabase Storage 사진 업로드 |
| `list.ts` | GET | `?tier=&page=` → ERP `/api/external/review-list` (status=approved만) |
| `[id].ts` | GET | id → ERP `/api/external/review-get` (approved만) |
| `admin/list.ts` | GET | Cloudflare Access 헤더 검증 + ERP `/api/external/admin/review-list` |
| `admin/[id]/approve.ts` | POST | Cloudflare Access + ERP `/api/external/admin/review-approve` |
| `admin/[id]/reject.ts` | POST | Cloudflare Access + ERP `/api/external/admin/review-reject` |
| `admin/photo-url.ts` | GET | signed URL — `functions/api/as/admin/photo-url.ts` 그대로 복사 |

**환경 변수 추가** (`wrangler.toml` / Cloudflare Pages dashboard):
- `ERP_REVIEW_API_KEY` (이미 ERP가 발급한 키 재사용 가능 여부 확인)
- 기존 `ERP_BASE_URL` 재사용
- 기존 `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` 재사용 (사진 업로드)

---

## ERP(cahwindow-quote)에 필요한 신규 외부 API (별도 작업)

홈페이지 PR에서는 호출만 함. ERP 측 구현은 별도 PR 필요 — 부사장님이 ERP 담당 세션에서 진행:

1. `POST /api/external/sms-send-code` { phone } → 팝빌 발송 + `review_verifications` 도큐먼트 생성
2. `POST /api/external/sms-verify-code` { phone, code } → 검증 + JWT(30분) 발급
3. `POST /api/external/review-create` (multipart) → JWT 검증 + Firestore `reviews` insert (status=pending) + 사진 URL 저장 + (선택) 관리자 알림톡
4. `GET /api/external/review-list?tier=&status=approved&page=` → 목록 (Stage 2)
5. `GET /api/external/review/:id` → 단건
6. `GET /api/external/admin/review-list` → 전체(승인 대기 포함). x-api-key 인증
7. `POST /api/external/admin/review-approve` { id } → status=approved + publishedAt
8. `POST /api/external/admin/review-reject` { id, reason } → status=rejected

→ **별도 작업서로 분리하여 ERP 담당 세션에 전달.**

---

## EventSection CTA 추가

수정 파일: `src/app/components/EventSection.tsx` (107행 grid 닫기 직후, 113행 `</section>` 직전)

CTA는 디자인의 `.ev-bonus-cta`(`event-section.jsx`) — 골드 그라데이션 버튼. EventSection 빨강 배경 위에 골드는 시인성 강함.

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-200px" }}
  transition={{ delay: 0.6 }}
  className="mt-10 flex flex-col items-center gap-3"
>
  <p className="text-white/90 text-[14px] md:text-[15px] text-center break-keep">
    시공받으신 고객님이라면, 한 줄 후기로 다른 분들께 도움을 주세요
  </p>
  <Link
    to="/review/new"
    className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-xl
               bg-gradient-to-br from-[#d4b277] to-[#b8945a]
               text-[#1a1210] font-extrabold text-[15px] tracking-tight
               shadow-lg hover:scale-[1.02] transition-transform"
  >
    <Crown className="w-4 h-4" />
    지금 후기 작성하러 가기
    <ArrowRight className="w-4 h-4" />
  </Link>
</motion.div>
```

`react-router` `Link` + `lucide-react` `Crown`, `ArrowRight` 사용 (둘 다 이미 사용중).

---

## ReviewSection — Stage 1 / Stage 2 분리

**Stage 1 (이번 PR)**: `src/app/components/ReviewSection.tsx` 손대지 않음. 기존 하드코딩 5줄 후기 그대로 유지.

**Stage 2 (별도 PR, 후기 누적 후)**: ReviewSection 자체가 **확장 변환**됨 (별도 페이지 이동 아님):
- 5줄 하드코딩 배열 제거 → `useEffect` 로 `GET /api/review/list?limit=N` fetch
- 환경 변수 `VITE_REVIEW_LIST_PUBLIC === '1'` 일 때만 실데이터 분기. 아닐 때 기존 하드코딩 유지(폴백).
- **확장된 레이아웃**:
  1. **상단 헤더** (기존 "수천 건의 시공이 입증한..." 타이틀 + 해시태그 유지)
  2. **요약 통계 추가**: 평균 별점 / 총 후기 건수 / 별점 분포 막대 (디자인 `screens.jsx:96-113`)
  3. **프리미엄 리뷰 영역 (먼저)**: 사진 + 본문 + 스펙 테이블이 있는 large card. 최근 3~5개. 디자인 `screens.jsx:25-84` PremiumReview 컴포넌트 패턴
  4. **간편 리뷰 영역 (다음)**: 별점 + 한 줄 + 태그 compact card. 최근 5~10개. 디자인 `screens.jsx:10-23` SimpleReview 컴포넌트 패턴
  5. **하단 CTA 두 개**: `[전체 후기 보기 →]` → `/review` 풀 페이지 / `[후기 작성하기]` → `/review/new`
- 기존 BeforeAfterSlider는 유지 (히어로 비교 시각화 가치 큼) — 요약 헤더 아래에 배치
- "더 많은 후기가 궁금하시다면?" 외부 네이버 블로그 링크 → `/review` 내부 라우트로 교체 (네이버 블로그 링크는 제거 또는 보조 자료로 격하)

---

## GA4 / 분석 이벤트

`src/lib/submitReview.ts` (새 파일, `submitLead.ts:1-157` 패턴):
- `start_review`: CTA 클릭 시
- `verify_phone_success`
- `submit_review` (tier, rating)
- 모든 이벤트는 `gtag` + `window.dataLayer` 양쪽 push (`submitLead.ts:60-90` 참조)

---

## 검증 (Verification)

### 자동
1. `cd C:/Users/CA/Worksapce/homewindow-web/sorce-main && npm run build` — 빌드 통과
2. TypeScript 컴파일 에러 없음

### 수동 (개발 서버)
```bash
cd sorce-main && npm run dev
```
- `/` 진입 → EventSection 하단에 "후기 작성하기" CTA 보임
- CTA 클릭 → `/review/new` 이동
- 전화번호 입력 → "인증번호 받기" → (ERP 미구현 시 503 응답 정상)
- 직접 URL `/review` 진입 시 → `/` 리다이렉트 (가드 동작 확인)
- 직접 URL `/admin/reviews` → Cloudflare Access 로그인 화면 (배포 후만 확인 가능)

### 모바일 반응형
- `width: 375px` (iPhone SE), `width: 768px` (iPad), `width: 1280px` (PC) 각 브레이크포인트
- 디자인 `screens.jsx`는 모바일 기준, `screens-pc.jsx`는 PC. PC는 폼이 좌측, 미리보기가 우측 사이드바 — Stage 1에선 폼만 풀폭, 미리보기 생략

### 배포 후
- Cloudflare Pages 미리보기 URL에서 실제 SMS 발송 테스트 (부사장님 본인 번호로)
- Firestore 콘솔에서 `reviews` 컬렉션 도큐먼트 확인 (status=pending)
- 관리자 페이지에서 승인 → status=approved 갱신 확인
- Stage 2 노출 토글: `VITE_REVIEW_LIST_PUBLIC=1` 환경 변수 추가 후 재배포 시 `/review` 페이지 접근 가능

---

## 작업 순서 (커밋 단위)

1. **Cloudflare Functions skeleton + 환경 변수** (`functions/api/review/`)
2. **공용 컴포넌트** (`StarInput`, `TagPicker`, `PhotoUploader`, `BrandModelSelect`, `ConfirmModal`)
3. **작성 플로우** (`ReviewNewPage` → `ReviewTypePage` → `ReviewWritePage` → `ReviewDonePage`)
4. **EventSection CTA + Router 등록**
5. **관리자 페이지** (`AdminReviewListPage`, `AdminReviewDetailPage`)
6. **리스트/상세 페이지** (가드 적용, 노출 안 됨)
7. **GA4 이벤트 (`submitReview.ts`)**
8. **빌드 검증 + 커밋 + push**

ERP 측 API는 별도 작업서로 부사장님이 cahwindow-quote 세션에서 진행. 그동안 홈페이지는 mock 응답으로 UI 작동 확인 가능 (개발 모드 `VITE_REVIEW_MOCK=1` 분기).

---

## 변경 파일 요약

**신규** (예상 20+ 파일):
- `src/app/components/review/*` (7 컴포넌트)
- `src/app/pages/Review*Page.tsx` (5 페이지)
- `src/app/pages/AdminReview*Page.tsx` (2 페이지)
- `src/lib/submitReview.ts`, `src/lib/reviewApi.ts`, `src/lib/brandModel.ts`
- `functions/api/review/*` (9 엔드포인트)

**수정** (3 파일):
- `src/app/Router.tsx` (라우트 8개 추가)
- `src/app/components/EventSection.tsx` (CTA 추가, 약 20줄)
- `.env.local.example` (환경 변수 키 추가, 주석)
