/**
 * 본인확인된 고객의 ERP 데이터를 5개 컬렉션에서 join → 후기에 표시할 snapshot 구성.
 *
 * 실측 트레이스 (2026-05-18) 기반:
 *   inboundCustomers/{sourceId}
 *     ↓ (inboundCustomerId 역참조)
 *   contracts where inboundCustomerId == sourceId
 *     ↓ (contractDocId)
 *   measurements where contractDocId == X
 *   builds where contractId == X AND status='confirmed'
 *
 * crm_customers (레거시) 분기는 추후 확장. 일단 inboundCustomers 만 처리.
 */
import {
  type RestSession,
  restQueryByField,
  decodeFields,
  type RestDocument,
} from './firestoreRest';
import { compressLocation } from './locationCompress';
import { warrantyFromGrade } from './warrantyMap';

export interface ReviewSnapshot {
  contractDocId?: string;
  brand?: string;            // "KCC"
  modelGrade?: string;       // "시그니처"
  productLabel?: string;     // "KCC 시그니처"
  locationLabel?: string;    // "경기 광주시 곤지암읍"
  installDate?: string;      // "2026.03.14"
  glassLabel?: string;       // "로이복층 22mm + 아르곤 가스"
  sizeLabel?: string;        // "3,200×2,400mm 외 6개소"
  warrantyLabel?: string;    // "PRESTIGE 20년 무상보증"
  warrantyYears?: number;
  siteWorkSummary?: string;  // "거실·주방·안방·베란다"
  erpPhotos?: { path: string; url: string }[];
}

/**
 * source + sourceId 에 따라 적절한 snapshot 빌더 호출.
 */
export async function buildSnapshot(
  session: RestSession,
  source: 'inboundCustomers' | 'crm_customers',
  sourceId: string,
): Promise<ReviewSnapshot> {
  if (source === 'inboundCustomers') {
    return buildSnapshotFromInbound(session, sourceId);
  }
  return buildSnapshotFromCrm(session, sourceId);
}

/**
 * crm_customers (레거시) 기반 snapshot.
 * 필드명이 snake_case (phone_number, customer_id, installation_date 등).
 */
export async function buildSnapshotFromCrm(
  session: RestSession,
  crmCustomerId: string,
): Promise<ReviewSnapshot> {
  const out: ReviewSnapshot = {};

  // 1) crm_customers 본 도큐먼트
  const cust = await getDoc(session, 'crm_customers', crmCustomerId);
  if (cust) {
    const f = decodeFields(cust.fields);
    out.locationLabel = compressLocation(
      f.address as string | undefined,
      f.address as string | undefined,
    );
  }

  // 2) crm_contracts where customer_id == crmCustomerId (integer)
  let contract: RestDocument | undefined;
  try {
    const contracts = await queryByIntField(session, 'crm_contracts', 'customer_id', crmCustomerId, 3);
    contract = contracts[0];
  } catch (e) {
    console.warn('[snapshot/crm] crm_contracts 조회 실패:', e);
  }

  if (contract) {
    const cf = decodeFields(contract.fields);
    out.contractDocId = docIdFromName(contract.name);
    out.brand = cf.brand as string | undefined;
    out.modelGrade = (cf.contract_grade as string | undefined) || (cf.contractGrade as string | undefined);
    if (out.brand || out.modelGrade) {
      out.productLabel = [out.brand, out.modelGrade].filter(Boolean).join(' ');
    }
    const w = warrantyFromGrade(out.modelGrade);
    if (w) {
      out.warrantyLabel = w.label;
      out.warrantyYears = w.years;
    }
    // 시공일 — installation_plan_date
    if (cf.installation_plan_date) {
      out.installDate = formatDate(String(cf.installation_plan_date));
    }
  }

  // 3) crm_installations where customer_id == crmCustomerId (시공 실제 일자)
  try {
    const installations = await queryByIntField(
      session,
      'crm_installations',
      'customer_id',
      crmCustomerId,
      1,
    );
    if (installations.length) {
      const inf = decodeFields(installations[0].fields);
      if (inf.installation_date) {
        out.installDate = formatDate(String(inf.installation_date));
      }
    }
  } catch (e) {
    console.warn('[snapshot/crm] crm_installations 조회 실패:', e);
  }

  return out;
}

