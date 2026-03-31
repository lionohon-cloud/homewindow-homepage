import { motion } from "motion/react";

export function Event2Section() {
  return (
    <section className="w-full bg-[#222] py-16 md:py-20 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#D22727] rounded-full" />
        <div className="absolute bottom-20 right-16 w-24 h-24 border-4 border-[#D22727] rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-[#D22727] rounded-full" />
      </div>

      <div className="max-w-screen-md mx-auto px-6 md:px-10 relative z-10">
        {/* EVENT 2: 키워드 배지 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-[#D22727]/20 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-[#D22727]/40">
            <span className="text-white text-[14px] md:text-[16px] font-bold tracking-wider">
              청암홈윈도우 EVENT 2
            </span>
          </div>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-[28px] md:text-[36px] font-extrabold text-center leading-[1.3] break-keep mx-[0px] mt-[0px] mb-[-4px]"
        >
          프레스티지 고객 특별혜택
        </motion.h2>

        {/* 강조 텍스트 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center break-keep mx-[0px] mt-[0px] mb-[25px]"
        >
          <span className="text-[#D22727] text-[32px] md:text-[40px] font-extrabold drop-shadow-[0_0_20px_rgba(210,39,39,0.5)]">
            200만원 상당
          </span>
          <br />
          <span className="text-white text-[24px] md:text-[28px] font-bold">
            안전방충망 무료
          </span>
        </motion.p>

        {/* 안전방충망 영상/이미지 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-2xl mb-8 border border-[#D22727]/20"
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/iSPkpw11FJ0?si=lwKD75I8eQb3NcJI"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </motion.div>

        {/* 설명 텍스트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white/90 leading-[1.7] break-keep text-[18px] md:text-[22px]">
            타사 <span className="text-[#D22727] font-black">200만원 상당</span>의 안전방충망을 무료로 업그레이드 해드립니다.<br />
            일반 망보다 훨씬 굵고 튼튼한 소재를 적용하여 추락사고를 예방해 줍니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}