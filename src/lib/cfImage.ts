/**
 * 이미지 리사이즈 헬퍼 (wsrv.nl 무료 이미지 CDN 프록시).
 *
 * 후기 사진은 사용자가 폰으로 찍은 원본(1~10MB)이 Firebase Storage 에 그대로 저장된다.
 * 200~400px 카드/썸네일에 원본을 받으면 느리므로, wsrv.nl(images.weserv.nl)로
 * 원본 URL 을 프록시해 리사이즈 + WebP 변환된 가벼운 이미지를 받는다.
 *
 *   예) 1.3MB JPG → ~8KB WebP (약 170배 감소)
 *
 * wsrv.nl 은 무료 공개 서비스로 별도 인프라/활성화가 필요 없고 dev/prod 모두 동작한다.
 * (Cloudflare Image Resizing 유료 활성화가 필요 없는 대안)
 */

const WSRV_BASE = "https://wsrv.nl/";

export interface CfImageOptions {
  width: number;
  quality?: number; // 기본 75
  fit?: "cover" | "contain" | "inside";
}

/** wsrv.nl 변환 URL 생성. 변환 불가 상황이면 원본을 그대로 반환. */
export function cfImage(url: string | undefined, opts: CfImageOptions): string {
  if (!url) return "";
  // data/blob/상대경로 등 프록시 불가능한 URL 은 그대로
  if (!/^https?:\/\//.test(url)) return url;
  // 이미 wsrv 프록시된 URL 은 중복 처리 안 함
  if (url.startsWith(WSRV_BASE)) return url;

  const params = new URLSearchParams({
    url,
    w: String(opts.width),
    q: String(opts.quality ?? 75),
    output: "webp",
    fit: opts.fit ?? "cover",
  });
  return `${WSRV_BASE}?${params.toString()}`;
}
