/**
 * GET /api/as/admin/list?status=&q=&page=0
 * 관리자 - 접수 목록 조회.
 * Authorization: Bearer <supabase_jwt> 필수.
 */
import type { AsEnv } from '../../../_shared/env';
import {
  createSupabaseRest,
  verifyAdminToken,
} from '../../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../../_shared/cors';

const PAGE_SIZE = 20;

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<AsEnv> = async ({ request, env }) => {
  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/admin/list] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  const user = await verifyAdminToken(supabase, request.headers.get('Authorization'));
  if (!user) return errorResponse('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim();
  const page = Math.max(0, parseInt(url.searchParams.get('page') || '0', 10));

  // PostgREST 필터 빌드
  const filters: string[] = ['select=*'];
  if (status) filters.push(`status=eq.${encodeURIComponent(status)}`);
  if (q) {
    // 계약자명 / 전화 / 접수번호 OR 검색
    const safe = encodeURIComponent(q);
    filters.push(
      `or=(contractor_name.ilike.*${safe}*,phone.ilike.*${safe}*,reception_no.ilike.*${safe}*)`
    );
  }
  filters.push('order=created_at.desc');

  const fromIdx = page * PAGE_SIZE;
  const toIdx = fromIdx + PAGE_SIZE - 1;

  // count 헤더 + 페이지네이션
  const supaUrl = `${supabase.url}/rest/v1/as_requests?${filters.join('&')}`;
  let res: Response;
  try {
    res = await fetch(supaUrl, {
      headers: {
        apikey: supabase.serviceKey,
        Authorization: `Bearer ${supabase.serviceKey}`,
        Prefer: 'count=exact',
        Range: `${fromIdx}-${toIdx}`,
      },
    });
  } catch (e) {
    console.error('[as/admin/list] fetch 오류:', e);
    return errorResponse('조회 실패', 500);
  }

  if (!res.ok) {
    const text = await res.text();
    console.error('[as/admin/list] supabase 오류:', res.status, text);
    return errorResponse('조회 실패', 500);
  }

  const rows = await res.json();
  const contentRange = res.headers.get('content-range') || '';
  const total = (() => {
    const m = contentRange.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  })();

  return jsonResponse({
    items: rows,
    page,
    pageSize: PAGE_SIZE,
    total,
  });
};
