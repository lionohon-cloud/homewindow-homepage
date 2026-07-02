import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { ArrowLeft, User, Phone, Loader2 } from "lucide-react";
import { HoneypotField } from "@/lib/HoneypotField";
import { lookupCustomer } from "@/lib/reviewApi";
import { trackReview } from "@/lib/submitReview";
import { REVIEW_SESSION_KEYS } from "../styles/reviewTokens";

export function Component() {
  const navigate = useNavigate();
  // 흐름: 유형 선택(/review/type) → 본인확인(현재) → 작성(/review/write)
  // 유형을 아직 안 골랐으면 선택 단계로 되돌림
  const hasTier =
    typeof window !== "undefined" && !!sessionStorage.getItem(REVIEW_SESSION_KEYS.TIER);
  const [name, setName] = useState("");
  const [last4, setLast4] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!hasTier) return <Navigate to="/review/type" replace />;

  const canSubmit =
    name.trim().length >= 1 &&
    /^[0-9]{4}$/.test(last4) &&
    agree &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await lookupCustomer({ name: name.trim(), phoneLast4: last4 });
      if (res.matched === "one") {
        sessionStorage.setItem(REVIEW_SESSION_KEYS.TOKEN, res.token);
        sessionStorage.setItem(REVIEW_SESSION_KEYS.MASKED, JSON.stringify(res.masked));
        if (res.snapshot) {
          sessionStorage.setItem(REVIEW_SESSION_KEYS.SNAPSHOT, JSON.stringify(res.snapshot));
        } else {
          sessionStorage.removeItem(REVIEW_SESSION_KEYS.SNAPSHOT);
        }
        trackReview("lookup_customer_success", {});
        navigate("/review/write");
        return;
      }
      trackReview("lookup_customer_fail", { reason: res.matched });
      if (res.matched === "none") {
        setErrorMsg(
          "고객 정보가 확인되지 않습니다. 성함과 휴대전화 뒷 4자리를 다시 확인해 주세요.",
        );
      } else if (res.matched === "already_reviewed") {
        setErrorMsg("이미 후기를 작성해 주신 번호입니다. 감사합니다.");
      }
    } catch {
      setErrorMsg("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#1c1614] md:bg-[#dcd5d0]">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-[#ebe5e0] md:hidden">
        <div className="max-w-screen-sm mx-auto px-5 h-14 flex items-center">
          <Link to="/review/type" aria-label="이전" className="-ml-2 p-2 text-[#1c1614]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="ml-1 text-[15px] font-bold tracking-tight">후기 작성 본인 확인</h1>
        </div>
      </header>

      <section className="max-w-screen-sm mx-auto px-5 pt-8 pb-16 md:max-w-xl md:py-16">
        <div className="rounded-2xl bg-white border border-[#ebe5e0] p-6 md:p-9 md:rounded-3xl md:shadow-2xl">
          <Link
            to="/review/type"
            aria-label="이전"
            className="hidden md:inline-flex items-center gap-1 -mt-1 mb-3 p-1.5 -ml-1 text-[#6b6460] hover:text-[#1c1614]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[12.5px] font-semibold">이전</span>
          </Link>
          <div className="mb-6">
            <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight leading-tight break-keep">
              시공받으신 고객님이
              <br />
              맞는지 확인해 드릴게요
            </h2>
            <p className="mt-2 text-[13.5px] text-[#6b6460] leading-[1.6] break-keep">
              ERP에 저장된 고객 정보로 확인하므로 별도 SMS 인증이 필요하지 않습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <HoneypotField />

            <label className="block">
              <span className="text-[12.5px] font-semibold tracking-tight text-[#6b6460]">
                고객명
              </span>
              <div className="mt-1.5 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a948f]" />
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="name"
                  placeholder="예) 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
                  maxLength={20}
                  className="w-full h-12 pl-9 pr-3 rounded-xl border border-[#ebe5e0] bg-white text-[15px] focus:border-[#952c2c] focus:outline-none focus:ring-2 focus:ring-[#952c2c]/15"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[12.5px] font-semibold tracking-tight text-[#6b6460]">
                휴대전화 뒷 4자리
              </span>
              <div className="mt-1.5 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a948f]" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="예) 1234"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  className="w-full h-12 pl-9 pr-3 rounded-xl border border-[#ebe5e0] bg-white text-[15px] tracking-[0.3em] focus:border-[#952c2c] focus:outline-none focus:ring-2 focus:ring-[#952c2c]/15"
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-[#9a948f]">
                010-XXXX-<span className="font-bold text-[#3a3531]">[뒷4자리]</span>
              </p>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#faf7f4] border border-[#ebe5e0] cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#952c2c]"
              />
              <span className="text-[12.5px] text-[#3a3531] leading-[1.55] break-keep">
                고객 확인을 위해 입력하신 이름과 휴대전화 뒷자리를 1회 조회하는 것에 동의합니다.
                <br />
                <span className="text-[#6b6460]">
                  (입력 정보는 후기 작성 본인확인 외 용도로 사용되지 않습니다.)
                </span>
              </span>
            </label>

            {errorMsg && (
              <div className="rounded-xl bg-[#fff5f5] border border-[#f3d0d0] p-3.5 text-[13px] text-[#7a1f1f] leading-[1.55]">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-13 h-[52px] rounded-xl bg-[#952c2c] hover:bg-[#7e2424] active:bg-[#6e1f1f] disabled:bg-[#cdb8b8] disabled:cursor-not-allowed text-white font-bold text-[15.5px] tracking-tight flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "확인하기"}
            </button>

          </form>
        </div>
      </section>
    </main>
  );
}
