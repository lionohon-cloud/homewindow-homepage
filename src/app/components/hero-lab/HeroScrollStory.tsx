import { Fragment, useEffect, useRef, useState } from "react";
import { useHeroVideo } from "../HeroSection";

/**
 * 결론 CTA 의 목적지 — 히어로 바로 아래 강화유리 설명 섹션
 * ("지금까지도 창문에는 강화유리가 드물었던 이유", WhyBasicSection).
 * 문서에 이 id 는 한 곳뿐이다(tempered/WhyBasicSection.tsx).
 */
export const HERO_CTA_TARGET_ID = "why-basic";

/* CTA 가 건 부드러운 스크롤이 히어로 고정 구간을 지나가는 동안에는
   스냅 복귀(useSnapStepper 의 snapToNearest)가 끼어들지 않게 알려 준다. */
let ctaScrollUntil = 0;
export const isCtaScrolling = () => performance.now() < ctaScrollUntil;

/** 결론 CTA 클릭 — 상담창을 열지 않고 강화유리 설명 섹션으로 내려간다. */
function goToTemperedIntro() {
  const el = document.getElementById(HERO_CTA_TARGET_ID);
  if (!el) return;
  const reduce =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  ctaScrollUntil = performance.now() + (reduce ? 0 : 1400);
  /* scrollIntoView 는 그 섹션이 이미 달고 있는 scroll-mt(모바일 73px / 1550px↑ 83px)를 지켜 준다 —
     고정 GNB 에 제목이 가리지 않는다. window.scrollTo 로는 scroll-margin 이 먹지 않는다. */
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * 히어로 E안 — 스크롤로 넘기는 인터랙티브 스토리. (문구 시안 비교 /copy-lab 전용)
 *
 * 히어로가 화면에 붙은(sticky) 채로, 내려온 거리에 따라 장면이 이어진다.
 *
 *   ① 영상 위 "창에 강화유리, 원래 가능했습니다."
 *   ② 조금 더 내리면 문장이 "비싸고 번거롭기 때문에 말하지 않았을 뿐입니다." 로 굴러 내려오고
 *      (다른 롤링 시안처럼 새 문장이 위에서 내려오며 앞 문장을 아래로 밀어냄)
 *      배경이 영상 → 사진(계산기·귓속말)으로 바뀐다
 *   ③ 더 내리면 ② 의 문장과 사진이 점점 어두워져 화면이 완전히 검정이 된다
 *      검정 화면 가운데 "하지만" 한 낱말이 딱 떴다가 사라진다
 *   ④ 이어서 "청암홈윈도우는 가능합니다." 가 점처럼 시작해 제 크기로 커진다
 *   ⑤ 검정 화면이 가운데서 위아래로 갈라지며 처음 영상이 다시 배경으로 드러나고 CTA 가 나온다
 *
 * 장면 경계는 아래 T 표에서 전부 조정한다 — 0 은 고정 시작, 1 은 고정이 풀리는 지점.
 * 고정 구간 길이는 SCROLL_SCREENS(화면 몇 개 분량을 내려야 끝나는지)로 정한다.
 *
 * 구조 — 그림(StoryScene)과 진행 방식을 나눴다.
 *   · 그림은 장면 값 묶음(SceneFx) 하나만 받아서 그린다.
 *   · E안(HeroScrollStory)은 스크롤 위치로 그 값을 만든다(스크럽).
 *   · /scroll-lab 의 시안들(HeroScrollStoryModes.tsx)은 같은 그림을 시간으로 재생한다.
 *
 * 주의 — sticky 가 먹으려면 조상 중에 overflow:hidden/auto 가 없어야 한다.
 * overflow-x:hidden 도 세로를 auto 로 바꿔 버리므로 안 된다(clip 을 쓸 것).
 */

export type ScrollStory = {
  /** 위 고정줄(머리말) */
  eyebrow: string;
  /** ① 영상 위 문장 */
  first: string;
  /** ② 사진 위 문장 */
  second: string;
  /** ③ 검정 화면에 잠깐 뜨는 낱말 (없으면 바로 결론) */
  but?: string;
  /** ④ 점에서 커지는 결론 문장 */
  last: string;
  /** 결론 문장에서 이 낱말만 굵게(800), 나머지는 한 단계 얇게(500) */
  lastEmphasis?: string;
  /** ② 에서 깔리는 사진 (public 경로) */
  image: string;
  cta: string;
};

/** E안 문구 — /copy-lab 과 /scroll-lab 이 같이 쓴다. 여기만 고치면 둘 다 바뀐다. */
export const STORY_E: ScrollStory = {
  eyebrow: "창호 업계가 말하지 않는 것",
  first: "창에 강화유리,\n원래 가능했습니다.",
  second: "비싸고 번거롭기 때문에\n말하지 않았을 뿐입니다.",
  /* 260911 — 검정 화면에 "하지만" 을 한 박자 두고 결론으로 넘어간다.
     결론은 "강화유리가 기본입니다" → "가능합니다". ① 의 "원래 가능했습니다" 를 되받는다. */
  but: "하지만",
  last: "청암홈윈도우는\n가능합니다.",
  /* 결론 문장은 "가능합니다." 만 굵게, "청암홈윈도우는" 은 얇게 */
  lastEmphasis: "가능합니다.",
  /* public/hero-story/ 에 넣은 사진 */
  image: "/hero-story/whisper-calculator.png",
  cta: "지금 강화유리를 확인해보세요.",
};

/** 고정 구간이 화면 몇 개 분량인지. 장면이 다섯이라 너무 짧으면 휙 지나간다. */
const SCROLL_SCREENS = 2.4;

/* 장면 경계 (고정 구간 진행률 0~1) */
export const T = {
  swapFrom: 0.08, // ① → ② 바뀌기 시작
  swapTo: 0.22, //   다 바뀜
  darkFrom: 0.3, //  ② 어두워지기 시작
  darkTo: 0.44, //   완전 검정
  /* ③ "하지만" — 검정이 된 뒤 딱 떴다가(짧게) 잠깐 머물고 사라진다.
     장면별 멈춤(B)은 결론 연출을 2.8초에 재생하므로 뜨는 데 약 .13초, 머무는 게 약 .55초다. */
  butFrom: 0.46,
  butIn: 0.49, //    다 뜸
  butOut: 0.62, //   사라지기 시작
  butTo: 0.65, //    다 사라짐
  growFrom: 0.66, // ④ 점에서 커지기 시작
  growTo: 0.8, //    제 크기
  /* ⑤ 검정이 갈라지기 시작 — 결론 문장이 다 커진 뒤가 아니라 절반쯤 커졌을 때부터 같이.
     크기는 easeOut 이라 앞쪽에서 빨리 커진다. 제 크기의 절반(scale .5)이 되는 건
     커지는 구간의 20% 지점 ≈ .69 라 거기서 조금 뒤(.70)부터 연다. */
  splitFrom: 0.7,
  splitTo: 0.97, //  다 갈라짐 — 영상 복귀, CTA 등장
};

/* ①→② 롤링 창 높이 — 문장이 두 줄이고 줄 높이가 1.25em 이라 2.5em */
const REEL_H = "2.5em";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** 장면 값 — 그림은 이것만 보고 그린다 */
export type SceneFx = {
  swap: number; //  ①→② (문장·배경)
  dark: number; //  ② → 검정
  grow: number; //  ④ 점 → 제 크기
  split: number; // ⑤ 검정 갈라짐
  butOp: number; // ③ "하지만"
  butIn: number; //  "하지만" 뜨는 정도 (살짝 크게 시작해 제자리로)
  lastOp: number;
  hintOp: number;
  ctaOn: boolean;
};

/** E안 — 고정 구간 진행률 t 하나로 전 장면을 만든다 */
function fxFromScroll(t: number): SceneFx {
  return {
    swap: easeInOut(ramp(t, T.swapFrom, T.swapTo)),
    dark: easeInOut(ramp(t, T.darkFrom, T.darkTo)),
    grow: easeOut(ramp(t, T.growFrom, T.growTo)),
    split: easeInOut(ramp(t, T.splitFrom, T.splitTo)),
    butOp: ramp(t, T.butFrom, T.butIn) * (1 - ramp(t, T.butOut, T.butTo)),
    butIn: easeOut(ramp(t, T.butFrom, T.butIn)),
    /* 결론 문장 — 커지기 시작하자마자 보이게(점으로) */
    lastOp: ramp(t, T.growFrom, T.growFrom + 0.03),
    /* 첫 화면 스크롤 안내 — 조금만 내려도(첫 문장이 굴러가기 전에) 사라진다 */
    hintOp: 1 - ramp(t, 0, T.swapFrom * 0.6),
    ctaOn: t >= T.splitTo - 0.02,
  };
}

/**
 * 시간 재생용 — a: ①→② 전환(0~1), b: 결론 연출(검정→커짐→갈라짐, 0~1).
 * b 는 위 T 표의 darkFrom~splitTo 구간을 그대로 늘여 쓴다 — 장면끼리의 간격 비율이 E안과 같다.
 */
export function fxFromPlay(a: number, b: number): SceneFx {
  const tb = T.darkFrom + b * (T.splitTo - T.darkFrom);
  return {
    swap: easeInOut(a),
    dark: easeInOut(ramp(tb, T.darkFrom, T.darkTo)),
    grow: easeOut(ramp(tb, T.growFrom, T.growTo)),
    split: easeInOut(ramp(tb, T.splitFrom, T.splitTo)),
    butOp: ramp(tb, T.butFrom, T.butIn) * (1 - ramp(tb, T.butOut, T.butTo)),
    butIn: easeOut(ramp(tb, T.butFrom, T.butIn)),
    lastOp: ramp(tb, T.growFrom, T.growFrom + 0.03),
    hintOp: 1 - clamp01(Math.max(a, b) * 5),
    ctaOn: tb >= T.splitTo - 0.02,
  };
}

/** 고정 구간 틀 — 높이를 재고, 스크롤 진행률 t 를 준다 */
export function useStoryLayout(screens: number) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [outerH, setOuterH] = useState<number | undefined>(undefined);
  const [t, setT] = useState(0);
  /* 검정이 갈라지는 가로선의 높이(px, 고정 화면 기준).
     결론 문장 두 줄("청암홈윈도우는" / "강화유리가 기본입니다.") 사이에서 열려야 깔끔하다.
     그 문장은 딱 두 줄이라 상자의 세로 가운데가 곧 줄 사이다. 커지는 효과가
     가운데를 기준으로 scale 하므로 문장 크기와 상관없이 이 높이는 변하지 않는다. */
  const lastRef = useRef<HTMLParagraphElement>(null);
  const [splitY, setSplitY] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const inner = innerRef.current;
      if (!inner) return;
      setOuterH(inner.offsetHeight + Math.round(window.innerHeight * screens));
      const last = lastRef.current;
      if (last) {
        const ir = inner.getBoundingClientRect();
        const lr = last.getBoundingClientRect();
        setSplitY(Math.round(lr.top + lr.height / 2 - ir.top));
      }
    };
    const onScroll = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;
      const range = outer.offsetHeight - inner.offsetHeight;
      if (range <= 0) return;
      setT(clamp01(-outer.getBoundingClientRect().top / range));
    };
    measure();
    onScroll();
    /* 글꼴이 늦게 들어오면 줄 높이가 달라지므로 한 번 더 잰다 */
    document.fonts?.ready.then(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [screens]);

  return { outerRef, innerRef, lastRef, outerH, splitY, t };
}
export type StoryLayout = ReturnType<typeof useStoryLayout>;

