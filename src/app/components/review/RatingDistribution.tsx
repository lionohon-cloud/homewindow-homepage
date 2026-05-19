import { Star } from "lucide-react";

export interface RatingSummary {
  avg: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function RatingDistribution({ summary }: { summary: RatingSummary }) {
  const total = summary.count || 1;
  return (
    <div className="grid md:grid-cols-[200px_1fr_auto] gap-6 md:gap-10 items-center bg-white rounded-2xl border border-[#ebe5e0] p-6 md:p-8">
      {/* 좌: 평균 */}
      <div className="text-center md:text-left">
        <div className="flex items-baseline justify-center md:justify-start gap-1">
          <span className="text-[44px] md:text-[52px] font-black text-[#1c1614] leading-none tracking-tight">
            {summary.avg.toFixed(1)}
          </span>
          <span className="text-[15px] text-[#9a948f]">/ 5.0</span>
        </div>
        <div className="mt-2 flex justify-center md:justify-start gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              width={14}
              height={14}
              strokeWidth={1.5}
              className={
                n <= Math.round(summary.avg)
                  ? "fill-[#c89545] text-[#c89545]"
                  : "text-[#ebe5e0]"
              }
            />
          ))}
        </div>
        <div className="mt-1.5 text-[12px] text-[#6b6460]">
          총 시공후기{" "}
          <strong className="text-[#1c1614]">{summary.count.toLocaleString()}건</strong>
        </div>
      </div>

      {/* 중: 별점 분포 막대 */}
      <div className="space-y-1.5 min-w-0">
        {[5, 4, 3, 2, 1].map((s) => {
          const n = summary.distribution[s as 1 | 2 | 3 | 4 | 5] || 0;
          const pct = Math.round((n / total) * 100);
          return (
            <div key={s} className="grid grid-cols-[28px_1fr_90px] items-center gap-3 text-[12px]">
              <span className="text-[#3a3531] font-semibold">{s}점</span>
              <div className="h-2 rounded-full bg-[#f4ede4] overflow-hidden">
                <div
                  className="h-full bg-[#952c2c] rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-right text-[#6b6460]">
                {pct}% · {n.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
