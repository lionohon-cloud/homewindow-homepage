import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { EstimateForm } from "./EstimateForm";
import { ConsultRegionFieldModal } from "./ConsultRegionFieldModal";
import { useConsultDetail } from "@/lib/useConsultDetail";
import { submitLead } from "@/lib/submitLead";

/**
 * AI상담 셸 — 하이브리드 챗봇 (시군구 개편 Phase E, 2026-07-10. 사장님 확정 구조).
 *
 * 흐름 원칙 (사장님 지시 2026-07-10):
 *  - 자유입력 분류 후 **자동 전환 금지** → "○○ 상담이시군요! 진행할까요? [네][다른 상담]"
 *    확인 칩을 눌러야 해당 분기로 넘어간다.
 *  - 분기:
 *    · window_estimate(창호 견적 가능) → 기존 매크로(EstimateForm)
 *    · window_consult(방충망·그린리모델링 등 견적 불가) → 지도(지역)+전화만 접수(견적 스킵)
 *    · as  → 간이 폼 → /api/as/create (asTickets, source='ai-chat')
 *    · inquiry → 간이 폼 → /api/inquiry (inquiryTickets)
 *  - 첫 화면 버튼은 사용자가 직접 고른 것이므로 즉시 진행(확인 불필요).
 */

type Branch = "menu" | "window" | "as" | "inquiry" | "consultPhone";
type Intent =
  | "window_estimate"
  | "window_consult_quote" // 메뉴 전용 (사장님 지시 2026-07-10): 창호 교체·견적 '상담' — 대화형 접수(연락처→지도)
  | "window_consult"
  | "as"
  | "inquiry";

interface Bubble {
  role: "bot" | "user";
  text: string;
}

const GREETING = "안녕하세요! 청암홈윈도우 AI 상담입니다 😊\n무엇을 도와드릴까요?";

const INTENT_LABEL: Record<Intent, string> = {
  window_estimate: "직접 견적 내보기",
  window_consult_quote: "창호 교체·견적 상담",
  window_consult: "그린리모델링 및 무이자 문의",
  as: "AS 접수",
  inquiry: "기타 문의",
};

