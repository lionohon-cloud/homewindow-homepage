import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Check } from 'lucide-react';

function CountUpNumber({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function PartnersTrust() {
  return (
    <section className="bg-white min-h-screen md:min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 md:py-10">
      <div className="max-w-md md:max-w-5xl w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-['Pretendard',sans-serif] font-bold text-lg text-[#1f6fff] mb-6">
            청암홈윈도우 믿을만해?
          </p>
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black mb-12">
            30년, 우리가<br />
            창문만 본 시간입니다
          </h2>
        </motion.div>

        {/* Infographic Stats */}
        <div className="space-y-6 mb-12 md:flex md:space-y-0 md:gap-6">
          {/* Stat 1 - 30년 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-[#f4f7fb] border border-[#e4eaf2] rounded-2xl py-3 px-6 text-center md:flex-1"
          >
            <div className="font-['Pretendard',sans-serif] font-extrabold text-[36px] text-[#1f6fff] mb-1">
              <CountUpNumber end={30} suffix="년" />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium text-base text-[#666] -mt-2">
              창호 업력
            </p>
          </motion.div>

          {/* Stat 2 - 38,000평 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-[#f4f7fb] border border-[#e4eaf2] rounded-2xl py-3 px-6 text-center md:flex-1"
          >
            <div className="font-['Pretendard',sans-serif] font-extrabold text-[36px] text-[#1f6fff] mb-1">
              <CountUpNumber end={38000} suffix="평" />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium text-base text-[#666] -mt-2">
              자동화 공장
            </p>
          </motion.div>

          {/* Stat 3 - 15년 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-[#f4f7fb] border border-[#e4eaf2] rounded-2xl py-3 px-6 text-center md:flex-1"
          >
            <div className="font-['Pretendard',sans-serif] font-extrabold text-[36px] text-[#1f6fff] mb-1">
              최대 <CountUpNumber end={15} suffix="년" />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium text-base text-[#666] -mt-2">
              무상 보증
            </p>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="space-y-3 mb-10"
        >
          <div className="flex items-start gap-3">
            <div className="bg-[#1f6fff] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium leading-[1.6] text-[#333] text-[15px]">
              LX지인 · KCC홈씨씨 · 홈윈도우 1군 브랜드 취급
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-[#1f6fff] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium leading-[1.6] text-[#333] text-[15px]">
              대기업 OEM 생산 파트너
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-[#1f6fff] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <p className="font-['Pretendard',sans-serif] font-medium leading-[1.6] text-[#333] text-[15px]">
              평생 유상 사후관리
            </p>
          </div>
        </motion.div>

        {/* Closing Statement */}
        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="font-['Pretendard',sans-serif] font-bold text-lg leading-[1.6] text-center text-[#333]"
        >
          소개해주신 고객, <span className="text-[#1f6fff]">끝까지 책임지는 회사</span>예요.
        </motion.p>
      </div>
    </section>
  );
}
