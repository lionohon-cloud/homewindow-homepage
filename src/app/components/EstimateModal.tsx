import { useEffect } from "react";
import { X } from "lucide-react";
import { EstimateForm } from "./EstimateForm";

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EstimateModal({ isOpen, onClose }: EstimateModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-estimate-modal-open", "true");
    } else {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-estimate-modal-open");
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-estimate-modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] shrink-0">
          <h2 className="text-lg font-bold text-[#2c2c2c]">실시간 견적 계산기</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors text-[#888] hover:text-[#333]"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* React Component replaced iframe */}
        <div className="w-full flex-1 min-h-0 border-0">
          <EstimateForm />
        </div>
      </div>
    </div>
  );
}