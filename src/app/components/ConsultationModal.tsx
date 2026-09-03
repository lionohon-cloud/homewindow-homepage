import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitLead } from "@/lib/submitLead";
import { useConsultDetail } from "@/lib/useConsultDetail";
import { ConsultRegionFieldModal } from "./ConsultRegionFieldModal";
import { HoneypotField } from "@/lib/HoneypotField";
import { useVisualViewport } from "@/lib/useVisualViewport";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "top" | "bottom";
  /** 어느 버튼으로 열었는지 — ERP entryForm 에 붙어 유입 경로가 구분된다 */
  entry?: string;
  /** 접수 출처 접두. 시트 D열의 "<출처> <기기> <위치>" 중 출처.
      기본값이 원본과 같아 메인 동작은 그대로다. */
  entrySource?: string;
}

/**
 * 화면에 보이는 입력칸에 포커스한다.
 *
 * PC 바와 모바일 팝업이 같은 파일에 둘 다 마운트돼 있고, 화면 크기로만 한쪽을 숨긴다
 * (hidden md:block / md:hidden). 그래서 ref 하나를 둘이 공유하면 나중에 마운트된
 * 쪽이 ref 를 차지하고, 반대쪽에서 focus() 를 불러도 display:none 인 칸으로 가
 * 아무 일도 일어나지 않는다. 셀렉터로 찾아 offsetParent 로 보이는 쪽을 고른다.
 */
function focusVisible(selector: string) {
  const els = document.querySelectorAll<HTMLInputElement>(selector);
  [...els].find((el) => el.offsetParent !== null)?.focus();
}

