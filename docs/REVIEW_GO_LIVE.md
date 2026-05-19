# 시공후기 시스템 — Go Live 토글 가이드

## TL;DR

**환경변수 `VITE_REVIEW_SECTION_LIVE` 하나로 모든 노출 토글.**

| 상태 | 환경변수 값 | 효과 |
|---|---|---|
| **OFF (기본)** | 빈 값 또는 미설정 | GNB "시공후기" 메뉴 숨김 / 메인 ReviewSection = 옛 채팅버블 / `/review` `/review/:id` 진입 시 메인으로 리다이렉트 |
| **ON (오픈)** | `1` | GNB "시공후기" 메뉴 노출 / 메인 ReviewSection = 신디자인 (featured 카드) / `/review` `/review/:id` 정상 노출 |

**중요**: OFF 상태에서도 **EventSection의 "지금 후기 작성하러 가기" 골드 CTA → `/review/new` 작성 진입은 항상 살아있음.** 데이터는 계속 수집됨 (`reviews/{docId}.status='pending'`).

---

## 오픈 시점에 해야 할 일 (체크리스트)

운영 시작 결정 났을 때 순서대로:

### 1. ERP 작업 완료 확인 (부사장님)
- [ ] ERP `/admin/reviews` 페이지 배포됨 (`docs/REVIEW_ERP_ADMIN.md`)
- [ ] pending 후기들 검토 → 양질 후기 몇 건 승인 (`status='approved'`)
- [ ] 그 중 메인 노출용 4~8건 골라서 ERP 상세 페이지에서 **"메인 노출" 토글 ON** (`featured=true`)
- [ ] Firestore Console 에서 확인: `reviews` 컬렉션에 `status='approved' && featured=true` 도큐먼트 최소 4건 존재

### 2. 환경변수 등록

**Cloudflare Pages 대시보드** (production):
1. Cloudflare Dashboard → Pages → `homewindow-homepage` → Settings → Environment variables
2. **Production** 환경에 추가:
   ```
   VITE_REVIEW_SECTION_LIVE=1
   ```
3. **Preview** 환경도 같이 (PR 미리보기에서도 확인 가능):
   ```
   VITE_REVIEW_SECTION_LIVE=1
   ```
4. Save → **재배포 트리거** (Deployments → Retry deployment 또는 새 푸시)

**로컬 dev (검증용)**:
`.env.local` 에 한 줄:
```
VITE_REVIEW_SECTION_LIVE=1
```
→ `npm run dev:cf` 재시작.

### 3. 동작 검증
- [ ] 메인 페이지 → GNB에 "시공후기" 메뉴 노출
- [ ] 메인 페이지 스크롤 → ReviewSection 신디자인 (베이지 BG + ★ 프리미엄 후기 4장 그리드 + 평점 요약)
- [ ] "시공후기" 메뉴 클릭 → `/review` → 시안 PcList 디자인 (점수 분포 + 탭/필터/정렬 + 프리미엄 그리드 + 간편 리스트)
- [ ] 카드 클릭 → `/review/:id` 상세 → 갤러리 + 본문 + 스펙 테이블 (snapshot)
- [ ] EventSection 골드 CTA → `/review/new` (운영 시작 후에도 변함 없음)

### 4. 모니터링
- [ ] 운영 첫 주: 사이트 후기 페이지 PV (GA4)
- [ ] 작성 전환율: EventSection CTA 클릭 → /review/new → /review/done 까지 funnel
- [ ] 거절률: ERP 관리자 화면에서 거절 vs 승인 비율

---

## 운영 중 — 후기 메인 노출 교체

### A. 한 건 추가 노출
1. ERP `/admin/reviews` 진입
2. 도큐먼트 클릭 → 우측 사이드바 "메인 노출" 토글 ON
3. 사이트 메인 새로고침 → 즉시 반영 (캐시 없음)

### B. 한 건 내림
1. 같은 자리에서 토글 OFF
2. 즉시 메인에서 사라짐 (다른 featured 후기로 채워짐)

### C. 8개 초과 토글
ERP UI 가 자동 경고. 가장 오래된 featured 후기를 먼저 내리는 것 권장.

### D. 거절된 후기 다시 살리기
1. ERP 상세 페이지 → "재승인" 클릭 (status=approved 복원)
2. 메인 노출하려면 "메인 노출" 토글 ON 추가

---

## 다시 OFF 로 (응급 상황)

문제 생기면 즉시 OFF 가능:

```
Cloudflare Pages → Settings → Environment variables
VITE_REVIEW_SECTION_LIVE 값 비우거나 0 으로 → Retry deployment
```

배포 후 즉시:
- GNB "시공후기" 메뉴 사라짐
- 메인 ReviewSection = 채팅버블 복원
- `/review` 직접 URL 진입 → / 로 리다이렉트

단 **작성 진입(EventSection CTA → /review/new) 은 그대로** 살아있음.
사이트 진입점은 막혀도 작성 폼은 동작 (테스트 / 우회 진입용).

이것도 막으려면 별도 작업 필요 (현재는 OFF 토글에 안 묶임 — 의도).

---

## 코드상 구현 위치

| 파일 | 분기 |
|---|---|
| `src/app/components/ReviewSection.tsx` | `LegacyReviewSection` (구) vs `LiveReviewSection` (신) — flag 분기 |
| `src/app/components/Navigation.tsx` | desktopMenuItems + 모바일 사이드메뉴 — flag로 "시공후기" 항목 노출/숨김 |
| `src/app/pages/ReviewListPage.tsx` | flag OFF면 `<Navigate to="/" replace />` |
| `src/app/pages/ReviewDetailPage.tsx` | 동상 |
| `.env.local` `.env.local.example` | `VITE_REVIEW_SECTION_LIVE=` 변수 정의 |

**살아있는(분기 안 함) 부분**:
- `src/app/components/EventSection.tsx` — 골드 CTA (`/review/new`) 항상 노출
- `src/app/pages/ReviewNewPage.tsx`, `ReviewTypePage.tsx`, `ReviewWritePage.tsx`, `ReviewDonePage.tsx` — 작성 플로우 항상 동작
- `functions/api/review/*` — 모든 API 항상 동작

---

## 변경 이력

- 2026-05-18: `VITE_REVIEW_LIST_PUBLIC` → `VITE_REVIEW_SECTION_LIVE` 로 통일.
  - 이전엔 페이지 가드만 토글했는데, 이제 GNB + 메인 섹션 디자인까지 하나로 토글.
  - "운영 시작" 버튼처럼 한 번에 모두 ON.
