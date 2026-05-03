/**
 * POST /api/as/create
 * 고객 AS 신규 접수 — ERP (cahwindow-quote) 로 forward.
 *
 * 부사장님 결정 (2026-05-03 B안):
 *   기존 Supabase 저장 폐기. ERP Firestore 단일화.
 *
 * Content-Type: multipart/form-data
 *   - contractor_name, phone, address, email, description, photos[], hw_website (honeypot)
 *
 * 응답: { reception_no, id }  (id == reception_no)
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  validateAsInput,
  validatePhotos,
} from '../../_shared/asValidate';

interface AsEnv {
  ERP_AS_API_KEY?: string;
  ERP_BASE_URL?: string;
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
    return jsonResponse({ reception_no: 'AS-000000-00000', id: 'bot' });
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
  const photoEntries = form
    .getAll('photos')
    .filter((v): v is File => v instanceof File);
  const photoCheck = validatePhotos(photoEntries);
  if (!photoCheck.ok) {
    return errorResponse(photoCheck.error || '사진 검증 실패', 400);
  }

  // 환경변수 검증
  if (!env.ERP_AS_API_KEY || !env.ERP_BASE_URL) {
    console.error('[as/create] ERP env 미설정 (ERP_AS_API_KEY / ERP_BASE_URL)');
    return errorResponse('서버 설정 오류', 500);
  }

  // ERP 호출용 multipart 재구성 (필드명 매핑: 홈페이지 → ERP)
  const erpForm = new FormData();
  erpForm.append('customerName', validation.data.contractor_name);
  erpForm.append('customerPhone', validation.data.phone);
  erpForm.append('customerAddress', validation.data.address);
  erpForm.append('email', validation.data.email);
  erpForm.append('content', validation.data.description);
  for (const f of photoEntries) {
    erpForm.append('photos', f, f.name);
  }

  try {
    const url = `${env.ERP_BASE_URL.replace(/\/+$/, '')}/api/external/as-create`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-api-key': env.ERP_AS_API_KEY },
      body: erpForm,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[as/create] ERP 응답 오류', res.status, text);
      return errorResponse('접수 처리 중 오류가 발생했습니다.', 502);
    }
    const data = (await res.json()) as { receptionNo: string; docId: string };
    // 기존 응답 형태 호환 — reception_no, id
    return jsonResponse({
      reception_no: data.receptionNo,
      id: data.docId,
    });
  } catch (e) {
    console.error('[as/create] ERP 호출 실패:', e);
    return errorResponse('접수 처리 실패', 500);
  }
};
