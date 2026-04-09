import { useState, useRef } from "react";
import { EstimateModal } from "./EstimateModal";
import { X, Phone, MessageSquare } from "lucide-react";

const CONSULTATION_URL =
  "https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec";

export function BottomBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  // 공유 폼 상태
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
    if (phone1.length < 2 || phone2.length < 3 || phone3.length < 4) {
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
        setShowMobilePopup(false);
      } else throw new Error();
    } catch {
      setAlertMessage("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 공통 입력 스타일 (PC용: 테두리형 흰 배경)
  const pcInput =
    "h-[42px] border-2 border-[#e0e0e0] rounded-xl text-center text-[14px] font-semibold text-[#2A2A2A] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]";

  // 공통 입력 스타일 (팝업용: 더 큰 터치 타겟)
  const popupInput =
    "h-[52px] border-2 border-[#e0e0e0] rounded-xl text-center text-[16px] font-semibold text-[#2A2A2A] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]";

  const phoneDisplay =
    phone2 || phone3
      ? `${phone1}-${phone2 || "____"}-${phone3 || "____"}`
      : "번호를 입력해 상담신청";

  return (
    <>
      {/* ── 하단 고정 바 ── */}
      {/* 모바일: h-[100px] / PC: h-[110px] */}
      <div className="fixed bottom-0 left-0 right-0 h-[100px] md:h-[110px] bg-white z-50 flex shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">

        {/* ════ PC 전용 폼 영역 (2/3) ════ */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:flex flex-[2] flex-col items-center justify-center px-10 gap-1.5 bg-white border-r border-[#e5e5e5]"
        >
          {/* 제목 */}
          <p className="text-[16px] font-extrabold text-[#2A2A2A] tracking-tight">
            창호 교체 비용이 궁금하신가요?
          </p>

          {/* 입력 행 */}
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phone1}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                if (v.length <= 4) setPhone1(v);
              }}
              maxLength={4}
              disabled={isSubmitting}
              className={`w-[62px] ${pcInput}`}
            />
            <span className="text-[#aaa] text-[16px] font-light select-none">—</span>
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
              className={`w-[76px] ${pcInput}`}
            />
            <span className="text-[#aaa] text-[16px] font-light select-none">—</span>
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
              className={`w-[76px] ${pcInput}`}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] px-7 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "전송중..." : "무료 상담신청"}
            </button>
          </div>

          {/* 동의 체크박스 */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isSubmitting}
              className="w-3.5 h-3.5 cursor-pointer accent-[#D22727]"
            />
            <span className="text-[11px] text-[#888]">
              상담을 위한 연락처 수집에 동의합니다.{" "}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="text-[#D22727] underline hover:text-[#b02020] cursor-pointer font-medium"
              >
                [내용보기]
              </button>
            </span>
          </label>
        </form>

        {/* ════ 모바일 전용 상담 탭 영역 (2/3) ════ */}
        <button
          type="button"
          onClick={() => setShowMobilePopup(true)}
          className="md:hidden flex-[2] bg-[#D22727] flex items-center justify-center gap-3 px-4 active:bg-[#b02020] transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Phone size={17} className="text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-white/75 text-[10px] font-semibold tracking-wide uppercase">
              무료 상담신청
            </span>
            <span className="text-white font-bold text-[13px] leading-tight">
              {phoneDisplay}
            </span>
          </div>
        </button>

        {/* ════ 직접견적 / AI 채팅 견적 (1/3) ════ */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-[1] bg-[#f5f5f5] hover:bg-[#ececec] active:bg-[#e5e5e5] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer px-2"
        >
          <MessageSquare size={18} className="text-[#D22727] md:size-5" strokeWidth={2} />
          <span className="text-[#2A2A2A] font-bold text-[11px] md:text-[14px] text-center leading-tight">
            AI 채팅<br />견적
          </span>
        </button>
      </div>

      {/* ════ 모바일 팝업 입력창 ════ */}
      {showMobilePopup && (
        <div
          className="md:hidden fixed inset-0 z-[100] bg-black/60"
          onClick={() => setShowMobilePopup(false)}
          style={{ display: "flex", alignItems: "flex-start", paddingTop: "8%" }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl mx-auto w-[92%] max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 팝업 헤더 */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[17px] font-extrabold text-[#2A2A2A] leading-snug">
                  창호교체 비용이 궁금하신가요?
                </p>
                <p className="text-[12px] text-[#888] mt-0.5">
                  무료견적상담, 지금 연락처만 남겨주세요!
                </p>
              </div>
              <button
                onClick={() => setShowMobilePopup(false)}
                className="w-8 h-8 bg-[#f5f5f5] rounded-full flex items-center justify-center shrink-0 ml-2 mt-0.5 cursor-pointer"
              >
                <X size={15} className="text-[#666]" />
              </button>
            </div>

            {/* 구분선 */}
            <div className="h-px bg-[#f0f0f0] mx-5" />

            {/* 팝업 폼 */}
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              {/* 전화번호 입력 */}
              <div>
                <p className="text-[11px] text-[#999] font-medium uppercase tracking-[0.05em] mb-1.5">
                  연락처
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="tel"
                    value={phone1}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length <= 4) setPhone1(v);
                    }}
                    maxLength={4}
                    disabled={isSubmitting}
                    className={`w-[62px] ${popupInput}`}
                  />
                  <span className="text-[#bbb] text-[18px] font-light">—</span>
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
                    className={`flex-1 ${popupInput}`}
                  />
                  <span className="text-[#bbb] text-[18px] font-light">—</span>
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
                    className={`flex-1 ${popupInput}`}
                  />
                </div>
              </div>

              {/* 개인정보 동의 */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 cursor-pointer accent-[#D22727] mt-0.5 shrink-0"
                />
                <span className="text-[12px] text-[#666] leading-relaxed">
                  상담을 위한 연락처 수집에 동의합니다.{" "}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }}
                    className="text-[#D22727] underline cursor-pointer font-medium"
                  >
                    [내용보기]
                  </button>
                </span>
              </label>

              {/* 신청 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "전송중..." : "무료 상담 신청하기"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 개인정보처리방침 모달 ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            <div className="p-6 overflow-y-auto text-[14px] leading-[1.8] text-[#666]">
              <p>회사는 상담 서비스 제공을 위해 연락처(휴대전화번호)를 수집합니다. 수집된 정보는 창호 교체 상담 및 견적 안내 목적으로만 이용되며, 상담 완료 후 3개월 이내 파기됩니다. 고객의 동의 없이 제3자에게 제공하지 않습니다.</p>
              <p className="text-[#999] text-[13px] mt-4">공고일자: 2024년 1월 1일 · 시행일자: 2024년 1월 1일</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 완료/오류 알림 ── */}
      {showAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
