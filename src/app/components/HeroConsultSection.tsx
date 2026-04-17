import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { X, Phone } from "lucide-react";
import { submitLead } from "@/lib/submitLead";
import { HoneypotField } from "@/lib/HoneypotField";

export function HeroConsultSection() {
  const navigate = useNavigate();
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
  const honeypotRef = useRef<HTMLInputElement>(null);

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
    const device = window.innerWidth >= 768 ? 'PC' : '모바일';
    try {
      const ok = await submitLead({
        phone,
        entryForm: `홈페이지 ${device} 메인`,
        honeypot: honeypotRef.current?.value,
      });
      if (ok) {
        setPhone1("010");
        setPhone2("");
        setPhone3("");
        navigate('/thanks');
      } else throw new Error();
    } catch {
      setAlertMessage("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "h-[46px] md:h-[50px] border-2 border-[#e5e5e5] rounded-xl text-center text-[14px] md:text-[15px] font-semibold text-[#2A2A2A] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]";

  return (
    <>
      <section id="consult-form" className="w-full bg-white border-b border-[#ececec] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-screen-lg mx-auto px-5 md:px-10 py-5 md:py-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-10"
          >
            <HoneypotField ref={honeypotRef} />
            {/* 왼쪽: 제목 + 아이콘 */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Toss-style icon badge */}
              <div className="w-10 h-10 rounded-xl bg-[#D22727]/10 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-[#D22727]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] text-[#999] font-medium uppercase tracking-[0.05em]">
                  무료 견적 상담
                </p>
                <h2 className="text-[17px] md:text-[20px] font-extrabold text-[#2A2A2A] leading-snug">
                  창호교체 비용이 궁금하신가요?
                </h2>
              </div>
            </div>

            {/* 오른쪽: 입력 영역 */}
            <div className="flex flex-col gap-2">
              {/* 전화번호 입력 행 */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* 010 — 편집 가능 */}
                <input
                  type="tel"
                  value={phone1}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    if (v.length <= 4) setPhone1(v);
                  }}
                  maxLength={4}
                  disabled={isSubmitting}
                  className={`w-[56px] md:w-[64px] ${inputCls}`}
                />
                <span className="text-[#ccc] text-[18px] font-light select-none">—</span>
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
                  className={`w-[70px] md:w-[82px] ${inputCls}`}
                />
                <span className="text-[#ccc] text-[18px] font-light select-none">—</span>
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
                  className={`w-[70px] md:w-[82px] ${inputCls}`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[46px] md:h-[50px] px-5 md:px-8 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[13px] md:text-[15px] rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:bg-[#999] disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "전송중..." : "상담신청"}
                </button>
              </div>

              {/* 동의 체크박스 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-3.5 h-3.5 cursor-pointer accent-[#D22727]"
                />
                <span className="text-[11px] md:text-[12px] text-[#999]">
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
            </div>
          </form>
        </div>
      </section>

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacy(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="border-b border-[#e5e5e5] p-6 flex items-center justify-between shrink-0">
              <h3 className="text-[20px] font-bold text-[#333]">개인정보처리방침</h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-9 h-9 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center cursor-pointer"
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

      {/* 완료/오류 알림 */}
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
                className="w-full h-[48px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-lg cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