/* ── 히어로 3단계 진행 표시 ────────────────────────────────────────────────
   사용자가 한 번 내릴 때마다 넘어가는 단계와 같다.
     01 창에 강화유리, 원래 가능했습니다.
     02 비싸고 번거롭기 때문에 말하지 않았을 뿐입니다.
     03 "하지만" → 청암홈윈도우는 가능합니다. + CTA
        ("하지만" 과 결론은 하나의 자동 연출이라 단계를 나누지 않는다)

   PC 와 모바일이 방향만 다르고 점·선·색·크기는 같은 것을 쓴다 — DOM 을 하나만 두고
   flex 방향과 선의 가로/세로만 바꿔, 두 벌을 따로 관리하다 어긋나는 일이 없게 했다.
     · 데스크톱 : 히어로 하단 가운데, 가로 (안내 화살표 bottom-152 위 · 하단 상담 바 110 위)
     · 모바일   : 화면 우측 가운데, 세로 (하단 상담·AI 바와 겹치지 않는 높이)
   숫자 라벨은 양쪽 다 가로로 읽는다 — 세로로 눕히면 01/03 을 한눈에 알아보기 어렵다.
   모바일에서는 라벨만 흐름 밖으로 빼 진행선 아래에 둔다. 가로 라벨은 폭이 40px 라
   세로 진행선 옆에 두면 360px 기기에서 히어로 문구와 겹친다. 흐름에서 빼면
   진행선은 원래 자리(화면 오른쪽 11px · 세로 가운데)를 그대로 지킨다.
   왼쪽 세로 목록(GNB 의 페이지 전체 목차)과는 별개다 — 그쪽은 건드리지 않는다. */
