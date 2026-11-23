import type { AsEnv } from '../../../_shared/env';
import { corsHeaders, jsonResponse } from '../../../_shared/cors';
import { normalizeSmsSend, DEV_BYPASS_PHONE } from '../../../_shared/requestFunnel';
import { handleRequestProxy } from '../../../_shared/requestProxy';
import { clearSmsOutage, isSmsOutage, reportSmsOutage } from '../../../_shared/smsOutage';

export const onRequestOptions: PagesFunction<AsEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env, waitUntil }) => {
  // 개발/테스트 우회 번호 — clone 으로 확인만 하고, 아니면 원본 request 를 그대로 흘려보낸다.
  const body = (await request
    .clone()
    .json()
    .catch(() => null)) as { tel?: unknown; phone?: unknown } | null;
  const tel = typeof body?.tel === 'string' ? body.tel : typeof body?.phone === 'string' ? body.phone : '';
  if (tel.replace(/\D/g, '') === DEV_BYPASS_PHONE) {
    return jsonResponse({ ok: true });
  }

  const response = await handleRequestProxy(request, env, '/api/external/request-sms/send', normalizeSmsSend);

  // 261123 문자 장애 감지 — 본문 code 를 보려고 복제해서 읽는다(원 응답은 그대로 돌려준다)
  const body2 = (await response
    .clone()
    .json()
    .catch(() => ({}))) as { code?: string };
  if (response.ok) {
    waitUntil(clearSmsOutage(env).catch(() => undefined));
  } else if (isSmsOutage(response.status, body2.code)) {
    waitUntil(
      reportSmsOutage(env, `응답: HTTP ${response.status} ${body2.code ?? ''}`.trim()).catch(() => undefined),
    );
  }
  return response;
};
