import { Star } from "lucide-react";

export function StarsDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          width={size}
          height={size}
          strokeWidth={1.5}
          className={
            n <= value ? "fill-[#c89545] text-[#c89545]" : "text-[#ebe5e0]"
          }
        />
      ))}
    </div>
  );
}
