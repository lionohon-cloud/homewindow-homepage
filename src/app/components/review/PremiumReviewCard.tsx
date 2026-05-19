import { Link } from "react-router";
import { Crown, Image as ImageIcon } from "lucide-react";
import { StarsDisplay } from "./StarsDisplay";

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
  const initial = (data.customerName[0] || "리").trim();

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
          <img
            src={data.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a1210]/85 text-[#d4b277] text-[10.5px] font-bold tracking-wider">
          <Crown className="w-3 h-3" /> 프리미엄 리뷰
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold">
          <ImageIcon className="w-3 h-3" />
          {data.photoCount}장
          {data.videoCount ? ` · 영상 ${data.videoCount}` : ""}
        </span>
      </div>

      {/* body */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#fbf0ef] text-[#952c2c] font-bold flex items-center justify-center text-[14px]">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-bold text-[#1c1614] truncate">
              {data.customerName}
            </div>
            <div className="text-[12px] text-[#6b6460] truncate">
              {data.location}
              {data.productLabel ? ` · ${data.productLabel}` : ""}
            </div>
          </div>
          <StarsDisplay value={data.rating} size={14} />
        </div>

        <p className="mt-3 text-[13.5px] text-[#3a3531] leading-[1.65] line-clamp-3 break-keep">
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
