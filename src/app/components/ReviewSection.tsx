import { motion } from "motion/react";
import { User, ArrowRight } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

const reviews = [
  "살면서 거주중인데도 하루 만에 끝났어요!",
  "바꿔보니 외풍이 사라지고 집이 따뜻해진게 느껴져요.",
  "견적도 상세하고 상담이 친절해서 바로 믿고 맡겼습니다.",
  "창문을 닫는 순간 바깥 소음이 차단돼서 신기해요!",
  "타사에선 비싼 안전방충망을 무상으로 해줘서 가성비 좋아요.",
];

export function ReviewSection() {
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
          고객 후기
        </motion.p>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-left"
        >수천 건의 시공이 입증한,<br />청암홈윈도우를 경험한 이야기</motion.h2>

        {/* Hashtag Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-4 justify-start"
        >
          <span className="px-4 py-2 bg-[#f5f5f5] text-[#D22727] text-[14px] md:text-[15px] font-semibold rounded-full border border-[#e0e0e0]">
            #하루 만에 끝나서 편해요
          </span>
          <span className="px-4 py-2 bg-[#f5f5f5] text-[#D22727] text-[14px] md:text-[15px] font-semibold rounded-full border border-[#e0e0e0]">
            #외풍과 소음이 완전히 사라졌어요
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[#666] text-[16px] md:text-[18px] leading-[26px] mb-12 break-keep text-left"
        >깐깐하게 고르고 만족하신 고객님들의 진짜 후기입니다.</motion.p>
      </div>

      {/* Before/After Slider - Full Width Outside Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-200px" }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mb-12"
      >
        <div className="max-w-screen-md mx-auto px-6 md:px-10">
          <BeforeAfterSlider />
        </div>
      </motion.div>

      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* Cards Container */}
        <div className="grid grid-cols-1 gap-6">
          {/* Review Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[#fff] rounded-2xl p-6 md:p-8 border border-[#e5e5e5]"
          >
            <div className="flex items-start gap-2 mb-6">
              <span className="flex-shrink-0 w-6 h-6 bg-[#D22727] text-white rounded-full flex items-center justify-center text-[14px] font-bold">
                Q
              </span>
              <h3 className="text-[16px] md:text-[17px] font-bold text-[#333] leading-[1.4]">청암홈윈도우 어떤점이 제일 만족스러웠나요?</h3>
            </div>

            <div className="space-y-4 p-[0px]">
              {reviews.map((review, index) => {
                const isLeft = index % 2 === 0;
                // 색상을 점진적으로 변화 (짙은 레드 톤 유지)
                const startColor = { r: 210, g: 39, b: 39 };
                const endColor = { r: 160, g: 50, b: 50 };
                const ratio = index / (reviews.length - 1);
                const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
                const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
                const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
                const bgColor = `rgb(${r}, ${g}, ${b})`;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-200px" }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.15 }}
                    className="flex items-end gap-2"
                  >
                    {isLeft ? (
                      <>
                        {/* 좌측: 아이콘 - 말풍선 순서 */}
                        <div className="hidden md:flex flex-shrink-0 w-9 h-9 bg-[#f5f5f5] border-2 border-[#e0e0e0] rounded-full items-center justify-center mb-1">
                          <User size={18} className="text-[#666]" />
                        </div>
                        <div
                          className="max-w-[85%] md:max-w-[75%] rounded-2xl leading-[1.6] text-white rounded-bl-none font-bold text-[14px] px-[16px] py-[14px]"
                          style={{
                            backgroundColor: bgColor,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                        >
                          "{review}"
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 우측: 공간 - 말풍선 - 아이콘 순서 */}
                        <div className="flex-1"></div>
                        <div
                          className="max-w-[85%] md:max-w-[75%] rounded-2xl leading-[1.6] text-white rounded-br-none font-bold text-[14px] px-[16px] py-[14px]"
                          style={{
                            backgroundColor: bgColor,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                        >
                          "{review}"
                        </div>
                        <div className="hidden md:flex flex-shrink-0 w-9 h-9 bg-[#f5f5f5] border-2 border-[#e0e0e0] rounded-full items-center justify-center mb-1">
                          <User size={18} className="text-[#666]" />
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* More Reviews Button */}
          <motion.a
            href="https://blog.naver.com/homewindow_ca2"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-white border-2 border-[#D22727] text-[#D22727] font-bold text-[15px] md:text-[16px] rounded-xl hover:bg-[#D22727] hover:text-white transition-all duration-300 shadow-sm"
          >
            더 많은 후기가 궁금하시다면?
            <ArrowRight size={20} strokeWidth={2.5} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}