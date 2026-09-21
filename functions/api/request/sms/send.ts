import type { AsEnv } from '../../../_shared/env';
import { corsHeaders, jsonResponse } from '../../../_shared/cors';
import { normalizeSmsSend, DEV_BYPASS_PHONE } from '../../../_shared/requestFunnel';
import { handleRequestProxy } from '../../../_shared/requestProxy';

export const onRequestOptions: PagesFunction<AsEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  // 개발/테스트 우회 번호 — clone 으로 확인만 하고, 아니면 원본 request 를 그대로 흘려보낸다.
  const body = (await request
    .clone()
    .json()
    .catch(() => null)) as { tel?: unknown; phone?: unknown } | null;
  const tel = typeof body?.tel === 'string' ? body.tel : typeof body?.phone === 'string' ? body.phone : '';
  if (tel.replace(/\D/g, '') === DEV_BYPASS_PHONE) {
    return jsonResponse({ ok: true });
  }

  return handleRequestProxy(request, env, '/api/external/request-sms/send', normalizeSmsSend);
};
