import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import imgBefore1 from "figma:asset/77c9545bdd5bfc576a2227956e537cb57564b88c.png";
import imgAfter1 from "figma:asset/e24e47bb4b16e8b7b1d2a3b1ac9f35c4ddf8adf9.png";
import imgBefore2 from "figma:asset/145b2342ad7b2f0b9cc02f714c799ea3f60d8875.png";
import imgAfter2 from "figma:asset/018d605b03b3094495e9aa9cd275fa76dcb5e5f9.png";
import imgBefore3 from "figma:asset/d81d7eb5d63fcdb636d782cd4581e6eeb812dcb7.png";
import imgAfter3 from "figma:asset/52087e45ac15575d2505231c847a04cec635c333.png";
import imgBefore4 from "figma:asset/5f638a71a955d4250a2852235649c8254b93046b.png";
import imgAfter4 from "figma:asset/aca321c3ed53caaed6851f9407929680b23ed31f.png";

const beforeAfterSets = [
  { before: imgBefore1, after: imgAfter1 }, // Set 1 - 기존 피그마 이미지
  { before: imgBefore2, after: imgAfter2 }, // Set 2 - 새 이미지 세트
  { before: imgBefore3, after: imgAfter3 }, // Set 3 - 새 이미지 세트
  { before: imgBefore4, after: imgAfter4 }, // Set 4 - 새 이미지 세트
];

export function BeforeAfterSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % beforeAfterSets.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % beforeAfterSets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + beforeAfterSets.length) % beforeAfterSets.length);
  };

  return (
    <div className="relative mb-6">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {beforeAfterSets.map((set, index) => (
            <div key={index} className="min-w-full flex flex-col md:flex-row gap-0">
              {/* Before Image */}
              <div className="w-full md:w-1/2 relative">
                <div className="relative w-full aspect-[4/3]">
                  <img
                    src={set.before}
                    alt={`시공 전 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white h-[40px] flex items-center justify-center">
                    <p className="font-semibold text-[#D22727] text-[18px] md:text-[20px]">
                      BEFORE
                    </p>
                  </div>
                </div>
              </div>

              {/* After Image */}
              <div className="w-full md:w-1/2 relative">
                <div className="relative w-full aspect-[4/3]">
                  <img
                    src={set.after}
                    alt={`시공 후 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-[#D22727] h-[40px] flex items-center justify-center">
                    <p className="font-semibold text-white text-[18px] md:text-[20px]">
                      AFTER
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-md transition-all z-10 hover:cursor-pointer"
          aria-label="이전 세트"
        >
          <ChevronLeft className="w-5 h-5 text-[#333]" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-md transition-all z-10 hover:cursor-pointer"
          aria-label="다음 세트"
        >
          <ChevronRight className="w-5 h-5 text-[#333]" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mx-[0px] mt-[16px] mb-[53px]">
        {beforeAfterSets.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all hover:cursor-pointer ${
              currentSlide === index
                ? "bg-[#D22727] w-5"
                : "bg-[#e5e5e5] hover:bg-[#ccc]"
            }`}
            aria-label={`세트 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}