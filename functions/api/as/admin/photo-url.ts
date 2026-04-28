/**
 * GET /api/as/admin/photo-url?path=<storage path>
 * 관리자 - 사진 signed URL 발급 (1시간 유효)
 */
import type { AsEnv } from '../../../_shared/env';
import {
  createSupabaseRest,
  storageSignedUrl,
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
    console.error('[as/admin/photo-url] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  const user = await verifyAdminToken(supabase, request.headers.get('Authorization'));
  if (!user) return errorResponse('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  if (!path) return errorResponse('path 파라미터가 필요합니다.', 400);

  try {
    const signed = await storageSignedUrl(supabase, 'as-photos', path, 60 * 60);
    return jsonResponse({ url: signed });
  } catch (e) {
    console.error('[as/admin/photo-url] 실패:', e);
    return errorResponse('signed URL 발급 실패', 500);
  }
};
