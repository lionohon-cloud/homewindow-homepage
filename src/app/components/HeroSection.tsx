import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { openConsultBar } from "@/lib/consultBar";
/* 히어로 배경 영상 — 유리 클로즈업(CF 스타일). PC 와 모바일이 서로 다른 파일이다.

   260907 시안 비교(/video-lab) 끝에 B 안으로 정하면서, 새 영상이 720×1280 세로라
   PC 에서 위아래가 크게 잘리는 문제가 있었다. 그래서 모바일에만 새 영상을 쓰고
   PC 는 쓰던 가로 영상을 그대로 둔다. 가로 원본이 생기면 PC 쪽만 바꾸면 된다.

   그 이전 히어로 영상(창가에서 뛰노는 아이)은 hero-tempered.mp4 로 남겨 뒀다. */
import heroVideoPc from "../../assets/hero-glass-closeup.mp4";
import heroVideoMo from "../../assets/hero-glass-closeup-mo.mp4";

/* 화면 폭으로 배경 영상을 가른다. md(768px) — 히어로 안의 모바일/PC 블록과 같은 경계.
   CSS 로 두 개를 겹쳐 놓고 숨기는 방법도 있지만, 그러면 안 보이는 쪽까지 받아 온다. */
export function useHeroVideo() {
  const [isPc, setIsPc] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setIsPc(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return isPc ? heroVideoPc : heroVideoMo;
}

/* ══════════════════════════════════════════════════════════════════════
   260907 — 강화유리 상시 히어로.

   구성은 강화유리 상세페이지 히어로와 같다: 배지 · 두 줄 헤드라인 · 문단 · 버튼.
   기존 히어로("창호 교체, 이제 믿을 수 있는 곳에서")는 이 파일 맨 아래에
   주석으로 통째로 남겨 뒀다.

   ▸ 260907 에 뺀 것 — 파일은 지우지 않았으니 되살릴 수 있다
     · 창짝 3D 턴테이블  <SashTurntable height={188} /> — PC 는 238
       + styles/index.css 의 hw-sash-* (없으면 안 돈다)
     · 손글씨 "강화유리" 태그  @/assets/handwrite-tempered.svg
       창짝 박스에 absolute 로 얹었다 — MO left 72% / PC 72.7%, top 49%, width 97%
     · "9월 한정" 손글씨  ./HandwriteSept + fonts.css 의 Nanum Pen Script @import

   ▸ 원래 히어로로 되돌리는 법
     1. 아래 HeroSection 을 통째로 지우고, 파일 끝의 주석 블록을 풀어 되살린다
     2. src/styles/fonts.css 의 Nanum Pen Script @import 삭제
     3. 되살릴 때 필요한 것: src/assets/hero-bg.jpeg, ./VideoModal — 지우지 말 것
   ══════════════════════════════════════════════════════════════════════ */

const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
} as const;

/* 문구 시안 비교용(/copy-lab). 안 넘기면 아래 기본값이 그대로 나가므로
   실서비스 동작은 바뀌지 않는다. 배경 영상·레이아웃·색은 시안과 무관하게 고정이다. */
