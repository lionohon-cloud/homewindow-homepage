import { motion } from 'motion/react';
import { UserPlus, Ruler, Handshake, DollarSign } from 'lucide-react';

const svgPaths = {
  pbb8cac0: "M9.87695 0V12.8984L14.7012 8.07422L16.7832 10.1055L8.37891 18.4844L0 10.1055L2.05664 8.07422L6.88086 12.8984V0H9.87695Z",
};

export default function PartnersProcess() {
  return (
    <section className="bg-[#f4f7fb] min-h-screen md:min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 md:py-10">
      <div className="max-w-md w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-['Pretendard',sans-serif] font-bold text-lg text-[#1f6fff] mb-6">
            "아, 창문 바꿔야 하는데..."
          </p>
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black mb-8">
            그런 분, 주변에<br />
            한 분쯤 있잖아요
          </h2>
          <div className="font-['Pretendard',sans-serif] font-medium text-lg leading-[1.3] text-[#666]">
            그 <span className="font-bold text-[#333]">얘기</span>만 전해주시면 돼요.<br />
            나머지는 저희가 합니다.
          </div>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-12">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-[#1f6fff] border border-[#e4eaf2] rounded-[10px] shadow-[0px_8px_8px_0px_#e4eaf2] h-[78px] flex items-center px-5">
              <div className="w-[61px] h-[61px] bg-white rounded-full mr-5 flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-[#1f6fff]" strokeWidth={2.5} />
              </div>
              <p className="font-['Pretendard',sans-serif] font-bold text-xl text-white">
                나는 소개만 하면 끝
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+1.1rem)]">
              <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
                <path d={svgPaths.pbb8cac0} fill="#1f6fff" />
              </svg>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white border border-[#e4eaf2] rounded-[10px] shadow-[0px_8px_8px_0px_#e4eaf2] h-[78px] flex items-center px-5">
              <div className="w-[61px] h-[61px] bg-[#e4eaf2] rounded-full mr-5 flex items-center justify-center">
                <Ruler className="w-7 h-7 text-[#1f6fff]" strokeWidth={2.5} />
              </div>
              <p className="font-['Pretendard',sans-serif] font-bold text-xl text-[#333]">
                본사 전문가 방문 · 실측
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+1.1rem)]">
              <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
                <path d={svgPaths.pbb8cac0} fill="#1f6fff" />
              </svg>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white border border-[#e4eaf2] rounded-[10px] shadow-[0px_8px_8px_0px_#e4eaf2] h-[78px] flex items-center px-5">
              <div className="w-[61px] h-[61px] bg-[#e4eaf2] rounded-full mr-5 flex items-center justify-center">
                <Handshake className="w-7 h-7 text-[#1f6fff]" strokeWidth={2.5} />
              </div>
              <p className="font-['Pretendard',sans-serif] font-bold text-xl text-[#333]">
                샷시 교체 계약 완료
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+1.1rem)]">
              <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
                <path d={svgPaths.pbb8cac0} fill="#1f6fff" />
              </svg>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#1f6fff] border border-[#e4eaf2] rounded-[10px] shadow-[0px_8px_8px_0px_#e4eaf2] h-[78px] flex items-center px-5">
              <div className="w-[61px] h-[61px] bg-white rounded-full mr-5 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-[#1f6fff]" strokeWidth={2.5} />
              </div>
              <p className="font-['Pretendard',sans-serif] font-bold text-xl text-white">
                수익금 정산
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
