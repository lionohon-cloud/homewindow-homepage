/**
 * 후기 태그(tags)에는 시공 부위(거실/주방/안방 등)와 만족 키워드(소음 차단/깔끔한 마감 등)가
 * 섞여 있다. 후기 카드 칩에는 시공 부위를 노출하지 않고 만족 키워드만 보여주기 위해 부위를 거른다.
 */

const PART_WORDS = new Set([
  "거실",
  "주방",
  "안방",
  "베란다",
  "발코니",
  "작은방",
  "큰방",
  "드레스룸",
  "현관",
  "욕실",
  "다용도실",
  "서재",
  "방",
  "전체",
]);

/** tags 에서 시공 부위 단어를 제거하고 만족 키워드만 반환 */
export function keywordTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.filter((t) => !PART_WORDS.has(t.trim()));
}
