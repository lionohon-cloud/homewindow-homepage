import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { ConsultRegionMap, type RegionSelection } from "./ConsultRegionMap";
import { TERRITORY_LABELS } from "@/lib/regionMap/territoryMapping";

/**
 * 상담배정 제도 — W2 2단계 접수 팝업 (시군구 개편 2026-07-10).
 *
 * Step 1: 지도 시군구 선택 (구 9권역 버튼 → 지도 드릴다운 + 검색). 값 = TERRITORY 4자리 코드.
 * Step 2: 상담분야 3개 (구 5개 → 창호 견적 문의 / 그린리모델링 및 무이자 문의 / 직접입력).
 *          직접입력은 자유 텍스트(consultFieldText, 코드는 ETC) 동반.
 *
 * 코드값은 ERP 와 공유(ERP 는 과도기에 9권역·시군구 양쪽 수용). 라벨은 화면·시트 가독용.
 * - 완료 → onComplete({ region, consultField, consultFieldText? })
 * - 이탈(X/바깥 클릭/잘 모르겠어요) → onSkip (접수는 유지, 미지정)
 */

/** 구 9권역 (과거 데이터 라벨 폴백용 — 신규 전송은 시군구 코드) */
export const CONSULT_REGIONS: readonly { code: string; label: string }[] = [
  { code: "SEOUL_GYEONGGI_N", label: "서울, 경기북부" },
  { code: "SEOUL_GYEONGGI_S", label: "경기남부" },
  { code: "INCHEON", label: "인천" },
  { code: "GYEONGNAM", label: "경남" },
  { code: "CHUNGCHEONG", label: "충청·대전·세종" },
  { code: "GYEONGBUK", label: "경북" },
  { code: "GANGWON", label: "강원" },
  { code: "JEOLLA", label: "전라" },
  { code: "JEJU", label: "제주" },
] as const;

/** 상담분야 — 5개 → 3개 (사장님 확정 2026-07-10). 코드는 기존 FIELD_CODES 재사용(ERP 무변경). */
export const CONSULT_FIELDS: readonly { code: string; label: string }[] = [
  { code: "WINDOW_QUOTE", label: "창호 견적 문의" },
  { code: "SAFETY_SCREEN", label: "방충망 상담" },
  { code: "GREEN_REMODEL", label: "그린리모델링 및 무이자 문의" },
  { code: "ETC", label: "직접입력" },
] as const;

/** 구 5분야 라벨 (과거 데이터 표시 폴백) */
const LEGACY_FIELD_LABELS: Record<string, string> = {
  WINDOW_QUOTE: "창호 견적",
  WINDOW_REPLACE: "창호 교체 상담",
  SAFETY_SCREEN: "안전/방범 방충망 상담",
  GREEN_REMODEL: "그린리모델링 또는 장기무이자할부 상담",
  ETC: "기타",
};

/** 지역 라벨 — 시군구(TERRITORY 4자리)·구 9권역 겸용. */
export function regionLabel(code: string): string {
  if (/^\d{4}$/.test(code)) return TERRITORY_LABELS[code] ?? "";
  return CONSULT_REGIONS.find((r) => r.code === code)?.label ?? "";
}

export function consultFieldLabel(code: string): string {
  return (
    CONSULT_FIELDS.find((f) => f.code === code)?.label ??
    LEGACY_FIELD_LABELS[code] ??
    ""
  );
}

export interface ConsultDetailResult {
  region: string;
  consultField: string;
  /** 「직접입력」 자유 텍스트 (consultField='ETC' 일 때) */
  consultFieldText?: string;
}

interface ConsultRegionFieldModalProps {
  isOpen: boolean;
  onComplete: (result: ConsultDetailResult) => void;
  onSkip: () => void;
  /** X·바깥 클릭 — 모달만 닫기 (사장님 지시 2026-07-10). 미지정 시 기존처럼 onSkip. */
  onClose?: () => void;
  /** 분야가 이미 정해진 진입(AI상담 분기) — 2단계(분야 선택) 생략, 지역 선택 즉시 완료. */
  fixedConsultField?: string;
}

