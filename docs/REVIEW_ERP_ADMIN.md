# ERP `/admin/reviews` 시공후기 관리 페이지 — 작업서

부사장님(또는 ERP 담당)이 ERP 레포(`cahwindow-Quote`)에서 직접 만들 코드.
홈페이지 측 작업은 100% 완료 (저장 + 노출). **승인 UI만 ERP에서 만들면 즉시 운영 가능.**

---

## 현재 상태 (2026-05-18 검증 완료)

| 항목 | 상태 |
|---|---|
| 홈페이지 작성 폼 (`/review/new` → `/review/write`) | ✅ 동작 |
| 본인확인 (이름+뒷4) — inboundCustomers + crm_customers 두 컬렉션 매칭 + dedupe | ✅ |
| `reviews` 컬렉션에 `status='pending'` 으로 저장 | ✅ (2건 동작 확인) |
| ERP 데이터 자동 매핑 (snapshot 필드 — 주소, 제품, 시공일 등) | ✅ |
| 사이트 노출 (`/review`, `/review/:id`) — `status='approved'` 만 | ✅ |
| Firestore Rules — `reviews` 컬렉션 (admin role read/write, approved는 공개) | ✅ 배포됨 |
| Storage Rules — `reviews/{docId}/photos/{*}` 경로 | ✅ 배포됨 |
| 시스템 봇 계정 `review-bot@cahwindow.local` (admin role) | ✅ Firebase Auth 등록됨 |
| 부사장님이 Firestore Console 에서 직접 status 수동 변경하면 즉시 사이트 노출 | ✅ 임시 운영 가능 |

**남은 작업 = ERP UI 만들기.** 임시로 Firestore Console에서 status 바꿔도 동작은 같음.

---

## 임시 운영 (지금 당장 가능 — UI 없이)

ERP 페이지 만들기 전까지는 Firestore Console에서 직접:

1. 👉 https://console.firebase.google.com/project/cahwindow-quote/firestore/data/~2Freviews
2. 도큐먼트 클릭 → `status` 필드 값 `pending` → `approved` 변경
3. `publishedAt` 필드 신규 추가 (string) → 현재 ISO 시간 (예: `2026-05-18T10:00:00.000Z`)
4. 저장 → 홈페이지 `/review` 새로고침 → 즉시 노출

본문 수정도 Console 에서: 도큐먼트 → `reviewText` 필드 → 더블클릭 편집 → 저장.

---

## 정식 작업 — ERP 레포 (`cahwindow-Quote`)

### 1. Schema 정의

**파일**: `packages/schemas/src/review.ts` (신규)

