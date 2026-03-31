import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import imgImage5 from "figma:asset/a2d5d52d293483dbe37645b6f1a429cad0268c8a.png";

type GlassColor = "투명" | "그린" | "미스트" | "모루";

const glassOptions: Record<GlassColor, { title: string; desc: string; previewClass: string }> = {
  투명: {
    title: "투명 유리",
    desc: "따스한 햇살을 집 안 깊숙이 그대로 받아들여, 언제나 밝고 화사하게 만들어 줍니다.",
    previewClass: "bg-transparent",
  },
  그린: {
    title: "그린 유리",
    desc: "은은한 그린 톤이 눈의 피로를 덜어주고 실내 공간에 생기를 더해줍니다.",
    previewClass: "bg-[#F1FFE9]/30 backdrop-hue-rotate-15",
  },
  미스트: {
    title: "미스트 유리",
    desc: "외부의 시선을 부드럽게 차단하여 프라이버시를 보호하면서도 채광은 유지합니다.",
    previewClass: "backdrop-blur-md bg-white/20",
  },
  모루: {
    title: "모루 유리",
    desc: "세로 패턴의 불투명 유리가 감각적인 인테리어 효과와 함께 시선 차단 효과를 줍니다.",
    previewClass: "backdrop-blur-sm bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.3)_4px,rgba(255,255,255,0.3)_8px)]",
  },
};

const glassOrder: GlassColor[] = ["투명", "그린", "미스트", "모루"];

export function GlassColorSection() {
  const [selected, setSelected] = useState<GlassColor>("투명");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setSelected((prev) => {
        const currentIndex = glassOrder.indexOf(prev);
        const nextIndex = (currentIndex + 1) % glassOrder.length;
        return glassOrder[nextIndex];
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // When user clicks a color manually, we stop the autoplay
  const handleColorClick = (color: GlassColor) => {
    setSelected(color);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-24 w-full bg-white relative">
      <div className="max-w-screen-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10 mb-12"
        >
          <p className="text-[#999] text-[16px] font-medium mb-3">유리 컬러</p>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep">
            빛은 들이고 시선은 막아주는<br/>
            <span className="text-[#d22727]">유리 컬러</span>
          </h2>
          <p className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep">
            채광과 프라이버시, 두 가지 모두 놓칠 수 없다면 공간의 쓰임새에 맞게 컬러를 선택하실 수 있습니다.
          </p>
        </motion.div>

        {/* Interactive Preview */}
        <div className="px-6 md:px-10 mb-8 flex flex-col items-center gap-8">
          <div className="relative w-full aspect-square md:aspect-video max-w-[500px] rounded-[10px] shadow-[5px_5px_15px_rgba(0,0,0,0.15)] overflow-hidden">
            {/* Base Image */}
            <img src={imgImage5} alt="Glass preview" className="absolute inset-0 w-full h-full object-cover" />
            {/* Glass Overlay Effect */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${glassOptions[selected].previewClass}`} />
          </div>

          <div className="flex justify-center gap-4 md:gap-6 w-full">
            {(Object.keys(glassOptions) as GlassColor[]).map((color) => {
              const isSelected = selected === color;
              return (
                <button 
                  key={color} 
                  onClick={() => handleColorClick(color)}
                  className="flex flex-col items-center gap-3 outline-none group"
                >
                  <div className={`w-[54px] h-[54px] md:w-[64px] md:h-[64px] rounded-full border-[2px] transition-all duration-300 flex items-center justify-center overflow-hidden relative ${isSelected ? 'border-[#333] scale-110' : 'border-[#e0e0e0] scale-100 group-hover:border-[#999]'}`}>
                    {color === '투명' && <div className="w-full h-full bg-white" />}
                    {color === '그린' && <div className="w-full h-full bg-[#F1FFE9]" />}
                    {color === '미스트' && <div className="w-full h-full bg-[#F2F2F2]" />}
                    {color === '모루' && (
                      <div className="w-full h-full bg-white overflow-hidden flex justify-center">
                        <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[14px] md:text-[15px] transition-colors ${isSelected ? 'text-[#333] font-bold' : 'text-[#999] font-medium'}`}>{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[#999] text-[14px] md:text-[15px] mb-10 font-medium">
          *컬러를 터치하시면 옵션을 미리 볼 수 있습니다
        </p>

        {/* Selected Description */}
        <div className="px-6 md:px-10">
          <div className="border-t border-[#333] pt-6 min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-[#333] text-[18px] md:text-[20px] font-bold mb-4">{glassOptions[selected].title}</h3>
                <p className="text-[#999] text-[16px] md:text-[17px] leading-[26px] break-keep">
                  {glassOptions[selected].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}