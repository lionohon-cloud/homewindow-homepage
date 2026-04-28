/**
 * DELETE /api/as/delete
 * 고객 AS 접수 취소(soft delete: status='canceled').
 * status='received' 인 경우만 가능.
 * body: { contractor_name, reception_no }
 */
import type { AsEnv } from '../../_shared/env';
import {
  createSupabaseRest,
  pgSelect,
  pgUpdate,
} from '../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import { isValidReceptionNo } from '../../_shared/asValidate';

interface AsRequestRow {
  id: string;
  status: string;
}

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestDelete: PagesFunction<AsEnv> = async ({ request, env }) => {
  let body: { contractor_name?: string; reception_no?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const contractorName = (body.contractor_name || '').trim();
  const receptionNo = (body.reception_no || '').trim().toUpperCase();

  if (!contractorName || !receptionNo) {
    return errorResponse('계약자명과 접수번호를 모두 입력해 주세요.', 400);
  }
  if (!isValidReceptionNo(receptionNo)) {
    return errorResponse('접수번호 형식이 올바르지 않습니다.', 400);
  }

  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/delete] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  let row: AsRequestRow;
  try {
    row = await pgSelect<AsRequestRow>(
      supabase,
      'as_requests',
      `reception_no=eq.${encodeURIComponent(receptionNo)}&contractor_name=eq.${encodeURIComponent(contractorName)}&select=id,status`,
      { single: true }
    );
  } catch (e) {
    return errorResponse('일치하는 접수내역이 없습니다.', 404);
  }

  if (row.status !== 'received') {
    return errorResponse(
      '이미 처리가 시작되어 취소할 수 없습니다. 담당자에게 연락해 주세요.',
      409
    );
  }

  try {
    await pgUpdate(supabase, 'as_requests', `id=eq.${row.id}`, {
      status: 'canceled',
    });
    return jsonResponse({ ok: true });
  } catch (e) {
    console.error('[as/delete] update 실패:', e);
    return errorResponse('취소 저장 실패', 500);
  }
};
