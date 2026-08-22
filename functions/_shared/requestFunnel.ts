import type { LeadSheetRow } from './leadSheet';

export const REQUEST_BODY_LIMIT = 32 * 1024;

export class RequestInputError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 400, code = 'INVALID_PAYLOAD') {
    super(message);
    this.name = 'RequestInputError';
    this.status = status;
    this.code = code;
  }
}

type JsonRecord = Record<string, unknown>;

const FLOW_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_RE = /^01\d{8,9}$/;

function record(value: unknown): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestInputError('요청 형식이 올바르지 않습니다.');
  }
  return value as JsonRecord;
}

function text(value: unknown, field: string, max: number, required = false): string {
  if (value == null || value === '') {
    if (required) throw new RequestInputError(`${field} 값이 필요합니다.`);
    return '';
  }
  if (typeof value !== 'string') throw new RequestInputError(`${field} 형식이 올바르지 않습니다.`);
  const normalized = value.trim();
  if (required && !normalized) throw new RequestInputError(`${field} 값이 필요합니다.`);
  if (normalized.length > max) throw new RequestInputError(`${field} 값이 너무 깁니다.`);
  return normalized;
}

function nullableInt(value: unknown, field: string, min: number, max: number): number | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new RequestInputError(`${field} 형식이 올바르지 않습니다.`);
  }
  return value;
}

function phoneDigits(value: unknown): string {
  const normalized = text(value, '연락처', 20, true).replace(/\D/g, '');
  if (!PHONE_RE.test(normalized)) throw new RequestInputError('연락처 형식이 올바르지 않습니다.', 400, 'INVALID_TEL');
  return normalized;
}

function flowId(value: unknown): string {
  const normalized = text(value, 'flowId', 64, true);
  if (!FLOW_ID_RE.test(normalized)) throw new RequestInputError('flowId 형식이 올바르지 않습니다.');
  return normalized;
}

function submittedAt(value: unknown): string {
  const normalized = text(value, '접수시각', 40, true);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(normalized) || Number.isNaN(Date.parse(normalized))) {
    throw new RequestInputError('접수시각 형식이 올바르지 않습니다.');
  }
  return normalized;
}

const UTM_LIMITS: Record<string, number> = {
  inflowMedia: 100,
  inflowChannelText: 100,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  utm_content: 200,
  utm_term: 200,
  visit_id: 200,
  landing_path: 500,
  referrer: 500,
};

function normalizeUtm(value: unknown): Record<string, string> {
  if (value == null) return {};
  const input = record(value);
  const output: Record<string, string> = {};
  for (const [key, limit] of Object.entries(UTM_LIMITS)) {
    const normalized = text(input[key], key, limit);
    if (normalized) output[key] = normalized;
  }
  return output;
}

export interface SmsSendPayload {
  tel: string;
  flowId: string;
}

export interface SmsVerifyPayload extends SmsSendPayload {
  code: string;
}

export function normalizeSmsSend(input: unknown): SmsSendPayload {
  const body = record(input);
  return { tel: phoneDigits(body.tel ?? body.phone), flowId: flowId(body.flowId) };
}

export function normalizeSmsVerify(input: unknown): SmsVerifyPayload {
  const body = record(input);
  const base = normalizeSmsSend(body);
  const code = text(body.code, '인증번호', 6, true);
  if (!/^\d{6}$/.test(code)) throw new RequestInputError('인증번호 형식이 올바르지 않습니다.', 400, 'CODE_MISMATCH');
  return { ...base, code };
}

/**
 * ERP 에 저장되는 inflowChannel.label 이자, 유입고객 추적 시트 D열(유입채널)에 찍히는 값이다.
 * 두 곳이 갈라지면 시트에서 랜딩퍼널 접수를 걸러낼 수 없으므로 한 상수에서 가져다 쓴다.
 */
export const REQUEST_FUNNEL_CHANNEL_LABEL = '홈페이지 견적 퍼널';

export interface ErpLeadPayload {
  phone: string;
  intakeRequestId: string;
  phoneVerificationToken: string;
  address: string;
  inflowChannel: { type: 'auto'; code: 'WEB_FORM'; label: '홈페이지 견적 퍼널' };
  consultField: 'WINDOW_REPLACE';
  utm: Record<string, string>;
  requestFunnelSnap: {
    residenceType: string;
    path: string;
    region: string;
    legalDong?: string;
    complexName?: string;
    completionYear?: number;
    buildingAge?: number;
    householdCount?: number;
    buildingCount?: number;
    maxFloor?: number;
    corridorType?: string;
    heatingType?: string;
    builder?: string;
    windowGeneration?: string;
    windowTypeEstimate?: string;
    insulationEstimate?: string;
    areaPyeong?: string;
    replacementScope?: string;
    headlineVariant?: string;
    consentMethod: string;
    consentVersion: string;
    submittedAt: string;
  };
}