export type HeroCopy = {
  /** 빈 문자열이면 배지를 아예 안 그린다 */
  badge: string;
  /** 앞부분 — 가벼운 글씨(font-light) */
  titleLight: string;
  /** 뒷부분 — 굵은 글씨(font-extrabold). 롤링 시 여기가 고정 문구가 된다 */
  titleBold: string;
  /** 넘기면 한 줄이 이 목록을 돌아간다. 어느 줄인지는 rotateAt 이 정한다 */
  titleRotate?: string[];
  /** before(기본) — 첫 줄(가벼운 글씨)이 돈다 · after — 둘째 줄(굵은 글씨)이 돈다 */
  rotateAt?: "before" | "after";
  /** 롤링 한 칸의 높이(줄 수). 긴 문장을 두 줄로 굴릴 때 2 */
  rotateRows?: number;
  /** 한 바퀴만 돌고 마지막 줄에서 멈춘다 */
  rotateOnce?: boolean;
  /** 마지막 줄에서만 머무는 시간(ms). 넘기면 그만큼 쉬었다가 처음부터 다시 돈다 */
  rotateHoldLastMs?: number;
  /** 롤링이 멈춘 뒤에야 CTA 를 드러낸다 (rotateOnce 와 같이 쓴다) */
  ctaAfterRoll?: boolean;
  /** 시간으로 자동으로 돌지 않고, 스크롤을 내릴 때마다 한 칸씩 넘어간다.
      히어로가 화면에 붙어 있는(sticky) 동안 스크롤로 문장을 넘기고,
      마지막 문장까지 가면 그다음부터 페이지가 평소처럼 내려간다. */
  scrollRoll?: boolean;
  /** 서브카피 — 한 줄이 배열 한 칸. 빈 칸은 빈 줄이 된다 */
  sub: string[];
  /** 서브카피 안에서 굵게 강조할 구절. 그 글자가 들어 있는 줄에만 적용된다 */
  subHighlight?: string;
  /** 서브카피에 나오는 이 낱말은 전부 굵게 + 밑에 메인 컬러 형광펜 줄을 긋는다 */
  subEmphasis?: string;
  cta: string;
  /** 타이틀 크기를 시안별로 줄여야 할 때만. 안 넘기면 기본 30 / 40px */
  titleSizeMo?: string;
  titleSizePc?: string;
  /** 하단 고정 바 높이를 15% 줄인다(100 → 85px). 히어로 CTA 는 건드리지 않는다 */
  compactCta?: boolean;
  /** 글을 가운데로 모으고, 배지~서브카피를 화면 위끝과 CTA 사이 한가운데 놓는다 */
  centered?: boolean;
};

export const HERO_COPY_DEFAULT: HeroCopy = {
  badge: "강화유리 자체 생산",
  titleLight: "이제는 창호도",
  titleBold: "강화유리가 기본입니다",
  sub: [
    "휴대폰도 자동차도 유리가 사용되는 곳은 강화유리입니다.",
    "집에서 가장 큰 유리만 그대로였습니다.",
  ],
  subHighlight: "집에서 가장 큰 유리만",
  cta: "무료 상담 신청하기",
};

/* 롤링 문구 — 룰렛처럼 위에서 아래로 굴러 내려온다.

   창(overflow:hidden)은 딱 한 줄 높이고, 그 안에 [다음 줄, 현재 줄] 을 세로로
   쌓아 둔다. 평소에는 트랙을 한 줄만큼 위로 올려 둬서 "현재 줄" 만 보이고,
   구를 때 트랙을 0 으로 내리면 위에 있던 "다음 줄" 이 내려오면서 현재 줄을
   아래로 밀어낸다. 다 내려온 뒤 애니메이션 없이 원위치시키고 인덱스를 올린다.

   높이를 em 으로 잡는 이유: 타이틀이 모바일 26px · PC 40px 로 다른데,
   px 로 박으면 한쪽에서 글자가 잘린다. 1.25em 은 h1 의 leading-[1.25] 과 같다. */
const ROTATE_MS = 3000;
const ROLL_MS = 520;
const LH = "1.25em";

/** 낱말 강조 — 굵게 + 글자 아래쪽 38% 에 메인 컬러 형광펜 줄.
    이미 굵게 강조된 문장 안에서도 한 번 더 튀어야 해서 굵기만으로는 모자라고,
    글자색을 새로 들이는 대신 브랜드 빨강을 밑줄 띠로만 쓴다. */
function emphasize(text: string, word?: string) {
  if (!word || !text.includes(word)) return text;
  return text.split(word).flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span
            key={i}
            className="font-extrabold text-white"
            style={{
              backgroundImage: "linear-gradient(transparent 62%, rgba(210,39,39,.8) 62%)",
              padding: "0 .06em",
            }}
          >
            {word}
          </span>,
          part,
        ],
  );
}

/** 서브카피 한 줄을 그린다. 강조 구절은 굵게, 강조 낱말은 형광펜까지. */
function subLine(line: string, hl?: string, word?: string) {
  if (!hl || !line.includes(hl)) return emphasize(line, word);
  const at = line.indexOf(hl);
  return (
    <>
      {emphasize(line.slice(0, at), word)}
      <b className="font-extrabold text-white">{emphasize(hl, word)}</b>
      {emphasize(line.slice(at + hl.length), word)}
    </>
  );
}

