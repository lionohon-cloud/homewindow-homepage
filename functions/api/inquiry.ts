/**
 * POST /api/inquiry — 기타문의 접수 프록시 (시군구 개편 Phase E, 2026-07-10).
 *
 * AI상담 「기타 문의」 분기 → ERP POST /api/external/inquiry-create 로 forward.
 * 인증: x-api-key ERP_AS_API_KEY (AS 접수와 동일 열쇠 재사용 — 신규 env 0개).
 * rate limit: IP 당 10회/분 (스팸 보호).
 */
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors';
import { checkRate } from '../_shared/rateLimit';

interface InquiryEnv {
  // 기타문의는 AS 접수와 성격이 같아 기존 AS 열쇠·주소를 그대로 재사용 (신규 env 0개).
  ERP_AS_API_KEY?: string;
  ERP_BASE_URL?: string;
  REVIEW_RL?: KVNamespace;
}

export const onRequestOptions: PagesFunction<InquiryEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<InquiryEnv> = async ({ request, env }) => {
  if (!env.ERP_AS_API_KEY || !env.ERP_BASE_URL) {
    console.error('[inquiry] env 미설정 (ERP_AS_API_KEY / ERP_BASE_URL)');
    return errorResponse('기타문의 연동 환경변수가 설정되지 않았습니다.', 503);
  }

  const rl = await checkRate(env.REVIEW_RL, request, {
    limit: 10,
    windowSec: 60,
    bucketKey: 'inquiry',
  });
  if (rl.blocked) {
    return errorResponse('요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  let payload: {
    customerName?: unknown;
    phone?: unknown;
    request?: unknown;
    address?: unknown;
    honeypot?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  // honeypot — 봇이면 성공으로 위장하고 버림 (submitLead 관례)
  if (typeof payload.honeypot === 'string' && payload.honeypot.trim()) {
    return jsonResponse({ ok: true });
  }

  const customerName = typeof payload.customerName === 'string' ? payload.customerName.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.replace(/[^0-9]/g, '') : '';
  const requestText = typeof payload.request === 'string' ? payload.request.trim() : '';
  if (!customerName || phone.length < 9 || !requestText) {
    return errorResponse('성함·연락처·요청사항을 확인해주세요.', 400);
  }

  const body = {
    customerName: customerName.slice(0, 50),
    phone,
    request: requestText.slice(0, 1000),
    address:
      typeof payload.address === 'string' && payload.address.trim()
        ? payload.address.trim().slice(0, 200)
        : undefined,
    source: 'homepage-ai-chat',
  };

  const target = `${env.ERP_BASE_URL.replace(/\/+$/, '')}/api/external/inquiry-create`;
  let res: Response;
  try {
    res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ERP_AS_API_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('[inquiry] forward 실패:', e);
    return errorResponse('접수 서버 연결 실패', 502);
  }

  const text = await res.text().catch(() => '');
  return new Response(text || '{}', {
    status: res.status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
};
