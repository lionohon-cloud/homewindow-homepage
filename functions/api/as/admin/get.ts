/**
 * GET /api/as/admin/get?id=<uuid>
 * 관리자 - 단건 상세 조회.
 */
import type { AsEnv } from '../../../_shared/env';
import {
  createSupabaseRest,
  pgSelect,
  verifyAdminToken,
} from '../../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../../_shared/cors';

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<AsEnv> = async ({ request, env }) => {
  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/admin/get] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  const user = await verifyAdminToken(supabase, request.headers.get('Authorization'));
  if (!user) return errorResponse('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('id가 필요합니다.', 400);

  try {
    const row = await pgSelect(
      supabase,
      'as_requests',
      `id=eq.${encodeURIComponent(id)}&select=*`,
      { single: true }
    );
    return jsonResponse(row);
  } catch (e) {
    return errorResponse('접수내역을 찾을 수 없습니다.', 404);
  }
};
