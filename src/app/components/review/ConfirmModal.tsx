import { CheckCircle2 } from "lucide-react";

export function ConfirmModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-[#952c2c]" />
        </div>
        <h3 className="text-[18px] font-extrabold text-center text-[#1c1614] tracking-tight">
          후기가 접수되었습니다
        </h3>
        <p className="mt-3 text-[14px] text-[#6b6460] text-center leading-[1.6] break-keep">
          관리자 확인 후 게시됩니다.
          <br />
          소중한 후기를 남겨주셔서 감사합니다.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-12 rounded-xl bg-[#952c2c] text-white font-bold text-[15px]"
        >
          확인
        </button>
      </div>
    </div>
  );
}
