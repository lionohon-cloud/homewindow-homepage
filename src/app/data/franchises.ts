/**
 * 260928 가맹점 지도 — 가맹점 목록 데이터.
 *
 * 실제 운영: 시공후기처럼 ERP 업체 마스터(vendors, type=franchise) → `/api/franchise/list` 로 공개 필드만 받는다.
 * 응답이 없으면(개발 서버 등) 아래 SAMPLE 을 쓴다. SAMPLE 은 예시값이라 운영에 나가면 안 된다.
 *
 * 261002 공개 항목 정리 (사장님 결정):
 *  - 연락처·주소·대표자는 싣지 않는다.
 *    · 가맹점 번호가 노출되면 고객이 본사를 거치지 않고 직접 연락 → 본사 DB 수집 구조와 어긋남
 *    · 자택·아파트로 사업자를 낸 가맹점이 많아 주소 공개가 부담
 *    · 가맹점 대표는 "대표"로 소개되기를 원하지 않음
 *  - 대신 프로필 사진(원형) · 사업자등록번호 · 담당 지역을 보여 주고,
 *    카드를 누르면 본사 양식의 "가맹점 인증서"를 띄운다 (상호·대표자·사업자등록번호). 인증기간은 관리가 어려워 넣지 않는다(261008).
 */
export interface Franchise {
  id: string;           // ERP 업체 문서 id (선택·키 용도)
  name: string;         // 상호 — ERP 업체 이름 그대로 (예: "청암홈윈도우 1호점")
  no?: number;          // 호점 번호 — 상호의 "N호점"에서 뽑음. 핀 숫자·정렬용 (없으면 핀에 •)
  bizNo?: string;       // 사업자등록번호 (000-00-00000)
  region?: string;      // 카드에 보이는 지역 (주소의 시·도 + 시·군, 예: "경기 남양주")
  area?: string;        // 핀 위치용 지역명 (시·군 또는 광역시명 — franchise-map.json centers 키). 없으면 핀 없음
  photo?: string;       // 프로필 사진 URL (없으면 기본 아이콘)
  rep?: string;         // 대표자 — 인증서에만, 두 번째 글자를 가려서 표시 (API 에서 가려 옴)
  lat?: number;         // 좌표가 있으면 area 대신 이것으로 핀을 찍는다
  lng?: number;
}

export const SAMPLE_FRANCHISES: Franchise[] = [
  { id: "sample-1", name: "청암홈윈도우 1호점", no: 1, bizNo: "000-00-00001", region: "경기 남양주", area: "남양주시", rep: "김민수" },
  { id: "sample-2", name: "청암홈윈도우 2호점", no: 2, bizNo: "000-00-00002", region: "경기 의정부", area: "의정부시", rep: "이영호" },
  { id: "sample-3", name: "청암홈윈도우 3호점", no: 3, bizNo: "000-00-00003", region: "경기 수원", area: "수원시", rep: "박지훈" },
  { id: "sample-4", name: "청암홈윈도우 4호점", no: 4, bizNo: "000-00-00004", region: "경기 부천", area: "부천시", rep: "최성민" },
  { id: "sample-5", name: "청암홈윈도우 5호점", no: 5, bizNo: "000-00-00005", region: "인천", area: "인천광역시", rep: "정우진" },
  { id: "sample-6", name: "청암홈윈도우 6호점", no: 6, bizNo: "000-00-00006", region: "강원 동해", area: "동해시", rep: "강동원" },
  { id: "sample-7", name: "청암홈윈도우 7호점", no: 7, bizNo: "000-00-00007", region: "충북 충주", area: "충주시", rep: "조현우" },
  { id: "sample-8", name: "청암홈윈도우 8호점", no: 8, bizNo: "000-00-00008", region: "충북 청주", area: "청주시", rep: "윤재석" },
  { id: "sample-9", name: "청암홈윈도우 9호점", no: 9, bizNo: "000-00-00009", region: "대전", area: "대전광역시", rep: "장민호" },
  { id: "sample-10", name: "청암홈윈도우 10호점", no: 10, bizNo: "000-00-00010", region: "전북 완주", area: "완주군", rep: "임태경" },
  { id: "sample-11", name: "청암홈윈도우 11호점", no: 11, bizNo: "000-00-00011", region: "광주", area: "광주광역시", rep: "한상철" },
  { id: "sample-12", name: "청암홈윈도우 12호점", no: 12, bizNo: "000-00-00012", region: "대구", area: "대구광역시", rep: "오세훈" },
  { id: "sample-13", name: "청암홈윈도우 13호점", no: 13, bizNo: "000-00-00013", region: "울산", area: "울산광역시", rep: "서준영" },
  { id: "sample-14", name: "청암홈윈도우 14호점", no: 14, bizNo: "000-00-00014", region: "경남 창원", area: "창원시", rep: "신동욱" },
  { id: "sample-15", name: "청암홈윈도우 15호점", no: 15, bizNo: "000-00-00015", region: "부산", area: "부산광역시", rep: "권혁진" },
];

/** 대표자명 두 번째 글자 가리기 — 홍길동 → 홍○동, 김수 → 김○ (261008 사장님 지시) */
export function maskName(name?: string): string {
  if (!name) return "";
  const ch = [...name.trim()];
  if (ch.length < 2) return name.trim();
  ch[1] = "○";
  return ch.join("");
}
