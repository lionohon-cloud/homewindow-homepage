import { Link } from "react-router";
import { ThumbsUp } from "lucide-react";
import { StarsDisplay } from "./StarsDisplay";

export interface SimpleRowData {
  id: string;
  customerName: string;
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
      className="grid grid-cols-[auto_140px_1fr_auto] gap-5 py-5 border-b border-[#ebe5e0] hover:bg-[#faf7f4] transition px-2 rounded-lg items-start"
    >
      <div className="pt-0.5">
        <StarsDisplay value={data.rating} size={14} />
      </div>
      <div className="text-[13px]">
        <div className="font-bold text-[#1c1614]">{data.customerName}</div>
        <div className="text-[11.5px] text-[#9a948f] mt-0.5">{data.publishedAt}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] text-[#3a3531] leading-[1.65] break-keep">
          {data.reviewText}
        </p>
        {data.tags && data.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 h-[22px] rounded-full bg-[#fbf0ef] text-[#952c2c] text-[11px] font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-[#9a948f] inline-flex items-center gap-1 pt-1">
        <ThumbsUp className="w-3 h-3" /> {data.helpfulCount ?? 0}
      </div>
    </Link>
  );
}
