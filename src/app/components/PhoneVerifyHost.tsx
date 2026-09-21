import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import {
  DialogClose,
  dialogBackdrop,
  dialogBody,
  dialogCard,
  dialogDesc,
  dialogDivider,
  dialogHeader,
  dialogPrimaryBtn,
  dialogTitle,
} from "./ConsultAlert";
import {
  CODE_LENGTH,
  MAX_TRIES,
  VERIFY_TEST_MODE,
  checkCode,
  digits,
  normalizePhone,
  onFakeSms,
  onVerifyRequest,
  sendCode,
  updateVerifyPhone,
  type FakeSms,
  type VerifyRequest,
} from "@/lib/phoneVerify";
import { useVisualViewport } from "@/lib/useVisualViewport";

/**
 * 휴대폰 번호 인증 팝업 (260917 실험판). main.tsx 에 한 번만 붙는다.
 * 어느 폼에서 접수하든 submitLead() → requestPhoneVerification() 으로 이 팝업이 뜬다.
 *
 * 자동 채우기
 *   - 아이폰: autocomplete="one-time-code" → 키보드 위에 번호가 뜨고 한 번 누르면 들어간다.
 *   - 안드로이드 크롬: WebOTP(navigator.credentials.get) → "허용" 한 번이면 채워진다.
 *   - 인앱 브라우저(카톡·네이버·인스타) 등 안 되는 곳은 직접 친다 — 그래서 칸이 차면 바로 확인한다.
 *
 * 입력칸은 진짜 input 하나를 네 칸 그림 위에 투명하게 덮는다.
 * 칸을 네 개의 input 으로 나누면 자동 채우기가 첫 칸에만 들어가는 기기가 있다.
 */
// main.tsx 에서 App 바깥에 붙어 App 의 Pretendard 지정을 물려받지 못한다 — 팝업·알림에 폰트를 직접 준다.
export function PhoneVerifyHost() {
  const [req, setReq] = useState<VerifyRequest | null>(null);
  useEffect(() => onVerifyRequest(setReq), []);
  return (
    <>
      {req && <VerifyDialog key={req.phone} req={req} />}
      {VERIFY_TEST_MODE && <FakeSmsToast />}
    </>
  );
}

type Phase = "sending" | "input" | "checking" | "done";

/** 260921 — 전화번호 수정 칸 입력 중 자동 대시. 010-1234-5678 (숫자 11자리까지, 3-4-4) */
const formatPhoneInput = (raw: string) => {
  const d = digits(raw).slice(0, 11);
  if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
};