export function AiConsultChat() {
  const navigate = useNavigate();
  const detail = useConsultDetail();
  const [branch, setBranch] = useState<Branch>("menu");
  const [bubbles, setBubbles] = useState<Bubble[]>([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  // 분류 후 사용자 확인 대기 (자동 전환 금지 — 사장님 지시)
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // AS 폼
  const [asName, setAsName] = useState("");
  const [asPhone, setAsPhone] = useState("");
  const [asAddress, setAsAddress] = useState("");
  const [asSymptom, setAsSymptom] = useState("");
  // 기타 폼
  const [inqName, setInqName] = useState("");
  const [inqPhone, setInqPhone] = useState("");
  const [inqRequest, setInqRequest] = useState("");
  // 창호 상담(견적 스킵) 전화 + 진입 경로 (ERP 문답 요약 구분용)
  const [consultPhone, setConsultPhone] = useState("");
  const [consultVia, setConsultVia] = useState<"window_consult_quote" | "window_consult">("window_consult");

  const scrollDown = () =>
    setTimeout(() => bodyRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 60);
  const push = (b: Bubble) => {
    setBubbles((prev) => [...prev, b]);
    scrollDown();
  };

  // 확정된 intent 로 실제 분기 진입 (확인 칩 클릭 또는 첫 화면 버튼).
  const enterIntent = (intent: Intent) => {
    setPendingIntent(null);
    if (intent === "window_estimate") setBranch("window");
    else if (intent === "window_consult_quote") {
      push({ role: "bot", text: "네! 창호 견적과 교체 상담은 현장 경험이 풍부한 전문 영업팀장님이 직접 봐드리는 것이 가장 정확해요.\n연락처와 시공 지역을 남겨주시면, 담당 영업팀장님이 최대한 빨리 전화드리도록 바로 접수해드릴게요." });
      setConsultVia("window_consult_quote");
      setBranch("consultPhone");
    } else if (intent === "window_consult") {
      push({ role: "bot", text: "네! 그린리모델링(창호 교체 지원 사업)과 무이자 할부 상담이시군요.\n지원 조건과 할부 혜택은 주택 상황에 따라 달라져서, 전문 영업팀장님이 직접 확인해드리는 것이 가장 정확해요.\n연락처와 시공 지역을 남겨주시면 담당 영업팀장님이 최대한 빨리 전화드릴게요." });
      setConsultVia("window_consult");
      setBranch("consultPhone");
    } else if (intent === "as") {
      push({ role: "bot", text: "AS 접수를 도와드릴게요. 아래 정보를 입력해 주세요!" });
      setBranch("as");
    } else if (intent === "inquiry") {
      push({ role: "bot", text: "기타 문의를 남겨주세요. (현금영수증, 일정 변경, 협력 제안 등 무엇이든 좋아요)" });
      setBranch("inquiry");
    }
  };

  // 첫 화면 버튼 — 창호 견적은 바로 문답으로 넘기지 않고 한 번 더 확인 (사장님 지시 2026-07-10),
  //   나머지(AS·기타·상담)는 즉시 진행.
  const chooseFromMenu = (intent: Intent) => {
    push({ role: "user", text: INTENT_LABEL[intent] });
    if (intent === "window_estimate") {
      push({ role: "bot", text: "직접 견적을 내보시는군요! 창 정보를 몇 가지 여쭤보고 예상 견적을 바로 보여드려요. 진행할까요?" });
      setPendingIntent("window_estimate");
      return;
    }
    setTimeout(() => enterIntent(intent), 200);
  };

  // 자유입력 → Claude 분류 → 확인 칩 표시 (자동 전환 안 함)
  const sendFree = async () => {
    const text = input.trim();
    if (!text || classifying) return;
    setInput("");
    push({ role: "user", text });

    // 확인 대기 중(칩 표시 상태)에 타이핑으로 답하면 재분류하지 말고 로컬로 처리
    //   (긍정 → 진행 / 부정 → 취소). Claude 재호출 반복 방지 (무한 "도와드릴까요?" 버그).
    if (pendingIntent) {
      // 긍정: 짧은 감탄사는 전체 일치("어" 단독은 OK, "어디서~" 질문은 제외),
      //        문장형은 진행 의사 단어 포함 여부로 판정.
      const yes =
        /^(응+|네+|넹+|넵|예|어|ㅇㅇ|오키|오케이|ok|okay|yes)[\s!.~요]*$/i.test(text) ||
        /(진행|해줘|해 줘|할게|할래|좋아|맞아|그래|부탁)/.test(text);
      const no = /(아니|아뇨|취소|다른 ?거|다른 ?상담|말고|됐어|안 ?할)/.test(text);
      const intent = pendingIntent;
      setPendingIntent(null);
      if (no) {
        push({ role: "bot", text: "알겠습니다! 어떤 상담이 필요하신지 아래에서 골라주세요." });
        setBranch("menu");
        return;
      }
      if (yes) {
        setTimeout(() => enterIntent(intent), 150);
        return;
      }
      // 애매하면 재분류로 진행 (아래로 폴스루)
    }
    setPendingIntent(null);
    setClassifying(true);
    // 응답이 늦거나 안 오면 '생각 중…'이 영원히 멈추지 않도록 12초 타임아웃 → 버튼 폴백.
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 12000);
    try {
      const history = [...bubbles, { role: "user" as const, text }].slice(-6).map((b) => ({
        role: b.role === "bot" ? "assistant" : "user",
        content: b.text,
      }));
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ac.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      const { intent, reply } = (await res.json()) as { intent: string; reply: string };
      // 창호 교체·견적 상담은 확인 없이 바로 상담 접수로 (사장님 지시 2026-07-10 —
      //   견적 미리보기는 원하는 사람만. enterIntent 가 전문 멘트를 출력하므로 reply 생략).
      if (intent === "window_consult_quote") {
        setTimeout(() => enterIntent("window_consult_quote"), 150);
        return;
      }
      push({ role: "bot", text: reply });
      // 확인 대기 — 사용자가 칩을 눌러야 진행 (바로 안 넘어감)
      if (["window_estimate", "window_consult", "as", "inquiry"].includes(intent)) {
        setPendingIntent(intent as Intent);
      }
    } catch {
      push({ role: "bot", text: "지금은 문장 이해가 어려워요 🙏 아래 버튼으로 선택해 주세요!" });
      setBranch("menu"); // 폴백 — 첫 화면 버튼 다시 노출
    } finally {
      clearTimeout(timer);
      setClassifying(false);
    }
  };

  // 창호 상담(견적 스킵): 전화 제출 → submitLead(창호 상담) → 지도 모달 → 접수
  const submitConsultPhone = async () => {
    if (submitting) return;
    // X 로 지도만 닫았다가 다시 여는 경우 — 이미 접수된 건 재사용 (중복 접수 방지).
    if (detail.leadDocId) {
      setSubmitting(true);
      detail.open(detail.leadDocId);
      return;
    }
    const phone = consultPhone.replace(/[^0-9]/g, "");
    if (phone.length < 9) {
      push({ role: "bot", text: "연락처를 정확히 입력해 주세요. 예) 010-1234-5678" });
      return;
    }
    setSubmitting(true);
    push({ role: "user", text: phone });
    try {
      const device = window.innerWidth >= 768 ? "PC" : "모바일";
      const { docId } = await submitLead({
        phone,
        entryForm: `AI채팅 ${device}`,
        honeypot: honeypotRef.current?.value,
        aiChat: {
          summary:
            consultVia === "window_consult_quote"
              ? "창호 교체·견적 상담 (전문 영업팀장 상담 연결)"
              : "그린리모델링/무이자 등 창호 상담 (견적 미산출)",
        },
        // 챗 분기에서 이미 확정된 분야 — 지도를 닫아도 ERP 배지에 남는다 (사장님 지시).
        consultField: consultVia === "window_consult" ? "GREEN_REMODEL" : "WINDOW_QUOTE",
      });
      if (docId) {
        detail.open(docId); // 지도(지역)+분야 팝업 → 접수 완료 시 /thanks
      } else {
        sessionStorage.setItem("hw_just_submitted", "1");
        navigate("/thanks");
      }
    } catch {
      push({ role: "bot", text: "접수 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
      setSubmitting(false);
    }
  };

  const submitAs = async () => {
    if (submitting) return;
    const phone = asPhone.replace(/[^0-9]/g, "");
    if (!asName.trim() || !asAddress.trim() || !asSymptom.trim()) {
      push({ role: "bot", text: "성함·연락처·주소·증상을 모두 입력해 주세요!" });
      return;
    }
    // AS 백엔드는 010 휴대폰 11자리만 수용 — 프론트에서 같은 기준으로 안내 (검증 불일치 수리).
    if (!/^010\d{8}$/.test(phone)) {
      push({ role: "bot", text: "연락처는 010으로 시작하는 휴대폰 번호 11자리로 입력해 주세요. 예) 010-1234-5678" });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("contractor_name", asName.trim());
      fd.set("phone", phone);
      fd.set("address", asAddress.trim());
      fd.set("description", asSymptom.trim());
      fd.set("source", "ai-chat");
      fd.set("hw_website", honeypotRef.current?.value ?? "");
      const res = await fetch("/api/as/create", { method: "POST", body: fd });
      if (!res.ok) throw new Error(String(res.status));
      sessionStorage.setItem("hw_just_submitted", "1");
      setDone("AS 접수가 완료되었습니다! 🔧\nAS 담당자가 최대한 빨리 연락드리겠습니다.");
    } catch {
      push({ role: "bot", text: "접수 중 오류가 발생했어요. 잠시 후 다시 시도하시거나 AS 접수 페이지를 이용해 주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  const submitInquiry = async () => {
    if (submitting) return;
    const phone = inqPhone.replace(/[^0-9]/g, "");
    if (!inqName.trim() || phone.length < 9 || !inqRequest.trim()) {
      push({ role: "bot", text: "성함·연락처·요청사항을 모두 입력해 주세요!" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: inqName.trim(),
          phone,
          request: inqRequest.trim(),
          honeypot: honeypotRef.current?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      sessionStorage.setItem("hw_just_submitted", "1");
      setDone("문의가 접수되었습니다! 📩\n담당자가 최대한 빨리 연락드리겠습니다.");
    } catch {
      push({ role: "bot", text: "접수 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  // 창호 견적 매크로 = 기존 EstimateForm 전체 화면 (수정 없음)
  if (branch === "window") {
    return <EstimateForm />;
  }

  const inputCls =
    "w-full border-[1.5px] border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#D22727]";
  const chipCls =
    "px-4 py-2 border-[1.5px] border-[#D22727] text-[#D22727] bg-white rounded-full text-[13.5px] font-bold hover:bg-[#fff8f8] cursor-pointer";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[#f7f7f5]">
      <input
        ref={honeypotRef}
        type="text"
        name="hw_website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2.5">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
              b.role === "bot"
                ? "bg-white border border-[#e8e8e8] self-start rounded-bl-md"
                : "bg-[#D22727] text-white self-end rounded-br-md"
            }`}
          >
            {b.text}
          </div>
        ))}
        {classifying && (
          <div className="self-start px-4 py-2.5 text-[13px] text-[#999]">생각 중…</div>
        )}

        {/* 분류 후 확인 칩 — 눌러야 진행 (자동 전환 안 함) */}
        {!done && pendingIntent && (
          <div className="flex flex-wrap gap-2 mt-1">
            <button type="button" className={chipCls} onClick={() => {
              push({ role: "user", text: "네, 진행할게요" });
              setTimeout(() => enterIntent(pendingIntent), 150);
            }}>
              네, 진행할게요
            </button>
            <button type="button" className={`${chipCls} border-[#ccc] text-[#666]`} onClick={() => {
              setPendingIntent(null);
              push({ role: "bot", text: "알겠습니다! 어떤 상담이 필요하신지 아래에서 골라주세요." });
            }}>
              다른 상담이에요
            </button>
          </div>
        )}

        {/* 완료 카드 */}
        {done && (
          <div className="self-start bg-white border-[1.5px] border-[#D22727] rounded-2xl px-5 py-4 max-w-[85%]">
            <p className="text-[14px] whitespace-pre-wrap">{done}</p>
            <button
              type="button"
              onClick={() => navigate("/thanks")}
              className="mt-3 w-full h-[44px] bg-[#D22727] hover:bg-[#a01d1d] text-white text-[14px] font-bold rounded-xl cursor-pointer transition-colors"
            >
              확인
            </button>
          </div>
        )}

        {/* 첫 화면 메뉴 버튼 (사용자 직접 선택 → 즉시 진행) */}
        {!done && !pendingIntent && branch === "menu" && (
          <div className="flex flex-wrap gap-2 mt-1">
            <button type="button" className={chipCls} onClick={() => chooseFromMenu("window_consult_quote")}>
              창호 교체·견적 상담
            </button>
            <button type="button" className={chipCls} onClick={() => chooseFromMenu("window_estimate")}>
              직접 견적 내보기
            </button>
            <button type="button" className={chipCls} onClick={() => chooseFromMenu("window_consult")}>
              그린리모델링 및 무이자 문의
            </button>
            <button type="button" className={chipCls} onClick={() => chooseFromMenu("as")}>
              AS 접수
            </button>
            <button type="button" className={chipCls} onClick={() => chooseFromMenu("inquiry")}>
              기타 문의
            </button>
          </div>
        )}

        {/* 창호 상담(견적 스킵) 전화 입력 */}
        {!done && branch === "consultPhone" && (
          <div className="self-start bg-white border border-[#e8e8e8] rounded-2xl p-4 w-full max-w-[420px] flex flex-col gap-2">
            <input className={inputCls} placeholder="연락처 (010-0000-0000)" inputMode="tel" value={consultPhone} onChange={(e) => setConsultPhone(e.target.value)} />
            <button type="button" onClick={submitConsultPhone} disabled={submitting}
              className="w-full h-[46px] bg-[#D22727] hover:bg-[#a01d1d] disabled:opacity-50 text-white text-[14.5px] font-extrabold rounded-xl cursor-pointer transition-colors">
              {submitting ? "접수 중…" : "다음 (지역 선택)"}
            </button>
          </div>
        )}

        {!done && branch === "as" && (
          <div className="self-start bg-white border border-[#e8e8e8] rounded-2xl p-4 w-full max-w-[420px] flex flex-col gap-2">
            <input className={inputCls} placeholder="성함" value={asName} onChange={(e) => setAsName(e.target.value)} />
            <input className={inputCls} placeholder="연락처 (010-0000-0000)" inputMode="tel" value={asPhone} onChange={(e) => setAsPhone(e.target.value)} />
            <input className={inputCls} placeholder="정확한 주소 (동·호수까지)" value={asAddress} onChange={(e) => setAsAddress(e.target.value)} />
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="증상 설명 (예: 거실 창 잠금장치 헐거움)" value={asSymptom} onChange={(e) => setAsSymptom(e.target.value)} />
            <button type="button" onClick={submitAs} disabled={submitting}
              className="w-full h-[46px] bg-[#D22727] hover:bg-[#a01d1d] disabled:opacity-50 text-white text-[14.5px] font-extrabold rounded-xl cursor-pointer transition-colors">
              {submitting ? "접수 중…" : "AS 접수하기"}
            </button>
          </div>
        )}

        {!done && branch === "inquiry" && (
          <div className="self-start bg-white border border-[#e8e8e8] rounded-2xl p-4 w-full max-w-[420px] flex flex-col gap-2">
            <input className={inputCls} placeholder="성함" value={inqName} onChange={(e) => setInqName(e.target.value)} />
            <input className={inputCls} placeholder="연락처 (010-0000-0000)" inputMode="tel" value={inqPhone} onChange={(e) => setInqPhone(e.target.value)} />
            <textarea className={`${inputCls} resize-none`} rows={4} placeholder="요청사항" value={inqRequest} onChange={(e) => setInqRequest(e.target.value)} />
            <button type="button" onClick={submitInquiry} disabled={submitting}
              className="w-full h-[46px] bg-[#D22727] hover:bg-[#a01d1d] disabled:opacity-50 text-white text-[14.5px] font-extrabold rounded-xl cursor-pointer transition-colors">
              {submitting ? "접수 중…" : "문의 접수하기"}
            </button>
          </div>
        )}
      </div>

      {/* 자유입력 — 첫 화면(menu)에서만. 분기 폼(as/inquiry/consultPhone) 진행 중엔 숨김
          (폼 위에 자유입력이 겹쳐 분류가 다시 도는 문제 방지 — 폼에 집중) */}
      {!done && branch === "menu" && (
        <div className="flex gap-2 p-3 md:p-4 border-t border-[#e5e5e5] bg-white shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) sendFree();
            }}
            placeholder="메시지를 입력하세요… (예: 창호교체 상담이요)"
            className="flex-1 h-[44px] border-[1.5px] border-[#e5e5e5] rounded-xl px-4 text-[14px] outline-none focus:border-[#D22727]"
          />
          <button type="button" onClick={sendFree} disabled={classifying}
            className="px-5 h-[44px] bg-[#D22727] hover:bg-[#a01d1d] disabled:opacity-50 text-white text-[14px] font-bold rounded-xl cursor-pointer transition-colors">
            전송
          </button>
        </div>
      )}
      {/* 폼 진행 중 이탈 경로 — 처음으로 돌아가기 */}
      {!done && branch !== "menu" && (
        <div className="p-3 border-t border-[#e5e5e5] bg-white shrink-0 text-center">
          <button type="button" onClick={() => { setBranch("menu"); setPendingIntent(null); }}
            className="text-[12.5px] text-[#999] underline hover:text-[#666] cursor-pointer">
            ← 처음으로 돌아가기
          </button>
        </div>
      )}

      {/* 창호 상담(견적 스킵) 지역 팝업 — AI상담은 분야가 이미 확정 → 분야 선택(2단계) 생략 */}
      <ConsultRegionFieldModal
        isOpen={detail.isOpen}
        onComplete={detail.onComplete}
        onSkip={detail.onSkip}
        fixedConsultField={consultVia === "window_consult" ? "GREEN_REMODEL" : "WINDOW_QUOTE"}
        onClose={() => {
          // X = 지도만 닫고 대화로 복귀 (접수는 유지 — 다시 열 수 있게 안내).
          detail.onClose();
          setSubmitting(false);
          push({ role: "bot", text: "지역 선택 창을 닫았어요. 연락처는 접수되어 있으니, [다음 (지역 선택)]을 누르면 지도를 다시 열 수 있어요." });
        }}
      />
    </div>
  );
}
