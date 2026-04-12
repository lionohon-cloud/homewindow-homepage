import { motion } from "motion/react";

export function EventSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#d22727] to-[#a01d1d] py-16 md:py-20 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-20 right-16 w-24 h-24 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-white rounded-full" />
      </div>

      <div className="max-w-screen-md mx-auto px-6 md:px-10 relative z-10">
        {/* EVENT 1: 키워드 배지 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-white/40">
            <span className="text-white text-[14px] md:text-[16px] font-bold tracking-wider">릴레이 고객 감사 EVENT</span>
          </div>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-[32px] md:text-[44px] font-extrabold text-center leading-[1.2] mb-4 break-keep"
        >
          최대{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-[48px] md:text-[64px] text-[#fff200] drop-shadow-[0_0_20px_rgba(255,242,0,0.5)]">
              40%
            </span>
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute -top-2 -right-2 text-[24px] md:text-[32px]"
            >
              🔥
            </motion.span>
          </span>
          <br className="md:hidden" />
          릴레이 할인,
          <br />
          지금 신청하면 더 드립니다.
        </motion.h2>

        {/* 서브 타이틀 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-[15px] md:text-[17px] text-center leading-[1.6] mb-12 break-keep"
        >혜택을 모두 더해 최대 40% 할인을 받아보세요.<br />선착순 한정 프로모션으로 조기 마감될 수 있습니다.</motion.p>

        {/* 할인 혜택 카드 - 행간 및 배지 여백 개선 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: `${new Date().getMonth() + 1}월 한정 전 품목 특별 할인`, desc: "전 품목 적용", percent: "+20%" },
            { title: "홈페이지 상담 신청 고객", desc: "현재 페이지에서 신청시 자동 적용", percent: "+10%" },
            { title: "지인 추천 고객", desc: "추천인 성함 기재 시 추가적용", percent: "+10%" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ 
                delay: 0.3 + index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              className={`bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-xl border border-white/50 flex flex-row items-center justify-between ${
                index === 0 ? 'md:col-span-2' : ''
              }`}
            >
              <div className={`flex-1 pr-3 flex justify-center ${
                index === 0 ? 'flex-col md:flex-row md:items-center md:gap-3' : 'flex-col'
              }`}>
                <h3 className={`text-[#333] font-bold leading-[1.2] break-keep ${ index === 0 ? 'text-[16px] md:text-[23px] md:mb-0 mb-1.5' : 'text-[15px] mb-1.5' } text-[#d22727] text-[16px]`}>
                  {item.title}
                </h3>
                <p className={`text-[#666] leading-[1.3] ${ index === 0 ? 'text-[15px] md:hidden' : 'text-[14px] md:text-[15px] break-keep' } text-[13px]`}>
                  {item.desc}
                </p>
              </div>
              <motion.div
                initial={{ scale: 1 }}
                whileInView={{ scale: [1, 1.15, 1] }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                className="flex-shrink-0 bg-[#d22727] text-white text-[20px] md:text-[22px] font-extrabold px-3 pt-[8px] pb-[6px] rounded-lg flex items-center justify-center leading-none tracking-tight h-fit"
              >
                {item.percent}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}