import image_aaf07d2b78aefbacd9977f2f1a8f38cb77267ac7 from 'figma:asset/aaf07d2b78aefbacd9977f2f1a8f38cb77267ac7.png'
import greenRemodelingCert from 'figma:asset/4baa597a8db94a391f7f173597fc2f975193db80.png'
import greenRemodelingPromo from 'figma:asset/9b746839ad6e6c91e16b68a177b181e167371811.png'
import { motion } from "motion/react";
// import useEmblaCarousel from "embla-carousel-react";
// import AutoScroll from "embla-carousel-auto-scroll";
import { Award, ShieldCheck, HeartHandshake, Home, Trophy, CheckCircle2 } from "lucide-react";
// import imgAward1 from "figma:asset/62e80a07fe09f7c67b19b27a2756f537d3580612.png";
// import imgAward2 from "figma:asset/36f2636135c2b0d3902c5fdaf3bb85ce8a4933a3.png";
// import imgAward3 from "figma:asset/1b594842be2f39dbf04c5356be99b8a6c04fa3c3.png";
import certShelfImg from "figma:asset/a3f18d2e5224ae03e1ae0a11ce8a38abf9c83901.png";

// const originalAwards = [
//   { img: imgAward1, text: "한국토지주택공사 격려장" },
//   { img: imgAward2, text: "국토교통부장관 표창장" },
//   { img: imgAward3, text: "한국일보 히트상품 선정" }
// ];

// Duplicate items to ensure smooth infinite scrolling even on larger screens
// const awards = [...originalAwards, ...originalAwards, ...originalAwards];

