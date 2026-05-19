/**
 * IP + (선택) 추가 키 기반 rate limit. Cloudflare KV 사용.
 *
 * 사용 예:
 *   const rl = await checkRate(env.REVIEW_RL, request, { limit: 5, windowSec: 60 });
 *   if (rl.blocked) return finish({ matched: 'none' }, 200); // 429 안 줌, 정보 노출 방지
 *
 * 정책:
 *   - IP는 Cloudflare 헤더 `cf-connecting-ip` 에서 추출 (Cloudflare Workers 환경)
 *   - 로컬 dev 에선 헤더 없을 수 있어 'local' 폴백
 *   - 카운트 만료는 windowSec 이후 자동 (KV expirationTtl)
 *   - KV binding 이 없으면 (개발 초기) 그냥 통과 처리 (로그만)
 */
export interface RateLimitResult {
  blocked: boolean;
  count: number;
  limit: number;
}

export async function checkRate(
  kv: KVNamespace | undefined,
  request: Request,
  opts: { limit: number; windowSec: number; bucketKey?: string },
): Promise<RateLimitResult> {
  if (!kv) {
    // KV binding 미설정 — 통과 (개발 초기/Pages 대시보드 KV 미연결 시)
    console.warn('[rateLimit] KV binding 미설정 — bypass');
    return { blocked: false, count: 0, limit: opts.limit };
  }

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local';
  const bucket = Math.floor(Date.now() / 1000 / opts.windowSec);
  const key = `rl:${opts.bucketKey || 'default'}:${ip}:${bucket}`;

  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= opts.limit) {
    return { blocked: true, count, limit: opts.limit };
  }

  await kv.put(key, String(count + 1), {
    expirationTtl: Math.max(60, opts.windowSec * 2),
  });
  return { blocked: false, count: count + 1, limit: opts.limit };
}
