/**
 * POST /api/as/lookup
 * 고객 AS 접수 조회.
 * body: { contractor_name, reception_no }
 * 응답: { id, reception_no, contractor_name, phone, address, email, description, photos, status, created_at, updated_at, photo_urls }
 */
import type { AsEnv } from '../../_shared/env';
import {
  createSupabaseRest,
  pgSelect,
  storageSignedUrl,
} from '../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import { isValidReceptionNo } from '../../_shared/asValidate';

interface AsRequestRow {
  id: string;
  reception_no: string;
  contractor_name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  photos: { path: string; name: string; size: number; mime: string }[];
  status: string;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
}

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
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
    console.error('[as/lookup] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  let row: AsRequestRow;
  try {
    row = await pgSelect<AsRequestRow>(
      supabase,
      'as_requests',
      `reception_no=eq.${encodeURIComponent(receptionNo)}&contractor_name=eq.${encodeURIComponent(contractorName)}&select=*`,
      { single: true }
    );
  } catch (e) {
    // PostgREST는 0건일 때 406 반환
    return errorResponse('일치하는 접수내역이 없습니다.', 404);
  }

  // 사진 signed URL 발급 (1시간)
  const photoUrls: string[] = [];
  for (const p of row.photos || []) {
    try {
      const url = await storageSignedUrl(supabase, 'as-photos', p.path, 60 * 60);
      photoUrls.push(url);
    } catch (e) {
      console.error('[as/lookup] signed URL 발급 실패:', e);
      photoUrls.push('');
    }
  }

  return jsonResponse({
    ...row,
    photo_urls: photoUrls,
  });
};