async function queryByIntField(
  session: RestSession,
  collection: string,
  field: string,
  value: string,
  pageLimit = 20,
): Promise<RestDocument[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${session.projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: 'EQUAL',
          value: { integerValue: value },
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
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{ document?: RestDocument }>;
  return data.map((r) => r.document).filter((d): d is RestDocument => !!d);
}

/**
 * inboundCustomers 도큐먼트 ID 로 풀 snapshot 구성.
 */
export async function buildSnapshotFromInbound(
  session: RestSession,
  inboundDocId: string,
): Promise<ReviewSnapshot> {
  const out: ReviewSnapshot = {};

  // 1) inboundCustomers 본 도큐먼트 fetch (주소용)
  const ib = await getDoc(session, 'inboundCustomers', inboundDocId);
  if (ib) {
    const f = decodeFields(ib.fields);
    out.locationLabel = compressLocation(
      f.addressRoad as string | undefined,
      f.address as string | undefined,
    );
  }

  // 2) contracts where inboundCustomerId == sourceId
  let contract: RestDocument | undefined;
  try {
    const contracts = await restQueryByField(
      session,
      'contracts',
      'inboundCustomerId',
      inboundDocId,
      3,
    );
    // 가장 최근 것 우선 (signedAt 또는 updatedAt 기준)
    contract = contracts[0];
  } catch (e) {
    console.warn('[snapshot] contracts 조회 실패:', e);
  }

  if (!contract) {
    return out;
  }

  const cf = decodeFields(contract.fields);
  const contractDocId = docIdFromName(contract.name);
  out.contractDocId = contractDocId;
  out.brand = cf.brand as string | undefined;
  out.modelGrade = cf.modelGrade as string | undefined;
  if (out.brand || out.modelGrade) {
    out.productLabel = [out.brand, out.modelGrade].filter(Boolean).join(' ');
  }
  // 주소 보강 (inbound에 없으면 contract 에서)
  if (!out.locationLabel) {
    out.locationLabel = compressLocation(
      cf.applicantAddressRoad as string | undefined,
      cf.applicantAddress as string | undefined,
    );
  }
  // 보증
  const w = warrantyFromGrade(out.modelGrade);
  if (w) {
    out.warrantyLabel = w.label;
    out.warrantyYears = w.years;
  }

  // 3) measurements where contractDocId == X
  let measurement: RestDocument | undefined;
  try {
    const ms = await restQueryByField(
      session,
      'measurements',
      'contractDocId',
      contractDocId,
      1,
    );
    measurement = ms[0];
  } catch (e) {
    console.warn('[snapshot] measurements 조회 실패:', e);
  }

  if (measurement) {
    const mf = decodeFields(measurement.fields);
    const items = (mf.items as Array<Record<string, unknown>>) || [];

    // 사이즈: 가장 큰 1개 + " 외 N개소"
    if (items.length) {
      const sized = items
        .map((it) => ({
          cw: Number(it.cw || 0),
          ch: Number(it.ch || 0),
          qty: Number(it.qty || 0),
        }))
        .filter((i) => i.cw && i.ch);
      if (sized.length) {
        const biggest = [...sized].sort((a, b) => b.cw * b.ch - a.cw * a.ch)[0];
        const totalQty = sized.reduce((s, i) => s + i.qty, 0);
        out.sizeLabel =
          `${formatNum(biggest.cw)}×${formatNum(biggest.ch)}mm` +
          (totalQty > 1 ? ` 외 ${totalQty - 1}개소` : '');
      }

      // 유리: items 의 glassOuter/Inner 중 unique
      const glasses = new Set<string>();
      for (const it of items) {
        const out2 = String(it.glassOuter || '').trim();
        const inn = String(it.glassInner || '').trim();
        if (out2) glasses.add(out2);
        if (inn) glasses.add(inn);
      }
      const glassList = [...glasses].filter(Boolean);
      if (glassList.length) {
        out.glassLabel = glassList.slice(0, 3).join(' + ');
      }

      // 시공 부위: items 의 location 또는 name 에서 추출
      const parts = new Set<string>();
      for (const it of items) {
        const loc = String(it.location || it.room || it.part || '').trim();
        if (loc) parts.add(loc);
      }
      if (parts.size) {
        out.siteWorkSummary = [...parts].join('·');
      }
    }
  }

  // 4) builds where contractId == X (시공완료일 + ERP 사진)
  try {
    const builds = await restQueryByField(
      session,
      'builds',
      'contractId',
      contractDocId,
      1,
    );
    if (builds.length) {
      const bf = decodeFields(builds[0].fields);
      if (bf.confirmedAt) {
        out.installDate = formatDate(String(bf.confirmedAt));
      } else if (bf.scheduledDate) {
        out.installDate = formatDate(String(bf.scheduledDate));
      }
      // ERP 시공 사진 (옵션)
      const photos = (bf.photos as Array<Record<string, unknown>>) || [];
      if (photos.length) {
        out.erpPhotos = photos
          .map((p) => ({
            path: String(p.path || ''),
            url: String(p.url || p.downloadUrl || ''),
          }))
          .filter((p) => p.url);
      }
    }
  } catch (e) {
    console.warn('[snapshot] builds 조회 실패:', e);
  }

  // 5) 시공일 fallback — contracts.signedAt
  if (!out.installDate && cf.signedAt) {
    out.installDate = formatDate(String(cf.signedAt));
  }

  return out;
}

// ============ helpers ============
async function getDoc(
  session: RestSession,
  coll: string,
  id: string,
): Promise<RestDocument | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${session.projectId}/databases/(default)/documents/${coll}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.idToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function docIdFromName(fullName: string): string {
  const parts = fullName.split('/');
  return parts[parts.length - 1] || fullName;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  } catch {
    return iso;
  }
}

function formatNum(n: number): string {
  return n.toLocaleString('ko-KR');
}