export function AwardsSection() {
  // const [emblaRef] = useEmblaCarousel(
  //   { 
  //     loop: true,
  //     align: "start",
  //     skipSnaps: false,
  //     dragFree: true
  //   },
  //   [AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
  // );

  return (
    <section className="py-24 pb-0 md:pb-24 w-full overflow-hidden bg-white">
      <div className="max-w-screen-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10 mb-8"
        >
          <p className="text-[#999] text-[16px] font-medium mb-3">믿을 수 있습니다</p>
          <h2 className="font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-[32px]">국가와 소비자가 인정한<br/><span className="text-[#d22727]">청암홈윈도우</span></h2>
          <div className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep mb-8">
            <p>어느 업체나 스스로 좋다고 말합니다.</p>
            <p>청암홈윈도우는 국가와 소비자가 증명합니다.</p>
          </div>

          {/* 키워드 박스 리스트 */}
          <div className="flex flex-col md:flex-row md:gap-2 gap-3">
            {[
              { text: "LH 입주자 평가 우수업체 선정", icon: Home, color: "#3B82F6" },
              { text: "국토부장관상 수상", icon: Award, color: "#F59E0B" },
              { text: "SGI 서울보증보험 가입", icon: ShieldCheck, color: "#10B981" },
              { text: "대한적십자사 아너스클럽", icon: HeartHandshake, color: "#EF4444" },
              { text: "한국일보", text2: "히트상품 선정", icon: Trophy, color: "#8B5CF6" }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 bg-white border border-[#eaeaea] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-[20px] py-[9px] md:px-[12px] md:py-[16px] md:flex-1 md:min-w-0"
                >
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-opacity-10 shrink-0 md:mb-3"
                    style={{ backgroundColor: '#D227271A', color: '#D22727' }}
                  >
                    <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
                  </div>
                  <div className="hidden md:block w-full h-[1px] bg-[#eee] md:mb-3"></div>
                  <div className="md:h-[40px] md:flex md:items-center md:justify-center">
                    <p className="text-[#333] font-bold text-[16px] md:text-[13px] md:text-center tracking-tight break-keep leading-tight">
                      {item.text2 ? (
                        <>
                          <span className="md:hidden">{item.text} {item.text2}</span>
                          <span className="hidden md:inline">{item.text}<br />{item.text2}</span>
                        </>
                      ) : item.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 인증서 책장 이미지 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="md:px-10 overflow-hidden"
        >
          <div className="w-full overflow-hidden pb-8 md:pb-8 min-h-[110%] relative md:rounded-lg">
            <img 
              src={image_aaf07d2b78aefbacd9977f2f1a8f38cb77267ac7} 
              alt="인증서 책장" 
              className="w-full h-auto scale-[1.2] md:scale-110 md:rounded-lg md:shadow-lg mx-[0px] mt-[0px] mb-[-20px]"
            />
            {/* 하단 그라데이션 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-24 bg-gradient-to-t from-white to-transparent pointer-events-none m-[0px]"></div>
          </div>
        </motion.div>

        {/* 그린리모델링 지원 혜택 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="md:px-10 mt-16"
        >
          <div className="bg-[#ecf7e7] md:rounded-2xl p-6 md:p-8 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-10">
              {/* 왼쪽: A4 비율 인증서 이미지 */}
              <div className="w-[70%] mx-auto md:mx-0 md:w-[240px] shrink-0">
                <div className="w-full aspect-[1/1.414] rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={greenRemodelingCert} 
                    alt="그린리모델링 사업자 등록증" 
                    className="w-full h-full object-cover"
                    style={{ transform: 'scale(1.08)' }}
                  />
                </div>
              </div>

              {/* 오른쪽: 그린리모델링 안내 */}
              <div className="flex-1 flex flex-col justify-center">
                {/* 키워드 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mb-3 text-center md:text-left"
                >
                  <span className="inline-block bg-[#0f763f] text-white text-[13px] md:text-[14px] font-bold px-4 py-2 rounded-full">
                    2년 만에 돌아온 국가지원혜택
                  </span>
                </motion.div>

                {/* 타이틀 */}
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="font-extrabold text-[#31443a] leading-[1.3] mb-6 break-keep text-center md:text-left text-[32px]"
                >그린리모델링<br/><span className="text-[#50ad49]">60개월 이자지원</span></motion.h3>

                {/* 모바일 전용 이미지 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.75 }}
                  className="md:hidden mb-6 rounded-lg overflow-hidden shadow-md"
                >
                  <img 
                    src={greenRemodelingPromo}
                    alt="그린리모델링 60개월 분할 목돈 부담 ZERO"
                    className="w-full h-auto"
                  />
                </motion.div>

                {/* 지원기준 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-[#fcfdf7] rounded-lg p-5 border border-[#719883]">
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} strokeWidth={2.5} color="#719883" className="shrink-0 mt-0.5" />
                        <p className="text-[#333] font-semibold text-[15px] md:text-[16px] break-keep">에너지 성능개선 비율 20% 이상<br/>(지정 프로그램 기준)</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} strokeWidth={2.5} color="#719883" className="shrink-0 mt-0.5" />
                        <p className="text-[#333] font-semibold text-[15px] md:text-[16px] break-keep">창호 소비효율등급 2등급 이상</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} strokeWidth={2.5} color="#719883" className="shrink-0 mt-0.5" />
                        <p className="text-[#333] font-semibold text-[15px] md:text-[16px] break-keep">2016년 이전 사용승인 건물 대상</p>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Embla Carousel Container - 주석처리 */}
        {/* <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex backface-hidden touch-pan-y">
            {awards.map((item, i) => (
              <div 
                key={i} 
                className="flex-[0_0_auto] min-w-0 flex flex-col items-center w-[160px] md:w-[180px] lg:w-[200px] pl-4 md:pl-6 lg:pl-8 first:pl-6 md:first:pl-10"
              >
                <div className="w-full aspect-[1/1.414] rounded-[10px] shadow-[0px_4px_12px_rgba(0,0,0,0.1)] border border-[#e5e5e5] overflow-hidden mb-4 relative bg-white pointer-events-none">
                  <img src={item.img} alt={item.text} className="w-full h-full object-cover" draggable={false} />
                </div>
                <p className="text-[#333] font-medium text-[15px] md:text-[16px] text-center break-keep w-full select-none">{item.text}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}