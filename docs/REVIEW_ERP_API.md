# 후기 시스템 — ERP (cahwindow-quote) 측 사전 준비 작업서

## 결정 (2026-05-18, 사용자 지시)

홈페이지 후기 시스템은 **ERP 백엔드 API를 거치지 않고 Firebase에 직접** 붙는다.
홈페이지는 ERP와 같은 Firebase 프로젝트 `cahwindow-quote` 의 또 하나의 클라이언트.

→ ERP 측에서 **신규 API 구현은 필요 없다.** 다만 다음 4가지만 준비.

---

## 1. 시스템 계정 신규 발급 (Firebase Auth)

홈페이지 Cloudflare Functions가 Firebase에 signIn할 계정.

**부사장님 작업:**
1. Firebase Console → Authentication → 사용자 추가
   - 이메일: `cron-review-homepage@cahwindow.local` (예시)
   - 비밀번호: 32자 이상 랜덤 (`openssl rand -base64 32`)
2. Firestore `users/{uid}` 도큐먼트 생성 (uid는 1번에서 받은 값):
   ```
   {
     role: 'admin',
     name: '홈페이지 후기 시스템',
     email: 'cron-review-homepage@cahwindow.local',
     createdAt: <ISO>,
   }
   ```
3. 홈페이지측 환경변수 4개 전달:
   - `FIREBASE_API_KEY` (ERP 의 `NEXT_PUBLIC_FIREBASE_API_KEY` 와 동일)
   - `FIREBASE_PROJECT_ID=cahwindow-quote`
   - `FIREBASE_STORAGE_BUCKET=cahwindow-quote.firebasestorage.app`
   - `SYSTEM_AUTH_EMAIL`, `SYSTEM_AUTH_PASSWORD` (1번에서 만든 값)

> ERP가 쓰는 기존 시스템 계정 자격증명을 그대로 복제하는 것은 보안상 회피.
> 신규 발급으로 권한·로그·회전을 홈페이지 라이프사이클에 맞춰 관리.

---

## 2. Firestore Security Rules — `reviews` 컬렉션 추가

ERP 레포 `firebase/firestore.rules` 에 다음 블록 추가:

```firestore
match /reviews/{docId} {
  function isReviewAdmin() {
    return isSignedIn() && (
      userRole() == 'admin' ||
      userRole() == 'manager' ||
      isCounselOrSupport()
    );
  }

  // read: 사이트 공개용 (인증된 모든 사용자가 approved 만), admin 은 전체
  allow read: if isSignedIn() && (
    resource.data.status == 'approved' ||
    isReviewAdmin()
  );

  // create: 시스템 계정 (admin role) 만, status='pending' 강제
  allow create: if isSignedIn() &&
                   isAdmin() &&
                   request.resource.data.status == 'pending' &&
                   request.resource.data.source == 'homepage';

  // update: admin/manager/지원팀만, 상태 변경만 허용
  allow update: if isReviewAdmin() &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['status', 'publishedAt', 'rejectionReason',
                               'lastModifiedAt', 'lastModifiedBy']);

  allow delete: if isAdmin();
}
```

배포: `firebase deploy --only firestore:rules`

---

## 3. Storage Rules — `reviews/{docId}/photos/` 경로 추가

ERP 레포 `firebase/storage.rules` 에 추가:

```firestore
match /reviews/{docId}/photos/{name} {
  // read: 누구나 (사이트 공개용)
  allow read: if true;
  // write: 시스템 계정 (admin) — 홈페이지 Cloudflare Function 만
  allow write: if request.auth != null &&
                  request.auth.token.email == 'cron-review-homepage@cahwindow.local';
}
```

또는 admin role 가드를 쓰려면:

```firestore
match /reviews/{docId}/photos/{name} {
  allow read: if true;
  allow write: if request.auth != null &&
                  firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

배포: `firebase deploy --only storage`

---

## 4. ERP 관리자 UI에 `reviews` 메뉴 추가 (별도 PR)

홈페이지에서 들어온 후기를 부사장님이 검토/승인/거절할 화면.

**구현 위치:** ERP `/admin/reviews` 같은 신규 페이지 (Next.js).

**최소 기능:**
- 리스트: 작성일·고객명·뒷4자리·브랜드/모델·별점·tier·상태 필터
- 상세: 본문, 사진 (Firebase Storage URL), 메타데이터
- 액션:
  - **승인** → `status='approved'`, `publishedAt=now()`, `lastModifiedAt=now()`, `lastModifiedBy=uid`
  - **거절** → `status='rejected'`, `rejectionReason=<입력>`
  - **수정** (오타 등) → reviewText 필드 update

**임시 운용 (관리자 UI 만들기 전):**
Firestore Console에서 직접 `reviews/{docId}` 도큐먼트 열어서 status 수동 변경 가능. status를 `approved`로 바꾸면 즉시 사이트(Stage 2) 노출.

---

## 데이터 모델 — `reviews` 컬렉션 schema

홈페이지 Cloudflare Function이 다음 형식으로 도큐먼트 생성:

```ts
{
  // 식별
  docId,                       // yyMMdd-{전화뒷4}-{seq2}, 예: 260518-5678-00
  customerName,                // 본인확인 시 추출한 풀네임 (crm_customers suffix 포함 가능)
  customerPhone,               // 010-XXXX-XXXX
  customerSource,              // 'inboundCustomers' | 'crm_customers'
  customerSourceId,            // 매칭된 도큐먼트 ID

  // 후기 내용
  tier,                        // 'simple' | 'premium'
  rating,                      // 1-5
  parts: string[],             // ['거실', '주방', ...]
  brand,                       // 'LX' | '홈씨씨' | '홈윈도우'
  model,                       // '프레스티지' | '시그니처' | '에코'
  reviewText,                  // simple ≤50자, premium ≥200자
  tags?: string[],             // simple 전용
  photos?: Array<{             // premium 최소 3장
    path: string,              // 'reviews/{docId}/photos/0-before.jpg'
    url: string,               // Firebase Storage 다운로드 URL
    label: 'before'|'after'|'other',
    mime: string,
  }>,

  // 관리
  status: 'pending'|'approved'|'rejected',
  source: 'homepage',
  rejectionReason?: string,
  publishedAt?: ISO,
  createdAt: ISO,
  createdBy: <systemUid>,
  lastModifiedAt: ISO,
  lastModifiedBy: <uid>,
}
```

---

## 검증 시나리오

1. **부사장님 단계** (사전 준비 완료):
   - 시스템 계정 발급 + admin 승격
   - Rules 배포
   - 환경변수 4개 전달

2. **개발자 단계** (홈페이지 .env.local 채움):
   - 부사장님 본인 이름 + 휴대폰 뒷4자리로 `/review/new` 진입
   - "확인하기" → matched:'one' 응답 + 토큰 발급
   - 작성 폼 → "등록하기" → reviews/{docId} 생성됨
   - Firestore Console 에서 도큐먼트 + Storage 에서 사진 확인

3. **승인 단계:**
   - Firestore Console 또는 ERP 관리자 UI 에서 status='approved' 변경
   - (Stage 2 활성 시) 홈페이지 `/review` 진입 → 후기 노출

---

## 미해결 항목

- 부사장님의 시스템 계정 발급 시점
- ERP 관리자 UI 신규 메뉴 일정 — 별도 PR
- 알림톡/텔레그램 자동 알림 (신규 pending 후기 발생 시) — 선택 사항
