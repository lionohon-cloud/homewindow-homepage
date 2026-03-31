import { motion, AnimatePresence } from "motion/react";
import { Shield, Hammer, Maximize2, CheckCircle, BadgeCheck, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { StepInfoModal } from "./StepInfoModal";
import step1Image from "figma:asset/f542cc9df71ad6db9a38cd83c1a289084acc5df6.png";
import step2Image from "figma:asset/8eacb420031f09e6ec0cb30eb5ac3fb1b52a2aa7.png";
import step3Image from "figma:asset/bc0af9d28b7340a90849deb8072aa8300ddaf7b0.png";
import step4Image from "figma:asset/d37da380b542af5e9d64a3a01108077e5b23e0ee.png";

export function OneDayInstallationSection() {
  const [isMorning, setIsMorning] = useState(true);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMorning((prev) => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    { 
      id: 1, 
      title: "보양작업", 
      icon: Shield,
      subtitle: "시공 전 내부를 보호하는 작업",
      description: "실내 바닥, 벽지, 가구 등에 먼지가 앉거나 흠집이 나지 않도록 마스킹 테이프와 전용 보양재를 이용해 주변을 철저히 감쌉니다.",
      imageUrl: step1Image
    },
    { 
      id: 2, 
      title: "철거/양중", 
      icon: Hammer,
      subtitle: "오래된 창호를 철거하고 새 창호를 올리는 작업",
      description: "노후된 창호를 분해하여 제거한 후, 시공 부위에 남아있는 이물질이나 오래된 실리콘 잔해까지 완벽하게 제거합니다.",
      imageUrl: step2Image
    },
    { 
      id: 3, 
      title: "창호 설치", 
      icon: Maximize2,
      subtitle: "새 창호를 설치하는 작업",
      description: "외부 찬 공기와 소음이 들어올 틈이 없도록 미세한 수직, 수평 오차까지 철저하게 잡아 시공합니다.",
      imageUrl: step3Image
    },
    { 
      id: 4, 
      title: "마무리 및\n시공확인", 
      icon: CheckCircle,
      subtitle: "깔끔한 마무리와 최종 점검 작업",
      description: "창호의 부드러운 개폐 여부를 점검하고 주변을 깨끗이 정리하며 하루 만에 시공을 마무리합니다.",
      imageUrl: step4Image
    },
    { 
      id: 5, 
      title: "'시공완료'\n품질보증", 
      icon: BadgeCheck, 
      isLast: true,
      subtitle: "15년 무상보증 시작",
      description: "시공 완료와 동시에 업계 최장 15년 무상보증이 시작됩니다. 정식 보증서와 함께 평생 사후관리 서비스를 받으실 수 있습니다.",
      imageUrl: "https://images.unsplash.com/photo-1761178334144-9715e83bf64b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFsaXR5JTIwYXNzdXJhbmNlJTIwY2VydGlmaWNhdGV8ZW58MXx8fHwxNzc0NTkyNzY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
  ];

  const currentStep = steps.find(s => s.id === selectedStep);

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-screen-md mx-auto">
        {/* Keyword */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5 }}
          className="px-6 md:px-10 text-[#999] text-[16px] font-medium mb-3"
        >
          원데이 시공
        </motion.p>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-6 md:px-10 text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep relative"
        >
          <motion.span
            animate={{ opacity: isMorning ? 1 : 0.3 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            아침 철거 시작,
          </motion.span>
          <motion.span
            animate={{ opacity: isMorning ? 0.3 : 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            {' '}저녁엔 완성!
          </motion.span>
          
          {/* Sun and Moon Animation - Temporarily disabled */}
          {/* <span className="absolute top-[-10px] right-0 w-12 h-12 pointer-events-none">
            <AnimatePresence mode="wait">
              {isMorning ? (
                <motion.span
                  key="sun"
                  initial={{ x: 150, y: 90, opacity: 0 }}
                  animate={{ 
                    x: [150, 120, 80, 40, 0, -40, -80, -120],
                    y: [90, 100, 110, 115, 100, 60, 0, -40],
                    opacity: [0, 0.5, 1, 1, 1, 1, 0.5, 0]
                  }}
                  transition={{ 
                    duration: 2.5,
                    times: [0, 0.14, 0.28, 0.42, 0.58, 0.72, 0.86, 1],
                    ease: "linear"
                  }}
                  className="absolute text-[28px] md:text-[32px]"
                >
                  ☀️
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ x: 150, y: 90, opacity: 0 }}
                  animate={{ 
                    x: [150, 120, 80, 40, 0, -40, -80, -120],
                    y: [90, 100, 110, 115, 100, 60, 0, -40],
                    opacity: [0, 0.5, 1, 1, 1, 1, 0.8, 0]
                  }}
                  transition={{ 
                    duration: 2.5,
                    times: [0, 0.14, 0.28, 0.42, 0.58, 0.72, 0.86, 1],
                    ease: "linear"
                  }}
                  className="absolute text-[28px] md:text-[32px]"
                >
                  🌙
                </motion.span>
              )}
            </AnimatePresence>
          </span> */}
          <br />
          <span className="text-[#D22727]">1DAY 시공</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 md:px-10 text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep mb-10 md:mb-14"
        >
          <p>공사 기간이 길어질까 걱정하지 마세요.<br />본사 전국 직영 시공팀이 방문해 하루 만에 마감합니다.</p>
        </motion.div>

        {/* Process Infographic - Mobile: Vertical Scroll, Desktop: Horizontal */}
        <div className="px-6 md:px-10 mb-16 md:mb-24">
          {/* Desktop View - Horizontal */}
          <div className="hidden md:flex items-center justify-between gap-2 max-w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="contents">
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-200px" }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                  className={`flex flex-col items-center flex-1 ${
                    step.isLast ? 'bg-[#D22727]' : 'bg-white'
                  } border-2 ${
                    step.isLast ? 'border-[#D22727]' : 'border-[#E5E5E5]'
                  } rounded-[24px] p-4 relative`}
                >
                  {/* ? Button - Top Right Corner */}
                  {!step.isLast && (
                    <button
                      onClick={() => setSelectedStep(step.id)}
                      className="absolute top-3 right-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors bg-[#f5f5f5] hover:bg-[#e5e5e5] cursor-pointer"
                      aria-label="상세정보"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#999]" />
                    </button>
                  )}
                  
                  <step.icon 
                    className={`w-10 h-10 mb-3 mt-2 ${
                      step.isLast ? 'text-white' : 'text-[#D22727]'
                    }`}
                    strokeWidth={2}
                  />
                  <div className={`text-center text-[15px] font-bold leading-[1.4] h-[42px] flex items-center justify-center whitespace-pre-line ${
                    step.isLast ? 'text-white' : 'text-[#333]'
                  }`}>
                    {step.title}
                  </div>
                </motion.div>

                {/* Arrow Between Steps */}
                {!step.isLast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-200px" }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                    className="flex-shrink-0"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#D22727]">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile View - Vertical */}
          <div className="flex md:hidden flex-col gap-0.5">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col gap-0.5">
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-200px" }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-4 ${ step.isLast ? 'bg-[#D22727]' : 'bg-white' } border-2 ${ step.isLast ? 'border-[#D22727]' : 'border-[#E5E5E5]' } rounded-[12px] pl-[10px] pr-[20px] py-[2px]`}
                >
                  <div className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full ${
                    step.isLast ? 'bg-white/20' : 'bg-[#FEF5F5]'
                  }`}>
                    <step.icon 
                      className={`w-5.5 h-5.5 ${
                        step.isLast ? 'text-white' : 'text-[#D22727]'
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <p className={`font-bold leading-[1.4] font-['Pretendard'] ${ step.isLast ? 'text-white' : 'text-[#333]' } text-left text-[18px]`}>
                      {step.title}
                    </p>
                    {!step.isLast && (
                      <button
                        onClick={() => setSelectedStep(step.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[#f5f5f5] active:bg-[#e5e5e5]"
                        aria-label="상세정보"
                      >
                        <HelpCircle className="w-4 h-4 text-[#999]" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Arrow Between Steps */}
                {!step.isLast && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true, margin: "-200px" }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex justify-center"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#D22727]">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* YouTube Video - Below Infographic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 md:mt-16"
          >
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/AImKPwvQsB4?si=eQoOPMj-93kgj0c9"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Step Info Modal */}
      {currentStep && (
        <StepInfoModal
          isOpen={selectedStep !== null}
          onClose={() => setSelectedStep(null)}
          title={currentStep.title.replace(/\n/g, ' ')}
          imageUrl={currentStep.imageUrl}
          subtitle={currentStep.subtitle}
          description={currentStep.description}
        />
      )}
    </section>
  );
}