```ts
/**
 * reviews 컬렉션 스키마 (시공후기).
 *
 * Firestore 경로: `reviews/{docId}`
 *
 * 2026-05-18 (이승환): 홈페이지(homewindow.kr) 작성 → ERP /admin/reviews 에서 승인.
 *   - 홈페이지가 시스템 봇 계정으로 status='pending' 으로 insert
 *   - ERP admin/manager 가 승인/거절/본문 수정
 *   - status='approved' 즉시 홈페이지 노출
 */
import { z } from 'zod';

export const ReviewPhotoSchema = z.object({
  path: z.string(),       // reviews/{docId}/photos/{idx}-{label}.{ext}
  url: z.string(),
  label: z.string(),      // 'before' | 'after' | 'other'
  mime: z.string(),
});
export type ReviewPhoto = z.infer<typeof ReviewPhotoSchema>;

export const ReviewSnapshotSchema = z.object({
  contractDocId: z.string().optional(),
  brand: z.string().optional(),
  modelGrade: z.string().optional(),
  productLabel: z.string().optional(),
  locationLabel: z.string().optional(),    // "경기 광주시 곤지암읍" — 개인정보 보호상 시/구·동까지만
  installDate: z.string().optional(),      // "2026.03.14"
  glassLabel: z.string().optional(),
  sizeLabel: z.string().optional(),
  warrantyLabel: z.string().optional(),
  warrantyYears: z.number().optional(),
  siteWorkSummary: z.string().optional(),
  erpPhotos: z.array(z.object({ path: z.string(), url: z.string() })).optional(),
});
export type ReviewSnapshot = z.infer<typeof ReviewSnapshotSchema>;

export const ReviewEditHistorySchema = z.object({
  at: z.string(),
  by: z.string(),
  byName: z.string().optional(),
  field: z.string(),
  before: z.string(),
  after: z.string(),
});
export type ReviewEditHistory = z.infer<typeof ReviewEditHistorySchema>;

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected', 'hidden'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_TIERS = ['simple', 'premium'] as const;
export type ReviewTier = (typeof REVIEW_TIERS)[number];

export const ReviewSchema = z.object({
  // 본인확인 시 자동 매핑 (홈페이지 측 customer-lookup)
  customerName: z.string(),
  customerPhone: z.string(),        // 010-XXXX-XXXX
  customerSource: z.enum(['inboundCustomers', 'crm_customers']),
  customerSourceId: z.string(),

  tier: z.enum(REVIEW_TIERS),
  rating: z.number().min(1).max(5),
  parts: z.array(z.string()),
  brand: z.string(),
  model: z.string(),
  reviewText: z.string(),
  tags: z.array(z.string()).optional(),
  photos: z.array(ReviewPhotoSchema).optional(),
  snapshot: ReviewSnapshotSchema.optional(),

  // 승인 워크플로
  status: z.enum(REVIEW_STATUSES),
  publishedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedBy: z.string().optional(),
  rejectedAt: z.string().optional(),
  hiddenBy: z.string().optional(),
  hiddenAt: z.string().optional(),

  // 수정 이력
  editHistory: z.array(ReviewEditHistorySchema).optional(),

  // 메타
  source: z.literal('homepage'),
  createdBy: z.string(),             // 봇 uid: s7ohR8XWNbfvduRJN96xpRj9ors2 (review-bot@cahwindow.local)
  createdAt: z.string(),
  lastModifiedAt: z.string(),
  lastModifiedBy: z.string(),

  // Stage 3
  helpfulCount: z.number().optional(),
});
export type Review = z.infer<typeof ReviewSchema> & { docId: string };

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: '검토 대기',
  approved: '게시 중',
  rejected: '거절',
  hidden: '숨김',
};

export const REVIEW_STATUS_BADGE: Record<ReviewStatus, { bg: string; fg: string }> = {
  pending:  { bg: '#FEF3C7', fg: '#92400E' },
  approved: { bg: '#D1FAE5', fg: '#065F46' },
  rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
  hidden:   { bg: '#E5E7EB', fg: '#374151' },
};
```

**`packages/schemas/src/index.ts`** 에 두 줄 추가:
```ts
// 2026-05-18 (이승환): 홈페이지 시공후기 — ERP /admin/reviews 에서 승인 관리.
export * from './review.js';
```
그리고 `COLLECTIONS` 상수에:
```ts
reviews: 'reviews',  // 2026-05-18 — 시공후기
```

---

### 2. Firestore CRUD 헬퍼

**파일**: `apps/web/src/lib/reviews.ts` (신규)

inbound-customers.ts 패턴 동일.

