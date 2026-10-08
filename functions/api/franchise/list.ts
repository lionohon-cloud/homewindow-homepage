/**
 * GET /api/franchise/list — 홈페이지 가맹점 지도·목록·인증서용 공개 조회 (261008).
 *
 * 데이터 출처: ERP 업체 마스터(Firestore `vendors`) 중 종류(type)가 'franchise'(가맹점)인 업체.
 *   시공후기(api/review/list.ts)와 같은 방식으로 ERP Firestore 를 직접 읽는다.
 *   - 'franchise' 코드값은 ERP 쪽 PR(업체 종류 「가맹점」 추가) 반영 후 생긴다. 그 전에는 0건 →
 *     화면(FranchiseMap)은 블록을 숨긴다.
 *   - 읽기 권한: vendors 는 익명이 아닌 로그인 사용자만 읽을 수 있다 →
 *     SYSTEM_AUTH_EMAIL / SYSTEM_AUTH_PASSWORD 가 설정돼 있어야 한다(없으면 익명 → 권한 오류 → 500).
 *
 * 응답은 화이트리스트로만 만든다: name · no · rep(두 번째 글자 가림) · bizNo · region · area.
 *   상세 주소(동·호수)·연락처·계좌·이메일·메모 등은 내보내지 않는다.
 *   주소는 시·도 + 시·군까지만 잘라서 region/area 로 바꾼 뒤 버린다.
 * 5분 캐시.
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import { getRestSession, restQueryByField, decodeFields } from '../../_shared/firestoreRest';
import type { FirebaseEnv } from '../../_shared/firebaseEnv';

interface PublicFranchise {
  id: string;
  name: string;
  no?: number;
  rep?: string;
  bizNo?: string;
  region?: string;
  area?: string;
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** 대표자명 두 번째 글자 가리기 (홍길동 → 홍○동) — 실명 전체가 공개 응답에 실리지 않게 */
const maskName = (v?: string) => {
  if (!v) return undefined;
  const ch = [...v];
  if (ch.length >= 2) ch[1] = '○';
  return ch.join('');
};

const SIDO_SHORT: [RegExp, string][] = [
  [/^서울/, '서울'], [/^부산/, '부산'], [/^대구/, '대구'], [/^인천/, '인천'], [/^광주/, '광주'],
  [/^대전/, '대전'], [/^울산/, '울산'], [/^세종/, '세종'], [/^경기/, '경기'], [/^강원/, '강원'],
  [/^충청북|^충북/, '충북'], [/^충청남|^충남/, '충남'], [/^전라북|^전북/, '전북'], [/^전라남|^전남/, '전남'],
  [/^경상북|^경북/, '경북'], [/^경상남|^경남/, '경남'], [/^제주/, '제주'],
];
/** 광역·특별시 → 지도 데이터(franchise-map.json centers)의 정식 이름 */
const METRO_FULL: Record<string, string> = {
  서울: '서울특별시', 부산: '부산광역시', 대구: '대구광역시', 인천: '인천광역시',
  광주: '광주광역시', 대전: '대전광역시', 울산: '울산광역시', 세종: '세종특별자치시',
};

/**
 * 주소에서 시·도 + 시·군만 뽑는다. 나머지(구·동·번지·호수)는 버린다.
 *   "경기도 양주시 옥정동로 …"   → { region: "경기 양주", area: "양주시" }
 *   "경기도 수원시 권선구 …"     → { region: "경기 수원", area: "수원시" }
 *   "부산광역시 사상구 학장동 …" → { region: "부산", area: "부산광역시" }
 */
export function areaFromAddress(address?: string): { region: string; area: string } | null {
  if (!address) return null;
  const toks = address.trim().split(/\s+/);
  const sido = SIDO_SHORT.find(([re]) => re.test(toks[0] ?? ''))?.[1];
  if (!sido) return null;
  if (METRO_FULL[sido]) return { region: sido, area: METRO_FULL[sido] };
  // "수원시권선구" 처럼 붙어 있어도 시·군까지만
  const m = (toks[1] ?? '').match(/^(.+?[시군])/);
  if (!m) return null;
  const sigun = m[1];
  return { region: `${sido} ${sigun.replace(/[시군]$/, '')}`, area: sigun };
}

export const onRequestOptions: PagesFunction<FirebaseEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet: PagesFunction<FirebaseEnv> = async ({ env }) => {
  let session;
  try {
    session = await getRestSession(env);
  } catch (e) {
    console.error('[franchise/list] signIn 실패:', e);
    return errorResponse('서버 설정 오류', 500);
  }

  let docs;
  try {
    docs = await restQueryByField(session, 'vendors', 'type', 'franchise', 100);
  } catch (e) {
    console.error('[franchise/list] vendors 조회 실패:', e);
    return errorResponse('가맹점 목록을 불러오지 못했습니다', 500);
  }

  const items: PublicFranchise[] = docs
    .map((d) => {
      const f = decodeFields(d.fields) as Record<string, unknown>;
      // 비활성·계약종료 업체는 숨긴다
      if (f.active === false || f.contractStatus === 'canceled') return null;
      const name = str(f.name);
      if (!name) return null;
      const loc = areaFromAddress(str(f.address));
      const noMatch = name.match(/(\d+)\s*호점/);
      const item: PublicFranchise = {
        id: d.name.split('/').pop()!,
        name,
        no: noMatch ? Number(noMatch[1]) : undefined,
        rep: maskName(str(f.ceoName)),
        bizNo: str(f.businessNumber),
        region: loc?.region ?? str(f.region),
        area: loc?.area,
      };
      return item;
    })
    .filter((x): x is PublicFranchise => !!x)
    // 호점 번호순 → 번호 없는 업체는 뒤에 이름순
    .sort((a, b) => (a.no ?? 1e9) - (b.no ?? 1e9) || a.name.localeCompare(b.name, 'ko'));

  return jsonResponse({ items }, { headers: { 'Cache-Control': 'public, max-age=300' } });
};
