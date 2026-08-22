/**
 * Cloudflare Functions 공용 환경변수 타입
 */
export interface AsEnv {
  // Supabase
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;

  // ERP
  EXTERNAL_LEAD_API_KEY?: string;
  ERP_API_BASE?: string;

  // GA4 (기존 analytics.ts와 공유)
  GA4_PROPERTY_ID?: string;
  GA4_SERVICE_ACCOUNT_EMAIL?: string;
  GA4_PRIVATE_KEY?: string;

  // 유입고객 추적 시트 웹훅. 비우면 leadSheet.ts 의 상수(운영 시트)로 폴백한다.
  // 프리뷰 환경에는 테스트 시트 주소를 넣어야 검증이 운영 시트를 건드리지 않는다.
  GAS_LEAD_WEBHOOK_URL?: string;

  // 시트 전송 중복 방지와 실패 사서함. 후기 rate limit 과 같은 네임스페이스를 함께 쓴다.
  REVIEW_RL?: KVNamespace;
}

export function requireEnv<K extends keyof AsEnv>(
  env: AsEnv,
  key: K
): NonNullable<AsEnv[K]> {
  const v = env[key];
  if (!v) {
    throw new Error(`환경변수 ${String(key)}가 설정되지 않았습니다.`);
  }
  return v as NonNullable<AsEnv[K]>;
}