```ts
import {
  collection, doc, getDoc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where,
  type QueryConstraint, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Review, ReviewStatus, ReviewEditHistory } from '@cahwindow/schemas';

export interface ListReviewsOptions {
  status?: ReviewStatus | ReviewStatus[];
  tier?: 'simple' | 'premium';
  max?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

function withDocId(snapDoc: { id: string; data: () => unknown }): Review {
  return { docId: snapDoc.id, ...(snapDoc.data() as Omit<Review, 'docId'>) };
}

export function subscribeReviews(
  options: ListReviewsOptions,
  callback: (reviews: Review[]) => void,
): Unsubscribe {
  const constraints: QueryConstraint[] = [];
  if (typeof options.status === 'string') {
    constraints.push(where('status', '==', options.status));
  } else if (Array.isArray(options.status) && options.status.length > 0) {
    constraints.push(where('status', 'in', options.status.slice(0, 10)));
  }
  if (options.tier) constraints.push(where('tier', '==', options.tier));
  constraints.push(
    orderBy(options.orderByField ?? 'createdAt', options.orderDirection ?? 'desc'),
  );
  const q = query(collection(db, 'reviews'), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.docs.map(withDocId)));
}

export function subscribeReview(
  docId: string,
  callback: (review: Review | null) => void,
): Unsubscribe {
  const ref = doc(db, 'reviews', docId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ docId: snap.id, ...(snap.data() as Omit<Review, 'docId'>) });
  });
}

/** 후기 승인 */
export async function approveReview(
  docId: string,
  ctx: { uid: string; userName?: string },
): Promise<void> {
  const ref = doc(db, 'reviews', docId);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    status: 'approved',
    publishedAt: now,
    approvedBy: ctx.uid,
    approvedAt: now,
    rejectionReason: null,
    lastModifiedAt: serverTimestamp(),
    lastModifiedBy: ctx.uid,
  });
}

/** 후기 거절 */
export async function rejectReview(
  docId: string,
  reason: string,
  ctx: { uid: string; userName?: string },
): Promise<void> {
  if (!reason.trim()) throw new Error('거절 사유를 입력해 주세요.');
  const ref = doc(db, 'reviews', docId);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    status: 'rejected',
    rejectionReason: reason.trim(),
    rejectedBy: ctx.uid,
    rejectedAt: now,
    lastModifiedAt: serverTimestamp(),
    lastModifiedBy: ctx.uid,
  });
}

/** 후기 숨김 (Stage 2) */
export async function hideReview(
  docId: string,
  ctx: { uid: string; userName?: string },
): Promise<void> {
  const ref = doc(db, 'reviews', docId);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    status: 'hidden',
    hiddenBy: ctx.uid,
    hiddenAt: now,
    lastModifiedAt: serverTimestamp(),
    lastModifiedBy: ctx.uid,
  });
}

/** 본문 수정 (editHistory 자동 push) */
export async function updateReviewText(
  docId: string,
  newText: string,
  ctx: { uid: string; userName?: string },
): Promise<void> {
  if (!newText.trim()) throw new Error('본문이 비어 있습니다.');
  const ref = doc(db, 'reviews', docId);
  const cur = await getDoc(ref);
  if (!cur.exists()) throw new Error(`review not found: ${docId}`);
  const prev = cur.data() as Review;
  if (prev.reviewText === newText.trim()) return;

  const entry: ReviewEditHistory = {
    at: new Date().toISOString(),
    by: ctx.uid,
    byName: ctx.userName,
    field: 'reviewText',
    before: prev.reviewText,
    after: newText.trim(),
  };

  await updateDoc(ref, {
    reviewText: newText.trim(),
    editHistory: [...(prev.editHistory ?? []), entry],
    lastModifiedAt: serverTimestamp(),
    lastModifiedBy: ctx.uid,
  });
}

/** 클라이언트 측 검색 */
export function searchReviews(reviews: Review[], keyword: string): Review[] {
  const kw = keyword.trim();
  if (!kw) return reviews;
  const last4kw = kw.replace(/[^0-9]/g, '');
  return reviews.filter((r) => {
    if (r.customerName?.includes(kw)) return true;
    if (r.reviewText?.includes(kw)) return true;
    if (last4kw && r.customerPhone.replace(/[^0-9]/g, '').includes(last4kw)) return true;
    if (r.brand?.includes(kw)) return true;
    if (r.model?.includes(kw)) return true;
    return false;
  });
}
```

---

### 3. 리스트 페이지

**파일**: `apps/web/src/app/admin/reviews/page.tsx` (신규)

`inbound-customers/page.tsx` 패턴 그대로:

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  REVIEW_STATUSES, REVIEW_STATUS_LABELS, REVIEW_STATUS_BADGE,
  type Review, type ReviewStatus,
} from '@cahwindow/schemas';
import { subscribeReviews, searchReviews } from '@/lib/reviews';
import { useAuth } from '@/lib/auth-context';

