/**
 * GET /api/review/:id
 * 공개용 단건 — status=approved 만 노출.
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  getRestSession,
  decodeFields,
} from '../../_shared/firestoreRest';
import { compressLocation } from '../../_shared/locationCompress';
import type { FirebaseEnv } from '../../_shared/firebaseEnv';

export const onRequestOptions: PagesFunction<FirebaseEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet: PagesFunction<FirebaseEnv> = async ({
  params,
  env,
}) => {
  const id = String(params.id || '');
  if (!id) return errorResponse('id가 필요합니다.', 400);

  let session;
  try {
    session = await getRestSession(env);
  } catch (e) {
    console.error('[review/[id]] signIn 실패:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  const url = `https://firestore.googleapis.com/v1/projects/${session.projectId}/databases/(default)/documents/reviews/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.idToken}` },
  });
  if (res.status === 404) return errorResponse('후기를 찾을 수 없습니다.', 404);
  if (!res.ok) {
    console.error('[review/[id]] 조회 실패:', res.status, await res.text().catch(() => ''));
    return errorResponse('후기 조회 실패', 500);
  }
  const doc = (await res.json()) as { fields: Record<string, unknown> };
  const f = decodeFields(doc.fields as never);
  if (f.status !== 'approved') return errorResponse('후기를 찾을 수 없습니다.', 404);

  const name = String(f.customerName || '');
  return jsonResponse({
    id,
    tier: f.tier,
    rating: f.rating,
    brand: f.brand,
    model: f.model,
    parts: f.parts,
    tags: f.tags,
    reviewText: f.reviewText,
    photos: f.photos,
    snapshot: sanitizeSnapshot(f.snapshot), // 자동 매핑된 메타 (productLabel/locationLabel/installDate 등)
    customerName: maskName(stripLast4Suffix(name)),
    // 화면 표기는 "리뷰 작성일"(createdAt) 기준 — 승인/게시일(publishedAt)이 아니라
    publishedAt: f.createdAt || f.publishedAt,
    helpfulCount: f.helpfulCount || 0,
  });
};

function stripLast4Suffix(n: string): string {
  return n.replace(/-\d{4}$/, '');
}
function maskName(n: string): string {
  if (n.length <= 2) return n[0] + '*';
  return n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
}
// 과거 박제된 snapshot.locationLabel 에 동호수("102동")가 남아 있어 읽기 시점에 재압축
function sanitizeSnapshot(snap: unknown): unknown {
  if (!snap || typeof snap !== 'object') return snap;
  const s = snap as Record<string, unknown>;
  if (typeof s.locationLabel === 'string' && s.locationLabel) {
    return { ...s, locationLabel: compressLocation(s.locationLabel) };
  }
  return snap;
}
