/**
 * Cloudflare Functions용 Supabase REST 헬퍼
 * @supabase/supabase-js를 직접 import하면 번들 크기 부담 — 필요한 부분만 fetch로 직접 호출.
 */
import type { AsEnv } from './env';
import { requireEnv } from './env';

export interface SupabaseRestClient {
  url: string;
  serviceKey: string;
}

export function createSupabaseRest(env: AsEnv): SupabaseRestClient {
  return {
    url: requireEnv(env, 'SUPABASE_URL'),
    serviceKey: requireEnv(env, 'SUPABASE_SERVICE_KEY'),
  };
}

function authHeaders(c: SupabaseRestClient) {
  return {
    apikey: c.serviceKey,
    Authorization: `Bearer ${c.serviceKey}`,
  };
}

// ── PostgREST ────────────────────────────────────────────────────────

export async function pgSelect<T = unknown>(
  c: SupabaseRestClient,
  table: string,
  query: string,
  opts?: { single?: boolean }
): Promise<T> {
  const res = await fetch(`${c.url}/rest/v1/${table}?${query}`, {
    headers: {
      ...authHeaders(c),
      Accept: opts?.single ? 'application/vnd.pgrst.object+json' : 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase select 실패: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function pgInsert<T = unknown>(
  c: SupabaseRestClient,
  table: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${c.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...authHeaders(c),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert 실패: ${res.status} ${text}`);
  }
  const arr = (await res.json()) as T[];
  return arr[0] as T;
}

export async function pgUpdate<T = unknown>(
  c: SupabaseRestClient,
  table: string,
  filter: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${c.url}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(c),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase update 실패: ${res.status} ${text}`);
  }
  const arr = (await res.json()) as T[];
  return arr[0] as T;
}

export async function pgRpc<T = unknown>(
  c: SupabaseRestClient,
  fn: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(`${c.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      ...authHeaders(c),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase rpc 실패: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Storage ──────────────────────────────────────────────────────────

export async function storageUpload(
  c: SupabaseRestClient,
  bucket: string,
  path: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<void> {
  const res = await fetch(`${c.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders(c),
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: body as BodyInit,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase storage upload 실패: ${res.status} ${text}`);
  }
}

export async function storageRemove(
  c: SupabaseRestClient,
  bucket: string,
  paths: string[]
): Promise<void> {
  const res = await fetch(`${c.url}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(c),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase storage remove 실패: ${res.status} ${text}`);
  }
}

export async function storageSignedUrl(
  c: SupabaseRestClient,
  bucket: string,
  path: string,
  expiresInSec: number
): Promise<string> {
  const res = await fetch(
    `${c.url}/storage/v1/object/sign/${bucket}/${path}`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(c),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: expiresInSec }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase signed url 실패: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { signedURL?: string; signedUrl?: string };
  const signed = data.signedURL || data.signedUrl;
  if (!signed) throw new Error('signed URL 응답 형식 오류');
  return `${c.url}/storage/v1${signed}`;
}

// ── Auth (관리자 JWT 검증) ──────────────────────────────────────────

/**
 * Authorization: Bearer <jwt> 검증.
 * Supabase가 발급한 JWT의 user 정보 반환. 실패 시 null.
 */
export async function verifyAdminToken(
  c: SupabaseRestClient,
  authHeader: string | null
): Promise<{ id: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const res = await fetch(`${c.url}/auth/v1/user`, {
    headers: {
      apikey: c.serviceKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const u = (await res.json()) as { id?: string; email?: string };
  if (!u.id || !u.email) return null;
  return { id: u.id, email: u.email };
}
