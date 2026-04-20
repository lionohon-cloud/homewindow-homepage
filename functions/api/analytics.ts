/**
 * GA4 Data API 프록시 (Cloudflare Pages Functions)
 *
 * 관리자 대시보드(/admin/dashboard)에서 호출:
 *   POST /api/analytics { period: 'today'|'7d'|'30d'|'90d' }
 *
 * 서비스 계정 JSON 키로 JWT(RS256) 서명 → OAuth2 access_token 교환 →
 * GA4 Data API v1 (properties/{propertyId}:runReport) 호출 →
 * 대시보드용 9개 보고서를 병렬로 가져와 정제된 JSON 반환.
 *
 * 같은 period 요청은 5분 메모리 캐시로 재사용 (GA4 rate limit 완화).
 *
 * 환경변수 (Cloudflare Pages Settings > Environment variables):
 *   GA4_PROPERTY_ID           = "530849763"
 *   GA4_SERVICE_ACCOUNT_EMAIL = "ga4-reader@homewindow-analytics.iam.gserviceaccount.com"
 *   GA4_PRIVATE_KEY           = JSON 키의 private_key 값 전체
 */

export interface Env {
  GA4_PROPERTY_ID?: string;
  GA4_SERVICE_ACCOUNT_EMAIL?: string;
  GA4_PRIVATE_KEY?: string;
}

type Period = 'today' | '7d' | '30d' | '90d';

