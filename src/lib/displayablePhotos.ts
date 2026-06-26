/**
 * 브라우저가 직접 렌더하지 못하는 이미지 포맷(HEIC/HEIF)을 후기 사진 목록에서 제외한다.
 * 아이폰 기본 포맷인 HEIC 는 대부분 브라우저에서 깨지고, 무료 변환 서비스(wsrv)도
 * 간헐적으로 거부하므로 아예 노출하지 않는다.
 */

const UNRENDERABLE = /\.(heic|heif)(\?|$)/i;

function isDisplayable(url?: string): boolean {
  return !!url && !UNRENDERABLE.test(url);
}

/** 표시 가능한 사진만 남긴다 (url 없는 항목도 제거) */
export function displayablePhotos<T extends { url?: string }>(photos?: T[]): T[] {
  return (photos || []).filter((p) => isDisplayable(p.url));
}

/** 표시 가능한 첫 사진의 url (카드 썸네일용) */
export function firstDisplayableUrl(photos?: { url?: string }[]): string | undefined {
  return displayablePhotos(photos)[0]?.url;
}
