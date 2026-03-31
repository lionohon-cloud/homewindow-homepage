import { motion } from "motion/react";
import { useState } from "react";
import imgMaterial from "figma:asset/39019c51fb35d693198efef4d7e8cca5c84f47f2.png";

// YouTube 영상 URL을 여기서 쉽게 변경할 수 있습니다
const YOUTUBE_VIDEO_ID = "QLsYvPHZ1pg"; // 이 부분만 새 영상 ID로 교체하세요

export function MaterialsSection() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  return (
    <section className="py-24 w-full bg-white">
      <div className="max-w-screen-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10 mb-12"
        >
          <p className="text-[#999] text-[16px] font-medium mb-3">프로파일 & 보강재</p>
          <h2 className="font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-[32px]">
            흔들림 없는 창호의 뼈대<br/>
            <span className="text-[#d22727]">프로파일 & 보강재</span>
          </h2>
          <div className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep">
            <p>타사는 보이지 않는 곳에서 원가를 줄이지만, 청암홈윈도우는 다릅니다.<br/>시작부터 끝까지 보강재를 100% 빈틈없이 채워 넣습니다.</p>
          </div>
        </motion.div>

        {/* YouTube 영상 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.6 }}
          className="px-6 md:px-10 mb-8"
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe 
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/0EfNukJ8NsQ?si=Z0lZ7F7bKP9QNCtO"
              title="청암홈윈도우 프로파일 및 보강재 영상" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* 아코디언 버튼 */}
        <div className="px-6 md:px-10 mb-8">
          <div className="border-2 border-[#eaeaea] rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex items-center justify-between transition-all duration-300 hover:bg-[#d22727]/5 px-[20px] py-[14px] hover:cursor-pointer"
            >
              <h3 className="text-[#d22727] font-bold text-[16px]">보강재의 중요성 확인하기</h3>
              <motion.span
                animate={{ rotate: isAccordionOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[#d22727] font-bold origin-center flex-shrink-0 ml-2 text-[16px]"
              >
                ▶
              </motion.span>
            </button>
          </div>
        </div>

        {/* 아코디언 콘텐츠 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isAccordionOpen ? "auto" : 0,
            opacity: isAccordionOpen ? 1 : 0 
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          {/* 이미지 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.6 }}
            className="px-6 md:px-10 mb-14"
          >
            <img 
              src={imgMaterial} 
              alt="프로파일 및 보강재 단면" 
              className="w-full h-auto rounded-xl"
            />
          </motion.div>

          <div className="px-6 md:px-10 flex flex-col gap-10 pb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
            >
              <h3 className="text-[#333] text-[20px] md:text-[22px] font-extrabold mb-3">프로파일의 중요성</h3>
              <p className="text-[#999] text-[16px] md:text-[17px] leading-[26px] md:leading-[28px] break-keep">
                프로파일 내부에는 여러 개의 빈 공간(격실)이 나뉘어 있습니다. 이 촘촘한 격실 구조가 외부의 냉기가 실내로 들어오는 것을 철저하게 막아주어, 냉난방비를 획기적으로 줄여줍니다.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
            >
              <h3 className="text-[#333] text-[20px] md:text-[22px] font-extrabold mb-3">보강재의 중요성</h3>
              <p className="text-[#999] text-[16px] md:text-[17px] leading-[26px] md:leading-[28px] break-keep">
                단열이 뛰어난 PVC 창틀 내부에는 무거운 복층 유리의 하중을 버티고, 거센 태풍의 비바람(풍압)을 이겨내기 위한 보강재가 반드시 들어가야 합니다.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}