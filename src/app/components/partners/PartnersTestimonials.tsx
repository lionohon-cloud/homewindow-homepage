import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import img1 from '../../../assets/partners/testimonial-1.png';
import img2 from '../../../assets/partners/testimonial-2.png';
import img3 from '../../../assets/partners/testimonial-3.png';
import img4 from '../../../assets/partners/testimonial-4.png';
import img5 from '../../../assets/partners/testimonial-5.png';

export default function PartnersTestimonials() {
  // Mobile carousel
  const [emblaRefMobile, emblaApiMobile] = useEmblaCarousel(
    {
      align: 'center',
      loop: true,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  // Desktop carousel
  const [emblaRefDesktop, emblaApiDesktop] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndexMobile, setSelectedIndexMobile] = useState(0);

  const onSelectMobile = useCallback(() => {
    if (!emblaApiMobile) return;
    setSelectedIndexMobile(emblaApiMobile.selectedScrollSnap());
  }, [emblaApiMobile]);

  useEffect(() => {
    if (!emblaApiMobile) return;
    onSelectMobile();
    emblaApiMobile.on('select', onSelectMobile);
    emblaApiMobile.on('reInit', onSelectMobile);
  }, [emblaApiMobile, onSelectMobile]);

  const testimonials = [
    {
      image: img1,
      title: '월급은 통장을 스칠 뿐',
      subtitle: '3년 차 직장인 김 대리, 파트너로 트인 숨통',
      content: '받은 날 빠져나가기 바빴던 월급, 늘 빠듯했죠. 이제는 파트너 수익이 한 달에 한 번씩 숨통을 틔워줘요.',
    },
    {
      image: img2,
      title: '수다 떨다 학원비 벌어버린 주부',
      subtitle: '맘카페 주부 9단, 대화 한 번이 수익으로',
      content: '맘카페에서 창문 얘기 나누다 한 분을 연결했을 뿐인데. 그 한 건이 아이들 영어 학원비가 되어 돌아왔어요.',
    },
    {
      image: img3,
      title: '손님에게 추천했더니 월 수익 2배',
      subtitle: '공인중개사 이 소장, 한마디가 새로운 수익으로',
      content: '집 보러 온 손님에게 "샷시도 한번 보세요" 한마디. 중개 수수료 말고 또 하나의 수익이 매달 들어와요.',
    },
    {
      image: img4,
      title: '견적 갔다 100만 원 보너스',
      subtitle: '인테리어 실장님, 소개 한 건이 보너스로',
      content: '도배장판 보러 갔다가 낡은 창문이 눈에 들어왔죠. 가볍게 소개 한 건에 100만 원이 더 따라왔어요.',
    },
    {
      image: img5,
      title: '파란불 계좌, 두 건으로 회복',
      subtitle: '직장인 박 씨, 파트너 두 건으로 메운 손실',
      content: '물려 있던 계좌만 보면 한숨이 나왔는데. 파트너 두 건으로 그 손실을 메꿨어요.',
    },
  ];

  return (
    <section className="bg-white min-h-screen md:min-h-[80vh] flex flex-col items-center justify-center py-20 md:py-10">
      <div className="w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 px-6"
        >
          <p className="font-['Pretendard',sans-serif] font-bold text-lg text-[#1f6fff] mb-4">
            이미 많은 분들이 파트너로,
          </p>
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black">
            월급 밖의 진짜 수익을<br/> 만들고 있어요
          </h2>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-hidden overflow-y-visible py-4 px-6" ref={emblaRefMobile}>
          <div className="flex pb-4">
            {testimonials.map((testimonial, index) => {
              const isSelected = selectedIndexMobile === index;
              return (
                <div
                  key={index}
                  className="flex-[0_0_90%] min-w-0 pr-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white border border-[#e4eaf2] rounded-2xl overflow-hidden shadow-lg h-[450px] flex flex-col transition-opacity duration-300"
                    style={{ opacity: isSelected ? 1 : 0.5 }}
                  >
                    {/* Image */}
                    <div className="h-[250px] overflow-hidden">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-4 flex flex-col flex-1">
                      <h3 className="font-['Pretendard',sans-serif] font-extrabold text-[18px] text-black mb-2">
                        {testimonial.title}
                      </h3>
                      <p className="font-['Pretendard',sans-serif] font-bold text-sm text-[#1f6fff] mb-3">
                        {testimonial.subtitle}
                      </p>
                      <p className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#666]">
                        {testimonial.content}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="overflow-hidden py-4 px-6" ref={emblaRefDesktop}>
            <div className="flex -mr-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_calc(33.333%)] min-w-0 pr-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white border border-[#e4eaf2] rounded-2xl overflow-hidden shadow-lg h-[450px] flex flex-col"
                  >
                    {/* Image */}
                    <div className="h-[250px] overflow-hidden">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-4 flex flex-col flex-1">
                      <h3 className="font-['Pretendard',sans-serif] font-extrabold text-[18px] text-black mb-2">
                        {testimonial.title}
                      </h3>
                      <p className="font-['Pretendard',sans-serif] font-bold text-sm text-[#1f6fff] mb-3">
                        {testimonial.subtitle}
                      </p>
                      <p className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#666]">
                        {testimonial.content}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