const STEP_TOTAL = 3;
const STEP_ON = "#d22727"; //             청암홈윈도우 빨강 — 현재 단계까지
const STEP_OFF = "rgba(255,255,255,.32)"; // 남은 단계

function HeroProgress({ step }: { step: number }) {
  const now = Math.min(Math.max(step, 0), STEP_TOTAL - 1);
  const label = String(now + 1).padStart(2, "0") + " / 0" + STEP_TOTAL;
  return (
    <div
      data-hero-progress
      role="progressbar"
      aria-label="히어로 진행 단계"
      aria-valuemin={1}
      aria-valuemax={STEP_TOTAL}
      aria-valuenow={now + 1}
      aria-valuetext={label}
      className="pointer-events-none absolute z-20 flex select-none items-center gap-2
                 right-[11px] top-1/2 -translate-y-1/2 flex-col
                 md:right-auto md:top-auto md:bottom-[196px] md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:flex-row md:gap-3
                 [filter:drop-shadow(0_1px_6px_rgba(0,0,0,.55))]"
    >
      <span className="absolute right-0 top-full mt-2 whitespace-nowrap text-[10px] font-bold tabular-nums tracking-[.08em] text-white/75 md:relative md:right-auto md:top-auto md:mt-0 md:text-[11px]">
        {label}
      </span>
      <div className="flex flex-col items-center md:flex-row">
        {Array.from({ length: STEP_TOTAL }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span
                className="block h-5 w-[2px] rounded-full transition-colors duration-300 md:h-[2px] md:w-6"
                style={{ background: i <= now ? STEP_ON : STEP_OFF }}
              />
            )}
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === now ? 9 : 6,
                height: i === now ? 9 : 6,
                background: i <= now ? STEP_ON : STEP_OFF,
                boxShadow: i === now ? "0 0 0 3px " + STEP_ON + "33" : "none",
              }}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** 그림 — 장면 값만 받아서 그린다 */