export function normalizeLead(input: unknown): ErpLeadPayload {
  const body = record(input);
  const region = text(body['상담권역'], '상담권역', 100, true);
  const legalDong = text(body['법정동'], '법정동', 100);
  const residenceType = text(body['거주형태'], '거주형태', 20, true);
  const path = text(body['경로'], '경로', 20, true);
  if (!['apt', 'house', 'none'].includes(path)) {
    throw new RequestInputError('경로 형식이 올바르지 않습니다.');
  }
  const complexName = text(body['단지명'], '단지명', 150, path === 'apt');
  const token = text(body['인증토큰'], '인증토큰', 4096, true);
  if (token.length < 16) throw new RequestInputError('인증토큰 형식이 올바르지 않습니다.');

  const snapshot: ErpLeadPayload['requestFunnelSnap'] = {
    residenceType,
    path,
    region,
    consentMethod: text(body['동의방식'], '동의방식', 100, true),
    consentVersion: text(body['동의문구버전'], '동의문구버전', 30, true),
    submittedAt: submittedAt(body['접수시각']),
  };

  const optionalStrings = {
    legalDong,
    complexName,
    corridorType: text(body['복도유형'], '복도유형', 50),
    heatingType: text(body['난방방식'], '난방방식', 50),
    builder: text(body['시공사'], '시공사', 100),
    windowGeneration: text(body['창호세대'], '창호세대', 50),
    windowTypeEstimate: text(body['창호종류'], '창호종류', 100),
    insulationEstimate: text(body['단열성능'], '단열성능', 100),
    areaPyeong: text(body['평형'], '평형', 50),
    replacementScope: text(body['교체범위'], '교체범위', 100),
    headlineVariant: text(body['헤드라인'], '헤드라인', 100),
  };
  for (const [key, value] of Object.entries(optionalStrings)) {
    if (value) snapshot[key as keyof typeof optionalStrings] = value;
  }

  const optionalNumbers = {
    completionYear: nullableInt(body['준공연도'], '준공연도', 1900, 2100),
    buildingAge: nullableInt(body['연차'], '연차', 0, 300),
    householdCount: nullableInt(body['세대수'], '세대수', 0, 1_000_000),
    buildingCount: nullableInt(body['동수'], '동수', 0, 10_000),
    maxFloor: nullableInt(body['최고층'], '최고층', 0, 500),
  };
  for (const [key, value] of Object.entries(optionalNumbers)) {
    if (value !== null) snapshot[key as keyof typeof optionalNumbers] = value;
  }

  const address = [region, legalDong, complexName].filter(Boolean).join(' ').slice(0, 300);
  return {
    phone: phoneDigits(body['연락처']),
    intakeRequestId: flowId(body.flowId),
    phoneVerificationToken: token,
    address,
    inflowChannel: { type: 'auto', code: 'WEB_FORM', label: REQUEST_FUNNEL_CHANNEL_LABEL },
    consultField: 'WINDOW_REPLACE',
    utm: normalizeUtm(body.utm),
    requestFunnelSnap: snapshot,
  };
}

/**
 * ERP 저장값 기준으로 전화번호를 대시 표준포맷으로 맞춘다.
 * ERP 는 toStandardPhone() 으로 하이픈을 붙여 저장하므로, 시트 B열도 같은 표기로 넣어야
 * 부사장님이 ERP 목록과 시트를 번호로 대조하실 때 어긋나지 않는다.
 */
function toDashedPhone(digits: string): string {
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

/**
 * 유입고객 추적 시트에 넣을 한 행을 이번 요청의 원본 body 에서 만든다.
 *
 * ERP 에 저장된 문서를 되읽지 않고 원본 body 를 쓰는 이유가 있다. 재접수 고객은 ERP 가 기존
 * 고객 문서에 병합하는데, 그때 utm 필드는 갱신되지 않아 과거 최초 유입의 값이 그대로 남는다.
 * 저장값을 되읽으면 이번 광고가 아니라 예전 유입이 시트에 찍힌다.
 *
 * 값이 없는 항목도 키를 생략하지 않고 빈 문자열로 채운다(부사장님 요청 2026-08-22).
 */
export function buildLeadSheetRow(input: unknown): LeadSheetRow {
  const body = record(input);
  const utm = normalizeUtm(body.utm);
  const pick = (key: string) => utm[key] ?? '';

  return {
    phone: toDashedPhone(phoneDigits(body['연락처'])),
    channel_media: pick('inflowMedia'), // C열 — 랜딩퍼널은 대부분 공란이며 의도된 결과다.
    entry_form: REQUEST_FUNNEL_CHANNEL_LABEL, // D열
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    utm_term: pick('utm_term'),
    visit_id: pick('visit_id'),
    landing_path: pick('landing_path'),
    referrer: pick('referrer'),
    region: '', // 시트 열 구성을 기존 홈페이지와 동일하게 유지하기 위한 자리다.
    consult_field: '',
    timestamp: submittedAt(body['접수시각']),
  };
}

export async function readLimitedJson(request: Request, maxBytes = REQUEST_BODY_LIMIT): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new RequestInputError('요청 데이터가 너무 큽니다.', 413, 'PAYLOAD_TOO_LARGE');
  if (!request.body) throw new RequestInputError('JSON 요청 본문이 필요합니다.');

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let source = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestInputError('요청 데이터가 너무 큽니다.', 413, 'PAYLOAD_TOO_LARGE');
    }
    source += decoder.decode(value, { stream: true });
  }
  source += decoder.decode();
  try {
    return JSON.parse(source);
  } catch {
    throw new RequestInputError('JSON 형식 오류', 400, 'INVALID_JSON');
  }
}

export function erpEndpoint(base: string, path: string): string {
  const url = new URL(path, `${base.replace(/\/$/, '')}/`);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('ERP_API_BASE는 HTTPS 주소여야 합니다.');
  }
  return url.toString();
}

export async function forwardErp(
  fetcher: typeof fetch,
  target: string,
  apiKey: string,
  payload: unknown,
  clientIp?: string,
): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  });
  if (clientIp) headers.set('X-Request-Client-IP', clientIp.slice(0, 80));
  return fetcher(target, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}