export function ConsultationModal({
  isOpen,
  onClose,
  variant = "bottom",
  entry,
  entrySource = "홈페이지",
}: ConsultationModalProps) {
  const navigate = useNavigate();

  /* 위에서 내려오는 접수 바는 GNB 와 같이 움직여야 한다.
     GNB 는 아래로 스크롤하면 숨고 위로 올리면 다시 나오는데, 이 바만 그대로
     붙어 있으면 화면을 계속 가린다. GNB 와 같은 규칙(아래로 + 100px 이상)을 쓴다. */
  /* 키패드가 가리지 않도록 실제 보이는 영역을 잡는다 */
  const visible = useVisualViewport(isOpen);

  /* 열리자마자 연락처 칸에 커서를 둔다 — 칸을 한 번 더 누르는 동작이 준다.
     PC 바와 모바일 카드가 둘 다 DOM 에 있으므로 화면에 보이는 쪽을 골라야 한다.
     iOS 사파리는 사용자 제스처 밖의 focus() 로는 키패드를 안 올려 줄 수 있다
     (그 경우 커서만 놓이고 키패드는 탭해야 뜬다). 안드로이드는 대체로 올라온다. */
  /* 그려지기 직전(useLayoutEffect)에 포커스한다. 타이머로 미루면 그만큼
     키패드가 늦게 올라와 한 박자 느리게 느껴진다. 모바일 카드는 등장
     애니메이션이 없어 기다릴 이유도 없다. */
  useLayoutEffect(() => {
    if (!isOpen) return;
    const els = document.querySelectorAll<HTMLInputElement>("[data-consult-phone2]");
    const shown = [...els].find((el) => el.offsetParent !== null);
    shown?.focus();
  }, [isOpen]);

  const [scrolledAway, setScrolledAway] = useState(false);
  useEffect(() => {
    if (!isOpen || variant !== "top") return;
    setScrolledAway(false); // 열 때는 항상 보이게
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolledAway(y > lastY && y > 100);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen, variant]);

  const [phone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phone3Ref = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  // W2 2단계 접수 팝업
  // 시군구 개편 (2026-07-10): 4폼 복붙 제거 — 공용 훅.
  const detail = useConsultDetail();

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
      const { ok, docId } = await submitLead({
        phone: phoneNumber,
        entryForm: `${entrySource} ${device} 상담모달${entry ? `-${entry}` : ""}`,
        honeypot: honeypotRef.current?.value,
      });

      if (ok) {
        setPhone2("");
        setPhone3("");
        onClose();
        // 접수 확정 직후 2단계 팝업(지역·분야). docId 없으면 Call2 불가 → 기존 흐름.
        if (docId) {
          detail.open(docId);
        } else {
          navigate('/thanks');
        }
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

  /* BottomBar 모바일 팝업과 같은 입력칸 스타일 */
  const popupInput =
    "h-[52px] border-2 border-[#e0e0e0] rounded-xl text-center text-[16px] font-semibold text-[#2A2A2A] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]";

  return (
    <>
      {/* Consultation Bar (PC) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: variant === "top" ? "-100%" : "100%" }}
            animate={{ y: variant === "top" && scrolledAway ? "-100%" : 0 }}
            exit={{ y: variant === "top" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            /* 위에서 내려오는 바는 PC 전용. 모바일은 아래의 카드 팝업으로 뜬다.

               top 변형은 상자를 top-0 에 두고 GNB 높이만큼 padding 으로 밀어 내린다.
               예전처럼 top-[61px] 로 내려놓으면 숨길 때 y:-100% 가 "자기 높이"만큼만
               올려서 그 61px 이 화면에 그대로 남는다(실측 확인). 패딩까지 상자 높이에
               포함시키면 한 번에 다 빠져나간다.
               패딩 영역은 GNB 자리라 비어 있어야 하므로 배경·클릭은 안쪽에만 준다. */
            className={`hidden md:block fixed left-0 right-0 z-40 ${
              variant === "top"
                ? "top-0 pt-[61px] min-[1550px]:pt-[71px] pointer-events-none"
                : "bottom-[70px] md:bottom-[80px] bg-white shadow-lg shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
            }`}
          >
            <div
              className={`relative w-full ${
                variant === "top"
                  ? "pointer-events-auto bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  : ""
              }`}
            >
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
                    <HoneypotField ref={honeypotRef} />
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
                            data-consult-phone2
                            type="tel"
                            value={phone2}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length <= 4) {
                                setPhone2(value);
                                if (value.length === 4) {
                                  focusVisible("[data-consult-phone3]");
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
                            data-consult-phone3
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
                          {isSubmitting ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>전송 중...</span>
                            </span>
                          ) : "상담신청"}
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
                          상담을 위한 연락처·지역·상담분야 수집에 동의합니다.{" "}
                          <button
                            type="button"
                            onClick={handleViewPrivacy}
                            className="text-[length:inherit] text-[#D22727] underline hover:text-[#b02020] transition-colors cursor-pointer font-medium"
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

      {/* ════ 모바일 팝업 — 하단 CTA 버튼 눌렀을 때와 같은 카드 형태 ════
          위에서 내려오는 바는 좁은 화면에서 화면을 가로로 다 먹어 읽기 나쁘다.
          BottomBar 의 모바일 팝업과 같은 마크업을 쓴다. */}
      {isOpen && (
        <div
          className="md:hidden fixed left-0 right-0 z-[100] bg-black/60 flex items-start justify-center px-0 pb-6 overflow-y-auto"
          /* 키패드가 뜨면 보이는 영역만큼만 차지해 카드가 그 안에서 가운데로 온다.
             visualViewport 를 못 쓰는 환경에서는 예전처럼 화면 전체를 덮는다. */
          style={
            visible
              ? { top: visible.top, height: visible.height, paddingTop: visible.height * 0.1 }
              : { top: 0, bottom: 0, paddingTop: "10vh" }
          }
          onClick={onClose}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl mx-auto w-[92%] max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={onClose}
                className="w-8 h-8 bg-[#f5f5f5] rounded-full flex items-center justify-center shrink-0 ml-2 mt-0.5 cursor-pointer"
                aria-label="닫기"
              >
                <X size={15} className="text-[#666]" />
              </button>
            </div>

            <div className="h-px bg-[#f0f0f0] mx-5" />

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              <HoneypotField ref={honeypotRef} />
              <div>
                <p className="text-[11px] text-[#999] font-medium uppercase tracking-[0.05em] mb-1.5">
                  연락처
                </p>
                {/* 칸 폭을 고정하지 않고 남는 폭을 나눠 갖게 한다 — 카드 좌우 여백선까지 꽉 찬다 */}
                <div className="flex items-center gap-1.5 w-full">
                  {/* 국번은 이 폼에서 010 고정이다(기존 동작 유지) */}
                  <input type="text" value={phone1} readOnly className={`w-0 flex-1 min-w-0 ${popupInput}`} />
                  <span className="text-[#bbb] text-[18px] font-light">—</span>
                  <input
                    data-consult-phone2
                    type="tel"
                    value={phone2}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length <= 4) {
                        setPhone2(v);
                        if (v.length === 4) focusVisible("[data-consult-phone3]");
                      }
                    }}
                    placeholder="0000"
                    maxLength={4}
                    disabled={isSubmitting}
                    className={`w-0 flex-1 min-w-0 ${popupInput}`}
                  />
                  <span className="text-[#bbb] text-[18px] font-light">—</span>
                  <input
                    ref={phone3Ref}
                    data-consult-phone3
                    type="tel"
                    value={phone3}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length <= 4) setPhone3(v);
                    }}
                    placeholder="0000"
                    maxLength={4}
                    disabled={isSubmitting}
                    className={`w-0 flex-1 min-w-0 ${popupInput}`}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 cursor-pointer accent-[#D22727] mt-0.5 shrink-0"
                />
                <span className="text-[12px] text-[#666] leading-relaxed">
                  상담을 위한 연락처·지역·상담분야 수집에 동의합니다.{" "}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleViewPrivacy(); }}
                    className="text-[length:inherit] text-[#D22727] underline cursor-pointer font-medium"
                  >
                    [내용보기]
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>전송 중...</span>
                  </span>
                ) : "무료 상담 신청하기"}
              </button>
            </form>
          </div>
        </div>
      )}

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
                      <li>필수항목: 연락처(휴대전화번호), 상담 지역, 상담분야</li>
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

      {/* W2 2단계 접수 팝업 (지역 → 상담분야) */}
      <ConsultRegionFieldModal
        isOpen={detail.isOpen}
        onComplete={detail.onComplete}
        onSkip={detail.onSkip}
        onClose={detail.onClose}
      />
    </>
  );
}