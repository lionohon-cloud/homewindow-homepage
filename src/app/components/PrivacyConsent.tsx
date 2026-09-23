/**
 * 260923 가맹전환 — 상담 접수 개인정보 동의 (공통)
 * 본사가 접수한 DB 를 지역 가맹점에 제공하고 가맹점이 계약 주체가 되므로,
 * "수집·이용" 과 "제3자 제공" 을 구분해서 동의받는다 (개인정보보호법 제22조).
 *
 * 폼 옆 좁은 자리에는 "모두 동의" 체크 하나만 두고,
 * [내용보기] 모달 안에서 항목별 체크박스로 따로 켜고 끌 수 있게 한다.
 * 폼의 agreed = 두 항목이 모두 체크된 상태.
 *
 * BottomBar · HeroConsultSection · ConsultationModal · EstimateForm · AiConsultChat 가 같이 쓴다.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";

/** 체크박스 옆 한 줄 문구 */
export const PRIVACY_CONSENT_LABEL = "개인정보 수집·이용 및 제3자 제공(필수)에 모두 동의합니다.";

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      className={`shrink-0 w-[22px] h-[22px] rounded-md flex items-center justify-center border-[1.5px] transition-colors ${
        checked ? "bg-[#D22727] border-[#D22727]" : "bg-white border-[#ccc]"
      }`}
    >
      {checked && <Check className="w-[15px] h-[15px] text-white" strokeWidth={3} />}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] md:grid-cols-[104px_1fr] gap-2 py-2 border-t border-[#eee] first:border-t-0">
      <dt className="text-[#999]">{label}</dt>
      <dd className="text-[#444] break-keep">{value}</dd>
    </div>
  );
}

function Item({
  checked,
  onToggle,
  title,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="shrink-0 rounded-xl border border-[#e8e8e8] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#fafafa] hover:bg-[#f4f4f4] text-left cursor-pointer transition-colors"
      >
        <Box checked={checked} />
        <span className="flex-1 text-[15px] font-bold text-[#333]">
          <span className="text-[#D22727]">[필수]</span> {title}
        </span>
      </button>
      <dl className="px-4 py-2 text-[13px] leading-[1.6]">{children}</dl>
    </section>
  );
}

export function PrivacyConsentModal({
  open,
  onClose,
  agreed,
  onAgreeChange,
  zIndex = "z-[120]",
  items = "휴대전화번호, 상담 지역, 상담분야, 상담 중 남기신 내용(예: 단지명·창 종류)",
  purpose = "상담 신청 접수, 견적 안내, 상담 진행을 위한 연락",
}: {
  open: boolean;
  onClose: () => void;
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
  zIndex?: string;
  /** 수집·제공 항목 (AI 상담의 AS·기타 문의처럼 받는 항목이 다른 폼에서 바꿔 쓴다) */
  items?: string;
  purpose?: string;
}) {
  useScrollLock(open);
  const [collect, setCollect] = useState(agreed);
  const [provide, setProvide] = useState(agreed);

  // 열 때마다 폼의 "모두 동의" 상태에서 시작
  useEffect(() => {
    if (open) {
      setCollect(agreed);
      setProvide(agreed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (c: boolean, p: boolean) => {
    setCollect(c);
    setProvide(p);
    onAgreeChange(c && p);
  };
  const all = collect && provide;

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="개인정보 수집·이용 및 제공 동의"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#eee] shrink-0">
          <h3 className="text-[18px] md:text-[19px] font-bold text-[#222]">개인정보 수집·이용 및 제공 동의</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>

        <div className="px-5 md:px-6 py-5 overflow-y-auto flex flex-col gap-3 text-[#666]">
          <button
            type="button"
            onClick={() => set(!all, !all)}
            className="shrink-0 w-full flex items-center gap-3 px-4 py-4 rounded-xl border-[1.5px] border-[#f3caca] bg-[#fff7f7] text-left cursor-pointer"
          >
            <Box checked={all} />
            <span className="text-[16px] font-bold text-[#222]">필수 항목에 모두 동의합니다</span>
          </button>

          <Item checked={collect} onToggle={() => set(!collect, provide)} title="개인정보 수집·이용 동의">
            <Row label="수집 항목" value={items} />
            <Row label="이용 목적" value={purpose} />
            <Row label="보유·이용기간" value="서비스 종료 시까지 (삭제를 요청하시면 지체 없이 파기)" />
          </Item>

          <Item checked={provide} onToggle={() => set(collect, !provide)} title="개인정보 제3자 제공 동의">
            <Row
              label="제공받는 자"
              value="고객님이 선택하신 지역을 담당하는 청암홈윈도우 가맹점 (방충망 단독 상담은 회사와 제휴한 방충망 전문업체)"
            />
            <Row label="제공 목적" value="방문 상담·실측·견적, 계약 체결, 시공 및 A/S 진행" />
            <Row label="제공 항목" value={items} />
            <Row label="보유·이용기간" value="서비스 종료 시까지 (삭제를 요청하시면 지체 없이 파기)" />
          </Item>

          <p className="shrink-0 text-[12.5px] leading-[1.7] text-[#999] break-keep px-1">
            가맹점은 회사와 별개의 사업자이며, 계약·시공·A/S는 제공받은 가맹점이 직접 진행합니다. 위 동의를 거부하실 수
            있으나, 거부하시면 상담 신청이 접수되지 않습니다. 개인정보 열람·정정·삭제·처리정지는 회사 고객센터로 요청하실 수
            있습니다.{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="text-[#D22727] underline font-medium">
              개인정보처리방침 전체 보기
            </a>
          </p>
        </div>

        <div className="px-5 md:px-6 py-4 border-t border-[#eee] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[50px] rounded-xl bg-[#D22727] hover:bg-[#b02020] text-white text-[16px] font-bold cursor-pointer transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
