import { Link } from "react-router";
import { Image as ImageIcon } from "lucide-react";
import { StarsDisplay } from "./StarsDisplay";
import { ReviewImage } from "./ReviewImage";

export interface PremiumCardData {
  id: string;
  customerName: string;     // 마스킹된 이름 "이*윤"
  location: string;         // "경기 분당"
  productLabel?: string;    // "KCC 클렌체 240mm"
  modelLabel?: string;      // "이중창 · 7개소"
  rating: number;
  photoCount: number;
  videoCount?: number;
  publishedAt: string;      // "2026.03.14"
  excerpt: string;
  thumbnailUrl?: string;
}

const PASTEL = ["#dfe9d2", "#e8dac6", "#d6e1ea", "#e6d8df", "#e3d9c5"];

export function PremiumReviewCard({ data }: { data: PremiumCardData }) {
  const fallbackBg = PASTEL[hashCode(data.id) % PASTEL.length];

  return (
    <Link
      to={`/review/${encodeURIComponent(data.id)}`}
      className="group block rounded-2xl bg-white border border-[#ebe5e0] overflow-hidden hover:border-[#c8b8a8] hover:shadow-lg transition"
    >
      {/* hero */}
      <div
        className="relative h-[200px] md:h-[240px] overflow-hidden"
        style={{ background: fallbackBg }}
      >
        {data.thumbnailUrl && (
          <ReviewImage
            url={data.thumbnailUrl}
            resize={{ width: 480 }}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            showSpinner={false}
          />
        )}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold">
          <ImageIcon className="w-3 h-3" />
          {data.photoCount}장
          {data.videoCount ? ` · 영상 ${data.videoCount}` : ""}
        </span>
      </div>

      {/* body */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-bold text-[#1c1614] truncate">
              {data.customerName}
            </div>
            <div className="text-[12px] text-[#6b6460] truncate">
              {data.location}
            </div>
          </div>
          <StarsDisplay value={data.rating} size={14} />
        </div>

        <p className="mt-3 text-[13.5px] text-[#3a3531] leading-[1.65] line-clamp-2 break-keep">
          {data.excerpt}
        </p>

        <div className="mt-3 flex items-center justify-between text-[12px] text-[#6b6460]">
          <span className="font-semibold text-[#3a3531]">{data.modelLabel || ""}</span>
          <span>{data.publishedAt}</span>
        </div>
      </div>
    </Link>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
