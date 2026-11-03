import { useEffect, useState } from "react";
import { Home, MessageCircleQuestion } from "lucide-react";
import {
  DialogClose,
  dialogBackdrop,
  dialogBody,
  dialogCard,
  dialogDesc,
  dialogDivider,
  dialogHeader,
  dialogTitle,
} from "./ConsultAlert";
import { onConsultTypeRequest, type ConsultType, type ConsultTypeRequest } from "@/lib/consultType";

/**
 * 상담 방법 팝업 (2026-11 추가). main.tsx 에 한 번만 붙는다.
 * 어느 폼에서 접수하든 submitLead() → 번호 인증 → requestConsultType() 으로 이 팝업이 뜬다.
 * 문구는 견적 퍼널(public/request)의 상담 방법 창과 같게 맞춘다.
 */
// main.tsx 에서 App 바깥에 붙어 App 의 Pretendard 지정을 물려받지 못한다 — 폰트를 직접 준다.
export function ConsultTypeHost() {
  const [req, setReq] = useState<ConsultTypeRequest | null>(null);
  useEffect(() => onConsultTypeRequest(setReq), []);
  return req ? <ConsultTypeDialog req={req} /> : null;
}

const OPTIONS: { type: Exclude<ConsultType, "">; Icon: typeof Home; title: string; desc: string[] }[] = [
  {
    type: "방문상담",
    Icon: Home,
    title: "집에 와서 직접 봐주세요",
    desc: ["무료 방문 실측으로", "현장에서 정확한 견적을 알려드려요"],
  },
  {
    type: "일반상담",
    Icon: MessageCircleQuestion,
    title: "궁금한 것부터 물어볼게요",
    desc: ["샷시교체가 처음이라", "먼저 시공 방법이나 상담이 필요해요"],
  },
];

function ConsultTypeDialog({ req }: { req: ConsultTypeRequest }) {
  // 고르지 않고 앱을 전환·창을 닫으면 상담 방법 없이 바로 접수를 이어 간다 (리드 보존)
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") req.resolve("");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [req]);

  const skip = () => req.resolve("");

  return (
    <div className="fixed inset-0 z-[140] font-['Pretendard',sans-serif] flex items-start md:items-center justify-center pt-[10vh] md:pt-0 pb-6 overflow-y-auto">
      <div className={dialogBackdrop} onClick={skip} />
      <div role="dialog" aria-modal="true" aria-labelledby="consult-type-title" className={dialogCard}>
        <div className={dialogHeader}>
          <div>
            <h2 id="consult-type-title" className={`${dialogTitle} !font-bold`}>
              상담 방법을 선택해 주세요
            </h2>
            <p className={`${dialogDesc} !mt-2 leading-[1.6]`}>정확한 견적은 방문이 필요해요.</p>
          </div>
          <DialogClose onClick={skip} />
        </div>
        <div className={dialogDivider} />
        <div className={dialogBody}>
          {OPTIONS.map(({ type, Icon, title, desc }) => (
            <button
              key={type}
              type="button"
              onClick={() => req.resolve(type)}
              className="w-full flex items-center gap-3.5 p-4 text-left bg-white border-2 border-[#e0e0e0] rounded-xl cursor-pointer transition-colors hover:border-[#D22727] active:bg-[#FDF0F0] active:border-[#D22727]"
            >
              <span className="w-11 h-11 shrink-0 rounded-xl bg-[#FDF0F0] flex items-center justify-center">
                <Icon size={22} strokeWidth={1.8} className="text-[#D22727]" aria-hidden />
              </span>
              <span className="min-w-0">
                <b className="block text-[16px] font-bold text-[#2A2A2A] leading-[1.4]">{title}</b>
                <small className="block mt-1 text-[12.5px] font-medium text-[#888] leading-[1.6] break-keep">
                  {desc[0]}
                  <br />
                  {desc[1]}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
