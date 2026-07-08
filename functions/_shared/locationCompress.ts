/**
 * 풀 주소를 시/구·동까지만 압축. 개인정보(번지·아파트 동호수) 노출 방지.
 *
 * 예:
 *   "경기 광주시 곤지암읍 건업길 5 아파트 103호" → "경기 광주시 곤지암읍"
 *   "서울특별시 마포구 양화로 121"              → "서울특별시 마포구"
 *   "인천광역시 미추홀구 매소홀로475번길 18(학익동, 신동아3차)" → "인천광역시 미추홀구 학익동"
 *   "대전 동구 가양로 12 102동 1001호"          → "대전 동구"
 *
 * 전략:
 *   1) 괄호 안의 동명 추출 (`(학익동, ...)` → `학익동`) 우선
 *   2) 공백 split 앞 2~3 토큰
 *      - 첫 토큰: 시도 (서울특별시/경기/인천광역시 등)
 *      - 둘째 토큰: 시/군/구 (광주시/마포구/미추홀구)
 *      - 셋째 토큰: 행정동/읍/면 (곤지암읍/학익동) — 있으면 포함
 *
 * ⚠️ 아파트 단지 동("102동")도 '동'으로 끝나므로, 숫자로 시작하는 토큰은
 *    행정동으로 취급하지 않는다 (개인정보). 이미 박제된 locationLabel
 *    ("대전 동구 102동")에 다시 적용해도 같은 규칙으로 잘린다.
 */
export function compressLocation(addressRoad?: string, address?: string): string {
  const src = (addressRoad || address || '').trim();
  if (!src) return '';

  // 1) 괄호 안 동명 추출 시도 (도로명 주소의 `(학익동, ...)` 형태)
  const dongFromParen = extractDongFromParen(src) || extractDongFromParen(address);

  // 2) 공백 분리
  const tokens = src.replace(/\([^)]*\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';

  const sido = tokens[0];
  const sigu = tokens[1];
  let dong = tokens[2];

  // 세번째 토큰이 도로명/번지/단지 동("102동")이면 dong 으로 안 침
  if (dong && !isAdminDong(dong)) {
    dong = undefined;
  }
  // 3) 도로명에서 동을 못 뽑았으면: 괄호 안 동명 → 지번 주소에서 동 보강
  if (!dong) dong = dongFromParen;
  if (!dong) dong = extractDongToken(address);

  return [sido, sigu, dong].filter(Boolean).join(' ');
}

/** 행정동/읍/면/리 토큰인지 — 숫자로 시작하면 아파트 단지 동("102동")이라 제외 */
function isAdminDong(t: string): boolean {
  return /[동읍면리가]$/.test(t) && !/^\d/.test(t);
}

/** 괄호 안에서 동/읍/면으로 끝나는 토큰 추출 (`(학익동, 신동아3차)` → `학익동`) */
function extractDongFromParen(s?: string): string | undefined {
  if (!s) return undefined;
  const paren = s.match(/\(([^,)]+)/);
  const inside = paren?.[1]?.trim();
  return inside && isAdminDong(inside) ? inside : undefined;
}

/** 지번 주소에서 동/읍/면/리 토큰 추출 (숫자 동 "삼동" 등 흔치 않으니 단순 매칭) */
function extractDongToken(s?: string): string | undefined {
  if (!s) return undefined;
  const tokens = s.replace(/\([^)]*\)/g, '').trim().split(/\s+/).filter(Boolean);
  // 시/구(앞 2토큰) 이후에서 동/읍/면/리로 끝나는 첫 토큰
  return tokens.slice(2).find(isAdminDong);
}
