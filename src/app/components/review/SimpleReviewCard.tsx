import { Link } from "react-router";
import { StarsDisplay } from "./StarsDisplay";

export interface SimpleRowData {
  id: string;
  customerName: string;
  location?: string;
  publishedAt: string;
  rating: number;
  reviewText: string;
  tags?: string[];
  helpfulCount?: number;
}

export function SimpleReviewCard({ data }: { data: SimpleRowData }) {
  return (
    <Link
      to={`/review/${encodeURIComponent(data.id)}`}
      className="flex h-full min-h-[168px] flex-col rounded-2xl bg-white border border-[#ebe5e0] p-5 hover:border-[#c8b8a8] hover:shadow-md transition"
    >
      {/* 상단: 이름·날짜·지역 + 별점 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div>
            <span className="text-[13px] font-bold text-[#1c1614]">
              {data.customerName}
            </span>
            <span className="ml-2 text-[11.5px] text-[#9a948f]">
              {data.publishedAt}
            </span>
          </div>
          {data.location && (
            <div className="mt-0.5 text-[12px] text-[#6b6460] truncate">
              {data.location}
            </div>
          )}
        </div>
        <StarsDisplay value={data.rating} size={14} />
      </div>

      {/* 본문 — 항상 3줄 높이 확보해 카드 높이 통일 */}
      <p className="mt-3 min-h-[69px] text-[14px] text-[#3a3531] leading-[1.65] break-keep line-clamp-3">
        {data.reviewText}
      </p>

      {/* 키워드 칩 — 하단 고정, 한 줄만 노출해 높이 변동 차단 */}
      <div className="mt-auto pt-3.5 flex flex-nowrap gap-1.5 overflow-hidden h-[36px] items-end">
        {data.tags?.map((t) => (
          <span
            key={t}
            className="shrink-0 inline-flex items-center px-2.5 h-[24px] rounded-full bg-[#fbf0ef] text-[#952c2c] text-[11.5px] font-semibold"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
