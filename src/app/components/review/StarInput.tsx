import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = ["", "아쉬워요", "보통이에요", "괜찮아요", "좋아요", "최고예요"];

export function StarInput({
  value,
  onChange,
  size = 36,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= shown;
          return (
            <button
              type="button"
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => onChange(n)}
              aria-label={`별점 ${n}점`}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                width={size}
                height={size}
                strokeWidth={1.5}
                className={active ? "fill-[#c89545] text-[#c89545]" : "text-[#ebe5e0]"}
              />
            </button>
          );
        })}
      </div>
      <div
        className="text-[13px] md:text-[14px] font-semibold tracking-tight text-[#3a3531] h-5"
        aria-live="polite"
      >
        {LABELS[shown] || "별점을 선택해주세요"}
      </div>
    </div>
  );
}