function VerifyDialog({ req }: { req: VerifyRequest }) {
  const [phase, setPhase] = useState<Phase>("sending");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(0);
  const [now, setNow] = useState(Date.now());
  // 260921 — "전화번호 수정" 인라인 편집. 확정하면 updateVerifyPhone() 이 phone 을 바꾸고,
  // 그 새 값이 key={req.phone} 라 이 다이얼로그 전체를 새로 마운트시켜 새 번호로 재발송한다.
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = useVisualViewport(true);

  const remain = Math.max(0, expiresAt - now);
  const expired = phase !== "sending" && expiresAt > 0 && remain === 0;
  const resendWait = Math.max(0, resendAt - now);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const send = async () => {
    setPhase("sending");
    setError("");
    setCode("");
    setLocked(false);
    const r = await sendCode(req.phone);
    if (r.ok) {
      setExpiresAt(r.expiresAt);
      setResendAt(Date.now() + 30_000);
    } else if (r.reason === "cooldown") {
      // 방금 보낸 번호가 아직 유효 — 새로 보내지 않고 남은 시간·재발송 대기만 이어 간다
      setExpiresAt(r.expiresAt);
      setResendAt(Date.now() + r.waitMs);
    } else {
      // 발송 실패·요청 과다 — 버튼이 "인증번호 다시 받기" 로 바뀐다
      setError(r.message);
      setLocked(true);
    }
    setPhase("input");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // 열리자마자 발송
  useEffect(() => {
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 안드로이드 크롬 자동 채우기 (WebOTP). 지원 안 하는 브라우저는 조용히 넘어간다.
  useEffect(() => {
    if (!("OTPCredential" in window)) return;
    const ac = new AbortController();
    (navigator.credentials as unknown as {
      get: (o: unknown) => Promise<{ code?: string } | null>;
    })
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((otp) => otp?.code && setCode(otp.code.slice(0, CODE_LENGTH)))
      .catch(() => {});
    return () => ac.abort();
  }, [expiresAt]);

  // 가짜 문자 알림을 누르면 채워 준다 (TEST_MODE — 아이폰 키보드 위 추천을 누르는 동작 흉내)
  useEffect(() => {
    const onFill = (e: Event) => setCode((e as CustomEvent<string>).detail);
    window.addEventListener("hw-fake-otp-fill", onFill);
    return () => window.removeEventListener("hw-fake-otp-fill", onFill);
  }, []);

  // 칸이 다 차면 바로 확인
  useEffect(() => {
    if (code.length !== CODE_LENGTH || phase !== "input" || locked) return;
    if (expired) {
      setError("시간이 지났어요. 인증번호를 다시 받아 주세요.");
      return;
    }
    let cancelled = false;
    setPhase("checking");
    void checkCode(req.phone, code).then(({ result, left }) => {
      if (cancelled) return;
      if (result === "ok") {
        setPhase("done");
        setTimeout(() => req.resolve(true), 800);
        return;
      }
      setPhase("input");
      setShake((s) => s + 1);
      setCode("");
      if (result === "wrong") setError(left != null ? `번호가 맞지 않아요 (${left}회 남음)` : "번호가 맞지 않아요");
      if (result === "error") setError("잠시 후 다시 시도해 주세요.");
      if (result === "expired") setError("시간이 지났어요. 인증번호를 다시 받아 주세요.");
      if (result === "locked") {
        setLocked(true);
        setError(`${MAX_TRIES}번 틀렸어요. 인증번호를 다시 받아 주세요.`);
      }
      requestAnimationFrame(() => inputRef.current?.focus());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const close = () => req.resolve(false);
  const mmss = `${Math.floor(remain / 60000)}:${String(Math.floor(remain / 1000) % 60).padStart(2, "0")}`;

  const needResend = locked || expired;

  return (
    <div
      className="fixed left-0 right-0 z-[140] font-['Pretendard',sans-serif] flex items-start md:items-center justify-center pb-6 overflow-y-auto"
      /* 상담 팝업과 같은 자리 — 보이는 영역 위에서 10% 내려온다. 키패드가 뜨면 그 안에서 다시 잡는다. */
      style={
        visible
          ? { top: visible.top, height: visible.height, paddingTop: visible.height * 0.1 }
          : { top: 0, bottom: 0, paddingTop: "10vh" }
      }
    >
      <div className={dialogBackdrop} onClick={close} />
      <div role="dialog" aria-modal="true" aria-labelledby="verify-title" className={dialogCard}>

        <div className={dialogHeader}>
          <div>
            <h2 id="verify-title" className={`${dialogTitle} !font-bold`}>
              {phase === "done" ? "확인되었어요" : "문자로 받은 인증번호를 입력해 주세요"}
            </h2>
            <p className={`${dialogDesc} !mt-2 leading-[1.6]`}>
              {phase === "done" ? (
                "상담 접수를 이어갈게요."
              ) : (
                <>
                  정확한 상담을 위해 본인확인이 필요해요.<br />
                  <b className="font-semibold text-[#555]">{normalizePhone(req.phone)}</b> 로 보냈어요.
                </>
              )}
            </p>
          </div>
          {phase !== "done" && <DialogClose onClick={close} />}
        </div>

        {phase !== "done" && editingPhone && (
          <>
            <div className={dialogDivider} />
            <div className={dialogBody}>
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(formatPhoneInput(e.target.value))}
                  placeholder="010-1234-5678"
                  aria-label="전화번호"
                  className="w-full h-[56px] px-4 border-2 rounded-xl bg-white text-[18px] font-bold text-[#2A2A2A] tabular-nums outline-none transition-colors border-[#e0e0e0] focus:border-[#D22727]"
                />
              </div>
              <div className="flex items-center gap-2.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => setEditingPhone(false)}
                  className="text-[13px] whitespace-nowrap text-[#666] font-medium underline underline-offset-[3px] decoration-[#ccc] cursor-pointer"
                >
                  취소
                </button>
              </div>
              <button
                type="button"
                disabled={digits(phoneDraft).length < 9}
                onClick={() => {
                  // 번호가 안 바뀌었으면(같은 값 재입력) key={req.phone} 이 안 바뀌어 다시 마운트되지
                  // 않으므로, 편집 화면 닫기는 여기서 직접 한다. 번호가 바뀐 경우엔 곧 새로 마운트될
                  // 다음 인스턴스가 처음부터 editingPhone=false 라 무해하다.
                  updateVerifyPhone(phoneDraft);
                  setEditingPhone(false);
                }}
                className={`${dialogPrimaryBtn} disabled:opacity-100 disabled:bg-[#f0f0f0] disabled:text-[#b5b5b5]`}
              >
                이 번호로 다시 받기
              </button>
            </div>
          </>
        )}

        {phase !== "done" && !editingPhone && (
          <>
            <div className={dialogDivider} />
            <div className={dialogBody}>
              {/* 260918 토스 인증창 참고 — 칸 하나에 번호를 크게, 남은 시간은 칸 안 오른쪽.
                  칸을 자릿수만큼 나누지 않고 진짜 input 하나로 둔다 → 자동 채우기·붙여넣기가 가장 잘 된다. */}
              <div>
                <div
                  key={shake}
                  className={`relative ${shake ? "animate-[verify-shake_.35s_ease-in-out]" : ""}`}
                >
                  <input
                    ref={inputRef}
                    data-verify-code
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={CODE_LENGTH}
                    value={code}
                    placeholder={`인증번호 ${CODE_LENGTH}자리`}
                    /* 확인 중에는 disabled 대신 readOnly — disabled 로 바꾸면 포커스가 빠져 모바일 키패드가 내려간다 */
                    disabled={needResend}
                    readOnly={phase !== "input"}
                    aria-label={`인증번호 ${CODE_LENGTH}자리`}
                    aria-invalid={!!error}
                    onChange={(e) => {
                      setError("");
                      setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
                    }}
                    className={`w-full h-[56px] pl-4 pr-20 border-2 rounded-xl bg-white text-[20px] font-bold tracking-[0.35em] text-[#2A2A2A] tabular-nums outline-none transition-colors placeholder:text-[15px] placeholder:font-medium placeholder:tracking-normal placeholder:text-[#bbb] disabled:bg-[#f5f5f5] ${
                      error ? "border-[#D22727]" : "border-[#e0e0e0] focus:border-[#D22727]"
                    }`}
                  />
                  {/* 남은 시간 — 칸 안 오른쪽 */}
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold tabular-nums">
                    {phase === "sending" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#bbb]" />
                    ) : (
                      <span className={needResend ? "text-[#bbb]" : "text-[#D22727]"}>{mmss}</span>
                    )}
                  </span>
                </div>

                {/* 칸 바로 아래 한 줄 — 오류가 있을 때만 */}
                {error && <p className="mt-1.5 text-[12px] text-[#D22727] font-medium break-keep">{error}</p>}
              </div>

              {/* 보조 동작 — 회색 글자 버튼 두 개 */}
              <div className="flex items-center gap-2.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={phase === "sending" || (resendWait > 0 && !needResend)}
                  className="text-[13px] whitespace-nowrap text-[#666] font-medium underline underline-offset-[3px] decoration-[#ccc] cursor-pointer disabled:text-[#bbb] disabled:no-underline disabled:cursor-default"
                >
                  {resendWait > 0 && !needResend
                    ? `인증번호 다시 받기 (${Math.ceil(resendWait / 1000)}초)`
                    : "인증번호 다시 받기"}
                </button>
                <span className="w-px h-3 bg-[#ddd]" aria-hidden />
                <button
                  type="button"
                  onClick={() => {
                    setPhoneDraft(formatPhoneInput(req.phone));
                    setEditingPhone(true);
                  }}
                  className="text-[13px] whitespace-nowrap text-[#666] font-medium underline underline-offset-[3px] decoration-[#ccc] cursor-pointer"
                >
                  전화번호 수정
                </button>
              </div>

              {/* 칸이 차면 알아서 확인한다. 비어 있을 땐 회색, 확인 중엔 빨간색에 로딩.
                  시간이 지났거나 5번 틀리면 "인증번호 다시 받기" 버튼이 된다. */}
              {needResend ? (
                <button type="button" onClick={() => void send()} className={dialogPrimaryBtn}>
                  인증번호 다시 받기
                </button>
              ) : (
                <button
                  type="button"
                  disabled={phase === "sending" || (phase === "input" && code.length < CODE_LENGTH)}
                  className={`${dialogPrimaryBtn} disabled:opacity-100 disabled:bg-[#f0f0f0] disabled:text-[#b5b5b5]`}
                >
                  {phase === "checking" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      확인 중...
                    </span>
                  ) : (
                    "확인"
                  )}
                </button>
              )}
            </div>
          </>
        )}
        {phase === "done" && <div className="pb-2" />}
      </div>
      <style>{`@keyframes verify-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

/** TEST_MODE 전용 — 휴대폰 문자 알림처럼 보이는 카드. 누르면 인증번호가 채워진다. */
function FakeSmsToast() {
  const [sms, setSms] = useState<FakeSms | null>(null);
  useEffect(() => onFakeSms(setSms), []);
  useEffect(() => {
    if (!sms) return;
    const t = setTimeout(() => setSms(null), 15000);
    return () => clearTimeout(t);
  }, [sms]);
  if (!sms) return null;

  return (
    <button
      type="button"
      data-fake-sms
      onClick={() => {
        window.dispatchEvent(new CustomEvent("hw-fake-otp-fill", { detail: sms.code }));
        setSms(null);
      }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] font-['Pretendard',sans-serif] w-[calc(100%-24px)] max-w-[380px] text-left rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,.25)] border border-black/5 px-4 py-3 cursor-pointer animate-[fake-sms-in_.35s_ease-out]"
    >
      <div className="flex items-center gap-2 text-[11px] text-[#888]">
        <span className="w-5 h-5 rounded-md bg-[#34c759] flex items-center justify-center">
          <MessageCircle size={12} className="text-white" fill="white" />
        </span>
        <span className="font-semibold text-[#555]">메시지</span>
        <span className="ml-auto">지금 · 테스트용 가짜 문자</span>
      </div>
      <p className="mt-1.5 text-[13px] text-[#2A2A2A] leading-[1.45] whitespace-pre-line">{sms.body}</p>
      <p className="mt-1.5 text-[11px] font-semibold text-[#007aff]">눌러서 자동 채우기 흉내 내기</p>
      <style>{`@keyframes fake-sms-in{from{opacity:0;transform:translate(-50%,-16px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </button>
  );
}
