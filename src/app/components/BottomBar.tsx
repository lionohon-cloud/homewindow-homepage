import { useState, useRef } from "react";
import { EstimateModal } from "./EstimateModal";

const CONSULTATION_URL =
  "https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec";

export function BottomBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const phone3Ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone2.length < 3 || phone3.length < 4) {
      setAlertMessage("연락처를 정확히 입력해주세요.");
      setShowAlert(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    const phone = `010-${phone2}-${phone3}`;
    try {
      const res = await fetch(CONSULTATION_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setAlertMessage("접수가 완료되었습니다");
        setShowAlert(true);
        setPhone2("");
        setPhone3("");
      } else throw new Error();
    } catch {
      setAlertMessage("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[70px] md:h-[80px] bg-white z-50 flex shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">

        {/* 왼쪽 2/3: 인라인 상담 폼 */}
        <form
          onSubmit={handleSubmit}
          className="flex-[2] flex items-center justify-center px-2 md:px-8 gap-1.5 md:gap-3 bg-[#d22727]"
        >
          {/* 010 */}
          <span className="text-white font-bold text-[12px] md:text-[15px] shrink-0">010</span>
          <span className="text-white/60 text-[12px] md:text-[14px] shrink-0">-</span>

          {/* 4자리 입력 1 */}
          <input
            type="tel"
            value={phone2}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              if (v.length <= 4) {
                setPhone2(v);
                if (v.length === 4) phone3Ref.current?.focus();
              }
            }}
            placeholder="0000"
            maxLength={4}
            disabled={isSubmitting}
            className="w-[48px] md:w-[72px] h-[38px] md:h-[46px] rounded-lg text-center text-[13px] md:text-[15px] font-medium bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:bg-white/30 disabled:opacity-60"
          />

          <span className="text-white/60 text-[12px] md:text-[14px] shrink-0">-</span>

          {/* 4자리 입력 2 */}
          <input
            ref={phone3Ref}
            type="tel"
            value={phone3}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              if (v.length <= 4) setPhone3(v);
            }}
            placeholder="0000"
            maxLength={4}
            disabled={isSubmitting}
            className="w-[48px] md:w-[72px] h-[38px] md:h-[46px] rounded-lg text-center text-[13px] md:text-[15px] font-medium bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:bg-white/30 disabled:opacity-60"
          />

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 h-[38px] md:h-[46px] px-2.5 md:px-6 bg-white text-[#d22727] font-bold text-[11px] md:text-[14px] rounded-lg transition-colors hover:bg-[#fff5f5] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? "전송중..." : (
              <>
                <span className="md:hidden">무료상담</span>
                <span className="hidden md:inline">무료 상담신청</span>
              </>
            )}
          </button>
        </form>

        {/* 오른쪽 1/3: 직접견적내기 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-[1] bg-[#eeeeee] text-[#333] font-bold flex items-center justify-center transition-colors active:bg-[#dddddd] hover:bg-[#dddddd] cursor-pointer leading-snug text-center px-2"
        >
          <span className="md:hidden text-[12px]">직접<br />견적</span>
          <span className="hidden md:inline text-[18px]">직접견적내기</span>
        </button>
      </div>

      {/* 완료/오류 알림 모달 */}
      {showAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAlert(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[28px]">
                  {alertMessage.includes("완료") ? "✓" : "!"}
                </div>
              </div>
              <p className="text-[16px] text-[#333] font-medium leading-[1.6]">
                {alertMessage}
              </p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowAlert(false)}
                className="w-full h-[48px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-lg transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
