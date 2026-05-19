/**
 * 풀 주소를 시/구·동까지만 압축. 개인정보(번지·동호수) 노출 방지.
 *
 * 예:
 *   "경기 광주시 곤지암읍 건업길 5 아파트 103호" → "경기 광주시 곤지암읍"
 *   "서울특별시 마포구 양화로 121"              → "서울특별시 마포구"
 *   "인천광역시 미추홀구 매소홀로475번길 18(학익동, 신동아3차)" → "인천광역시 미추홀구 학익동"
 *
 * 전략:
 *   1) 괄호 안의 동명 추출 (`(학익동, ...)` → `학익동`) 우선
 *   2) 공백 split 앞 2~3 토큰
 *      - 첫 토큰: 시도 (서울특별시/경기/인천광역시 등)
 *      - 둘째 토큰: 시/군/구 (광주시/마포구/미추홀구)
 *      - 셋째 토큰: 동/읍/면 (곤지암읍/학익동) — 있으면 포함, 없으면 두 토큰만
 */
export function compressLocation(addressRoad?: string, address?: string): string {
  const src = (addressRoad || address || '').trim();
  if (!src) return '';

  // 1) 괄호 안 동명 추출 시도
  const paren = src.match(/\(([^,)]+)/);
  let dongFromParen: string | undefined;
  if (paren && paren[1]) {
    const inside = paren[1].trim();
    if (/[동읍면]$/.test(inside)) {
      dongFromParen = inside;
    }
  }

  // 2) 공백 분리
  const tokens = src.replace(/\([^)]*\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';

  const sido = tokens[0];
  const sigu = tokens[1];
  let dong = tokens[2];

  // 세번째 토큰이 도로명/번지면 dong 으로 안 침
  if (dong && !/[동읍면리가]$/.test(dong)) {
    dong = undefined;
  }
  if (!dong && dongFromParen) dong = dongFromParen;

  return [sido, sigu, dong].filter(Boolean).join(' ');
}