interface DateRange {
  startDate: string; // YYYY-MM-DD 또는 'today'/'NdaysAgo'
  endDate: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 메모리 캐시 (Worker 인스턴스 생애주기 동안 유효, 5분 TTL)
// ────────────────────────────────────────────────────────────────────────────
const cache = new Map<string, { at: number; data: unknown }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// ────────────────────────────────────────────────────────────────────────────
// 기간 계산
// ────────────────────────────────────────────────────────────────────────────
function getDateRanges(period: Period): { current: DateRange; previous: DateRange } {
  const dayMap: Record<Period, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 };
  const days = dayMap[period];
  return {
    current: { startDate: `${days - 1}daysAgo`, endDate: 'today' },
    previous: { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// JWT(RS256) 서명 — Web Crypto API 사용 (Cloudflare Workers 호환, 외부 라이브러리 불필요)
// ────────────────────────────────────────────────────────────────────────────
function base64urlEncode(bytes: Uint8Array | string): string {
  const str =
    typeof bytes === 'string'
      ? bytes
      : String.fromCharCode(...bytes);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** PEM(PKCS8) 형식 private_key에서 바이너리 추출 — 입력 형식에 관대 */
function pemToPkcs8(pem: string): Uint8Array {
  const clean = pem
    .replace(/\\n/g, '\n')                    // 리터럴 \n을 실제 줄바꿈으로
    .replace(/\\r/g, '')                      // 리터럴 \r 제거
    .replace(/^\s*["']|["']\s*$/g, '')        // 앞뒤 따옴표 제거
    .replace(/-----BEGIN [A-Z0-9 ]+-----/g, '') // PEM 헤더 (PKCS8/RSA/EC 모두 대응)
    .replace(/-----END [A-Z0-9 ]+-----/g, '')   // PEM 푸터
    .replace(/[^A-Za-z0-9+/=]/g, '');         // base64 허용 문자 외 모두 제거
  if (!clean) {
    throw new Error('GA4_PRIVATE_KEY가 비어있거나 형식이 잘못됐습니다. JSON 키 파일의 private_key 값 전체를 붙여넣었는지 확인하세요.');
  }
  return base64ToBytes(clean);
}

async function signJwtRS256(
  header: object,
  claim: object,
  privateKeyPem: string
): Promise<string> {
  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const claimB64 = base64urlEncode(encoder.encode(JSON.stringify(claim)));
  const signingInput = `${headerB64}.${claimB64}`;

  const keyData = pemToPkcs8(privateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  );
  const sigB64 = base64urlEncode(new Uint8Array(signature));
  return `${signingInput}.${sigB64}`;
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwtRS256(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    privateKey
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth2 토큰 교환 실패: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error(`access_token 없음: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ────────────────────────────────────────────────────────────────────────────
// GA4 runReport 호출 헬퍼
// ────────────────────────────────────────────────────────────────────────────
interface RunReportBody {
  dateRanges: DateRange[];
  dimensions?: { name: string }[];
  metrics?: { name: string }[];
  orderBys?: unknown[];
  limit?: number;
  dimensionFilter?: unknown;
}

async function runReport(
  propertyId: string,
  token: string,
  body: RunReportBody
): Promise<any> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 API 오류: ${res.status} ${text}`);
  }
  return res.json();
}

// ────────────────────────────────────────────────────────────────────────────
// GA4 응답 파싱 유틸
// ────────────────────────────────────────────────────────────────────────────
function rowsToArray(
  report: any,
  mapper: (dims: string[], metrics: string[]) => any
): any[] {
  if (!report?.rows) return [];
  return report.rows.map((row: any) => {
    const dims = (row.dimensionValues || []).map((d: any) => d.value || '');
    const metrics = (row.metricValues || []).map((m: any) => m.value || '0');
    return mapper(dims, metrics);
  });
}

function sumMetric(report: any, index: number): number {
  if (!report?.rows) return 0;
  return report.rows.reduce(
    (acc: number, row: any) =>
      acc + Number(row.metricValues?.[index]?.value || 0),
    0
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 모든 보고서 병렬 호출 → 대시보드용 JSON 조립
// ────────────────────────────────────────────────────────────────────────────
async function fetchAllReports(
  propertyId: string,
  token: string,
  period: Period
) {
  const { current, previous } = getDateRanges(period);

  // 9개 보고서 병렬 호출
  const [
    overviewCur,
    overviewPrev,
    dailyTrend,
    channels,
    regions,
    cities,
    devices,
    hours,
    pages,
    entryForms,
  ] = await Promise.all([
    // 1) Overview 현재 기간
    runReport(propertyId, token, {
      dateRanges: [current],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
        { name: 'conversions' },
      ],
    }),
    // 2) Overview 이전 기간 (증감% 계산용)
    runReport(propertyId, token, {
      dateRanges: [previous],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
        { name: 'conversions' },
      ],
    }),
    // 3) 일별 트렌드
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    // 4) 채널별 유입 Top 10
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    // 5) 지역별(시/도) Top 15
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'region' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 15,
    }),
    // 6) 지역별(도시) Top 20
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'city' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 20,
    }),
    // 7) 기기별
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    }),
    // 8) 시간대
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'hour' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'hour' } }],
    }),
    // 9) 인기 페이지 Top 10
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    }),
    // 10) 폼 접수 위치 (customEvent:lead_source, event=generate_lead)
    runReport(propertyId, token, {
      dateRanges: [current],
      dimensions: [{ name: 'customEvent:lead_source' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'generate_lead', matchType: 'EXACT' },
        },
      },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 10,
    }).catch(() => ({ rows: [] })), // custom dimension 미등록 시 빈 배열 반환
  ]);

  // Overview 정리 (현재 + 이전 + 증감%)
  const overviewMetricsOrder = [
    'totalUsers',
    'newUsers',
    'sessions',
    'averageSessionDuration',
    'screenPageViews',
    'conversions',
  ];
  const overview: Record<string, { current: number; previous: number; changePct: number | null }> = {};
  overviewMetricsOrder.forEach((name, i) => {
    const cur = Number(overviewCur?.rows?.[0]?.metricValues?.[i]?.value || 0);
    const prev = Number(overviewPrev?.rows?.[0]?.metricValues?.[i]?.value || 0);
    overview[name] = {
      current: cur,
      previous: prev,
      changePct: prev > 0 ? ((cur - prev) / prev) * 100 : null,
    };
  });

  return {
    period,
    overview,
    dailyTrend: rowsToArray(dailyTrend, (d, m) => ({
      date: d[0], // YYYYMMDD
      users: Number(m[0]),
      sessions: Number(m[1]),
    })),
    channels: rowsToArray(channels, (d, m) => ({
      channel: d[0] || '(not set)',
      sessions: Number(m[0]),
    })),
    regions: rowsToArray(regions, (d, m) => ({
      region: d[0] || '(not set)',
      users: Number(m[0]),
      sessions: Number(m[1]),
      avgDurationSec: Number(m[2]),
    })),
    cities: rowsToArray(cities, (d, m) => ({
      city: d[0] || '(not set)',
      users: Number(m[0]),
      sessions: Number(m[1]),
      avgDurationSec: Number(m[2]),
    })),
    devices: rowsToArray(devices, (d, m) => ({
      device: d[0] || 'unknown',
      sessions: Number(m[0]),
    })),
    hours: rowsToArray(hours, (d, m) => ({
      hour: Number(d[0]),
      sessions: Number(m[0]),
    })),
    pages: rowsToArray(pages, (d, m) => ({
      path: d[0] || '/',
      pageviews: Number(m[0]),
      users: Number(m[1]),
      avgDurationSec: Number(m[2]),
    })),
    entryForms: rowsToArray(entryForms, (d, m) => ({
      leadSource: d[0] || '(unknown)',
      count: Number(m[0]),
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Functions 엔트리포인트
// ────────────────────────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const propertyId = env.GA4_PROPERTY_ID;
    const email = env.GA4_SERVICE_ACCOUNT_EMAIL;
    const privateKey = env.GA4_PRIVATE_KEY;

    if (!propertyId || !email || !privateKey) {
      return json(
        {
          error: 'GA4 환경변수 미설정',
          missing: {
            GA4_PROPERTY_ID: !propertyId,
            GA4_SERVICE_ACCOUNT_EMAIL: !email,
            GA4_PRIVATE_KEY: !privateKey,
          },
        },
        503
      );
    }

    const body = (await request.json().catch(() => ({}))) as { period?: Period };
    const period: Period = ['today', '7d', '30d', '90d'].includes(body.period as any)
      ? (body.period as Period)
      : '7d';

    // 캐시 확인
    const cached = cache.get(period);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return json({ ...(cached.data as object), cached: true });
    }

    const token = await getAccessToken(email, privateKey);
    const data = await fetchAllReports(propertyId, token, period);

    cache.set(period, { at: Date.now(), data });

    return json({ ...data, cached: false });
  } catch (err: any) {
    return json({ error: err?.message || String(err) }, 500);
  }
};

// CORS preflight 대응 (선택)
export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

// ────────────────────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
