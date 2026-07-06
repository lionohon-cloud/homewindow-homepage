import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoReviewCard, type PhotoReviewData } from "./PhotoReviewCard";

/**
 * "사진 후기 모아보기" 데스크톱 슬라이드.
 * 한 화면에 5개 노출(각 슬라이드 = 카드 1개, flex-basis 20%), 좌우 화살표로 넘긴다.
 * 5개 이하면 화살표를 숨긴다. (모바일은 이 컴포넌트를 쓰지 않고 페이지 쪽에서 그리드로 처리)
 */
export function PhotoReviewCarousel({ items }: { items: PhotoReviewData[] }) {
  const canScroll = items.length > 5;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 5,
    containScroll: "trimSnaps",
    active: canScroll,
  });

  const [prevOn, setPrevOn] = useState(false);
  const [nextOn, setNextOn] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevOn(emblaApi.canScrollPrev());
    setNextOn(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((it) => (
            <div key={it.id} className="flex-[0_0_calc((100%-64px)/5)] min-w-0">
              <PhotoReviewCard data={it} />
            </div>
          ))}
        </div>
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            aria-label="이전 사진 후기"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!prevOn}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#ebe5e0] shadow-md flex items-center justify-center text-[#3a3531] hover:border-[#c8b8a8] disabled:opacity-0 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="다음 사진 후기"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!nextOn}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#ebe5e0] shadow-md flex items-center justify-center text-[#3a3531] hover:border-[#c8b8a8] disabled:opacity-0 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
