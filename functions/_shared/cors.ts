/**
 * 공용 CORS 헤더 (same-origin이지만 OPTIONS preflight 대비)
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

export function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, { status });
}
