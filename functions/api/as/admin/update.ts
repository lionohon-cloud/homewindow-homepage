/**
 * PATCH /api/as/admin/update
 * 관리자 - 상태/메모 변경.
 * body: { id, status?, admin_memo? }
 */
import type { AsEnv } from '../../../_shared/env';
import {
  createSupabaseRest,
  pgUpdate,
  verifyAdminToken,
} from '../../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../../_shared/cors';

const ALLOWED_STATUS = new Set([
  'received',
  'scheduled',
  'in_progress',
  'done',
  'canceled',
]);

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPatch: PagesFunction<AsEnv> = async ({ request, env }) => {
  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/admin/update] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  const user = await verifyAdminToken(supabase, request.headers.get('Authorization'));
  if (!user) return errorResponse('인증이 필요합니다.', 401);

  let body: { id?: string; status?: string; admin_memo?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const id = (body.id || '').trim();
  if (!id) return errorResponse('id가 필요합니다.', 400);

  const update: Record<string, string> = {};
  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.has(body.status)) {
      return errorResponse('허용되지 않은 status 값', 400);
    }
    update.status = body.status;
  }
  if (body.admin_memo !== undefined) {
    if (body.admin_memo.length > 4000) {
      return errorResponse('메모가 너무 깁니다.', 400);
    }
    update.admin_memo = body.admin_memo;
  }

  if (Object.keys(update).length === 0) {
    return errorResponse('변경할 항목이 없습니다.', 400);
  }

  try {
    await pgUpdate(supabase, 'as_requests', `id=eq.${encodeURIComponent(id)}`, update);
    return jsonResponse({ ok: true });
  } catch (e) {
    console.error('[as/admin/update] 실패:', e);
    return errorResponse('변경 저장 실패', 500);
  }
};
