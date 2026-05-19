/**
 * HS256 JWT — Cloudflare Workers Web Crypto 자체 구현.
 * customer-lookup → submit 간 본인확인 토큰 (30분 TTL).
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): Uint8Array {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export interface ReviewTokenPayload {
  phone: string;            // 010-XXXX-XXXX
  source: 'inboundCustomers' | 'crm_customers';
  sourceId: string;         // 매칭된 도큐먼트 ID
  customerName: string;
  exp: number;              // unix sec
  iat: number;
}

export async function signReviewToken(
  payload: Omit<ReviewTokenPayload, 'exp' | 'iat'>,
  secret: string,
  ttlSec = 30 * 60,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const full: ReviewTokenPayload = { ...payload, iat, exp: iat + ttlSec };
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(full)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await hmacKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, enc.encode(signingInput)),
  );
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

export async function verifyReviewToken(
  token: string,
  secret: string,
): Promise<ReviewTokenPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(sigB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    );
    if (!ok) return null;
    const payload = JSON.parse(
      dec.decode(base64UrlDecode(payloadB64)),
    ) as ReviewTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
