import { motion } from 'motion/react';

interface HeroSectionProps {
  onApplyClick: () => void;
}

export default function PartnersHero({ onApplyClick }: HeroSectionProps) {
  return (
    <section className="bg-[#fff] min-h-screen md:min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 md:py-10">
      <div className="max-w-md w-full text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center bg-[#eef4ff] border border-[#e0eaff] rounded-full px-6 py-2.5 mb-12"
        >
          <span className="font-['Pretendard',sans-serif] font-bold text-[#1f6fff] text-base">
            나이 · 성별 · 학력 · 경력 무관
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-['Pretendard',sans-serif] font-extrabold text-[48px] leading-[1.3] text-black mb-8"
        >
          창문 바꾸실 분,<br />
          <span className="text-[#1f6fff]">소개만</span> 해주세요
        </motion.h1>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.3] text-[#666] mb-10"
        >
          <p className="mb-0">
            방문 실측도 계약도<br />
            <span className="font-bold text-[#333]">평균 15년 이상 경력의 전문가</span>가 합니다.
          </p>
          <p className="mt-4 leading-[1.93]">홈윈도우 파트너는 소개만 해주시면 돼요.</p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileTap={{ scale: 0.95 }}
          onClick={onApplyClick}
          className="bg-[#1f6fff] text-white rounded-[28px] px-12 py-4 mb-12 shadow-[0px_10px_7.3px_0px_rgba(31,111,255,0.27)] active:bg-[#1557d6] transition-colors cursor-pointer"
        >
          <span className="font-['Pretendard',sans-serif] font-extrabold text-xl">
            지금 신청하기 →
          </span>
        </motion.button>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex gap-3 justify-center scale-[0.85] sm:scale-100 origin-center"
        >
          <div className="bg-[#F4F7FB] border border-[#E4EAF2] rounded-full px-[14px] py-2 whitespace-nowrap">
            <span className="font-['Pretendard',sans-serif] font-medium text-sm text-[#666]">
              부업 · 겸업 가능
            </span>
          </div>
          <div className="bg-[#f4f7fb] border border-[#e4eaf2] rounded-full px-[14px] py-2 whitespace-nowrap">
            <span className="font-['Pretendard',sans-serif] font-medium text-sm text-[#666]">
              시간 · 장소 자유
            </span>
          </div>
          <div className="bg-[#f4f7fb] border border-[#e4eaf2] rounded-full px-[12px] py-2 whitespace-nowrap">
            <span className="font-['Pretendard',sans-serif] font-medium text-sm text-[#666]">
              전문지식 불필요
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
