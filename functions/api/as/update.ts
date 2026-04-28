/**
 * PUT /api/as/update
 * 고객 AS 접수 수정. status='received' 인 경우만 가능.
 * body: { contractor_name, reception_no, address?, email?, description? }
 *   - phone, contractor_name 수정은 lookup 키이므로 변경 불가
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

export const onRequestPut: PagesFunction<AsEnv> = async ({ request, env }) => {
  let body: {
    contractor_name?: string;
    reception_no?: string;
    address?: string;
    email?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const contractorName = (body.contractor_name || '').trim();
  const receptionNo = (body.reception_no || '').trim().toUpperCase();
  const address = body.address?.trim();
  const email = body.email?.trim();
  const description = body.description?.trim();

  if (!contractorName || !receptionNo) {
    return errorResponse('계약자명과 접수번호를 모두 입력해 주세요.', 400);
  }
  if (!isValidReceptionNo(receptionNo)) {
    return errorResponse('접수번호 형식이 올바르지 않습니다.', 400);
  }

  // 부분 검증 — 입력된 필드만
  const update: Record<string, string> = {};
  if (address !== undefined) {
    if (!address) return errorResponse('주소는 비워둘 수 없습니다.', 400);
    if (address.length > 200) return errorResponse('주소가 너무 깁니다.', 400);
    update.address = address;
  }
  if (email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('이메일 형식이 올바르지 않습니다.', 400);
    }
    update.email = email;
  }
  if (description !== undefined) {
    if (!description) return errorResponse('상세내용은 비워둘 수 없습니다.', 400);
    if (description.length > 2000) return errorResponse('상세내용은 2000자 이내', 400);
    update.description = description;
  }

  if (Object.keys(update).length === 0) {
    return errorResponse('변경할 항목이 없습니다.', 400);
  }

  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/update] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  // 1) 매칭 + status 확인
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
      '이미 처리가 시작되어 수정할 수 없습니다. 담당자에게 연락해 주세요.',
      409
    );
  }

  // 2) 업데이트
  try {
    await pgUpdate(supabase, 'as_requests', `id=eq.${row.id}`, update);
    return jsonResponse({ ok: true });
  } catch (e) {
    console.error('[as/update] update 실패:', e);
    return errorResponse('수정 저장 실패', 500);
  }
};
