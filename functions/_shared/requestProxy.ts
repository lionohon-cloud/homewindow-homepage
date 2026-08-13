import type { AsEnv } from './env';
import { corsHeaders, errorResponse, jsonResponse } from './cors';
import {
  RequestInputError,
  erpEndpoint,
  forwardErp,
  readLimitedJson,
} from './requestFunnel';

type Normalizer = (input: unknown) => unknown;

function upstreamResponse(response: Response): Response {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders,
    },
  });
}

export async function handleRequestProxy(
  request: Request,
  env: AsEnv,
  path: string,
  normalize: Normalizer,
): Promise<Response> {
  if (!env.EXTERNAL_LEAD_API_KEY || !env.ERP_API_BASE) {
    console.error('[request-proxy] ERP 연동 환경변수 누락');
    return errorResponse('ERP 연동 환경변수가 설정되지 않았습니다.', 503);
  }

  let payload: unknown;
  try {
    payload = normalize(await readLimitedJson(request));
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonResponse(
        { ok: false, error: error.message, code: error.code },
        { status: error.status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return errorResponse('요청을 처리할 수 없습니다.', 400);
  }

  let target: string;
  try {
    target = erpEndpoint(env.ERP_API_BASE, path);
  } catch {
    console.error('[request-proxy] ERP_API_BASE 형식 오류');
    return errorResponse('ERP 연동 환경변수가 올바르지 않습니다.', 503);
  }

  try {
    const response = await forwardErp(
      fetch,
      target,
      env.EXTERNAL_LEAD_API_KEY,
      payload,
      request.headers.get('CF-Connecting-IP') || undefined,
    );
    return upstreamResponse(response);
  } catch {
    console.error('[request-proxy] ERP 서버 연결 실패');
    return errorResponse('ERP 서버 연결 실패', 502);
  }
}
