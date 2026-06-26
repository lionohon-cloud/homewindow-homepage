import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SimpleReviewCard, type SimpleRowData } from "./SimpleReviewCard";

/**
 * 최근(간편) 후기 자동 롤링 캐러셀.
 * 한 슬라이드 = 후기 2개 묶음 → autoplay 로 4초마다 다음 2개로 페이지 전환.
 * 모바일: 2개를 세로로, 데스크탑: 2개를 가로로 배치.
 */
export function RecentReviewsCarousel({ items }: { items: SimpleRowData[] }) {
  // 2개씩 묶어 슬라이드(페이지) 구성
  const pages: SimpleRowData[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pages.push(items.slice(i, i + 2));
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: pages.length > 1 },
    pages.length > 1
      ? [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
      : []
  );

  const [selected, setSelected] = useState(0);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (pages.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pages.map((page, pi) => (
            <div key={pi} className="flex-[0_0_100%] min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                {page.map((it) => (
                  <SimpleReviewCard key={it.id} data={it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이지 인디케이터 (도트) */}
      {pages.length > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번째 후기 묶음`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={[
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-5 bg-[#952c2c]" : "w-1.5 bg-[#d8cfc8]",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
