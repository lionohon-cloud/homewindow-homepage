import { motion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { useState } from "react";
import normalNetImage from "figma:asset/4159d646b2a30533f2a364fc900f770ac476620e.png";
import safetyNetCompareImage from "figma:asset/82cf8e9dee5ab3705f7f4c0d5b273aa39f4d363d.png";

function NetComparisonSlider() {
  const [position, setPosition] = useState(50);
  
  return (
    <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-[#eee] touch-none mb-4">
      {/* Base Layer: 일반 방충망 (왼쪽) — 라벨이 오른쪽 레이어 위로 새어 나오지 않게 같은 기준선으로 클립 */}
      <div
        className="absolute inset-0 flex"
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      >
        <img
          src={normalNetImage}
          alt="일반 방충망"
          className="absolute w-full object-cover max-w-none h-[calc(100%+80px)] top-[-80px] translate-y-[80px] md:h-[calc(100%+280px)] md:top-[-280px] md:translate-y-[280px]"
          loading="lazy"
          decoding="async"
        />
        {/* Overall darken overlay - 10% */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Gradient overlay - bottom 30% only */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%)' }} />
        <div className="absolute left-4 bottom-4 z-10 text-white drop-shadow-md">
          <p className="text-[16px] md:text-[18px] font-bold">일반 방충망</p>
        </div>
      </div>
      
      {/* Overlay Layer: 안전방충망 (오른쪽) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)` }}
      >
        <img src={safetyNetCompareImage} alt="안전방충망" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
        {/* Gradient overlay - bottom 30% only */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%)' }} />
        <div className="absolute right-4 bottom-4 z-10 text-white drop-shadow-md">
          <p className="text-[16px] md:text-[18px] font-bold text-[#fff]">청암홈윈도우 안전방충망</p>
        </div>
      </div>

      {/* Slider Divider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize drop-shadow-sm"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        {/* Custom Thumb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center pointer-events-none">
          <MoveHorizontal size={20} color="#d22727" />
        </div>
      </div>
      
      {/* Invisible Input for dragging */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
      />
    </div>
  );
}

export function SafetyNetSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-screen-md mx-auto">
        {/* Keyword */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5 }}
          className="px-6 md:px-10 text-[#999] text-[16px] font-medium mb-3"
        >안전방충망</motion.p>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-6 md:px-10 text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
        >벌레만 막는 방충망이 아닙니다,<br /><span className="text-[#D22727]">추락까지 막는</span> 안전방충망</motion.h2>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 md:px-10 text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep mb-8"
        >
          <p>일반 망보다 훨씬 굵고 튼튼한 망으로,<br />아이와 반려동물이 있는 집이라면 창호 교체와 함께 선택하실 수 있습니다.</p>
        </motion.div>

        {/* Net Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-6 md:px-10 mb-12 md:mb-16"
        >
          <NetComparisonSlider />
          <p className="text-[#999] text-[12px] md:text-[13px] text-center mt-3 md:mb-8">좌우로 스와이프하여 안전방충망의 차이를 확인해보세요.</p>
        </motion.div>

        {/* Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          /* 영상은 16:9 라 md:aspect-[21/9] 를 쓰면 위아래가 잘린다 */
          className="px-6 md:px-10 w-full max-w-[800px] mx-auto mb-16 md:mb-24"
        >
          {/* 260901: 강아지 이미지 → 방충망 강도 테스트 영상 (기존 이벤트2 섹션에 있던 것) */}
          <div className="w-full aspect-video rounded-[10px] overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/iSPkpw11FJ0?si=lwKD75I8eQb3NcJI"
              title="방충망 강도 충격 테스트"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* Copy Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="px-6 md:px-10 text-xl md:text-2xl font-bold text-[#111] mb-3 md:mb-4"
        >
          굵고 튼튼한 망, 빈틈없는 안전
        </motion.h3>

        {/* Copy Content */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="px-6 md:px-10 text-base md:text-lg text-[#666] leading-relaxed mb-10"
        >
          일반 망보다 훨씬 견고해 강한 충격이나 하중에도 쉽게 훼손되지 않습니다. 저층 세대에서는 방범살 대신 쓰기도 합니다.
        </motion.p>
      </div>
    </section>
  );
}