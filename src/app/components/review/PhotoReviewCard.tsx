import { Link } from "react-router";
import { ReviewImage } from "./ReviewImage";

export interface PhotoReviewData {
  id: string;
  thumbnailUrl: string;
  location?: string; // "인천 부평구 110동"
}

// "인천 부평구 110동" → "인천 부평구" (마지막 동/번지 토큰 제거)
function shortLocation(loc?: string): string {
  if (!loc) return "";
  const parts = loc.trim().split(/\s+/);
  if (parts.length <= 2) return loc;
  const last = parts[parts.length - 1];
  // 동/번지(숫자 포함 or "동"/"가"/"리"로 끝나는) 토큰이면 떼어낸다
  if (/(동|가|리|번지|\d)$/.test(last)) return parts.slice(0, -1).join(" ");
  return loc;
}

export function PhotoReviewCard({ data }: { data: PhotoReviewData }) {
  return (
    <Link
      to={`/review/${encodeURIComponent(data.id)}`}
      className="group relative block aspect-square rounded-2xl overflow-hidden bg-[#eef2f6] shadow-sm hover:shadow-md transition"
    >
      <ReviewImage
        url={data.thumbnailUrl}
        resize={{ width: 320 }}
        alt={`${data.location || ""} 창호 시공 후기 사진`}
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        showSpinner={false}
      />
      {data.location && (
        <span className="absolute inset-x-0 bottom-0 px-3.5 pt-6 pb-3 bg-gradient-to-t from-black/60 to-transparent text-white text-[13px] font-extrabold">
          {shortLocation(data.location)}
        </span>
      )}
    </Link>
  );
}
