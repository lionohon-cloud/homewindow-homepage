/**
 * GET /api/review/list?tier=&part=&sort=&limit=
 * 공개용 — status='approved' 강제. customerName 마스킹, customerPhone 제외.
 * 응답에 summary (avg + count + 별점 분포) 함께.
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  getRestSession,
  restQueryByField,
  decodeFields,
} from '../../_shared/firestoreRest';
import { compressLocation } from '../../_shared/locationCompress';
import type { FirebaseEnv } from '../../_shared/firebaseEnv';

export const onRequestOptions: PagesFunction<FirebaseEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet: PagesFunction<FirebaseEnv> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url);
  const tierParam = url.searchParams.get('tier'); // 'simple' | 'premium' | null
  const partParam = url.searchParams.get('part'); // 한글 부위명 또는 null
  const sortParam = (url.searchParams.get('sort') as 'latest' | 'helpful' | 'rating') || 'latest';
  const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50', 10) || 50);
  // 메인 페이지 ReviewSection 용: ERP에서 featured=true 토글한 후기만
  const featuredOnly = url.searchParams.get('featured') === '1';

  let session;
  try {
    session = await getRestSession(env);
  } catch (e) {
    console.error('[review/list] signIn 실패:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  let docs;
  try {
    docs = await restQueryByField(session, 'reviews', 'status', 'approved', 200);
  } catch (e) {
    console.error('[review/list] reviews 조회 실패:', e);
    return errorResponse('후기 조회 실패', 500);
  }

  // 디코딩 + 정렬용 정규화
  const all = docs.map((d) => {
    const f = decodeFields(d.fields);
    return { id: d.name.split('/').pop()!, fields: f };
  });

  // 별점 분포 (전체 approved 기준 — 필터 적용 전)
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  for (const r of all) {
    const rt = Number(r.fields.rating) as 1 | 2 | 3 | 4 | 5;
    if (rt >= 1 && rt <= 5) {
      distribution[rt]++;
      ratingSum += rt;
    }
  }
  const summary = {
    avg: all.length ? ratingSum / all.length : 0,
    count: all.length,
    distribution,
    counts: {
      all: all.length,
      simple: all.filter((r) => r.fields.tier === 'simple').length,
      premium: all.filter((r) => r.fields.tier === 'premium').length,
    },
  };

  // 필터
  let filtered = all;
  if (tierParam === 'simple' || tierParam === 'premium') {
    filtered = filtered.filter((r) => r.fields.tier === tierParam);
  }
  if (partParam) {
    filtered = filtered.filter((r) => {
      const parts = (r.fields.parts as string[]) || [];
      return parts.includes(partParam);
    });
  }
  // featured=1: ERP에서 토글한 메인 노출 후기만.
  // 없으면(0건) tier='premium' 최신으로 fallback. 그것도 0이면 빈 배열.
  if (featuredOnly) {
    const featuredItems = filtered.filter((r) => r.fields.featured === true);
    if (featuredItems.length > 0) {
      filtered = featuredItems;
    } else {
      const premiumFallback = filtered.filter((r) => r.fields.tier === 'premium');
      filtered = premiumFallback;
    }
  }

  // 정렬
  filtered.sort((a, b) => {
    // featured 모드는 featuredOrder asc → featuredAt desc 우선
    if (featuredOnly) {
      const ao = Number(a.fields.featuredOrder ?? 9999);
      const bo = Number(b.fields.featuredOrder ?? 9999);
      if (ao !== bo) return ao - bo;
      const af = String(b.fields.featuredAt || b.fields.publishedAt || b.fields.createdAt || '');
      const bf = String(a.fields.featuredAt || a.fields.publishedAt || a.fields.createdAt || '');
      return af.localeCompare(bf);
    }
    if (sortParam === 'rating') {
      return Number(b.fields.rating || 0) - Number(a.fields.rating || 0);
    }
    if (sortParam === 'helpful') {
      return Number(b.fields.helpfulCount || 0) - Number(a.fields.helpfulCount || 0);
    }
    // latest
    const ta = String(b.fields.publishedAt || b.fields.createdAt || '');
    const tb = String(a.fields.publishedAt || a.fields.createdAt || '');
    return ta.localeCompare(tb);
  });

  const items = filtered.slice(0, limit).map((r) => {
    const f = r.fields;
    const photos = (f.photos as Array<Record<string, unknown>>) || [];
    return {
      id: r.id,
      tier: f.tier,
      rating: f.rating,
      brand: f.brand,
      model: f.model,
      parts: f.parts,
      tags: f.tags,
      reviewText: f.reviewText,
      photos,
      videoCount: (f.videos as unknown[])?.length || 0,
      snapshot: sanitizeSnapshot(f.snapshot), // 자동 매핑된 메타 (productLabel/locationLabel/installDate 등)
      customerName: maskName(stripLast4Suffix(String(f.customerName || ''))),
      // 화면 표기는 "리뷰 작성일"(createdAt) 기준 — 승인/게시일(publishedAt)이 아니라
      publishedAt: f.createdAt || f.publishedAt,
      helpfulCount: f.helpfulCount || 0,
      featured: f.featured === true,
    };
  });

  return jsonResponse({ summary, items });
};

function stripLast4Suffix(n: string): string {
  return n.replace(/-\d{4}$/, '');
}
function maskName(n: string): string {
  if (!n) return '';
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
