import type { AsEnv } from '../../../_shared/env';
import { corsHeaders, jsonResponse } from '../../../_shared/cors';
import {
  normalizeSmsVerify,
  DEV_BYPASS_PHONE,
  DEV_BYPASS_CODE,
  DEV_BYPASS_TOKEN_PREFIX,
} from '../../../_shared/requestFunnel';
import { handleRequestProxy } from '../../../_shared/requestProxy';

export const onRequestOptions: PagesFunction<AsEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  // 개발/테스트 우회 — 번호와 인증번호가 둘 다 맞아야 통과. clone 으로 확인만 한다.
  const body = (await request
    .clone()
    .json()
    .catch(() => null)) as { tel?: unknown; phone?: unknown; code?: unknown; flowId?: unknown } | null;
  const tel = typeof body?.tel === 'string' ? body.tel : typeof body?.phone === 'string' ? body.phone : '';
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (tel.replace(/\D/g, '') === DEV_BYPASS_PHONE && code === DEV_BYPASS_CODE) {
    const flow = typeof body?.flowId === 'string' && body.flowId ? body.flowId.slice(0, 40) : 'no-flow';
    return jsonResponse({ ok: true, token: DEV_BYPASS_TOKEN_PREFIX + flow });
  }

  return handleRequestProxy(request, env, '/api/external/request-sms/verify', normalizeSmsVerify);
};