export function StoryScene({
  story,
  fx,
  layout,
  step,
  onAdvance,
}: {
  story: ScrollStory;
  fx: SceneFx;
  layout: StoryLayout;
  /** 진행 표시에 쓸 현재 단계(0·1·2). 안 넘기면 표시하지 않는다 — 시안 모드는 그대로 둔다. */
  step?: number;
  /** 스크롤 안내 화살표를 누르면 한 단계 진행. 안 넘기면(시안 모드) 예전처럼 장식용으로만 둔다. */
  onAdvance?: () => void;
}) {
  const heroVideo = useHeroVideo();
  const { swap, dark, grow, split } = fx;

  /* ①·② 는 한 창 안에서 굴러 넘어가고, 어두워질 때 창째로 흐려진다 */
  const reelOp = 1 - dark;
  /* 사진은 완전히 검정이 된 뒤에는 치운다 — 검정이 갈라질 때 뒤에서 영상이 보여야 하므로 */
  const imageOp = dark < 1 ? swap : 0;
  const lastScale = 0.02 + 0.98 * grow;
  /* 머리말 — 검정으로 들어갈 때 같이 꺼지고 다시 나오지 않는다.
     마지막 장면은 "업계가 말하지 않는 것" 이 아니라 우리 자랑이라 머리말이 붙으면 안 맞는다. */
  const eyebrowOp = 1 - dark;
  /* 검정 판 — 어두워질 때 짙어지고, 갈라질 때 위아래로 빠진다 */
  const blackOp = dark;

  return (
    <div ref={layout.outerRef} className="relative" style={{ height: layout.outerH }}>
      {/* 스크롤 안내 화살표 애니메이션 — 움직임 줄이기 설정이면 멈춘다 */}
      <style>{`
        @keyframes hw-scroll-cue { 0%,100% { transform: translateY(0); opacity: .5 } 50% { transform: translateY(7px); opacity: 1 } }
        .hw-scroll-cue { animation: hw-scroll-cue 1.4s ease-in-out infinite }
        .hw-scroll-cue-2 { animation-delay: .18s }
        @media (prefers-reduced-motion: reduce) { .hw-scroll-cue { animation: none } }
      `}</style>
      <div ref={layout.innerRef} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black">
        {/* 배경 1 — 영상 (맨 아래, 항상 깔려 있다) */}
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* 영상 위 가독용 그라데이션 — 다른 시안과 같은 값 */}
        <div
          className="hidden md:block absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(14,10,6,.84) 0%, rgba(14,10,6,.62) 38%, rgba(14,10,6,.2) 65%, rgba(14,10,6,.06) 100%)",
          }}
        />
        <div
          className="block md:hidden absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(12,8,4,.93) 0%, rgba(12,8,4,.6) 42%, rgba(12,8,4,.12) 72%, transparent 100%)",
          }}
        />

        {/* 배경 2 — ② 의 사진. 글이 얹히므로 어둡게 한 겹(55%).
            35% 로는 얼굴·계산기가 너무 밝게 살아 글보다 먼저 눈에 들어왔다. */}
        <div className="absolute inset-0" style={{ opacity: imageOp }}>
          <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div data-photo-dim className="absolute inset-0 bg-black/55" />
        </div>

        {/* 검정 판 — 위아래 두 장. 붙어 있으면 온 화면이 검정,
            결론 문장 두 줄 사이 가로선에서 위 판은 위로 · 아래 판은 아래로 빠지며
            뒤 영상이 드러난다. 각 판은 자기 높이만큼 움직여 완전히 화면 밖으로 나간다. */}
        <div
          data-split="top"
          className="absolute inset-x-0 top-0 bg-black"
          style={{
            height: layout.splitY ?? "50%",
            opacity: blackOp,
            transform: `translateY(${-split * 100}%)`,
          }}
        />
        <div
          data-split="bottom"
          className="absolute inset-x-0 bottom-0 bg-black"
          style={{
            top: layout.splitY ?? "50%",
            opacity: blackOp,
            transform: `translateY(${split * 100}%)`,
          }}
        />

        {typeof step === "number" && <HeroProgress step={step} />}

        {/* 첫 화면 스크롤 안내 — 아래로 꺾인 화살표 두 개가 차례로 내려간다(글자 없음).
            이 시안은 내려야 장면이 넘어가는데, 첫 화면만 봐선 알 수 없어서 넣었다.
            조금만 내려도 사라진다. 하단 고정바(85·94px)에서 한참 띄워 둔다.
            onAdvance 가 있으면(snap 모드) 눌러서도 한 단계 진행할 수 있는 버튼이 된다 —
            전체 폭을 덮으면 아래 CTA 등을 가리므로 화살표 크기만큼만 히트영역을 준다. */}
        {onAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            aria-label="다음 장면 보기"
            data-scroll-hint
            className="absolute z-20 left-1/2 -translate-x-1/2 flex flex-col items-center bottom-[140px] md:bottom-[152px] px-4 py-2 cursor-pointer [filter:drop-shadow(0_1px_6px_rgba(0,0,0,.6))]"
            style={{ opacity: fx.hintOp }}
          >
            <svg className="hw-scroll-cue" width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 2l9 8 9-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className="hw-scroll-cue hw-scroll-cue-2 -mt-1" width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 2l9 8 9-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div
            data-scroll-hint
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center bottom-[140px] md:bottom-[152px] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,.6))]"
            style={{ opacity: fx.hintOp }}
          >
            <svg className="hw-scroll-cue" width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 2l9 8 9-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className="hw-scroll-cue hw-scroll-cue-2 -mt-1" width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 2l9 8 9-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* 글 — 화면 가운데. 세 문장은 같은 자리에 겹쳐 두고 투명도·크기로만 바꾼다 */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-[60px] pb-[110px] md:pt-[70px] md:pb-[110px]">
          <div
            className="text-white leading-[1.25] break-keep -tracking-[.025em] text-[30px] md:text-[40px]"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)" }}
          >
            <p className="font-light mb-[.353em]" style={{ fontSize: ".85em", opacity: eyebrowOp }}>
              {story.eyebrow}
            </p>
            <div className="grid font-extrabold whitespace-pre-line">
              {/* ①→② 롤링 창 — [②, ①] 을 세로로 쌓아 두고 트랙을
                  -2.5em → 0 으로 내린다. ② 가 위에서 내려오며 ① 을 아래로 밀어낸다.
                  창이 overflow:hidden 이라 글자 그림자가 모서리에서 네모나게 잘리므로
                  그림자는 filter 로 창 바깥에 다시 얹는다. */}
              <div
                data-reel="first-second"
                className="[grid-area:1/1] overflow-hidden"
                style={{
                  height: REEL_H,
                  opacity: reelOp,
                  textShadow: "none",
                  filter: "drop-shadow(0 2px 16px rgba(0,0,0,.65))",
                }}
              >
                <div style={{ transform: `translateY(calc(${(swap - 1).toFixed(4)} * ${REEL_H}))` }}>
                  <p style={{ height: REEL_H }}>{story.second}</p>
                  <p style={{ height: REEL_H }}>{story.first}</p>
                </div>
              </div>
              {/* ③ "하지만" — 검정 화면 가운데 한 낱말. 살짝 크게(1.12배) 나타나 제자리로 딱 앉는다 */}
              {story.but && (
                <p
                  data-but
                  className="[grid-area:1/1] self-center font-bold"
                  style={{
                    opacity: fx.butOp,
                    transform: `scale(${(1.12 - 0.12 * fx.butIn).toFixed(4)})`,
                  }}
                >
                  {story.but}
                </p>
              )}
              <p
                ref={layout.lastRef}
                data-last
                className={`[grid-area:1/1] ${story.lastEmphasis ? "font-medium" : ""}`}
                style={{
                  opacity: fx.lastOp,
                  transform: `scale(${lastScale})`,
                  transformOrigin: "50% 50%",
                }}
              >
                {story.lastEmphasis && story.last.includes(story.lastEmphasis)
                  ? story.last.split(story.lastEmphasis).flatMap((part, i) =>
                      i === 0
                        ? [part]
                        : [
                            <span key={i} className="font-extrabold">
                              {story.lastEmphasis}
                            </span>,
                            part,
                          ],
                    )
                  : story.last}
              </p>
            </div>
          </div>

          <div
            className="mt-8 transition-opacity duration-500"
            style={{ opacity: fx.ctaOn ? 1 : 0, pointerEvents: fx.ctaOn ? "auto" : "none" }}
          >
            <button
              type="button"
              onClick={goToTemperedIntro}
              className="flex items-center justify-center h-[52px] min-w-[260px] px-8 whitespace-nowrap bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[15.5px] md:text-[16.5px] rounded-xl cursor-pointer transition-colors"
              style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
            >
              {story.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** E안 — 스크롤 위치에 그대로 붙어 가는 방식(스크럽) */
export function HeroScrollStory({ story }: { story: ScrollStory }) {
  const layout = useStoryLayout(SCROLL_SCREENS);
  return <StoryScene story={story} fx={fxFromScroll(layout.t)} layout={layout} />;
}
