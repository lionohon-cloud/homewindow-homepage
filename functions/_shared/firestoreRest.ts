/**
 * Firestore REST API 헬퍼 — Cloudflare Workers edge runtime 호환.
 *
 * 출처: ERP(cahwindow-Quote) `apps/web/src/lib/firestore-rest.ts` 패턴 복제.
 * 부사장님 결정 (260506-2-11): Firebase JS SDK 가 edge runtime 에서 간헐적 hang
 * → Identity Toolkit + Firestore REST API 직접 호출.
 *
 * 동작:
 *   - SYSTEM_AUTH_EMAIL/PASSWORD 있으면 그 계정으로 signIn (admin role)
 *   - 없으면 익명 signUp (isSignedIn() Rules 만 통과)
 */
import { requireEnv, type FirebaseEnv } from './firebaseEnv';

interface CachedSession {
  idToken: string;
  uid: string;
  expiresAtMs: number;
}

let cached: CachedSession | null = null;

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

async function signInPassword(
  email: string,
  password: string,
  apiKey: string,
): Promise<CachedSession> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`signIn 실패 [${res.status}] ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    idToken?: string;
    localId?: string;
    expiresIn?: string;
  };
  if (!data.idToken || !data.localId || !data.expiresIn) {
    throw new Error('Identity Toolkit 응답 형식 오류');
  }
  const expiresAtMs =
    Date.now() + Math.max(0, parseInt(data.expiresIn, 10) - 60) * 1000;
  return { idToken: data.idToken, uid: data.localId, expiresAtMs };
}

async function signInAnonymous(apiKey: string): Promise<CachedSession> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`anon signUp 실패 [${res.status}] ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    idToken?: string;
    localId?: string;
    expiresIn?: string;
  };
  if (!data.idToken || !data.localId || !data.expiresIn) {
    throw new Error('Identity Toolkit anonymous 응답 형식 오류');
  }
  const expiresAtMs =
    Date.now() + Math.max(0, parseInt(data.expiresIn, 10) - 60) * 1000;
  return { idToken: data.idToken, uid: data.localId, expiresAtMs };
}

export interface RestSession {
  idToken: string;
  uid: string;
  projectId: string;
  storageBucket: string;
}

export async function getRestSession(env: FirebaseEnv): Promise<RestSession> {
  const cfg = requireEnv(env);
  if (!cached || cached.expiresAtMs <= Date.now()) {
    if (cfg.email && cfg.password) {
      cached = await signInPassword(cfg.email, cfg.password, cfg.apiKey);
    } else {
      cached = await signInAnonymous(cfg.apiKey);
    }
  }
  return {
    idToken: cached.idToken,
    uid: cached.uid,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
  };
}

// =====================================================
// Firestore field encoding
// =====================================================
export type FieldValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values: FieldValue[] } }
  | { mapValue: { fields: Record<string, FieldValue> } };

export function encodeValue(v: unknown): FieldValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(encodeValue) } };
  }
  if (typeof v === 'object') {
    const fields: Record<string, FieldValue> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === undefined) continue;
      fields[k] = encodeValue(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

export function encodeFields(
  obj: Record<string, unknown>,
): Record<string, FieldValue> {
  const out: Record<string, FieldValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = encodeValue(v);
  }
  return out;
}

export function decodeValue(v: FieldValue): unknown {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return null;
}

export function decodeFields(
  fields: Record<string, FieldValue>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = decodeValue(v);
  }
  return out;
}

// =====================================================
// Firestore operations
// =====================================================
export interface RestDocument {
  name: string;
  fields: Record<string, FieldValue>;
}

export interface RunQueryResult {
  documents: RestDocument[];
}

/**
 * 단일 필드 == 매칭 쿼리.
 */