function RollingLine({
  list,
  rows = 1,
  once = false,
  holdLastMs,
  onDone,
  className = "",
}: {
  list: string[];
  rows?: number;
  once?: boolean;
  holdLastMs?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [rolling, setRolling] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  /* 한 칸씩 예약하는 방식이라 once 일 때 마지막 줄에서 그대로 멈출 수 있다.
     setInterval 로 돌리면 "마지막에서 멈춤" 을 따로 끊어 줘야 해서 이쪽이 단순하다. */
  useEffect(() => {
    const last = list.length - 1;
    /* 마지막 줄에 닿으면 알린다. 반복하는 시안도 첫 바퀴가 끝날 때 CTA 가 켜지고,
       다시 돌 때 꺼지지는 않는다(받는 쪽이 true 로만 바꾸므로). */
    if (i >= last) doneRef.current?.();
    if (list.length < 2 || (once && i >= last)) return;
    let inner: ReturnType<typeof setTimeout> | undefined;
    /* 마지막 줄만 머무는 시간을 따로 줄 수 있다. 그 뒤에는 (i+1)%길이 로
       첫 줄이 같은 방식으로 굴러 내려오면서 처음부터 다시 돈다. */
    const wait = i === last && holdLastMs != null ? holdLastMs : ROTATE_MS;
    const outer = setTimeout(() => {
      setRolling(true);
      inner = setTimeout(() => {
        setI((n) => (n + 1) % list.length);
        setRolling(false);
      }, ROLL_MS);
    }, wait);
    return () => {
      clearTimeout(outer);
      if (inner) clearTimeout(inner);
    };
  }, [i, list, once, holdLastMs]);

  const H = `calc(${LH} * ${rows})`;
  return (
    <span
      className={`block overflow-hidden ${className}`}
      style={{
        height: H,
        /* h1 에 걸린 text-shadow 가 이 상자(overflow:hidden) 모서리에서 잘려
           네모난 테두리처럼 보인다. 그래서 글자 그림자는 여기서 끄고,
           잘라 낸 결과 위에 filter 로 다시 얹는다 — filter 는 클리핑 다음 단계라
           그림자가 상자 밖으로 자연스럽게 번진다. */
        textShadow: "none",
        filter: "drop-shadow(0 2px 16px rgba(0,0,0,.65))",
      }}
    >
      <span
        className="block"
        style={{
          transform: rolling ? "translateY(0)" : `translateY(calc(-1 * ${H}))`,
          transition: rolling ? `transform ${ROLL_MS}ms cubic-bezier(.22,.61,.36,1)` : "none",
        }}
      >
        {/* 두 줄 칸이면 문장이 칸 안에서 접히고, 칸 아래쪽에 붙는다.
            문구에 줄바꿈(
)을 넣어 두면 그 자리에서 끊는다 — 줄 수를 문장마다
            똑같이 맞추고 싶을 때 쓴다(pre-line). 줄바꿈이 없는 문구에는 영향이 없다. */}
        <span className="flex flex-col justify-end whitespace-pre-line" style={{ height: H }}>
          {list[(i + 1) % list.length]}
        </span>
        <span className="flex flex-col justify-end whitespace-pre-line" style={{ height: H }}>
          {list[i]}
        </span>
      </span>
    </span>
  );
}

/* 스크롤로 넘기는 롤링 — 몇 번째 줄을 보일지는 바깥(index)이 정한다.
   내려가면 새 줄이 위에서 내려오고(자동 롤링과 같은 방향), 올라가면 반대로
   아래에서 올라온다. 스크롤이 여러 칸을 한 번에 건너뛰어도 마지막 목표로 바로 간다. */
function StepRollingLine({
  list,
  index,
  rows = 1,
  className = "",
}: {
  list: string[];
  index: number;
  rows?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(index); // 자리 잡은 줄
  const [from, setFrom] = useState<number | null>(null); // 넘어가는 중이면 떠나는 줄
  const [dir, setDir] = useState<1 | -1>(1);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (index === shown) return;
    setDir(index > shown ? 1 : -1);
    setFrom(shown);
    setGo(false);
    /* 시작 위치를 한 번 그린 다음 프레임에 움직여야 transition 이 걸린다 */
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setGo(true));
    });
    const t = setTimeout(() => {
      setShown(index);
      setFrom(null);
      setGo(false);
    }, ROLL_MS);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(t);
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const H = `calc(${LH} * ${rows})`;
  /* 트랙에 쌓는 순서와 출발·도착 위치
     · 내려갈 때: [새 줄, 떠나는 줄] — -H 에서 0 으로 (새 줄이 위에서 내려옴)
     · 올라갈 때: [떠나는 줄, 새 줄] — 0 에서 -H 로 (새 줄이 아래에서 올라옴) */
  let items: number[];
  let y: string;
  if (from === null) {
    items = [shown];
    y = "0px";
  } else if (dir === 1) {
    items = [index, from];
    y = go ? "0px" : `calc(-1 * ${H})`;
  } else {
    items = [from, index];
    y = go ? `calc(-1 * ${H})` : "0px";
  }

  return (
    <span
      className={`block overflow-hidden ${className}`}
      style={{
        height: H,
        textShadow: "none",
        filter: "drop-shadow(0 2px 16px rgba(0,0,0,.65))",
      }}
    >
      <span
        className="block"
        style={{
          transform: `translateY(${y})`,
          transition: from !== null && go ? `transform ${ROLL_MS}ms cubic-bezier(.22,.61,.36,1)` : "none",
        }}
      >
        {items.map((n, k) => (
          <span
            key={`${n}-${k}`}
            className="flex flex-col justify-end whitespace-pre-line"
            style={{ height: H }}
          >
            {list[n]}
          </span>
        ))}
      </span>
    </span>
  );
}

