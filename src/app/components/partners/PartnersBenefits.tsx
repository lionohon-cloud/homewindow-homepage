import { motion } from 'motion/react';
import { Clock, Smartphone, ShieldCheck } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

export default function PartnersBenefits() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    setScrollProgress(progress);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
  }, [emblaApi, onScroll]);

  const benefits = [
    {
      icon: <Clock className="w-12 h-12 text-[#1f6fff]" strokeWidth={2.5} />,
      title: '출퇴근 없이, 원하는 시간에',
      description: '본업 하면서 짬날 때, 내 페이스대로',
    },
    {
      icon: <Smartphone className="w-12 h-12 text-[#1f6fff]" strokeWidth={2.5} />,
      title: '핸드폰 하나로 끝',
      description: '떠오르는 한 분, 알려주시면 끝나요',
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-[#1f6fff]" strokeWidth={2.5} />,
      title: '영업압박 ZERO',
      description: <>설득도 계약도 회사가<br />겸업도 부담없이</>,
    },
  ];

  const getRotation = (index: number) => {
    const scrolled = scrollProgress * (benefits.length - 1);
    const distance = index - scrolled;
    const rotation = distance * 15; // 15도씩 회전
    return Math.max(-25, Math.min(25, rotation));
  };

  return (
    <section className="bg-[#1f6fff] min-h-screen md:min-h-0 flex flex-col items-center justify-center py-20 md:py-[70px]">
      <div className="w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 px-6"
        >
          <p className="font-['Pretendard',sans-serif] font-bold text-lg text-white/90 mb-4">
            언제 · 어디서든
          </p>
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-white">
            부담 없이, 가볍게
          </h2>
        </motion.div>

        {/* Carousel - Mobile / Grid - Desktop */}
        <div className="md:hidden overflow-hidden perspective-[1000px] py-4" style={{ perspective: '1000px' }}>
          <div className="overflow-x-hidden overflow-y-visible" ref={emblaRef}>
            <div className="flex pb-8" style={{ transformStyle: 'preserve-3d' }}>
              {benefits.map((benefit, index) => {
                const rotation = getRotation(index);
                return (
                  <div
                    key={index}
                    className="flex-[0_0_85%] min-w-0 pl-6 pr-4 transition-transform duration-300"
                    style={{
                      transform: `rotateY(${rotation}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="bg-white border border-white/20 rounded-2xl p-8 h-full flex flex-col items-center text-center shadow-[0px_10px_30px_rgba(0,0,0,0.25)]">
                      {/* Icon */}
                      <div className="bg-[#eef4ff] rounded-full w-20 h-20 flex items-center justify-center mb-6">
                        {benefit.icon}
                      </div>
                      {/* Title */}
                      <h3 className="font-['Pretendard',sans-serif] font-bold text-xl text-black mb-3">
                        {benefit.title}
                      </h3>
                      {/* Description */}
                      <p className="font-['Pretendard',sans-serif] font-medium leading-[1.6] text-[#666] text-[15px]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:flex max-w-5xl mx-auto px-6 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="bg-white border border-white/20 rounded-2xl p-8 h-full flex flex-col items-center text-center shadow-[0px_10px_30px_rgba(0,0,0,0.25)]">
                {/* Icon */}
                <div className="bg-[#eef4ff] rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                {/* Title */}
                <h3 className="font-['Pretendard',sans-serif] font-bold text-xl text-black mb-3">
                  {benefit.title}
                </h3>
                {/* Description */}
                <p className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#666]">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
