/**
 * POST /api/erp-lead
 * 홈페이지 전화번호 폼을 ERP(cahwindow-Quote)로 forward.
 * 브라우저는 EXTERNAL_LEAD_API_KEY를 모름 — 서버에서만 보유.
 *
 * 환경변수:
 *   EXTERNAL_LEAD_API_KEY: ERP와 공유하는 API 키
 *   ERP_API_BASE: 예) https://cahwindow-quote.vercel.app
 */
import type { AsEnv } from '../_shared/env';
import { jsonResponse, errorResponse, corsHeaders } from '../_shared/cors';

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  const apiKey = env.EXTERNAL_LEAD_API_KEY;
  const erpBase = env.ERP_API_BASE;

  if (!apiKey || !erpBase) {
    console.error('[erp-lead] env 누락: EXTERNAL_LEAD_API_KEY 또는 ERP_API_BASE');
    return errorResponse('ERP 연동 환경변수가 설정되지 않았습니다.', 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const target = `${erpBase.replace(/\/$/, '')}/api/external/inbound-customers`;

  let res: Response;
  try {
    res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[erp-lead] forward 실패:', e);
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
