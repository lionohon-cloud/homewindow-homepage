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
