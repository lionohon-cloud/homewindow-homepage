/**
 * POST /api/review/submit
 * Content-Type: multipart/form-data
 *   token, tier, rating, parts(JSON), brand, model, reviewText, tags?(JSON),
 *   photos[]?, photoLabels[]?, hw_website
 *
 * 흐름:
 *   1. JWT 검증 → phone, source, sourceId, customerName 복원
 *   2. 필드 검증 (tier별 본문/사진 규칙)
 *   3. Firebase 시스템 계정 signIn
 *   4. (프리미엄) 사진 Firebase Storage REST 업로드
 *   5. reviews/{docId} 생성 (status='pending')
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  getRestSession,
  restCreateDocument,
  uploadStorageObject,
  storageDownloadUrl,
} from '../../_shared/firestoreRest';
import { verifyReviewToken } from '../../_shared/reviewJwt';
import { buildSnapshot } from '../../_shared/customerSnapshot';
import type { FirebaseEnv } from '../../_shared/firebaseEnv';

export const onRequestOptions: PagesFunction<FirebaseEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<FirebaseEnv> = async ({
  request,
  env,
}) => {
  if (!env.REVIEW_JWT_SECRET) return errorResponse('서버 설정 오류', 500);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('multipart/form-data 형식이 아닙니다.', 400);
  }

  if (String(form.get('hw_website') || '').length > 0) {
    return jsonResponse({ id: 'bot', status: 'rejected' });
  }

  const token = String(form.get('token') || '');
  const payload = await verifyReviewToken(token, env.REVIEW_JWT_SECRET);
  if (!payload) return errorResponse('본인확인 토큰이 만료되었거나 잘못되었습니다.', 401);

  const tier = String(form.get('tier') || '');
  const rating = Number(form.get('rating') || 0);
  const brand = String(form.get('brand') || '');
  const model = String(form.get('model') || '');
  const reviewText = String(form.get('reviewText') || '');
  const partsRaw = String(form.get('parts') || '[]');
  const tagsRaw = String(form.get('tags') || '');

  let parts: string[] = [];
  try {
    parts = JSON.parse(partsRaw);
    if (!Array.isArray(parts)) parts = [];
  } catch {
    parts = [];
  }
  let tags: string[] | undefined;
  if (tagsRaw) {
    try {
      tags = JSON.parse(tagsRaw);
      if (!Array.isArray(tags)) tags = undefined;
    } catch {
      tags = undefined;
    }
  }

  // ---------- 검증 ----------
  if (!['simple', 'premium'].includes(tier))
    return errorResponse('잘못된 후기 유형', 400);
  if (!rating || rating < 1 || rating > 5)
    return errorResponse('별점을 선택해 주세요.', 400);
  if (!brand || !model) return errorResponse('브랜드/모델을 선택해 주세요.', 400);
  if (!parts.length) return errorResponse('시공 부위를 선택해 주세요.', 400);
  if (tier === 'simple' && (!reviewText || reviewText.length > 50))
    return errorResponse('간편 후기는 50자 이내로 작성해 주세요.', 400);
  if (tier === 'premium' && reviewText.length < 200)
    return errorResponse('프리미엄 후기는 200자 이상 작성해 주세요.', 400);

  const photoFiles = form
    .getAll('photos')
    .filter((v): v is File => v instanceof File);
  const photoLabels = form.getAll('photoLabels').map(String);
  if (tier === 'premium' && photoFiles.length < 3)
    return errorResponse('프리미엄 후기는 사진 3장 이상이 필요합니다.', 400);
  if (photoFiles.length > 10)
    return errorResponse('사진은 최대 10장까지 가능합니다.', 400);
  for (const f of photoFiles) {
    if (!f.type.startsWith('image/')) return errorResponse('이미지만 업로드 가능합니다.', 400);
    if (f.size > 10 * 1024 * 1024) return errorResponse('각 사진은 10MB 이하여야 합니다.', 400);
  }

  // ---------- Firebase signIn ----------
  let session;
  try {
    session = await getRestSession(env);
  } catch (e) {
    console.error('[review/submit] signIn 실패:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  // ---------- docId 생성 ----------
  const now = new Date();
  const yy = String(now.getFullYear() % 100).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const last4 = payload.phone.replace(/[^0-9]/g, '').slice(-4);
  const seq = String(now.getTime() % 100).padStart(2, '0');
  const docId = `${yy}${mm}${dd}-${last4}-${seq}`;

  // ---------- 사진 업로드 (병렬) ----------
  let uploaded: Array<{ path: string; url: string; label: string; mime: string }>;
  try {
    uploaded = await Promise.all(
      photoFiles.map(async (f, i) => {
        const label = (photoLabels[i] || 'other').slice(0, 12);
        const ext = (f.name.match(/\.[a-zA-Z0-9]+$/)?.[0] || '.jpg').toLowerCase();
        const path = `reviews/${docId}/photos/${i}-${label}${ext}`;
        const buf = await f.arrayBuffer();
        await uploadStorageObject(session, path, buf, f.type || 'image/jpeg');
        return {
          path,
          url: storageDownloadUrl(session.storageBucket, path),
          label,
          mime: f.type || 'image/jpeg',
        };
      }),
    );
  } catch (e) {
    console.error('[review/submit] 사진 업로드 실패:', e);
    return errorResponse('사진 업로드에 실패했습니다.', 500);
  }

  // ---------- ERP snapshot 자동 매핑 ----------
  // inboundCustomers + crm_customers 둘 다 지원
  let snapshot: Record<string, unknown> | undefined;
  try {
    const snap = await buildSnapshot(session, payload.source, payload.sourceId);
    if (Object.values(snap).some((v) => v !== undefined && v !== null && v !== '')) {
      snapshot = snap as unknown as Record<string, unknown>;
    }
  } catch (e) {
    console.warn('[review/submit] snapshot 구성 실패 (계속 진행):', e);
  }

  // ---------- Firestore 생성 ----------
  const fields = {
    customerName: payload.customerName,
    customerPhone: payload.phone,
    customerSource: payload.source,
    customerSourceId: payload.sourceId,
    tier,
    rating,
    parts,
    brand,
    model,
    reviewText: reviewText.trim(),
    tags: tier === 'simple' ? tags || [] : undefined,
    photos: uploaded.length ? uploaded : undefined,
    snapshot,
    status: 'pending',
    source: 'homepage',
    createdAt: now.toISOString(),
    createdBy: session.uid,
    lastModifiedAt: now.toISOString(),
    lastModifiedBy: session.uid,
  };

  try {
    await restCreateDocument(session, 'reviews', docId, fields);
  } catch (e) {
    console.error('[review/submit] Firestore 생성 실패:', e);
    return errorResponse('후기 저장에 실패했습니다.', 500);
  }

  return jsonResponse({ id: docId, status: 'pending' });
};
