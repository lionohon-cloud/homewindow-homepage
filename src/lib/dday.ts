/**
 * 프로모션 종료일까지 남은 날.
 *
 * 히어로 배지와 강화유리 섹션 배지가 같은 값을 써야 해서 여기로 뺐다.
 * 종료일을 바꿀 때는 PROMO_END 한 곳만 고치면 된다.
 */

/** 9월 프로모션 종료일. 이 날짜가 지나면 배지가 "종료" 로 바뀐다. */
export const PROMO_END = "2026-09-30";

/** "D-29" · "D-DAY" · "종료" */
export function useDday(targetDate: string = PROMO_END): string {
  const diff = Math.ceil(
    (new Date(targetDate).setHours(23, 59, 59, 999) - Date.now()) / 86400000,
  );
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-DAY";
  return "종료";
}
