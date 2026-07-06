import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";

/**
 * 상담배정 제도 — W2 2단계 접수 팝업.
 * 전화번호 제출(접수 확정) 직후 지역·상담분야를 추가로 받는다.
 *
 * 코드값은 ERP 와 공유(정확히 이대로 유지). 라벨은 화면·시트 가독용.
 * - 완료(2단계 선택) → onComplete({ region, consultField })
 * - 이탈(X/바깥 클릭) → onSkip (접수는 유지, 미지정)
 */

export const CONSULT_REGIONS: readonly { code: string; label: string }[] = [
  { code: "SEOUL_GYEONGGI_N", label: "서울·경기(한강 이북)" },
  { code: "SEOUL_GYEONGGI_S", label: "서울·경기(한강 이남)" },
  { code: "INCHEON", label: "인천" },
  { code: "GYEONGNAM", label: "경남" },
  { code: "CHUNGCHEONG", label: "충청·대전·세종" },
  { code: "GYEONGBUK", label: "경북" },
  { code: "GANGWON", label: "강원" },
  { code: "JEOLLA", label: "전라" },
  { code: "JEJU", label: "제주" },
] as const;

export const CONSULT_FIELDS: readonly { code: string; label: string }[] = [
  { code: "WINDOW_QUOTE", label: "창호 견적" },
  { code: "WINDOW_REPLACE", label: "창호 교체 상담" },
  { code: "SAFETY_SCREEN", label: "안전/방범 방충망 상담" },
  { code: "GREEN_REMODEL", label: "그린리모델링 또는 장기무이자할부 상담" },
  { code: "ETC", label: "기타" },
] as const;

export function regionLabel(code: string): string {
  return CONSULT_REGIONS.find((r) => r.code === code)?.label ?? "";
}

export function consultFieldLabel(code: string): string {
  return CONSULT_FIELDS.find((f) => f.code === code)?.label ?? "";
}

interface ConsultRegionFieldModalProps {
  isOpen: boolean;
  onComplete: (result: { region: string; consultField: string }) => void;
  onSkip: () => void;
}

export function ConsultRegionFieldModal({
  isOpen,
  onComplete,
  onSkip,
}: ConsultRegionFieldModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [region, setRegion] = useState<string>("");

  if (!isOpen) return null;

  const handleRegion = (code: string) => {
    setRegion(code);
    setStep(2);
  };

  const handleField = (code: string) => {
    onComplete({ region, consultField: code });
  };

  const handleClose = () => {
    // 이탈 시 다음 오픈을 위해 내부 상태 초기화
    setStep(1);
    setRegion("");
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-[#e5e5e5] p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-8 h-8 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="이전 단계"
              >
                <ArrowLeft className="w-4 h-4 text-[#666]" />
              </button>
            )}
            <h3 className="text-[17px] md:text-[18px] font-bold text-[#2A2A2A]">
              {step === 1 ? "상담 지역을 선택해 주세요" : "어떤 상담이 필요하세요?"}
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
        <div className="p-5 overflow-y-auto">
          {step === 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONSULT_REGIONS.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => handleRegion(r.code)}
                  className="h-[56px] px-2 border-2 border-[#e5e5e5] rounded-xl text-[13px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer leading-tight"
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {CONSULT_FIELDS.map((f) => (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => handleField(f.code)}
                  className="w-full min-h-[52px] px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-[14px] font-semibold text-[#2A2A2A] bg-white hover:border-[#D22727] hover:bg-[#fff8f8] transition-colors cursor-pointer text-left leading-snug"
                >
                  {f.label}
                </button>
              ))}
            </div>
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
