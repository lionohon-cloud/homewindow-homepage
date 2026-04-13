import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface StepInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  subtitle: string;
  description: string;
}

export function StepInfoModal({ isOpen, onClose, title, imageUrl, subtitle, description }: StepInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 md:pb-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full md:w-[60vw] max-w-2xl flex flex-col shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 8rem - 100px)' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 bg-white border-b border-[#eee] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-[20px] md:text-[24px] font-extrabold text-[#333]">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="닫기"
                >
                  <X size={20} className="text-[#999]" />
                </button>
              </div>

              {/* Content */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  div::-webkit-scrollbar-thumb {
                    background-color: #d1d5db;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background-color: #9ca3af;
                  }
                `}</style>

                {/* Image */}
                <div className="w-full rounded-xl overflow-hidden mb-6">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Subtitle */}
                <h4 className="text-[18px] md:text-[20px] font-bold text-[#333] mb-4">
                  {subtitle}
                </h4>

                {/* Description */}
                <p className="text-[15px] md:text-[16px] text-[#666] leading-[1.7] whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
