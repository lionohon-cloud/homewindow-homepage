import { useState } from "react";
import { motion } from "motion/react";
import heroBg from "figma:asset/043d32be9e8d4e45d2ea3135af6c4c2ad7644c36.png";
import { ConsultationModal } from "./ConsultationModal";
import { VideoModal } from "./VideoModal";

export function HeroSection() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] max-h-[900px] bg-black overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="hero background" className="w-full h-full object-cover opacity-60 blur-sm scale-105" loading="eager" fetchPriority="high" />
      </div>

      <div className="absolute inset-0 bg-[rgba(20,20,20,0.5)] z-0" />

      {/* Content centered vertically and horizontally */}
      <div className="relative z-10 flex flex-col justify-start md:justify-center h-full max-w-screen-md mx-auto w-full px-6 md:px-10 pt-[30svh] md:pt-20 pb-[140px] md:pb-0 bg-[#00000000]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => setIsConsultOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsConsultOpen(true); } }}
          aria-label="상담 신청 열기"
          className="text-[32px] md:text-[40px] font-extrabold text-white leading-tight md:text-center text-center cursor-pointer select-none hover:scale-[1.01] active:scale-[0.99] transition-transform outline-none"
        ><span className="text-[#d22727]">창호 교체, </span><span>이제</span><br /><span>믿을 수 있는 곳에서</span><br /><span>한번에 끝내세요.</span></motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        onClick={() => setIsVideoOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsVideoOpen(true); } }}
        aria-label="회사 소개 영상 재생"
        className="absolute bottom-[100px] right-6 md:right-10 text-right z-10 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] transition-transform outline-none"
      >
        <div className="mb-4">
          <p className="text-[#d22727] text-sm md:text-base font-bold mb-1">Since. 1996</p>
          <p className="text-white text-3xl md:text-4xl font-extrabold">창호 제조 30년</p>
        </div>
        <div>
          <p className="text-[#d22727] text-sm md:text-base font-bold mb-1">국내 최대 자동화 공장</p>
          <p className="text-white text-3xl md:text-4xl font-extrabold">38,000평</p>
        </div>
      </motion.div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        variant="top"
      />
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        youtubeId="LZBNfx5ilLw"
        title="청암홈윈도우 회사·공장 소개"
      />
    </section>
  );
}
