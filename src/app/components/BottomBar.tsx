import { useState } from "react";
import { EstimateModal } from "./EstimateModal";
import { ConsultationModal } from "./ConsultationModal";
import { motion } from "motion/react";

export function BottomBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[70px] md:h-[80px] bg-white z-50 flex shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {/* Consultation Button with Floating Badge */}
        <div className="relative flex-1">
          {/* Floating Micro CTA Badge - Only show when modal is closed */}
          {!isConsultationOpen && (
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[55px] md:bottom-[60px] left-1/2 -translate-x-1/2 z-10"
            >
              <div className="relative bg-[#FFD700] px-4 py-2 rounded-2xl shadow-lg">
                <p className="text-[#D22727] font-black text-[11px] md:text-[14px] whitespace-nowrap">
                  지금 상담접수 시 10% 할인
                </p>
                {/* Speech Bubble Tail */}
                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#FFD700]" />
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setIsConsultationOpen(!isConsultationOpen)}
            className="block w-full h-full bg-[#d22727] text-white font-bold text-[16px] md:text-[18px] flex items-center justify-center transition-colors active:bg-[#b02020] hover:bg-[#b02020] cursor-pointer"
          >
            상담접수하기
          </button>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 bg-[#eeeeee] text-[#333] font-bold text-[16px] md:text-[18px] flex items-center justify-center transition-colors active:bg-[#dddddd] hover:bg-[#dddddd] cursor-pointer"
        >
          직접견적내기
        </button>
      </div>
      
      <EstimateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </>
  );
}