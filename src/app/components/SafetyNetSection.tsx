import { motion } from "motion/react";
import { ArrowDown, MoveHorizontal } from "lucide-react";
import { useState } from "react";
import safetyNetImage from "figma:asset/f40b326fb6a471ce7547099fed79e08fd9d0894a.png";
import normalNetImage from "figma:asset/4159d646b2a30533f2a364fc900f770ac476620e.png";
import safetyNetCompareImage from "figma:asset/82cf8e9dee5ab3705f7f4c0d5b273aa39f4d363d.png";

function NetComparisonSlider() {
  const [position, setPosition] = useState(50);
  
  return (
    <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-[#eee] touch-none mb-4">
      {/* Base Layer: 일반 방충망 (왼쪽) */}
      <div className="absolute inset-0 flex">
        <img 
          src={normalNetImage} 
          alt="일반 방충망" 
          className="absolute w-full object-cover max-w-none h-[calc(100%+80px)] top-[-80px] translate-y-[80px] md:h-[calc(100%+280px)] md:top-[-280px] md:translate-y-[280px]" 
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
        <img src={safetyNetCompareImage} alt="안전방충망" className="absolute inset-0 w-full h-full object-cover" />
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
        >안전방충망 혜택 <span className="text-[14px] text-[#bbb]">*프레스티지 한정</span></motion.p>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-6 md:px-10 text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
        >타사 200만원 안전방충망,<br />청암홈윈도우는 <span className="text-[#D22727]">무상 제공</span></motion.h2>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 md:px-10 text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep mb-8"
        >
          <p>벌레 차단은 기본,<br />아이와 반려동물의 추락을 막는 필수 안전 옵션</p>
        </motion.div>

        {/* Net Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-6 md:px-10 mb-16 md:mb-20"
        >
          <NetComparisonSlider />
          <p className="text-[#999] text-[12px] md:text-[13px] text-center mt-3 md:mb-8">좌우로 스와이프하여 안전방충망의 차이를 확인해보세요.</p>
        </motion.div>

        {/* Comparison Container */}
        <div className="px-6 md:px-10 relative max-w-[500px] mx-auto mb-16 md:mb-24">
          <motion.div
            className="relative flex items-end justify-center gap-6 md:gap-16 h-[260px] md:h-[320px] px-4 mb-0"
          >
            {/* Badge (Top Center) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 12, delay: 1.2 }}
              className="absolute top-[-50px] md:top-[-60px] left-[50%] -translate-x-1/2 z-30 bg-white border-[3px] border-[#D22727] rounded-[2rem] shadow-xl text-center whitespace-nowrap px-[35px] py-[5px]"
            >
              <span className="block text-[#666] mb-0.5 mx-[0px] mt-[0px] mb-[-2px] text-[16px]">타사대비</span>
              <span className="block text-[#D22727] text-xl md:text-3xl font-black tracking-tight">200만원 저렴</span>
            </motion.div>

            {/* Dynamic Curved Arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute top-[15%] left-[25%] w-[50%] h-[50%] z-20 pointer-events-none"
            >
              <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" className="overflow-visible">
                {/* Main curve - 부드러운 곡선 */}
                <motion.path
                  d="M 10,25 Q 90,10 170,85"
                  stroke="#D22727"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
                />
                {/* Arrowhead */}
                <motion.path
                  d="M 158,70 L 170,85 L 182,70"
                  stroke="#D22727"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  transform="rotate(-40 170 85)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: 1.6 }}
                />
              </svg>
            </motion.div>

            {/* Left Box - Competitor (Tall) */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-[130px] md:w-[160px] bg-[#E5E5E5] rounded-t-3xl flex flex-col justify-end items-center relative z-10 origin-bottom px-[0px] pt-[0px] pb-[20px]"
            >
              <p className="text-2xl md:text-4xl font-bold text-[#999] tracking-tight mb-0 font-[Pretendard]">
                200<span className="text-lg md:text-2xl">만원</span>
              </p>
            </motion.div>

            {/* Right Box - Cheongam (Short) */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "35%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="w-[130px] md:w-[160px] bg-[#D22727] rounded-t-3xl flex flex-col justify-end items-center relative z-10 origin-bottom shadow-lg px-[0px] pt-[0px] pb-[20px]"
            >
              <p className="text-white tracking-tight mb-0">
                <span className="text-5xl md:text-6xl font-black">0</span>
                <span className="text-lg md:text-2xl font-black">원</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Divider Line */}
          <div className="w-full px-4 mb-2">
            <div className="h-[2px] bg-gray-200" />
          </div>

          {/* Labels Below Line */}
          <div className="flex items-center justify-center gap-6 md:gap-16 px-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="w-[130px] md:w-[160px] text-center text-[#888] font-bold text-[18px]"
            >
              타사
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="w-[130px] md:w-[160px] text-center text-[#D22727] font-bold text-[18px]"
            >
              청암홈윈도우
            </motion.p>
          </div>
        </div>

        {/* Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="px-6 md:px-10 w-full max-w-[800px] mx-auto aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden relative group mb-16 md:mb-24"
        >
          <img
            src={safetyNetImage}
            alt="안전방충망 설치 예시"
            className="w-full h-full object-cover rounded-[10px]"
          />
        </motion.div>

        {/* Copy Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="px-6 md:px-10 text-xl md:text-2xl font-bold text-[#111] mb-3 md:mb-4"
        >
          탁 트인 시야와 빈틈없는 안전
        </motion.h3>

        {/* Copy Content */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="px-6 md:px-10 text-base md:text-lg text-[#666] leading-relaxed mb-10"
        >
          일반 망보다 훨씬 견고해 강한 충격이나 하중에도 쉽게 훼손되지 않아 안심할 수 있습니다.
        </motion.p>
      </div>
    </section>
  );
}