/* 스크롤 한 칸(문장 하나를 넘기는 거리) — 화면 높이의 절반.
   휠 두세 번, 모바일 한 번 쓸어내리기 정도다. */
const SCROLL_STEP_RATIO = 0.5;

/* videoSrc 는 배경 영상 시안 비교용(/video-lab)으로만 넘긴다.
   안 넘기면 위에서 import 한 기본 영상을 쓰므로 실서비스 동작은 그대로다. */
export function HeroSection({
  videoSrc,
  copy = HERO_COPY_DEFAULT,
}: { videoSrc?: string; copy?: HeroCopy } = {}) {
  const heroVideo = useHeroVideo();

  /* 가운데 정렬 시안 — 배지·타이틀·서브카피를 한 덩어리로 묶어 flex-1 안에서
     세로 가운데에 놓는다. CTA 는 원래 자리(아래)에 그대로 두므로 결과적으로
     "화면 위끝 ~ CTA" 구간의 한가운데가 된다.
     기본값일 때는 wrap 이 display:contents 라 DOM 이 있어도 레이아웃에 영향이 없다 —
     지금까지의 히어로와 픽셀 단위로 같게 유지하기 위한 것이다. */
  const centered = !!copy.centered;
  const wrapCls = centered
    ? "flex-1 flex flex-col justify-center items-center text-center"
    : "contents";
  const badgeSelf = centered ? "self-center" : "self-start";

  /* CTA 를 롤링이 멈춘 뒤에 보여 주는 시안 — 자리는 처음부터 차지해 두고
     투명도만 바꿔서, 드러날 때 위 글이 들썩이지 않게 한다.
     motion.div 에 직접 걸면 등장 애니메이션(opacity → 1)이 덮어써서 안 먹는다.
     그래서 버튼을 감싼 안쪽 div 에 건다. */
  const [rollDone, setRollDone] = useState(!copy.ctaAfterRoll);

  /* 스크롤 롤링 — 바깥 상자를 (문장 수 - 1) × 한 칸 만큼 길게 늘리고
     안쪽 히어로를 sticky 로 붙여 둔다. 그 늘어난 구간을 얼마나 내려왔는지로
     몇 번째 문장인지 정한다. 반 칸을 넘기면 다음 문장으로 넘어간다. */
  const scrollMode = !!(copy.scrollRoll && copy.titleRotate);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLElement>(null);
  const [outerH, setOuterH] = useState<number | undefined>(undefined);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    if (!scrollMode) return;
    const n = copy.titleRotate!.length;
    const measure = () => {
      const inner = innerRef.current;
      if (!inner) return;
      const step = Math.round(window.innerHeight * SCROLL_STEP_RATIO);
      setOuterH(inner.offsetHeight + (n - 1) * step);
    };
    const onScroll = () => {
      const outer = outerRef.current;
      if (!outer) return;
      const step = Math.round(window.innerHeight * SCROLL_STEP_RATIO);
      const scrolled = -outer.getBoundingClientRect().top;
      const idx = Math.max(0, Math.min(n - 1, Math.floor(scrolled / step + 0.5)));
      setScrollIdx(idx);
      if (idx >= n - 1) setRollDone(true);
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [scrollMode, copy.titleRotate]);
  const ctaReveal = {
    opacity: rollDone ? 1 : 0,
    pointerEvents: rollDone ? ("auto" as const) : ("none" as const),
    transition: "opacity .5s ease",
  };

  /* 타이틀 두 줄. 롤링 시안은 줄마다 block 으로 쌓고, 아닐 때는 지금까지와 같은
     span + <br> 를 그대로 쓴다 — 실서비스 히어로의 DOM 을 바꾸지 않기 위해서다. */
  const titleLines = copy.titleRotate ? (
    (() => {
      const roll = (weight: string) =>
        scrollMode ? (
          <StepRollingLine
            list={copy.titleRotate!}
            index={scrollIdx}
            rows={copy.rotateRows}
            className={weight}
          />
        ) : (
        <RollingLine
          list={copy.titleRotate!}
          rows={copy.rotateRows}
          once={copy.rotateOnce}
          holdLastMs={copy.rotateHoldLastMs}
          onDone={() => setRollDone(true)}
          className={weight}
        />
        );
      return copy.rotateAt === "after" ? (
        <>
          {/* 위 고정줄은 롤링 문장보다 한 단계 작게(85%) — 제목이라기보다 머리말 역할이다.
              아래 롤링과는 살짝 띄운다. 이 줄 글자가 작아졌으니 em 기준도 같이 줄어드는데,
              띄운 간격은 그대로(타이틀 크기의 .3em = 모바일 9px · PC 12px) 두려고
              .3 / .85 = .353em 으로 잡았다. */}
          <span className="block font-light mb-[.353em]" style={{ fontSize: ".85em" }}>
            {copy.titleLight}
          </span>
          {roll("font-extrabold")}
        </>
      ) : (
        <>
          {roll("font-light")}
          <span className="block font-extrabold">{copy.titleBold}</span>
        </>
      );
    })()
  ) : (
    <>
      <span className="font-light">{copy.titleLight}</span>
      <br />
      <span className="font-extrabold">{copy.titleBold}</span>
    </>
  );

  /* 접수 바는 GNB 가 하나만 그린다(lib/consultBar.ts).
     여기서 따로 <ConsultationModal> 을 두면 GNB 것과 두 겹으로 열린다. */

  // 높이: 화면을 채우되 900px 를 넘지 않고(원본 규격), 내용이 더 길면 내용만큼 늘어난다.
  // min-h-fit 이 max-h 보다 우선하므로 짧은 화면에서 CTA 가 하단 고정바에 잘리지 않는다.
  const body = (
    <section
      ref={innerRef}
      className="relative w-full h-[100svh] min-h-fit max-h-[900px] bg-black overflow-hidden flex flex-col"
    >
      <video
        key={videoSrc ?? heroVideo}
        src={videoSrc ?? heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* 글이 왼쪽에 붙는 PC 는 좌→우, 글이 아래 깔리는 모바일은 아래→위로 어둡게 */}
      <div
        className="hidden md:block absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to right, rgba(14,10,6,.84) 0%, rgba(14,10,6,.62) 38%, rgba(14,10,6,.2) 65%, rgba(14,10,6,.06) 100%)",
        }}
      />
      <div
        className="block md:hidden absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to top, rgba(12,8,4,.93) 0%, rgba(12,8,4,.6) 42%, rgba(12,8,4,.12) 72%, transparent 100%)",
        }}
      />

      {/* ── 모바일 — 하단 정렬. pb 140px 는 고정 BottomBar(100px) 를 비우는 값 ── */}
      <div
        className={`flex md:hidden flex-col relative z-10 flex-1 max-w-screen-md mx-auto w-full px-6 pt-[70px] pb-[140px] ${
          centered ? "" : "justify-end"
        }`}
      >
        <div className={wrapCls}>
        {copy.badge && (
          <motion.div
            {...rise}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 mb-5 ${badgeSelf}`}
          >
            {/* 상시버전 배지 — 행사가 아니라 "설비를 갖췄다" 는 사실만 알린다.
                이벤트판에서는 여기에 "이벤트 마감 D-XX" 가 들어간다.
                시안에서 badge 를 빈 값으로 주면 이 블록째 빠진다. */}
            <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11.5px] font-bold text-white">{copy.badge}</span>
            </div>
          </motion.div>
        )}

        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-[30px] text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)", fontSize: copy.titleSizeMo }}
        >
          {/* 굵기 대비로 두 줄을 나눈다 — 상세페이지 히어로와 같은 형태 */}
          {titleLines}
        </motion.h1>

        {copy.sub.length > 0 && (
        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[15px] text-white/85 leading-[1.6] -tracking-[.02em] mb-7 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          {copy.sub.map((line, i) =>
            /* 빈 칸은 "한 줄 띄움". 온전한 한 줄(1.6em)은 너무 벌어져서 70% 만 준다.
               block 이라 그 자체가 줄을 끊으므로 앞뒤에 <br> 이 필요 없다. */
            line === "" ? (
              <span key={i} className="block" style={{ height: "1.12em" }} />
            ) : (
              <span key={i}>
                {i > 0 && copy.sub[i - 1] !== "" && <br />}
                {subLine(line, copy.subHighlight, copy.subEmphasis)}
              </span>
            ),
          )}
        </motion.p>
        )}

        </div>

        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-col gap-3"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          <div className="flex flex-col" style={ctaReveal}>
          {/* 260907 통합버전: 상세페이지가 없으니 "자세히 보기" 로 보낼 곳이 없다.
              대신 상세 히어로가 쓰던 접수 모달을 그대로 연다.
              모달은 GNB(Navigation)가 하나만 그린다 — lib/consultBar.ts 참고.
              여기서 <ConsultationModal> 을 또 두면 두 겹으로 열린다. */}
          <button
            type="button"
            onClick={() => openConsultBar("히어로")}
            className="flex items-center justify-center h-[52px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[15.5px] rounded-xl cursor-pointer transition-colors"
          >
            {copy.cta}
          </button>
          </div>
        </motion.div>
      </div>

      {/* ── PC — 좌측 정렬, 세로 가운데. pt 는 고정 GNB(70px) 를 비우는 값 ── */}
      <div className="hidden md:flex flex-col justify-center relative z-10 flex-1 max-w-screen-md mx-auto w-full px-10 pt-[112px] pb-[112px]">
        <div className={wrapCls}>
        {copy.badge && (
          <motion.div
            {...rise}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 mb-5 ${badgeSelf}`}
          >
            {/* 상시버전 배지 — 행사가 아니라 "설비를 갖췄다" 는 사실만 알린다.
                이벤트판에서는 여기에 "이벤트 마감 D-XX" 가 들어간다.
                시안에서 badge 를 빈 값으로 주면 이 블록째 빠진다. */}
            <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[12.5px] font-bold text-white">{copy.badge}</span>
            </div>
          </motion.div>
        )}

        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-[40px] text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)", fontSize: copy.titleSizePc }}
        >
          {/* 굵기 대비로 두 줄을 나눈다 — 상세페이지 히어로와 같은 형태 */}
          {titleLines}
        </motion.h1>

        {copy.sub.length > 0 && (
        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[19px] text-white/85 leading-[1.6] mb-8 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          {copy.sub.map((line, i) =>
            /* 빈 칸은 "한 줄 띄움". 온전한 한 줄(1.6em)은 너무 벌어져서 70% 만 준다.
               block 이라 그 자체가 줄을 끊으므로 앞뒤에 <br> 이 필요 없다. */
            line === "" ? (
              <span key={i} className="block" style={{ height: "1.12em" }} />
            ) : (
              <span key={i}>
                {i > 0 && copy.sub[i - 1] !== "" && <br />}
                {subLine(line, copy.subHighlight, copy.subEmphasis)}
              </span>
            ),
          )}
        </motion.p>
        )}

        {/* PC 는 CTA 까지 같은 덩어리로 묶는다. 가운데 정렬 시안에서 CTA 만 아래로
            떨어져 있으면 글과 버튼이 따로 노는 것처럼 보인다.
            기본값일 때 바깥 래퍼는 display:contents 라 이 위치 변경이 레이아웃에
            아무 영향을 주지 않는다 — 지금까지의 PC 히어로와 동일하다. */}
        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className={`flex flex-row gap-3 ${centered ? "justify-center" : ""}`}
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          <div className="flex" style={ctaReveal}>
          <button
            type="button"
            onClick={() => openConsultBar("히어로")}
            /* 폭을 260px 로 못 박으면 "견적서에 강화유리가 있는지 확인하세요" 같은 긴 문구가
               버튼 밖으로 삐져나온다. 최소 260px 은 지키되 글자만큼 늘어나게 둔다. */
            className="flex items-center justify-center h-[52px] min-w-[260px] px-8 whitespace-nowrap bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[16.5px] rounded-xl cursor-pointer transition-colors"
          >
            {copy.cta}
          </button>
          </div>
        </motion.div>
        </div>
      </div>

    </section>
  );

  if (!scrollMode) return body;
  /* sticky 가 먹으려면 조상 중에 overflow:hidden/auto 인 것이 없어야 한다.
     (overflow-x:hidden 도 세로를 auto 로 바꿔 버리므로 안 된다 — clip 을 쓸 것) */
  return (
    <div ref={outerRef} className="relative" style={{ height: outerH }}>
      <div className="sticky top-0">{body}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ↓↓↓ 이벤트 종료 후 되살릴 기존 히어로 (260831 이전 원본 그대로) ↓↓↓

   되살리는 법: 위 HeroSection 을 지우고 아래 주석을 풀면 된다.
   함께 되살려야 하는 import 두 줄:
     import heroBg from "../../assets/hero-bg.jpeg";
     import { VideoModal } from "./VideoModal";
   (heroBg 주석 — 260714: 4096px·20MB PNG → 1920px·363KB JPEG, 블러 배경이라 화질 차이 없음)

export function HeroSection() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] max-h-[900px] bg-black overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="hero background" className="w-full h-full object-cover opacity-60 blur-sm scale-105" loading="eager" fetchPriority="high" />
      </div>

      <div className="absolute inset-0 bg-[rgba(20,20,20,0.5)] z-0" />

      {/* Content centered vertically and horizontally *​/}
      <div className="relative z-10 flex flex-col justify-start md:justify-center h-full max-w-screen-md mx-auto w-full px-6 md:px-10 pt-[30svh] md:pt-20 pb-[140px] md:pb-0 bg-[#00000000]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => setIsConsultOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsConsultOpen(true); } }}
          aria-label="상담 신청 열기"
          className="text-[32px] md:text-[40px] font-extrabold text-white leading-tight md:text-center text-center cursor-pointer select-none hover:scale-[1.01] active:scale-[0.99] transition-transform outline-none"
        ><span className="text-[#d22727]">창호 교체, </span><span>이제</span><br /><span>믿을 수 있는 곳에서</span><br /><span>한번에 끝내세요.</span></motion.h1>
      </div>

      {/* 260714: GNB 무료상담접수 버튼의 오른쪽 끝선(max-w-screen-xl 컨테이너 라인)에 정렬
          — 뷰포트 우측 끝(right-10)이 아니라 컨테이너 기준이라 측면 인디케이터와 안 겹침 *​/}
      <div className="absolute bottom-[100px] inset-x-0 z-10 pointer-events-none">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            onClick={() => setIsVideoOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsVideoOpen(true); } }}
            aria-label="회사 소개 영상 재생"
            className="inline-block text-right pointer-events-auto cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] transition-transform outline-none"
          >
            <div className="mb-4">
              <p className="text-[#d22727] text-sm md:text-base font-bold mb-1">Since. 1996</p>
              <p className="text-white text-3xl md:text-4xl font-extrabold">창호 제조 30년</p>
            </div>
            <div>
              <p className="text-[#d22727] text-sm md:text-base font-bold mb-1">국내 최대 자동화 공장</p>
              <p className="text-white text-3xl md:text-4xl font-extrabold">38,000평</p>
            </div>
          </motion.div>
        </div>
      </div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        variant="top"
      />
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        youtubeId="LZBNfx5ilLw"
        title="청암홈윈도우 회사·공장 소개"
      />
    </section>
  );
}

   ↑↑↑ 여기까지 ↑↑↑
   ══════════════════════════════════════════════════════════════════════ */
