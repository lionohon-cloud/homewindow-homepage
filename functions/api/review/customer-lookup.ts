/**
 * POST /api/review/customer-lookup
 *
 * 이름 + 휴대전화 뒷 4자리로 본인 확인.
 * Firebase 직접 (ERP cahwindow-quote 와 같은 프로젝트, ERP 백엔드 우회).
 *
 * 조회 대상 (둘 다 — 사용자 결정 2026-05-18):
 *   1. inboundCustomers  : 신규 Quote v2.1 SoR. 필드: customerName 또는 name, phone
 *   2. crm_customers     : 레거시 CRM 동기화. 필드: name (suffix `-{last4}` 가능), phoneNumber
 *
 * Firestore endsWith 쿼리 불가 → 이름 기반 후보 fetch 후 client-side 필터.
 * 한쪽이라도 정확히 1건 매칭되면 통과 (양쪽 합쳐 1건도 OK).
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import {
  getRestSession,
  restQueryByField,
  decodeFields,
  type RestDocument,
} from '../../_shared/firestoreRest';
import { signReviewToken } from '../../_shared/reviewJwt';
import { checkRate } from '../../_shared/rateLimit';
import { buildSnapshot } from '../../_shared/customerSnapshot';
import type { FirebaseEnv } from '../../_shared/firebaseEnv';

const MIN_RESP_MS = 220; // 타이밍 공격 방지 baseline

export const onRequestOptions: PagesFunction<FirebaseEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<FirebaseEnv> = async ({
  request,
  env,
}) => {
  const startedAt = Date.now();
  const finish = async (body: unknown, status = 200) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESP_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESP_MS - elapsed));
    }
    return jsonResponse(body, { status });
  };

  let body: { name?: string; phoneLast4?: string; hw_website?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('잘못된 요청 형식입니다.', 400);
  }

  // Honeypot
  if (body.hw_website && body.hw_website.length > 0) {
    return finish({ matched: 'none' });
  }

  // Rate limit — IP당 분당 5회, 시간당 30회 (이중 게이트)
  // brute force (이름 + 0000~9999 자동 시도) 차단
  const rlMinute = await checkRate(env.REVIEW_RL, request, {
    limit: 5,
    windowSec: 60,
    bucketKey: 'lookup-min',
  });
  if (rlMinute.blocked) {
    console.warn('[customer-lookup] rate limit (minute) blocked', rlMinute);
    return finish({ matched: 'none' }); // 429 안 줌 — 봇에게 정보 노출 방지
  }
  const rlHour = await checkRate(env.REVIEW_RL, request, {
    limit: 30,
    windowSec: 3600,
    bucketKey: 'lookup-hour',
  });
  if (rlHour.blocked) {
    console.warn('[customer-lookup] rate limit (hour) blocked', rlHour);
    return finish({ matched: 'none' });
  }

  const name = (body.name || '').trim();
  const last4 = (body.phoneLast4 || '').trim();
  // 이름은 비어있지만 않으면 통과 — 매칭은 last4 + 후보 존재로 판단.
  // (영문/한자/긴 이름/ERP 깨진 이름까지 모두 허용)
  if (name.length < 1) {
    return errorResponse('이름을 입력해 주세요.', 400);
  }
  if (!/^[0-9]{4}$/.test(last4)) {
    return errorResponse('휴대전화 뒷 4자리를 정확히 입력해 주세요.', 400);
  }

  if (!env.REVIEW_JWT_SECRET) {
    console.error('[review/customer-lookup] REVIEW_JWT_SECRET 누락');
    return errorResponse('서버 설정 오류', 500);
  }

  let session;
  try {
    session = await getRestSession(env);
  } catch (e) {
    console.error('[review/customer-lookup] signIn 실패:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  // ---------- 후보 조회 (두 컬렉션 병렬) ----------
  type Candidate = {
    source: 'inboundCustomers' | 'crm_customers';
    id: string;
    fullName: string;
    phone: string;
  };

  const candidates: Candidate[] = [];

  // inboundCustomers — customerName 또는 name 매칭
  try {
    const [byCustomerName, byName] = await Promise.all([
      restQueryByField(session, 'inboundCustomers', 'customerName', name, 20),
      restQueryByField(session, 'inboundCustomers', 'name', name, 20),
    ]);
    for (const d of dedupeDocs([...byCustomerName, ...byName])) {
      const data = decodeFields(d.fields);
      const phone = String(data.phone || '');
      const fullName = String(
        (data.customerName as string) || (data.name as string) || '',
      );
      if (!phone || !fullName) continue;
      candidates.push({
        source: 'inboundCustomers',
        id: docIdFromName(d.name),
        fullName,
        phone,
      });
    }
  } catch (e) {
    console.warn('[review/customer-lookup] inboundCustomers 조회 실패:', e);
  }

  // crm_customers — name 정확매칭 + name "{이름}-{last4}" suffix 패턴
  // ⚠️ Firestore 실제 필드는 snake_case (`phone_number`, `phone_number` 아닌 `phoneNumber`는 schema 정의만)
  try {
    const [byName, bySuffix] = await Promise.all([
      restQueryByField(session, 'crm_customers', 'name', name, 20),
      restQueryByField(session, 'crm_customers', 'name', `${name}-${last4}`, 20),
    ]);
    for (const d of dedupeDocs([...byName, ...bySuffix])) {
      const data = decodeFields(d.fields);
      // 실제 필드는 phone_number (snake_case). phoneNumber 폴백.
      const phone = String(data.phone_number || data.phoneNumber || '');
      const fullName = String(data.name || '');
      if (!phone || !fullName) continue;
      candidates.push({
        source: 'crm_customers',
        id: docIdFromName(d.name),
        fullName,
        phone,
      });
    }
  } catch (e) {
    console.warn('[review/customer-lookup] crm_customers 조회 실패:', e);
  }

  // ---------- 뒷 4자리 필터 ----------
  const filtered = candidates.filter((c) => endsWithLast4(c.phone, last4));

  // 같은 phone 으로 dedupe — inboundCustomers + crm_customers 양쪽에 동일 인물이
  // 박혀있어도 1명으로 간주. inboundCustomers 우선 (snapshot 풍부).
  const byPhone = new Map<string, typeof filtered[number]>();
  for (const c of filtered) {
    const key = String(c.phone).replace(/[^0-9]/g, '');
    const exist = byPhone.get(key);
    if (!exist) {
      byPhone.set(key, c);
    } else if (exist.source === 'crm_customers' && c.source === 'inboundCustomers') {
      // inboundCustomers 우선 (contracts/measurements/builds join 가능)
      byPhone.set(key, c);
    }
  }
  const matched = Array.from(byPhone.values());

  if (matched.length === 0) {
    return finish({ matched: 'none' });
  }

  // 동명이인(서로 다른 phone, 2명+)이어도 막지 않음 — 첫 후보를 통과시킨다.
  // candidates 에 inboundCustomers 를 먼저 push 하므로 filtered/matched 순서상
  // inbound 후보가 앞선다 (snapshot 풍부). 단, 같은 last4 충돌 시 본인이 아닌
  // 후보의 PII 가 prefill 될 수 있음 — 의도된 정책 (사용자 확인 2026-05-29).
  const hit = matched[0];

  // ---------- 이미 작성한 후기 확인 (3건까지 허용) ----------
  try {
    const existing = await restQueryByField(
      session,
      'reviews',
      'customerPhone',
      hit.phone,
      10,
    );
    const live = existing.filter((d) => {
      const f = decodeFields(d.fields);
      return f.status !== 'rejected';
    });
    if (live.length >= 3) {
      return finish({ matched: 'already_reviewed' });
    }
  } catch (e) {
    // reviews 컬렉션 권한 없을 수도 — 일단 통과
    console.warn('[review/customer-lookup] reviews 조회 skip:', e);
  }

  // ---------- Snapshot 자동 매핑 (prefill용) ----------
  // 작성 폼에 제품/유리/사이즈/시공일/주소 자동 채움
  // inboundCustomers + crm_customers 둘 다 지원
  let snapshot;
  try {
    snapshot = await buildSnapshot(session, hit.source, hit.id);
  } catch (e) {
    console.warn('[customer-lookup] snapshot 구성 실패 (계속 진행):', e);
  }

  // ---------- JWT 발급 ----------
  const token = await signReviewToken(
    {
      phone: hit.phone,
      source: hit.source,
      sourceId: hit.id,
      customerName: hit.fullName,
    },
    env.REVIEW_JWT_SECRET,
  );

  return finish({
    matched: 'one',
    token,
    masked: {
      name: maskName(stripSuffix(hit.fullName, last4)),
      phone: maskPhone(hit.phone),
    },
    snapshot, // prefill 데이터 (제품/유리/사이즈/시공일/주소 등)
  });
};

// =================== utils ===================

function dedupeDocs(docs: RestDocument[]): RestDocument[] {
  const seen = new Set<string>();
  const out: RestDocument[] = [];
  for (const d of docs) {
    if (seen.has(d.name)) continue;
    seen.add(d.name);
    out.push(d);
  }
  return out;
}

function docIdFromName(fullName: string): string {
  const parts = fullName.split('/');
  return parts[parts.length - 1] || fullName;
}

function endsWithLast4(phone: string, last4: string): boolean {
  return phone.replace(/[^0-9]/g, '').endsWith(last4);
}

function stripSuffix(fullName: string, last4: string): string {
  return fullName.endsWith(`-${last4}`)
    ? fullName.slice(0, -1 - last4.length)
    : fullName;
}

function maskName(n: string): string {
  if (n.length <= 2) return n[0] + '*';
  return n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
}

function maskPhone(p: string): string {
  // 010-1234-5678 → 010-****-5678
  const m = p.match(/^(010)[-\s]?\d{3,4}[-\s]?(\d{4})$/);
  if (m) return `${m[1]}-****-${m[2]}`;
  return p.replace(/\d/g, '*');
}
