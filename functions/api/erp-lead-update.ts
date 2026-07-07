/**
 * POST /api/erp-lead-update
 * W2 2단계 접수 팝업(지역·상담분야)을 이미 등록된 ERP inboundCustomers 문서에 반영.
 * 브라우저는 EXTERNAL_LEAD_API_KEY를 모름 — 서버에서만 보유.
 *
 * 입력 (POST JSON): { docId: string, region: string, consultField: string }
 * ERP 로 PATCH {ERP_API_BASE}/api/external/inbound-customers/{docId} 포워드.
 *
 * 환경변수 (erp-lead.ts와 동일):
 *   EXTERNAL_LEAD_API_KEY: ERP와 공유하는 API 키
 *   ERP_API_BASE: 예) https://cahwindow-quote.vercel.app
 */
import type { AsEnv } from '../_shared/env';
import { errorResponse, corsHeaders } from '../_shared/cors';

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  const apiKey = env.EXTERNAL_LEAD_API_KEY;
  const erpBase = env.ERP_API_BASE;

  if (!apiKey || !erpBase) {
    console.error('[erp-lead-update] env 누락: EXTERNAL_LEAD_API_KEY 또는 ERP_API_BASE');
    return errorResponse('ERP 연동 환경변수가 설정되지 않았습니다.', 503);
  }

  let payload: { docId?: unknown; region?: unknown; consultField?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const docId = typeof payload.docId === 'string' ? payload.docId.trim() : '';
  if (!docId) {
    return errorResponse('docId 누락', 400);
  }

  const body = {
    region: typeof payload.region === 'string' ? payload.region : undefined,
    consultField:
      typeof payload.consultField === 'string' ? payload.consultField : undefined,
  };

  const target = `${erpBase.replace(/\/$/, '')}/api/external/inbound-customers/${encodeURIComponent(docId)}`;

  let res: Response;
  try {
    res = await fetch(target, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('[erp-lead-update] forward 실패:', e);
    return errorResponse('ERP 서버 연결 실패', 502);
  }

  // ERP 응답 그대로 전달
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
};
