import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, ArrowRight, Crown, Star, Check, ChevronRight, ChevronRight as Chevron } from "lucide-react";
import { REVIEW_SESSION_KEYS, type ReviewTier } from "../styles/reviewTokens";
import { trackReview } from "@/lib/submitReview";

export function Component() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.DONE);
  }, []);

  // 흐름: 유형 선택(현재) → 본인확인(/review/new) → 작성(/review/write)
  const pick = (tier: ReviewTier) => {
    sessionStorage.setItem(REVIEW_SESSION_KEYS.TIER, tier);
    trackReview("pick_review_type", { tier });
    navigate("/review/new");
  };

  return (
    <>
      {/* === 모바일 === */}
      <main className="md:hidden min-h-screen bg-[#faf7f4] text-[#1c1614]">
        <header className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-[#ebe5e0]">
          <div className="max-w-screen-sm mx-auto px-5 h-14 flex items-center">
            <Link to="/" aria-label="홈으로" className="-ml-2 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="ml-1 text-[15px] font-bold tracking-tight">후기 유형 선택</h1>
          </div>
        </header>

        <section className="max-w-screen-sm mx-auto px-5 pt-8 pb-16">
          <h2 className="text-[22px] font-extrabold tracking-tight leading-tight break-keep">
            청암홈윈도우, 어떠셨나요?
          </h2>
          <p className="mt-2 text-[13.5px] text-[#6b6460] leading-[1.6] break-keep">
            간편 후기는 30초, 프리미엄 후기는 5분이면 충분합니다.
          </p>

          <div className="mt-6 space-y-4">
            <MobileCard tier="simple" onClick={() => pick("simple")} />
            <MobileCard tier="premium" onClick={() => pick("premium")} />
          </div>
        </section>
      </main>

      {/* === PC — 시안 PcTypePicker 1:1 (모달형) === */}
      <main className="hidden md:flex min-h-screen bg-[#dcd5d0] items-start justify-center pt-12 pb-16 px-6">
        <div className="w-full max-w-[800px] bg-white rounded-[18px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          {/* head */}
          <div className="px-10 py-8 border-b border-[#ebe5e0] text-center relative">
            <Link
              to="/"
              aria-label="홈으로"
              className="absolute left-7 top-7 p-1.5 text-[#8a807c] hover:text-[#1c1614] rounded-md hover:bg-[#faf7f4]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-[24px] font-extrabold tracking-tight">청암홈윈도우, 어떠셨나요?</h2>
            <p className="mt-2 text-[14px] text-[#8a807c] tracking-tight">
              간단히 별점만, 아니면 자세한 시공기까지. 편하신 방식으로 남겨주세요.
            </p>
          </div>

          {/* type grid */}
          <div className="grid grid-cols-2 gap-4 p-10">
            {/* 간편 — 라이트 카드 */}
            <DesktopTypeCard
              tier="simple"
              onClick={() => pick("simple")}
            />
            {/* 프리미엄 — 다크 카드 */}
            <DesktopTypeCard
              tier="premium"
              onClick={() => pick("premium")}
            />
          </div>
        </div>
      </main>
    </>
  );
}

