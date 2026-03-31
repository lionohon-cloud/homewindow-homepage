import { motion } from "motion/react";
import { Heart, GraduationCap, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import imgCsr1 from "figma:asset/c7a590bf8bb8f1dcca5990725b6edeac8d41e181.png";
import imgCsr2 from "figma:asset/95d7cd220cdc8297427a1c8101601c5607c31d90.png";
import imgCsr3 from "figma:asset/cf4a7868d49b07b78760598e00a3b9828024f091.png";
import imgCsr4 from "figma:asset/afe5987009199bd2bc4ce73a1eb1caae19d72af9.png";
import imgCsr5 from "figma:asset/f0bbbe3acb6f69aae47de13237979e903fc07cd9.png";
import imgCsr6 from "figma:asset/b1e7ad01b897c73772bcce5c2a17ba61a6fce9bc.png";

const donationData = [
  { amount: "81억 원", category: "교육 지원 부문", highlight: false },
  { amount: "7.6억 원", category: "장학금 지급 부문", highlight: false },
  { amount: "6.3억 원", category: "지역사회 및 복지 부문", highlight: false },
  { amount: "98억 원", category: "총 누적 기부액", highlight: true },
];

const activities = [
  {
    icon: GraduationCap,
    title: "릴레이 장학 & 발전기금",
    description:
      "충청권 초·중·고교 및 대학교(KAIST, 충남대 등)에 매년 꾸준히 장학금을 전달하여 학생들의 꿈을 응원합니다.",
  },
  {
    icon: Users,
    title: "실질적 교육 환경 개선",
    description:
      "100억 원 상당 에듀솔루션 기증, 해외연수 지원, 야구부·축구부 통학 버스 기증에 앞장섭니다.",
  },
  {
    icon: Heart,
    title: "대한적십자사 아너스클럽",
    description:
      "고액 기부자 모임 가입 및 캄보디아 선천성 심장병 수술비 지원 등 국내외 소외 이웃을 돕습니다.",
  },
];

export function CorporateValueSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [imgCsr1, imgCsr2, imgCsr3, imgCsr4, imgCsr5, imgCsr6];

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* Keyword */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5 }}
          className="text-[#999] text-[16px] font-medium mb-3 text-left"
        >
          기업 가치
        </motion.p>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-left"
        >30년을 희망과 나누다,<br />누적 기부액 <span className="text-[#D22727]">98억 원</span>의 진정성</motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#666] text-[16px] md:text-[18px] leading-[26px] mb-12 break-keep text-left"
        >
          이윤 창출을 넘어 미래의 희망을 키웁니다.
          <br />
          지속적인 나눔 실천은 오랜 시간 고객님을 든든히 책임질 기업의 증명입니다.
        </motion.p>

        {/* Donation Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-12 w-full">
          {donationData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`rounded-2xl p-5 md:p-6 border ${
                item.highlight
                  ? "bg-[#fff5f5] border-[#D22727]"
                  : "bg-[#f8f8f8] border-[#e5e5e5]"
              }`}
            >
              <p
                className={`text-[24px] md:text-[28px] font-extrabold mb-1 ${
                  item.highlight ? "text-[#D22727]" : "text-[#333]"
                }`}
              >
                {item.amount}
              </p>
              <p
                className={`text-[13px] md:text-[14px] font-medium ${
                  item.highlight ? "text-[#D22727]" : "text-[#666]"
                }`}
              >
                {item.category}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Foundation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-[#f8f8f8] rounded-2xl p-6 md:p-8 border border-[#e5e5e5] mb-8"
        >
          {/* Image Slider */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] mb-6 rounded-xl overflow-hidden bg-white">
            {/* Images */}
            <div 
              className="flex transition-transform duration-500 ease-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderImages.map((img, index) => (
                <div key={index} className="min-w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={img} 
                    alt={`장학금 활동 ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10 cursor-pointer"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#333]" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10 cursor-pointer"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#333]" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'bg-[#D22727] w-6' 
                      : 'bg-white/60 hover:bg-white/80 cursor-pointer'
                  }`}
                  aria-label={`이미지 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>

          <h3 className="text-[20px] md:text-[24px] font-extrabold text-[#333] mb-4 text-left">
            세상을 밝히는 따뜻한 창, <span className="text-[#D22727]"><br/>청암장학재단</span>
          </h3>
          <p className="text-[#666] text-[15px] md:text-[16px] leading-[26px] break-keep text-left">미래 인재를 위한 릴레이 장학금, 실질적인 교육 환경 개선 솔루션 기증, 심장병 수술 지원 등 국내외 소외된 이웃을 적극적으로 돕습니다. 고객님의 현명한 선택이 세상을 따뜻하게 만드는 가치 있는 소비로 이어집니다.</p>
        </motion.div>

        {/* Activities List */}
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[#D22727] rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[16px] md:text-[17px] font-bold text-[#333] text-left mx-[0px] mt-[0px] mb-[2px]">
                    {activity.title}
                  </h4>
                  <p className="text-[14px] md:text-[15px] text-[#666] leading-[24px] break-keep text-left">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}