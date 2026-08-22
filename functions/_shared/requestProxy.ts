import type { AsEnv } from './env';
import { corsHeaders, errorResponse, jsonResponse } from './cors';
import {
  RequestInputError,
  erpEndpoint,
  forwardErp,
  readLimitedJson,
} from './requestFunnel';

type Normalizer = (input: unknown) => unknown;

/**
 * ERP 등록이 성공했을 때 한 번 불린다. 후속 처리(구글시트 웹훅 전송)를 붙이는 자리다.
 * 이 훅에서 무엇이 터지더라도 접수 응답은 영향을 받지 않도록 호출부가 try/catch 로 감싼다.
 */
export interface ProxySuccessHook {
  (args: { rawBody: unknown; erpResult: Record<string, unknown> }): void;
}

function upstreamResponse(response: Response, body: BodyInit | null): Response {
  return new Response(body, {
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
  onErpSuccess?: ProxySuccessHook,
): Promise<Response> {
  if (!env.EXTERNAL_LEAD_API_KEY || !env.ERP_API_BASE) {
    console.error('[request-proxy] ERP 연동 환경변수 누락');
    return errorResponse('ERP 연동 환경변수가 설정되지 않았습니다.', 503);
  }

  let payload: unknown;
  let rawBody: unknown;
  try {
    rawBody = await readLimitedJson(request);
    payload = normalize(rawBody);
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

    // 훅이 없는 경로(SMS 발송·검증)는 종전대로 본문을 그대로 흘려보낸다.
    // 본문 처리 방식을 바꾸는 위험을 이 건과 무관한 경로까지 지우지 않기 위함이다.
    if (!onErpSuccess || !response.ok) return upstreamResponse(response, response.body);

    // 훅에 ERP 응답을 넘기려면 본문을 읽어야 하므로 한 번 버퍼링한다.
    // 응답은 수백 바이트이고 호출부(public/request/app.js)도 어차피 전량 파싱한다.
    // 여기서 무엇이 터지든 ERP 접수는 이미 성립했으므로 502 로 뒤집지 않는다.
    let text: string;
    try {
      text = await response.text();
    } catch {
      console.error('[request-proxy] ERP 성공 응답 본문 읽기 실패');
      return upstreamResponse(response, null);
    }

    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (parsed.ok === true) onErpSuccess({ rawBody, erpResult: parsed });
    } catch {
      console.error('[request-proxy] ERP 성공 응답 후속 처리 실패');
    }
    return upstreamResponse(response, text);
  } catch {
    console.error('[request-proxy] ERP 서버 연결 실패');
    return errorResponse('ERP 서버 연결 실패', 502);
  }
}