export async function restQueryByField(
  session: RestSession,
  collection: string,
  field: string,
  value: string,
  pageLimit = 20,
): Promise<RestDocument[]> {
  const url = `${FIRESTORE_BASE}/projects/${session.projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: 'EQUAL',
          value: { stringValue: value },
        },
      },
      limit: pageLimit,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(
      `runQuery 실패 [${res.status}] ${collection}/${field}: ${t.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as Array<{ document?: RestDocument }>;
  return data.map((r) => r.document).filter((d): d is RestDocument => !!d);
}

/**
 * prefix 범위 상한 sentinel — Firestore 문서 권장값(U+F8FF, private use area 상위).
 *   `field < prefix + U+F8FF` 로 "prefix 로 시작하는 모든 문자열" 범위를 만든다.
 */
const PREFIX_HIGH = '\uf8ff';

/**
 * 단일 필드 prefix (앞부분 일치) 쿼리 — `field >= prefix && field < prefix + U+F8FF`.
 *
 * 왜 필요한가 (2026-07-30, 후기 본인확인 실패건):
 *   ERP 저장값이 `"김진일-8733 "` 처럼 **앞뒤 공백**이나 `-{뒷4자리}` 접미사로 오염된 케이스가
 *   있어(CRM 이관분 256건) 정확일치(EQUAL) 쿼리로는 통째로 빗나간다. 이름은 사람이 보기에
 *   같으니 원인 파악도 어렵다. → 이름 앞부분으로 후보를 긁어와 client-side 로 정규화 비교.
 *
 * 주의:
 *   - Firestore 는 부등호 필터가 있으면 **첫 orderBy 가 그 필드**여야 하므로 명시적으로 넣는다.
 *   - 단일 필드 자동 인덱스로 동작 (복합 인덱스 추가 불필요).
 *   - 뒤 공백은 prefix 로 잡히지만 **앞 공백(`" 박성연"`)은 못 잡는다** — 그건 ERP 데이터 정리 몫
 *     (`scripts/backfill-inbound-customer-name-trim-260730.ts`).
 *   - pageLimit 은 read 상한. 흔한 이름은 잘릴 수 있어 호출부가 정확일치 쿼리를 함께 쓴다.
 */
export async function restQueryByPrefix(
  session: RestSession,
  collection: string,
  field: string,
  prefix: string,
  pageLimit = 20,
): Promise<RestDocument[]> {
  if (!prefix) return [];
  const url = `${FIRESTORE_BASE}/projects/${session.projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: field },
                op: 'GREATER_THAN_OR_EQUAL',
                value: { stringValue: prefix },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: field },
                op: 'LESS_THAN',
                value: { stringValue: `${prefix}${PREFIX_HIGH}` },
              },
            },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: field }, direction: 'ASCENDING' }],
      limit: pageLimit,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(
      `runQuery(prefix) 실패 [${res.status}] ${collection}/${field}: ${t.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as Array<{ document?: RestDocument }>;
  return data.map((r) => r.document).filter((d): d is RestDocument => !!d);
}

/**
 * 도큐먼트 생성 — POST로 documentId 지정.
 */
export async function restCreateDocument(
  session: RestSession,
  collection: string,
  docId: string,
  fields: Record<string, unknown>,
): Promise<RestDocument> {
  const url = `${FIRESTORE_BASE}/projects/${session.projectId}/databases/(default)/documents/${collection}?documentId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: encodeFields(fields) }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(
      `createDocument 실패 [${res.status}] ${collection}/${docId}: ${t.slice(0, 200)}`,
    );
  }
  return res.json();
}

/**
 * 컬렉션 전체 도큐먼트 조회 (페이지네이션). 백필 등 일괄 작업용.
 */
export async function restListDocuments(
  session: RestSession,
  collection: string,
  pageSize = 100,
): Promise<RestDocument[]> {
  const out: RestDocument[] = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) params.set('pageToken', pageToken);
    const url = `${FIRESTORE_BASE}/projects/${session.projectId}/databases/(default)/documents/${collection}?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.idToken}` },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`listDocuments 실패 [${res.status}] ${collection}: ${t.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      documents?: RestDocument[];
      nextPageToken?: string;
    };
    if (data.documents) out.push(...data.documents);
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

/**
 * 도큐먼트 부분 업데이트 — updateMask 로 지정한 필드만 갱신.
 */
export async function restPatchDocument(
  session: RestSession,
  collection: string,
  docId: string,
  fields: Record<string, unknown>,
): Promise<RestDocument> {
  const mask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');
  const url = `${FIRESTORE_BASE}/projects/${session.projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}?${mask}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: encodeFields(fields) }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`patchDocument 실패 [${res.status}] ${collection}/${docId}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Firebase Storage REST API 사진 업로드.
 * 응답에서 path 추출 → 다운로드 URL은 호출 측에서 조합.
 */
export async function uploadStorageObject(
  session: RestSession,
  path: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<{ name: string; mediaLink?: string }> {
  const url = `https://firebasestorage.googleapis.com/v0/b/${session.storageBucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Firebase ${session.idToken}`,
      'Content-Type': contentType,
    },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Storage upload 실패 [${res.status}]: ${t.slice(0, 200)}`);
  }
  return res.json();
}

export function storageDownloadUrl(bucket: string, path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