export default function ReviewsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [all, setAll] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('pending');
  const [tierFilter, setTierFilter] = useState<'all' | 'simple' | 'premium'>('all');

  useEffect(() => {
    if (authLoading || !appUser) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeReviews({ max: 500 }, (rows) => {
      setAll(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [appUser, authLoading]);

  const filtered = useMemo(() => {
    let rows = all;
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter);
    if (tierFilter !== 'all') rows = rows.filter((r) => r.tier === tierFilter);
    rows = searchReviews(rows, keyword);
    return rows;
  }, [all, keyword, statusFilter, tierFilter]);

  // 상태별 카운트
  const counts = useMemo(() => {
    const c: Record<ReviewStatus | 'all', number> = {
      all: all.length, pending: 0, approved: 0, rejected: 0, hidden: 0,
    };
    for (const r of all) c[r.status]++;
    return c;
  }, [all]);

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 + 필터 */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">⭐ 시공후기</h1>
          <div className="text-xs text-gray-500">
            전체 {counts.all} · 검토대기 <b className="text-amber-700">{counts.pending}</b> ·
            게시중 <b className="text-emerald-700">{counts.approved}</b> ·
            거절 {counts.rejected} {counts.hidden > 0 && `· 숨김 ${counts.hidden}`}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="🔍 고객명·전화·본문·브랜드"
            className="h-9 w-64 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReviewStatus)}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
          >
            <option value="all">전체 상태</option>
            {REVIEW_STATUSES.map((s) => (
              <option key={s} value={s}>{REVIEW_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'all' | 'simple' | 'premium')}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
          >
            <option value="all">전체 유형</option>
            <option value="simple">간편</option>
            <option value="premium">프리미엄</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">조건에 맞는 후기가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left text-xs text-gray-700">
                <th className="px-4 py-2.5">작성일</th>
                <th className="px-4 py-2.5">고객명</th>
                <th className="px-4 py-2.5">전화</th>
                <th className="px-4 py-2.5">유형</th>
                <th className="px-4 py-2.5">별점</th>
                <th className="px-4 py-2.5">브랜드 · 모델</th>
                <th className="px-4 py-2.5">본문(요약)</th>
                <th className="px-4 py-2.5">상태</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const badge = REVIEW_STATUS_BADGE[r.status];
                return (
                  <tr
                    key={r.docId}
                    onClick={() => router.push(`/admin/reviews/${r.docId}`)}
                    className="cursor-pointer border-b border-gray-100 hover:bg-amber-50"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.createdAt).toLocaleString('ko-KR', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {r.customerName.replace(/-\d{4}$/, '')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.customerPhone}</td>
                    <td className="px-4 py-3">
                      {r.tier === 'premium' ? '⭐ 프리미엄' : '간편'}
                    </td>
                    <td className="px-4 py-3 text-amber-600">{'★'.repeat(r.rating)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.brand} · {r.model}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-md truncate">
                      {r.reviewText}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: badge.bg, color: badge.fg }}
                      >
                        {REVIEW_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

---

### 4. 상세 페이지

**파일**: `apps/web/src/app/admin/reviews/[docId]/page.tsx` (신규)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  REVIEW_STATUS_LABELS, REVIEW_STATUS_BADGE,
  type Review,
} from '@cahwindow/schemas';
import {
  subscribeReview, approveReview, rejectReview, hideReview, updateReviewText,
} from '@/lib/reviews';
import { useAuth } from '@/lib/auth-context';

export default function ReviewDetailPage() {
  const { docId } = useParams<{ docId: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // 본문 수정 모드
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  // 거절 사유 모달
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    const unsub = subscribeReview(docId, (r) => {
      setReview(r);
      if (r) setEditText(r.reviewText);
      setLoading(false);
    });
    return () => unsub();
  }, [docId]);

  if (loading) return <div className="p-8">로딩 중...</div>;
  if (!review) return <div className="p-8">후기를 찾을 수 없습니다.</div>;

  const ctx = { uid: appUser!.uid, userName: appUser!.name };
  const badge = REVIEW_STATUS_BADGE[review.status];

  async function withBusy(fn: () => Promise<void>, okMsg: string) {
    try {
      setBusy(true);
      setMsg('');
      await fn();
      setMsg(okMsg);
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(`⚠ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const handleApprove = () => withBusy(() => approveReview(docId!, ctx), '✓ 승인됨');
  const handleReject = () => withBusy(async () => {
    await rejectReview(docId!, rejectReason, ctx);
    setShowReject(false);
    setRejectReason('');
  }, '✓ 거절됨');
  const handleHide = () => withBusy(() => hideReview(docId!, ctx), '✓ 숨김됨');
  const handleSaveText = () => withBusy(async () => {
    await updateReviewText(docId!, editText, ctx);
    setEditing(false);
  }, '✓ 본문 수정됨');

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="text-sm text-gray-500">
          <Link href="/admin/reviews" className="hover:text-gray-700">← 시공후기</Link>
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <h1 className="text-lg font-semibold">{review.customerName.replace(/-\d{4}$/, '')} 의 시공후기</h1>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {REVIEW_STATUS_LABELS[review.status]}
          </span>
          <span className="text-xs text-gray-500">#{docId}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
          {/* 좌: 본문 + 사진 */}
          <div className="space-y-6">
            {/* 사진 갤러리 */}
            {review.photos && review.photos.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold">사진 ({review.photos.length}장)</div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {review.photos.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square overflow-hidden rounded-lg border border-gray-200 hover:opacity-90"
                    >
                      <img src={p.url} alt="" className="h-full w-full object-cover" />
                      <div className="text-xs text-center text-gray-500 mt-1">
                        {p.label?.toUpperCase()}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 본문 + 수정 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">본문</div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    ✏ 본문 수정
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(false); setEditText(review.reviewText); }}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveText}
                      disabled={busy}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      {busy ? '저장중…' : '저장'}
                    </button>
                  </div>
                )}
              </div>
              {!editing ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {review.reviewText}
                </p>
              ) : (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={Math.max(6, Math.ceil(editText.length / 50))}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              )}
            </div>

            {/* 메타 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 text-sm font-semibold">시공 정보</div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field k="유형" v={review.tier === 'premium' ? '⭐ 프리미엄' : '간편'} />
                <Field k="별점" v={'★'.repeat(review.rating)} />
                <Field k="브랜드" v={review.brand} />
                <Field k="모델" v={review.model} />
                <Field k="시공 부위" v={review.parts.join(' · ')} />
                {review.tags && review.tags.length > 0 && (
                  <Field k="좋았던 부분" v={review.tags.join(' · ')} />
                )}
                {review.snapshot?.locationLabel && (
                  <Field k="위치" v={review.snapshot.locationLabel} />
                )}
                {review.snapshot?.installDate && (
                  <Field k="시공일" v={review.snapshot.installDate} />
                )}
                {review.snapshot?.productLabel && (
                  <Field k="제품 (ERP)" v={review.snapshot.productLabel} />
                )}
                {review.snapshot?.warrantyLabel && (
                  <Field k="보증" v={review.snapshot.warrantyLabel} />
                )}
              </dl>
            </div>

            {/* 수정 이력 */}
            {review.editHistory && review.editHistory.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-3 text-sm font-semibold">수정 이력 ({review.editHistory.length})</div>
                <ul className="space-y-3 text-xs text-gray-600">
                  {review.editHistory.map((h, i) => (
                    <li key={i} className="border-l-2 border-gray-200 pl-3">
                      <div className="font-mono">{new Date(h.at).toLocaleString('ko-KR')} · {h.byName ?? h.by}</div>
                      <div className="mt-1 text-red-600 line-through">{h.before.slice(0, 80)}</div>
                      <div className="text-green-700">{h.after.slice(0, 80)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 우: 액션 */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 text-sm font-semibold">고객 정보</div>
              <dl className="space-y-2 text-sm">
                <Field k="이름" v={review.customerName} />
                <Field k="전화" v={review.customerPhone} />
                <Field k="출처" v={review.customerSource} small />
                <Field k="원본 ID" v={review.customerSourceId} small />
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 text-sm font-semibold">승인 액션</div>
              {review.status === 'pending' && (
                <div className="space-y-2">
                  <button
                    onClick={handleApprove}
                    disabled={busy}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✓ 승인 (사이트 노출)
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={busy}
                    className="w-full rounded-lg border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    ✗ 거절
                  </button>
                </div>
              )}
              {review.status === 'approved' && (
                <div className="space-y-2">
                  <button
                    onClick={handleHide}
                    disabled={busy}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    👁‍🗨 숨김 (일시)
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={busy}
                    className="w-full rounded-lg border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    거절로 변경
                  </button>
                </div>
              )}
              {(review.status === 'rejected' || review.status === 'hidden') && (
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  재승인 (사이트 노출)
                </button>
              )}

              {review.rejectionReason && (
                <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">
                  <b>거절 사유:</b> {review.rejectionReason}
                </div>
              )}

              {msg && (
                <div className="mt-3 text-xs text-emerald-700">{msg}</div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* 거절 사유 모달 */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold">거절 사유 입력</h3>
            <p className="mt-1 text-xs text-gray-500">고객에게 표시되진 않지만 기록됩니다.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 욕설 포함 / 광고성 / 본인확인 불일치 등"
              rows={4}
              className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowReject(false); setRejectReason(''); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                거절 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ k, v, small }: { k: string; v: string; small?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{k}</dt>
      <dd className={small ? 'font-mono text-xs text-gray-700' : 'text-gray-900'}>{v}</dd>
    </div>
  );
}
```

---

### 5. NAV 메뉴 등록 (기타관리 그룹)

**파일**: `apps/web/src/components/AdminShell.tsx`

**위치**: 라인 348-369 사이 `kind: 'group', key: 'misc', label: '기타관리'` 의 `children` 배열 안에 추가. **롯데할부 아래 (마지막)** 또는 자유 위치.

```ts
{
  kind: 'group',
  key: 'misc',
  label: '기타관리',
  icon: '🗂',
  children: [
    { href: '/admin/delivery-confirmations', label: '납품확인서', icon: '📦' },
    { href: '/admin/warranties', label: '15년 보증서 관리', icon: '🛡️', requirePerm: ['warranty.view'] },
    // ... 기존 항목들 ...
    { href: '/admin/lotte-installments', label: '롯데할부', icon: '💳', requireRole: ['admin', 'manager'] },

    // ★ 2026-05-18: 시공후기 관리 추가
    {
      href: '/admin/reviews',
      label: '시공후기 관리',
      icon: '⭐',
      requireRole: ['admin', 'manager'],  // 또는 requirePerm: ['reviews.approve'] (권한 매트릭스 추가 시)
    },
  ],
},
```

> 권한 매트릭스 (`role-permissions.ts`)에 `reviews.approve` 같은 신규 권한 추가는 **선택**. 단순화하려면 `requireRole: ['admin', 'manager']` 만으로도 충분.

---

### 6. Firestore Rules 갱신 (선택 — 보안 강화)

현재 배포된 Rules 는 `isAdmin()` 만 read/write. manager도 승인할 수 있게 + 본문 수정 트래킹을 더 빡빡하게 하려면 다음으로 교체:

**파일**: `firebase/firestore.rules` 의 `match /reviews/{docId}` 블록

```firestore
match /reviews/{docId} {
  function isReviewer() {
    return isSignedIn() && (userRole() == 'admin' || userRole() == 'manager');
  }
  function safeMetaUpdate() {
    return request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      'status', 'publishedAt', 'rejectionReason',
      'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt',
      'hiddenBy', 'hiddenAt',
      'lastModifiedAt', 'lastModifiedBy',
    ]);
  }
  function safeContentEdit() {
    return request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      'reviewText', 'editHistory', 'lastModifiedAt', 'lastModifiedBy',
    ]);
  }

  allow read: if isReviewer() || isAdmin() || resource.data.status == 'approved';
  allow create: if isAdmin() &&
                   request.resource.data.status == 'pending' &&
                   request.resource.data.source == 'homepage';
  allow update: if isReviewer() && (safeMetaUpdate() || safeContentEdit());
  allow delete: if isAdmin();
}
```

배포: `firebase deploy --only firestore:rules`

> **이거 안 해도 동작은 됨** (admin role 봇으로 작성하고, manager는 본인 권한 없으면 페이지 진입 시 차단). 보안 강화일 뿐.

---

## 작업 순서 (부사장님/ERP 담당이 진행)

1. **Schema 추가** — `packages/schemas/src/review.ts` + `index.ts` 2줄
2. **빌드 확인** — `pnpm --filter @cahwindow/schemas build`
3. **Lib 추가** — `apps/web/src/lib/reviews.ts`
4. **리스트 페이지** — `apps/web/src/app/admin/reviews/page.tsx`
5. **상세 페이지** — `apps/web/src/app/admin/reviews/[docId]/page.tsx`
6. **NAV 등록** — `AdminShell.tsx` 기타관리 그룹에 1줄
7. **(선택) Rules 강화** — `firestore.rules` 의 reviews 블록 교체 + `firebase deploy`
8. **검증**:
   - ERP `/admin/reviews` 진입 → 현재 pending 2건 (`260518-2683-61`, `260518-3386-68`) 보임
   - 한 건 클릭 → 상세 → "✓ 승인" → 사이트(`homewindow.kr/review` 또는 로컬 `localhost:8788/review`) 새로고침 → 즉시 노출
   - 본문 수정 → editHistory 1줄 박힘
   - 거절 → 사유 입력 → 사이트에서 안 보임

---

## 임시 운영 가이드 (Console)

ERP 페이지 만들기 전까지 부사장님이 직접:

| 작업 | 방법 |
|---|---|
| **승인** | reviews/{docId} → status 필드 `pending` → `approved` 변경 + publishedAt 신규 string 필드 추가 (ISO 시각) |
| **거절** | status → `rejected` + rejectionReason 신규 string 필드 추가 |
| **본문 수정** | reviewText 필드 더블클릭 → 편집 → 저장 |
| **삭제** | 도큐먼트 우측 점 3개 메뉴 → 삭제 |

링크: https://console.firebase.google.com/project/cahwindow-quote/firestore/data/~2Freviews

---

## ★ 메인 노출 (featured) — 2026-05-18 추가

홈페이지 메인의 ReviewSection 은 **`featured: true` 로 토글된 후기만** 노출.
홈페이지 측 코드는 이미 완료 (`/api/review/list?featured=1`). ERP 측 추가 작업.

### A. Schema 추가 (`packages/schemas/src/review.ts`)

기존 ReviewSchema 에 4개 필드 추가:
```ts
  // 메인 노출 토글 (2026-05-18)
  featured: z.boolean().optional(),       // true 면 홈페이지 메인 ReviewSection 에 노출
  featuredAt: z.string().optional(),      // 토글 켠 시각 (ISO) — 정렬용
  featuredBy: z.string().optional(),      // 토글한 직원 uid
  featuredOrder: z.number().optional(),   // 수동 정렬 (작은 숫자 위)
```

### B. Lib 함수 추가 (`apps/web/src/lib/reviews.ts`)

```ts
/**
 * 메인 노출 토글 — featured on/off + featuredAt/By 갱신.
 *
 * 정책:
 *   - status='approved' 만 토글 가능 (UI에서 가드)
 *   - 최대 8개까지 추천 (운영 가이드 — 코드 강제 X)
 */
export async function setReviewFeatured(
  docId: string,
  featured: boolean,
  ctx: { uid: string; userName?: string },
): Promise<void> {
  const ref = doc(db, 'reviews', docId);
  const now = new Date().toISOString();
  if (featured) {
    await updateDoc(ref, {
      featured: true,
      featuredAt: now,
      featuredBy: ctx.uid,
      lastModifiedAt: serverTimestamp(),
      lastModifiedBy: ctx.uid,
    });
  } else {
    await updateDoc(ref, {
      featured: false,
      featuredAt: null,
      featuredBy: null,
      featuredOrder: null,
      lastModifiedAt: serverTimestamp(),
      lastModifiedBy: ctx.uid,
    });
  }
}

/**
 * 현재 featured=true 인 후기 개수 (운영 가이드 8개 제한 체크용).
 */
export async function countFeaturedReviews(): Promise<number> {
  const q = query(collection(db, 'reviews'), where('featured', '==', true));
  const snap = await getDocs(q);  // import { getDocs } from 'firebase/firestore' 필요
  return snap.size;
}
```

### C. 상세 페이지 UI 추가 (`apps/web/src/app/admin/reviews/[docId]/page.tsx`)

우측 사이드바, "승인 액션" 카드 **아래** 별도 카드:

```tsx
{/* 메인 노출 토글 */}
<div className="rounded-xl border border-gray-200 bg-white p-5">
  <div className="mb-2 flex items-center justify-between">
    <div className="text-sm font-semibold">⭐ 메인 노출</div>
    {/* 토글 스위치 */}
    <button
      type="button"
      onClick={handleToggleFeatured}
      disabled={busy || review.status !== 'approved'}
      className={
        'relative h-6 w-11 rounded-full transition ' +
        (review.featured
          ? 'bg-amber-500'
          : 'bg-gray-300 disabled:bg-gray-200')
      }
    >
      <span
        className={
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ' +
          (review.featured ? 'left-5' : 'left-0.5')
        }
      />
    </button>
  </div>
  <p className="text-xs text-gray-500 leading-relaxed">
    {review.status !== 'approved'
      ? '⚠ 승인된 후기만 메인 노출 가능합니다.'
      : review.featured
        ? '✓ 홈페이지 메인 ReviewSection 에 노출 중입니다.'
        : '홈페이지 메인 ReviewSection 에 노출하려면 ON.'}
  </p>
  {review.featured && review.featuredAt && (
    <div className="mt-2 text-[11px] text-gray-400 font-mono">
      {new Date(review.featuredAt).toLocaleString('ko-KR')}{' '}
      · {review.featuredBy}
    </div>
  )}
</div>
```

핸들러:
```tsx
async function handleToggleFeatured() {
  // 켤 때 8개 초과 경고 (선택)
  if (!review.featured) {
    const count = await countFeaturedReviews();
    if (count >= 8) {
      if (!confirm(`현재 ${count}개 메인 노출 중. 8개 초과 시 정렬 잘림. 계속할까요?`)) return;
    }
  }
  await withBusy(
    () => setReviewFeatured(docId!, !review.featured, ctx),
    review.featured ? '✓ 메인 노출 해제' : '✓ 메인 노출 활성',
  );
}
```

### D. 리스트 페이지에 featured 컬럼 추가 (선택)

`/admin/reviews/page.tsx` 테이블에 `⭐` 컬럼:
```tsx
<th className="px-4 py-2.5">메인</th>
...
<td className="px-4 py-3 text-center">
  {r.featured ? <span className="text-amber-500">⭐</span> : ''}
</td>
```

필터에 "메인 노출만" 옵션:
```tsx
const [featuredOnly, setFeaturedOnly] = useState(false);
// ...
if (featuredOnly) rows = rows.filter((r) => r.featured === true);
```

### E. Firestore Rules 갱신 — safeMetaUpdate 에 추가

기존 `match /reviews/{docId}` 의 `safeMetaUpdate` 함수에 `featured` 관련 4개 필드 추가:
```firestore
function safeMetaUpdate() {
  return request.resource.data.diff(resource.data).affectedKeys().hasOnly([
    'status', 'publishedAt', 'rejectionReason',
    'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt',
    'hiddenBy', 'hiddenAt',
    'featured', 'featuredAt', 'featuredBy', 'featuredOrder',  // ← 추가
    'lastModifiedAt', 'lastModifiedBy',
  ]);
}
```

배포: `firebase deploy --only firestore:rules`

### F. 운영 가이드

- **최대 노출 개수**: 권장 8개. 메인 페이지엔 4개만 노출되므로 여분 4개는 추후 활용/A/B 용.
- **정렬**: `featuredOrder asc` → `featuredAt desc`. order 미지정이면 최근 토글 순.
- **노출 정책**: 부사장님이 검토하면서 "좋은 후기" 골라서 토글. 시즌별/캠페인별 교체.
- **상시 운영**: 한 달에 한 번 정도 메인 노출 후기 교체 권장 (방문자 새로움).

### G. 임시 운영 (ERP UI 만들기 전)

Firestore Console 에서 직접:
1. https://console.firebase.google.com/project/cahwindow-quote/firestore/data/~2Freviews
2. 도큐먼트 클릭
3. 「+ 필드 추가」:
   - `featured` (boolean) → `true`
   - `featuredAt` (string) → 현재 ISO 시각
4. 저장 → 홈페이지 메인 새로고침 → ReviewSection 에 즉시 노출

---

## 미해결/후속

1. **권한 매트릭스 reviews 권한** — Stage 2 (단순화 위해 일단 requireRole만)
2. **featured 수동 정렬 UI** — 드래그 앤 드롭 (Stage 2.5)
3. **고객 답글** — 관리자가 후기에 답글 (Stage 3)
4. **"내 후기 조회" 페이지** — 고객이 자기 후기 상태 확인 (Stage 3)
5. **알림** — pending 들어왔을 때 알림톡/이메일 (사용자 결정: 안 씀. 관리자가 직접 확인)

---

## 참고

- 홈페이지 측 코드 (참고용):
  - `functions/api/review/customer-lookup.ts` — 본인확인 + snapshot
  - `functions/api/review/submit.ts` — Firestore reviews insert
  - `functions/api/review/list.ts` / `[id].ts` — 공개 조회 (status=approved 강제)
  - `functions/_shared/customerSnapshot.ts` — ERP 5개 컬렉션 join
- 봇 계정: `review-bot@cahwindow.local` (uid: `s7ohR8XWNbfvduRJN96xpRj9ors2`)
- 현재 reviews 2건 (검토 대기):
  - `260518-2683-61` (전효정 / 010-3200-2683 / ★4 simple)
  - `260518-3386-68` (김예은 / 010-3345-3386 / ★5 simple)