function MobileCard({
  tier,
  onClick,
}: {
  tier: ReviewTier;
  onClick: () => void;
}) {
  if (tier === "simple") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left rounded-2xl bg-white border border-[#ebe5e0] p-6 hover:border-[#952c2c]/40 hover:shadow-md transition group"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-[#952c2c] font-bold">
              <Star className="w-3 h-3 fill-[#c89545] text-[#c89545]" /> 약 30초
            </div>
            <h3 className="mt-2 text-[18px] font-extrabold tracking-tight">간편 후기</h3>
            <p className="mt-1.5 text-[13px] text-[#6b6460] leading-[1.55] break-keep">
              별점 + 한 줄 후기 + 좋았던 부분 태그만 남겨도 됩니다.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#9a948f] mt-1 group-hover:translate-x-0.5 transition" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-[#3a3531]">
          <span className="px-2 py-0.5 rounded-full bg-[#fbf0ef] text-[#952c2c] font-semibold">
            기본 할인 +10%
          </span>
        </div>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-gradient-to-br from-[#1a1210] to-[#2a1f1c] border border-[#b8945a]/40 p-6 hover:scale-[1.005] transition group relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,178,119,0.16) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-[#d4b277] font-bold">
            <Crown className="w-3 h-3" /> PREMIUM EXCLUSIVE
          </div>
          <h3 className="mt-2 text-[18px] font-extrabold tracking-tight text-[#faf7f4]">
            프리미엄 후기
          </h3>
          <p className="mt-1.5 text-[13px] text-white/65 leading-[1.55] break-keep">
            사진 3장 이상 + 200자 본문.
            <br />
            기본 할인 + 두 가지 혜택 중 하나를 더 선택하실 수 있어요.
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-[#d4b277] mt-1 group-hover:translate-x-0.5 transition" />
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
          기본 할인 +10%
        </span>
        <span className="text-white/40">+</span>
        <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
          추가 할인 +5%
        </span>
        <span className="text-white/40">또는</span>
        <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
          10만원 상품권
        </span>
      </div>
    </button>
  );
}

function DesktopTypeCard({
  tier,
  onClick,
}: {
  tier: ReviewTier;
  onClick: () => void;
}) {
  if (tier === "simple") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left rounded-[14px] border-[1.5px] border-[#ebe5e0] bg-white p-7 transition hover:border-[#952c2c] hover:shadow-md group"
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[16px] font-bold tracking-tight">
            <Star className="w-5 h-5 fill-[#c89545] text-[#c89545]" />
            간편 리뷰
          </div>
          <div className="text-[12px] text-[#8a807c]">약 30초</div>
        </div>
        <div className="mt-3 text-[13.5px] text-[#4a423f] tracking-tight">
          별점 + 한 줄 후기로 빠르게 남기기
        </div>
        <ul className="mt-5 space-y-2 text-[13px] text-[#4a423f]">
          <FeatRow>별점 5단계</FeatRow>
          <FeatRow>50자 이내 한 줄 코멘트</FeatRow>
          <FeatRow>만족한 부분 태그 선택</FeatRow>
        </ul>
        <div className="mt-6 pt-5 border-t border-[#ebe5e0] flex items-center justify-between text-[13.5px] font-bold text-[#952c2c] tracking-tight">
          간편하게 작성하기
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </div>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-[14px] border-[1.5px] border-transparent bg-[#1a1210] p-7 transition hover:scale-[1.005] relative overflow-hidden group"
    >
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,178,119,0.20) 0%, transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[16px] font-bold tracking-tight text-[#d4b277]">
            <Crown className="w-4 h-4" />
            프리미엄 리뷰
          </div>
          <div className="text-[12px] text-white/55">약 5분</div>
        </div>
        <div className="mt-3 text-[13.5px] text-white/80 tracking-tight">
          사진과 함께 시공 경험을 자세히 남기기
        </div>
        <ul className="mt-5 space-y-2 text-[13px] text-white/75">
          <FeatRow dark>200자 이상 본문</FeatRow>
          <FeatRow dark>사진 3장 이상 + 동영상 첨부</FeatRow>
          <FeatRow dark>Before / After 비교 사진</FeatRow>
          <FeatRow dark>제품·옵션 정보 기록</FeatRow>
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
          <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
            기본 할인 +10%
          </span>
          <span className="text-white/40">+</span>
          <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
            추가 할인 +5%
          </span>
          <span className="text-white/40">또는</span>
          <span className="px-2 py-0.5 rounded-full bg-[#d4b277]/15 text-[#e3c690] font-semibold">
            10만원 상품권
          </span>
        </div>
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[13.5px] font-bold text-[#d4b277] tracking-tight">
          자세히 작성하기
          <Chevron className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </button>
  );
}

function FeatRow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={"w-3.5 h-3.5 mt-0.5 shrink-0 " + (dark ? "text-[#d4b277]" : "text-[#952c2c]")} strokeWidth={2.5} />
      <span>{children}</span>
    </li>
  );
}
