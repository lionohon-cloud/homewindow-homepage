import { motion, useInView } from "motion/react";
import { Factory, Award } from "lucide-react";
import factoryBg from "figma:asset/9fbac59e103efcdd3b35d71230e34e1af0dbbeab.png";
import { useState, useEffect, useRef } from "react";

export function ProductionSection() {
  const [typedText, setTypedText] = useState("");
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-200px" });
  
  // "30년"을 자음/모음 단위로 분해 (빈 문자열 포함하여 반복 시 초기화)
  const decomposedText = ["", "3", "30", "30ㄴ", "30녀", "30년"];
  
  useEffect(() => {
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      setTypedText(decomposedText[currentIndex]);
      currentIndex = (currentIndex + 1) % decomposedText.length;
    }, 300);
    
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full overflow-hidden relative"
    >
      {/* 아코디언 컨테이너 */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94] 
        }}
        style={{ 
          originY: 0,
          willChange: "transform"
        }}
        className="py-24"
      >
        {/* 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${factoryBg})` }}
        />
        
        {/* Dimmed 오버레이 - 그라디언트로 상단을 더 어둡게 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/60" />

        {/* 컨텐츠 - 섹션 열린 후 딜레이 */}
        <div className="relative z-10 max-w-screen-md mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ 
              delay: 1.2, // 아코디언 열린 후 딜레이
              duration: 0.5 
            }}
          >
            {/* 키워드 */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-white/70 text-[16px] font-medium mb-3"
            >
              업계 최대 자동화 설비
            </motion.p>
            
            {/* 메인타이틀 */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-[28px] md:text-[36px] font-extrabold text-white leading-[1.3] mb-5 break-keep"
            >
              <span className="text-[#d22727]">[<span className="inline-block min-w-[60px] md:min-w-[80px]">{typedText}</span>]</span> 간 쌓아온 기술력,<br/>정직한 숫자가 증명합니다
            </motion.h2>
            
            {/* 서브타이틀 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-white/80 text-[16px] md:text-[18px] leading-[26px] break-keep mb-10"
            >
              <p>화려한 과장 광고보다 30년의 실적이 더 정직합니다.</p>
              <p>3만 8천 평 자동화 공장에서 직접 생산해 전국 어디든 직접 시공합니다.</p>
            </motion.div>

            {/* 통계 배지 */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Factory, label: "자동화 공장", value: "38,000 평" },
                { icon: Award, label: "Since 1996", value: "창호 제조 30년" }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-end justify-between mb-1">
                      <Icon size={20} strokeWidth={2.5} color="#D22727" />
                      <p className="text-white/60 text-[12px] md:text-[13px] font-medium">{stat.label}</p>
                    </div>
                    <p className="text-white font-extrabold text-right text-[20px]">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* 유튜브 영상 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/20"
            >
              {/* 유튜브 임베드 - 실제 URL로 교체 필요 */}
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/LZBNfx5ilLw?autoplay=1&mute=1&loop=1&playlist=LZBNfx5ilLw"
                title="청암홈윈도우 공장 소개"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}