export function ConsultRegionFieldModal({
  isOpen,
  onComplete,
  onSkip,
  onClose,
  fixedConsultField,
}: ConsultRegionFieldModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [region, setRegion] = useState<string>("");
  const [regionName, setRegionName] = useState<string>("");
  const [directMode, setDirectMode] = useState(false);
  const [directText, setDirectText] = useState("");
  const [meshConfirmMode, setMeshConfirmMode] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setRegion("");
    setRegionName("");
    setDirectMode(false);
    setDirectText("");
    setMeshConfirmMode(false);
  };

  const handleRegionSelect = (sel: RegionSelection) => {
    // 방충망 확정 진입(AI상담 「방충망 문의」) — 지역 선택 후 방충망 재확인 1스텝 필수.
    //   제휴 자동발송은 되돌리기 불가 → 「방충망만/창호도 같이/괜찮아요」 재확인을 반드시 거친다.
    //   step 을 2로 올려야 지도(step===1) 대신 재확인 화면이 렌더된다.
    if (fixedConsultField === "SAFETY_SCREEN") {
      setRegion(sel.territoryCode);
      setRegionName(sel.label);
      setMeshConfirmMode(true);
      setStep(2);
      return;
    }
    // 그 외 AI상담 진입 — 분야는 챗에서 이미 확정 → 지역만 찍으면 바로 접수 (2단계 생략).
    if (fixedConsultField) {
      onComplete({ region: sel.territoryCode, consultField: fixedConsultField });
      reset();
      return;
    }
    setRegion(sel.territoryCode);
    setRegionName(sel.label);
    setStep(2);
  };

  const handleField = (code: string) => {
    if (code === "ETC") {
      setDirectMode(true);
      return;
    }
    // 방충망 = 재확인 1스텝 필수 (제휴 자동발송은 되돌리기 불가 → 마지막 방어선).
    if (code === "SAFETY_SCREEN") {
      setMeshConfirmMode(true);
      return;
    }
    onComplete({ region, consultField: code });
    reset();
  };

  const handleMeshOnly = () => {
    // 「네, 방충망만 할게요」 = 제휴 전문업체 이관 대상으로 접수.
    onComplete({ region, consultField: "SAFETY_SCREEN" });
    reset();
  };
  // 「아니오, 창호랑 같이」·「아니에요 괜찮아요」 = 재확인만 닫고 분야 선택 화면으로 복귀
  //   (setMeshConfirmMode(false) — 유도 없이 고객이 분야를 다시 고르게. 사장님 지시 260713).

  const handleDirectSubmit = () => {
    const text = directText.trim();
    onComplete({ region, consultField: "ETC", consultFieldText: text || undefined });
    reset();
  };

  const handleClose = () => {
    // X·바깥 클릭 = 모달만 닫기 (onClose 미지정 소비처는 기존 onSkip 폴백).
    reset();
    (onClose ?? onSkip)();
  };

  const handleSkip = () => {
    // 「잘 모르겠어요·건너뛰기」 = 지역 미지정으로 접수 마무리 (기존 동작 유지).
    reset();
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      {/* 모바일 = 전체화면 (사장님 지시 2026-07-10 — 지도 찍기 쉽게), sm 이상 = 기존 팝업 */}
      <div className="relative z-10 bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-[100dvh] sm:h-auto max-w-none sm:max-w-[560px] max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-[#e5e5e5] p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {(step === 2 || directMode || meshConfirmMode) && (
              <button
                type="button"
                onClick={() => {
                  if (meshConfirmMode) setMeshConfirmMode(false);
                  else if (directMode) setDirectMode(false);
                  else setStep(1);
                }}
                className="w-8 h-8 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="이전 단계"
              >
                <ArrowLeft className="w-4 h-4 text-[#666]" />
              </button>
            )}
            <h3 className="text-[17px] md:text-[18px] font-bold text-[#2A2A2A]">
              {step === 1
                ? "시공 지역을 선택해 주세요"
                : directMode
                  ? "어떤 내용이 궁금하세요?"
                  : meshConfirmMode
                    ? "방충망 상담 안내"
                    : "어떤 상담이 필요하세요?"}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-3 sm:p-5 overflow-y-auto">
          {step === 1 ? (
            <>
              <p className="text-[12.5px] text-[#999] -mt-1 mb-2.5">
                지도에서 지역을 누르면 상세 지역이 나와요. 정확히 안 맞아도 괜찮아요!
              </p>
              <ConsultRegionMap onSelect={handleRegionSelect} />
              <button
                type="button"
                onClick={handleSkip}
                className="block mx-auto mt-2 text-[12.5px] text-[#bbb] underline cursor-pointer hover:text-[#999]"
              >
                잘 모르겠어요 · 건너뛰기
              </button>
            </>
          ) : directMode ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-[12.5px] text-[#999] -mt-1">
                편하게 적어주시면 담당자가 확인 후 연락드려요
              </p>
              <textarea
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="예: 베란다 창에 결로가 심해서 교체 상담 받고 싶어요"
                className="w-full border-[1.5px] border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#D22727] resize-none"
              />
              <button
                type="button"
                onClick={handleDirectSubmit}
                className="w-full h-[50px] bg-[#D22727] hover:bg-[#a01d1d] text-white text-[15px] font-extrabold rounded-xl cursor-pointer transition-colors"
              >
                이 내용으로 접수
              </button>
            </div>
          ) : meshConfirmMode ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-[13.5px] text-[#555] -mt-1 leading-relaxed whitespace-pre-line">
                {"청암홈윈도우는 창호(샷시) 전문 시공업체라, 방충망 단독 교체는 진행하지 않습니다.\n대신 전국에서 방충망을 전문으로 취급하는 제휴 전문업체에서 직접 연락드리도록 도와드리고 있어요.\n창호와 방충망을 함께 교체하실 거라면 저희가 방충망까지 한 번에 견적을 도와드립니다."}
              </p>
              <button
                type="button"
                onClick={handleMeshOnly}
                className="w-full min-h-[50px] px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-[14px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer"
              >
                네, 방충망만 할게요 (제휴사에서 연락 부탁드려요)
              </button>
              <button
                type="button"
                onClick={() => setMeshConfirmMode(false)}
                className="w-full min-h-[50px] px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-[14px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer"
              >
                아니오, 창호랑 같이 하고 싶어요
              </button>
              <button
                type="button"
                onClick={() => setMeshConfirmMode(false)}
                className="w-full min-h-[50px] px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-[14px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer"
              >
                아니에요 괜찮아요
              </button>
            </div>
          ) : (
            <>
              {regionName && (
                <p className="text-[12.5px] text-[#999] -mt-1 mb-2.5">
                  {regionName} 지역이시군요!
                </p>
              )}
              <div className="flex flex-col gap-2">
                {CONSULT_FIELDS.map((f) => (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => handleField(f.code)}
                    className="w-full min-h-[52px] px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-[14px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer text-left leading-snug"
                  >
                    {f.label}
                    {f.code === "ETC" && (
                      <span className="ml-2 text-[12px] font-medium text-[#999]">
                        원하시는 내용을 직접 적어주세요
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 하단 안내 문구 */}
        <div className="px-5 pb-5 pt-1 shrink-0">
          <p className="text-center text-[13px] text-[#D22727] font-bold">
            {step === 1 ? "거의 다 되었습니다." : "마지막 질문입니다"}
          </p>
        </div>
      </div>
    </div>
  );
}
