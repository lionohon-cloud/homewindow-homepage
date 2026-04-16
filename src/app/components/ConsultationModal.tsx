import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitLead } from "@/lib/submitLead";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "top" | "bottom";
}

export function ConsultationModal({ isOpen, onClose, variant = "bottom" }: ConsultationModalProps) {
  const navigate = useNavigate();
  const [phone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phone3Ref = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      setAlertMessage("개인정보 수집에 동의해주세요.");
      setShowAlert(true);
      return;
    }
    
    if (phone2.length < 3 || phone3.length < 4) {
      setAlertMessage("연락처를 정확히 입력해주세요.");
      setShowAlert(true);
      return;
    }

    // 전송 중 중복 클릭 방지
    if (isSubmitting) return;
    setIsSubmitting(true);

    const phoneNumber = `${phone1}-${phone2}-${phone3}`;
    const device = window.innerWidth >= 768 ? 'PC' : '모바일';

    try {
      const ok = await submitLead({ phone: phoneNumber, entryForm: `홈페이지 ${device} 상담모달` });

      if (ok) {
        setPhone2("");
        setPhone3("");
        onClose();
        navigate('/thanks');
      } else {
        throw new Error("전송 실패");
      }
    } catch (error) {
      console.error("전송 오류:", error);
      setAlertMessage("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPrivacy = () => {
    setShowPrivacy(true);
  };

  return (
    <>
      {/* Consultation Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: variant === "top" ? "-100%" : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: variant === "top" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed left-0 right-0 bg-white shadow-lg z-40 ${
              variant === "top"
                ? "top-[120px] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                : "bottom-[70px] md:bottom-[80px] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
            }`}
          >
            <div className="relative w-full">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 w-8 h-8 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="닫기"
              >
                <X className="w-4 h-4 text-[#666]" />
              </button>

              {/* Content */}
              <div className="w-full px-5 md:px-10 py-4 md:py-0 md:h-[160px] md:flex md:items-center">
                <div className="max-w-screen-lg mx-auto w-full">
                  <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-6">
                    {/* 제목 */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <h3 className="font-bold text-[#d22727] text-[18px] md:text-[32px] md:whitespace-nowrap">
                        창호교체 비용이 궁금하신가요?
                      </h3>
                      <p className="text-[#666] mt-0.5 text-[13px] md:text-[16px]">
                        무료견적상담, 지금 연락처만 남겨주세요!
                      </p>
                    </div>

                    {/* 입력 및 버튼 */}
                    <div className="flex flex-col gap-2 relative">
                      {/* Floating Micro CTA Badge */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="hidden md:block absolute md:-top-[50px] md:right-0 z-10"
                      >
                        <div className="relative bg-[#FFD700] px-3 py-1.5 md:px-4 md:py-2 rounded-2xl shadow-lg">
                          <p className="text-[#D22727] font-black text-[11px] md:text-[14px] whitespace-nowrap">
                            지금 상담접수 시 10% 할인
                          </p>
                          <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[26px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#FFD700]" />
                        </div>
                      </motion.div>

                      {/* 연락처 + 버튼 */}
                      <div className="flex items-center justify-center md:justify-start gap-2 md:gap-5">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <input
                            type="text"
                            value={phone1}
                            readOnly
                            className="w-[52px] md:w-[65px] h-[42px] md:h-[48px] border-2 border-[#e5e5e5] rounded-lg text-center text-[13px] md:text-[15px] font-medium bg-[#f8f8f8] text-[#999]"
                          />
                          <span className="text-[#999] text-[14px] md:text-[16px]">-</span>
                          <input
                            type="tel"
                            value={phone2}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length <= 4) {
                                setPhone2(value);
                                if (value.length === 4) {
                                  phone3Ref.current?.focus();
                                }
                              }
                            }}
                            placeholder="0000"
                            maxLength={4}
                            disabled={isSubmitting}
                            className="w-[62px] md:w-[80px] h-[42px] md:h-[48px] border-2 border-[#e5e5e5] focus:border-[#D22727] rounded-lg text-center text-[13px] md:text-[15px] font-medium outline-none transition-colors disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                          />
                          <span className="text-[#999] text-[14px] md:text-[16px]">-</span>
                          <input
                            ref={phone3Ref}
                            type="tel"
                            value={phone3}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length <= 4) setPhone3(value);
                            }}
                            placeholder="0000"
                            maxLength={4}
                            disabled={isSubmitting}
                            className="w-[62px] md:w-[80px] h-[42px] md:h-[48px] border-2 border-[#e5e5e5] focus:border-[#D22727] rounded-lg text-center text-[13px] md:text-[15px] font-medium outline-none transition-colors disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-[42px] md:h-[48px] px-4 md:px-8 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[13px] md:text-[15px] rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:bg-[#999] disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "전송중..." : "상담신청"}
                        </button>
                      </div>

                      {/* 개인정보 동의 */}
                      <label className="flex items-center gap-2 cursor-pointer justify-center md:justify-start">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          disabled={isSubmitting}
                          className="w-4 h-4 cursor-pointer accent-[#D22727] disabled:cursor-not-allowed"
                        />
                        <span className="text-[11px] md:text-[13px] text-[#666]">
                          상담을 위한 연락처 수집에 동의합니다.{" "}
                          <button
                            type="button"
                            onClick={handleViewPrivacy}
                            className="text-[#D22727] underline hover:text-[#b02020] transition-colors cursor-pointer font-medium"
                          >
                            [내용보기]
                          </button>
                        </span>
                      </label>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacy(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Privacy Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[#e5e5e5] p-6 flex items-center justify-between">
                <h3 className="text-[20px] font-bold text-[#333]">
                  개인정보처리방침
                </h3>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="w-9 h-9 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="개인정보처리방침 닫기"
                >
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6 text-[14px] leading-[1.8] text-[#666]">
                  <section>
                    <h4 className="font-bold text-[#333] mb-2">1. 수집하는 개인정보 항목</h4>
                    <p>회사는 상담 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
                    <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                      <li>필수항목: 연락처(휴대전화번호)</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">2. 개인정보의 수집 및 이용목적</h4>
                    <p>수집한 개인정보는 다음의 목적으로 이용됩니다:</p>
                    <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                      <li>창호 교체 상담 서비스 제공</li>
                      <li>견적 안내 및 시공 일정 협의</li>
                      <li>고객 문의 응대 및 사후관리</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">3. 개인정보의 보유 및 이용기간</h4>
                    <p>
                      회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                      단, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                      <li>상담 신청 정보: 상담 완료 후 3개월</li>
                      <li>계약 정보: 계약 종료 후 5년 (전자상거래법)</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">4. 개인정보의 제3자 제공</h4>
                    <p>
                      회사는 고객의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
                      다만, 아래의 경우에는 예외로 합니다:
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                      <li>고객이 사전에 동의한 경우</li>
                      <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">5. 개인정보 처리의 위탁</h4>
                    <p>
                      회사는 서비스 향상을 위해 개인정보를 외부 전문업체에 위탁할 수 있으며,
                      위탁 시 관련 법령에 따라 안전하게 관리됩니다.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">6. 정보주체의 권리·의무 및 행사방법</h4>
                    <p>
                      고객은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정, 삭제, 처리정지를 요청할 수 있습니다.
                      개인정보 보호 관련 문의는 고객센터를 통해 가능합니다.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">7. 개인정보 자동 수집 장치의 설치·운영 및 거부</h4>
                    <p>
                      회사는 쿠키 등 인터넷 서비스 이용 시 자동 생성되는 개인정보를 수집하는 장치를 운영하지 않습니다.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">8. 개인정보 보호책임자</h4>
                    <p>
                      회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
                      피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                    </p>
                    <div className="mt-3 p-4 bg-[#f8f8f8] rounded-lg">
                      <p className="font-medium text-[#333]">개인정보 보호책임자</p>
                      <p className="mt-1">고객센터를 통해 문의하실 수 있습니다.</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-bold text-[#333] mb-2">9. 개인정보 처리방침 변경</h4>
                    <p>
                      이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
                      변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                    </p>
                  </section>

                  <section className="pt-4 border-t border-[#e5e5e5]">
                    <p className="text-[#999] text-[13px]">
                      공고일자: 2024년 1월 1일<br />
                      시행일자: 2024년 1월 1일
                    </p>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlert(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Alert Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-sm"
            >
              {/* Content */}
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center">
                    <span className="text-[28px]">
                      {alertMessage.includes("완료") ? "✓" : "!"}
                    </span>
                  </div>
                </div>
                <p className="text-[16px] text-[#333] font-medium leading-[1.6]">
                  {alertMessage}
                </p>
              </div>

              {/* Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowAlert(false)}
                  className="w-full h-[48px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-lg transition-colors cursor-pointer"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}