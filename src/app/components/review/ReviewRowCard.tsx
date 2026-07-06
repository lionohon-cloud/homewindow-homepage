import { Link } from "react-router";
import { Image as ImageIcon } from "lucide-react";
import { ReviewImage } from "./ReviewImage";

export interface ReviewRowData {
  id: string;
  customerName: string; // 마스킹된 이름 "김*수"
  location?: string; // "인천 부평구 110동"
  brand?: string; // "홈윈도우"
  model?: string; // "프레스티지"
  rating: number;
  publishedAt: string; // "2026.04.22"
  reviewText: string;
  tags?: string[]; // keywordTags 통과된 만족 키워드
  photoUrls: string[]; // 표시 가능한 사진 url (0개면 사진 없음)
}

// "인천 부평구 110동 시공 후기" 형태의 상단 라인용 — 동/번지는 그대로 두되 위치 문구만.
function locationPhrase(loc?: string): string {
  if (!loc) return "";
  return `${loc} 시공 후기`;
}

export function ReviewRowCard({ data }: { data: ReviewRowData }) {
  const hasPhotos = data.photoUrls.length > 0;

  return (
    <Link
      to={`/review/${encodeURIComponent(data.id)}`}
      className="group flex flex-col md:flex-row gap-4 md:gap-6 py-6 border-b border-[#ebe5e0] last:border-b-0"
    >
      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {/* 상단: 이름 · 별점 · 날짜 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[15px] font-extrabold text-[#1c1614]">
            {data.customerName}
          </span>
          <span className="text-[13px] font-extrabold text-[#1c1614]">
            <span className="text-[#c89545]">★</span> {data.rating.toFixed(1)}
          </span>
          <span className="text-[12px] text-[#9a948f] font-semibold">
            {data.publishedAt}
          </span>
        </div>

        {/* 지역 · 브랜드 · 등급 */}
        {(data.location || data.brand || data.model) && (
          <div className="mt-2.5 text-[13px] text-[#6b6460] font-semibold">
            {data.location && <span>{locationPhrase(data.location)}</span>}
            {data.brand && (
              <>
                <span className="mx-1.5 text-[#d6cfc8]">·</span>
                <span>{data.brand}</span>
              </>
            )}
            {data.model && (
              <>
                <span className="mx-1.5 text-[#d6cfc8]">·</span>
                <span className="text-[#952c2c] font-extrabold">{data.model}</span>
              </>
            )}
          </div>
        )}

        {/* 모바일 사진: 이름·지역 바로 밑, 가로 4칸 (앞 3장 + 4번째 = 더보기) */}
        {hasPhotos && (
          <div className="mt-3 md:hidden">
            <MobilePhotoStrip photoUrls={data.photoUrls} location={data.location} />
          </div>
        )}

        {/* 키워드 칩 */}
        {data.tags && data.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fbe7e7] text-[#b23b3b] text-[12px] font-bold"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 본문 */}
        <p className="mt-3 text-[14.5px] text-[#3a3531] leading-[1.7] break-keep line-clamp-3">
          {data.reviewText}
        </p>
      </div>

      {/* 데스크톱 우측 사진 — 대표 썸네일 한 장 (+ 나머지 장수 표시) */}
      {hasPhotos && (
        <div className="hidden md:block flex-none md:w-[180px]">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#eef2f6]">
            <ReviewImage
              url={data.photoUrls[0]}
              resize={{ width: 360 }}
              alt={`${data.location || ""} 창호 시공 후기 사진`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              showSpinner={false}
            />
            {data.photoUrls.length > 1 && (
              <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 bg-black/60 text-white text-[11.5px] font-bold px-2.5 py-1 rounded-full">
                <ImageIcon className="w-3 h-3" />
                {data.photoUrls.length}
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}

/** 모바일 전용 — 사진을 가로 4칸으로. 사진이 4장 초과면 4번째 칸을 "+N 더보기" 로. */
function MobilePhotoStrip({
  photoUrls,
  location,
}: {
  photoUrls: string[];
  location?: string;
}) {
  const overflow = photoUrls.length > 4;
  // 사진 4장 이하면 그대로, 초과면 앞 3장 + 더보기 칸
  const shown = overflow ? photoUrls.slice(0, 3) : photoUrls.slice(0, 4);
  const moreCount = photoUrls.length - 3;
  const moreThumb = photoUrls[3];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {shown.map((url, i) => (
        <div
          key={i}
          className="relative aspect-square rounded-lg overflow-hidden bg-[#eef2f6]"
        >
          <ReviewImage
            url={url}
            resize={{ width: 160 }}
            alt={`${location || ""} 창호 시공 후기 사진 ${i + 1}`}
            className="w-full h-full object-cover"
            showSpinner={false}
          />
        </div>
      ))}
      {overflow && (
        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#2a2320]">
          {moreThumb && (
            <ReviewImage
              url={moreThumb}
              resize={{ width: 160 }}
              alt=""
              className="w-full h-full object-cover"
              showSpinner={false}
            />
          )}
          <span className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">
            <span className="text-[15px] font-black leading-none">+{moreCount}</span>
            <span className="mt-0.5 text-[10px] font-bold">더보기</span>
          </span>
        </div>
      )}
    </div>
  );
}
