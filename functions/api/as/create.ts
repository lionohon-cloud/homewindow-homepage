/**
 * POST /api/as/create
 * 고객 AS 신규 접수.
 * Content-Type: multipart/form-data
 *   - contractor_name, phone, address, email, description
 *   - hw_website (honeypot — 비어있어야 정상)
 *   - photos[] (선택, 최대 5장)
 *
 * 응답: { reception_no, id }
 */
import type { AsEnv } from '../../_shared/env';
import {
  createSupabaseRest,
  pgInsert,
  pgRpc,
  storageUpload,
} from '../../_shared/supabase';
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  validateAsInput,
  validatePhotos,
  AsPhotoMeta,
} from '../../_shared/asValidate';

interface AsRequestRow {
  id: string;
  reception_no: string;
}

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('multipart/form-data 형식이 아닙니다.', 400);
  }

  // Honeypot
  const honeypot = String(form.get('hw_website') || '').trim();
  if (honeypot.length > 0) {
    // 봇으로 판단. 가짜 성공 응답.
    return jsonResponse({ reception_no: 'AS-000000000000', id: 'bot' });
  }

  // 입력 검증
  const validation = validateAsInput({
    contractor_name: String(form.get('contractor_name') || ''),
    phone: String(form.get('phone') || ''),
    address: String(form.get('address') || ''),
    email: String(form.get('email') || ''),
    description: String(form.get('description') || ''),
  });
  if (!validation.ok || !validation.data) {
    return errorResponse(validation.error || '입력 오류', 400);
  }

  // 사진 추출
  const photoEntries = form.getAll('photos').filter((v): v is File => v instanceof File);
  const photoCheck = validatePhotos(photoEntries);
  if (!photoCheck.ok) {
    return errorResponse(photoCheck.error || '사진 검증 실패', 400);
  }

  let supabase;
  try {
    supabase = createSupabaseRest(env);
  } catch (e) {
    console.error('[as/create] env 오류:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  // 1) 접수번호 발급 (RPC)
  let receptionNo: string;
  try {
    receptionNo = await pgRpc<string>(supabase, 'next_reception_no');
  } catch (e) {
    console.error('[as/create] reception_no 발급 실패:', e);
    return errorResponse('접수번호 발급 실패', 500);
  }

  // 2) 사진 업로드 (있는 경우)
  const photoMeta: AsPhotoMeta[] = [];
  for (let i = 0; i < photoEntries.length; i++) {
    const file = photoEntries[i];
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${receptionNo}/${i + 1}-${crypto.randomUUID()}.${ext}`;
    try {
      const buf = await file.arrayBuffer();
      await storageUpload(supabase, 'as-photos', path, buf, file.type);
      photoMeta.push({
        path,
        name: file.name,
        size: file.size,
        mime: file.type,
      });
    } catch (e) {
      console.error('[as/create] 사진 업로드 실패:', e);
      return errorResponse('사진 업로드 중 오류가 발생했습니다.', 500);
    }
  }

  // 3) 행 삽입
  try {
    const row = await pgInsert<AsRequestRow>(supabase, 'as_requests', {
      reception_no: receptionNo,
      ...validation.data,
      photos: photoMeta,
      status: 'received',
    });
    return jsonResponse({ reception_no: row.reception_no, id: row.id });
  } catch (e) {
    console.error('[as/create] insert 실패:', e);
    return errorResponse('접수 저장 실패', 500);
  }
};
