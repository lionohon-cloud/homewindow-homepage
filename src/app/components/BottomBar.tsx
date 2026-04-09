import { useState, useRef } from "react";
import { EstimateModal } from "./EstimateModal";
import { X } from "lucide-react";

const CONSULTATION_URL =
  "https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec";

export function BottomBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone1, setPhone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setAlertMessage("개인정보 수집에 동의해주세요.");
      setShowAlert(true);
      return;
    }
    if (phone1.length < 3 || phone2.length < 3 || phone3.length < 4) {
      setAlertMessage("연락처를 정확히 입력해주세요.");
      setShowAlert(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    const phone = `${phone1}-${phone2}-${phone3}`;
    try {
      const res = await fetch(CONSULTATION_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setAlertMessage("접수가 완료되었습니다");
        setShowAlert(true);
        setPhone1("010");
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

  const inputBase =
    "rounded-lg text-center font-medium bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:bg-white/30 disabled:opacity-60";

  return (
    <>
      {/*
        모바일: h-[80px] / PC: h-[110px]
        App.tsx pb 값도 맞춰져 있어야 함
      */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] md:h-[110px] bg-white z-50 flex shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">

        {/* ── 왼쪽 폼 영역 (2/3) ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-[2] flex items-center bg-[#d22727] px-3 md:px-8 gap-3 md:gap-6"
        >
          {/* PC 전용: 제목 */}
          <div className="hidden md:block flex-shrink-0">
            <p className="text-white font-extrabold text-[18px] leading-snug">
              창호 교체 비용이<br />궁금하신가요?
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="flex flex-col justify-center gap-1.5 flex-1 md:flex-none">

            {/* 모바일 전용: 상단 레이블 */}
            <p className="md:hidden text-white/80 text-[11px] font-semibold tracking-wide">
              📞 무료 상담신청
            </p>

            {/* 전화번호 입력 행 */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* 010 입력 */}
              <input
                type="tel"
                value={phone1}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  if (v.length <= 4) setPhone1(v);
                }}
                maxLength={4}
                disabled={isSubmitting}
                className={`w-[40px] md:w-[58px] h-[36px] md:h-[44px] text-[12px] md:text-[15px] ${inputBase}`}
              />
              <span className="text-white/60 text-[12px] md:text-[14px] shrink-0">-</span>

              {/* 가운데 4자리 */}
              <input
                ref={phone2Ref}
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
                className={`w-[46px] md:w-[68px] h-[36px] md:h-[44px] text-[12px] md:text-[15px] ${inputBase}`}
              />
              <span className="text-white/60 text-[12px] md:text-[14px] shrink-0">-</span>

              {/* 끝 4자리 */}
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
                className={`w-[46px] md:w-[68px] h-[36px] md:h-[44px] text-[12px] md:text-[15px] ${inputBase}`}
              />

              {/* 신청 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 h-[36px] md:h-[44px] px-2.5 md:px-6 bg-white text-[#d22727] font-bold text-[11px] md:text-[14px] rounded-lg transition-colors hover:bg-[#fff5f5] disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? "전송중..." : (
                  <>
                    <span className="md:hidden">신청</span>
                    <span className="hidden md:inline">상담신청</span>
                  </>
                )}
              </button>
            </div>

            {/* PC 전용: 개인정보 동의 */}
            <label className="hidden md:flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 cursor-pointer accent-white"
              />
              <span className="text-white/80 text-[12px]">
                상담을 위한 연락처 수집에 동의합니다.{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-white underline hover:text-white/80 transition-colors cursor-pointer font-medium"
                >
                  [내용보기]
                </button>
              </span>
            </label>
          </div>
        </form>

        {/* ── 오른쪽: 직접견적내기 (1/3) ── */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-[1] bg-[#eeeeee] text-[#333] font-bold flex items-center justify-center transition-colors active:bg-[#dddddd] hover:bg-[#dddddd] cursor-pointer text-center px-2 leading-snug"
        >
          <span className="md:hidden text-[12px]">직접<br />견적</span>
          <span className="hidden md:inline text-[17px]">직접견적내기</span>
        </button>
      </div>

      {/* ── 개인정보처리방침 모달 ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacy(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-white border-b border-[#e5e5e5] p-6 flex items-center justify-between shrink-0">
              <h3 className="text-[20px] font-bold text-[#333]">개인정보처리방침</h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-9 h-9 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-[14px] leading-[1.8] text-[#666] space-y-4">
              <p>회사는 상담 서비스 제공을 위해 연락처(휴대전화번호)를 수집합니다. 수집된 정보는 창호 교체 상담 및 견적 안내 목적으로만 이용되며, 상담 완료 후 3개월 이내 파기됩니다. 고객의 동의 없이 제3자에게 제공하지 않습니다.</p>
              <p className="text-[#999] text-[13px]">공고일자: 2024년 1월 1일 · 시행일자: 2024년 1월 1일</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 완료/오류 알림 모달 ── */}
      {showAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAlert(false)} />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[28px]">
                  {alertMessage.includes("완료") ? "✓" : "!"}
                </div>
              </div>
              <p className="text-[16px] text-[#333] font-medium leading-[1.6]">{alertMessage}</p>
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

      <EstimateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
