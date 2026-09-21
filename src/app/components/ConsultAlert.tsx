import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

/**
 * 상담 접수 쪽 작은 팝업 공통 디자인 (260917 번호인증 실험 — 인증창·알림창 통일)
 *
 * 같은 틀을 쓰는 곳
 *   - 알림창: HeroConsultSection / BottomBar / ConsultationModal 의 "연락처를 정확히…" 등
 *   - 인증창: PhoneVerifyHost
 *
 * 틀은 모바일 상담 팝업(BottomBar "창호교체 비용이 궁금하신가요?")을 그대로 따른다 — 사용자 지시.
 *   왼쪽 정렬 제목 17px + 회색 설명 12px · 오른쪽 회색 동그라미 닫기(32px) · 얇은 구분선
 *   · 11px 회색 라벨 · 52px 테두리 칸 · 52px 빨간 버튼. 아이콘 없음.
 */

export const dialogBackdrop = "absolute inset-0 bg-black/60";
export const dialogCard =
  "relative z-10 mx-auto w-[92%] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden";
export const dialogHeader = "flex items-start justify-between px-5 pt-5 pb-3";
export const dialogTitle = "text-[17px] font-extrabold text-[#2A2A2A] leading-snug break-keep";
export const dialogDesc = "text-[12px] text-[#888] mt-0.5 break-keep";
export const dialogDivider = "h-px bg-[#f0f0f0] mx-5";
export const dialogBody = "px-5 py-4 space-y-3";
export const dialogLabel = "text-[11px] text-[#999] font-medium uppercase tracking-[0.05em]";
export const dialogPrimaryBtn =
  "w-full h-[52px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

/** 헤더 오른쪽 닫기 — 상담 팝업과 같은 회색 동그라미 */
export function DialogClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      className="w-8 h-8 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center shrink-0 ml-2 mt-0.5 cursor-pointer transition-colors"
    >
      <X size={15} className="text-[#666]" />
    </button>
  );
}

/** 확인 버튼 하나짜리 알림창 */
export function ConsultAlert({
  open,
  message,
  onClose,
  zIndex = "z-[120]",
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  zIndex?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={dialogBackdrop}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-describedby="consult-alert-msg"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={dialogCard}
          >
            <div className={dialogHeader}>
              <p id="consult-alert-msg" className={dialogTitle}>
                {message}
              </p>
              <DialogClose onClick={onClose} />
            </div>
            <div className={dialogDivider} />
            <div className={dialogBody}>
              <button type="button" onClick={onClose} className={dialogPrimaryBtn} autoFocus>
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
