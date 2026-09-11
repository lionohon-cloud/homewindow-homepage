import { motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ComponentType } from "react";
import { Flame, Wrench, Truck, Factory } from "lucide-react";

/* 재단 아이콘 — 가위 대신 "유리판(직사각형) 가운데를 지나는 점선 재단선".
   lucide 아이콘과 같은 24 격자 · currentColor · size/strokeWidth 로 맞춰 옆 아이콘과 굵기가 같다.
   재단선(점선)은 판 안쪽에만 둔다. (260911 — 위아래로 삐져나오던 것을 안으로 넣음) */
function CutIcon({ size = 24, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      {/* 260911 판을 키웠다 (18×12 → 21×15). 격자를 거의 꽉 채운다 */}
      <rect x="1.5" y="4.5" width="21" height="15" rx="1.8" strokeWidth={strokeWidth} strokeLinejoin="round" />
      {/* 재단선은 판 안쪽에만 — 점 3개(2.4)·틈 2개(1.6) = 10.4 를 판 세로 가운데(12)에 맞춘다.
          판 안쪽 테두리(y≈5.6~18.4)에서 위아래 1.2 씩 띄워 삐져나오지 않는다. */}
      <path d="M12 6.8v10.4" strokeWidth={strokeWidth} strokeDasharray="2.4 1.6" />
    </svg>
  );
}

/**
 * 히어로 바로 다음 섹션 — 히어로가 다 말하지 못한 "왜" 를 잇는다. (260911 통합버전)
 *
 * 히어로 흐름
 *   창에 강화유리, 원래 가능했습니다 → 비싸고 번거롭기 때문에 말하지 않았을 뿐입니다
 *   → 청암홈윈도우는 강화유리가 기본입니다
 *
 * 이 섹션 흐름
 *   ① 왜 드물었나 — 점선 캡슐 안 겹친 원 셋(+강화 공정 · +물류비 · 외주생산비)
 *      → 점·선 → 빨간 요약 박스. 여백을 크게 두고 키워드로 전달한다. (260911 섹션 실험실 B안 채택)
 *   ② 생산 과정 비교 — 한 박스 안에서 좌우로 (260911: 위아래 → 좌우, 모바일에서 한 화면에 들어오게)
 *        왼쪽 : 설비 없는 곳 — 재단 ↓(트럭) 외부 강화 공장 ↓(트럭) 제작, 세로 3단계 왕복
 *        오른쪽: 청암홈윈도우 — 단계 없이 직영 공장 하나에서 재단·강화·제작이 한꺼번에
 *      화면에 들어오면 둘이 동시에 시작하고, 청암 쪽이 먼저 끝난다.
 *      스크롤 위치에 묶지 않고 "들어오면 시작 → 제 속도로 재생" 이라
 *      빨리 내리는 사람도 끝 모습은 본다. 긴 쪽이 끝나고 2초 뒤 처음부터 반복.
 *
 * 260911 — 끝에 있던 검정 카드("그래서 강화유리가 기본입니다" + 60억 원·38,000평)는 뺐다.
 *
 * 행사 문구(가격·무상 등)는 넣지 않는다 — 설비 도입 · 직접 생산 사실만.
 * 섹션 타이틀·리드 글자 규격은 메인 섹션(TemperedSections)과 같다.
 */

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
} as const;

/* 원 셋 — 260911 섹션 실험실 B안(원형 3개) 채택.
   이전의 이유 카드 2장은 section-lab/WhyBasicVariants.tsx 의 WhyBasicCards 로 옮겨 두었다. */
const CIRCLES = [
  { value: "+강화 공정", label: "번거로운 강화 공정" },
  { value: "+물류비", label: "외부 운송비용 발생" },
  { value: "+외주생산비", label: "외부 강화로 사용" },
];

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;
type Step = { icon: IconType; name: string; place?: string };

/** 비교 박스 한 칸(설비 없는 곳 / 청암홈윈도우)의 머리 정보 */
type RowMeta = {
  title: string;
  /** 제목 아래 가는 글씨 한 줄 */
  subtitle: string;
  /** 전체 재생 시간(초) */
  duration: number;
  mine?: boolean;
};

type OutsideRoute = RowMeta & {
  steps: Step[];
  /** [0, 외부 강화 공장 도착, 외부 강화 공장 출발, 1] — 전체 시간 대비 */
  times: number[];
  /** 각 단계 동그라미가 켜지는 시점 (전체 시간 대비 0~1) */
  nodeAt: number[];
  /** 비용 팝업 — 마리오 동전처럼 해당 단계 왼쪽에서 "+운송비" 가 튀어 올랐다 사라진다.
      at: 전체 시간 대비 시점(0~1), node: 몇 번째 단계 옆인지 */
  pops: { at: number; node: number; label: string }[];
  color: string;
};

type InsideRoute = RowMeta & {
  /** 공장 하나 위로 차례로 튀어 오르는 공정 — 선·동그라미 단계 없이 한 곳에서 다 한다 */
  tasks: Step[];
};

/* 설비 없는 곳 — 트럭이 천천히 외부 강화 공장까지 가서 한참 머물다 돌아온다.
   전체 8.9초로 청암 쪽(2.5초)보다 3.5배쯤 길다. (260911: 4.2 → 7.5 → 8.9초, 차이를 더 크게)
   실제 기간을 뜻하지 않는다. 공장 밖을 오가는 만큼 길다는 느낌만 준다. */
const OUTSIDE: OutsideRoute = {
  title: "강화 설비가 없는 곳",
  subtitle: "번거롭고 복잡한 프로세스",
  steps: [
    { icon: CutIcon, name: "재단", place: "창호 공장" },
    { icon: Flame, name: "강화", place: "외부 강화 공장" },
    { icon: Wrench, name: "제작", place: "창호 공장" },
  ],
  /* 260911 트럭 이동속도 0.8배 — 달리는 구간만 2.85 → 3.56초, 대기 1.8초는 그대로.
     가는 길 3.56초 · 외부 공장에서 1.78초 대기 · 오는 길 3.56초 = 8.9초 */
  duration: 8.9,
  times: [0, 0.4, 0.6, 1],
  nodeAt: [0, 0.4, 1],
  /* 트럭이 도착할 때마다 운송비, 외부 공장에서 기다리는 동안 가공비 */
  pops: [
    { at: 0.4, node: 1, label: "+운송비" },
    { at: 0.5, node: 1, label: "+가공비" },
    { at: 1, node: 2, label: "+운송비" },
  ],
  color: "#8a8a8e",
};

/* 청암홈윈도우 — 260911 3단계(선·동그라미 셋)를 없애고 공장 아이콘 하나로.
   그 공장 위로 재단 → 강화 → 제작 이 차례로 튀어 올랐다 사라진다. 2.5초. */
const INSIDE: InsideRoute = {
  title: "청암홈윈도우",
  subtitle: "Non-Stop 프로세스",
  duration: 2.5,
  tasks: [
    { icon: CutIcon, name: "재단" },
    { icon: Flame, name: "강화" },
    { icon: Wrench, name: "제작" },
  ],
  mine: true,
};

/** 긴 쪽(설비 없는 곳)이 끝난 뒤 처음부터 다시 돌기까지 쉬는 시간(초) */
const LOOP_GAP_S = 2;

const NODE_OFF = { backgroundColor: "#ffffff", borderColor: "#e2e2e6", color: "#b5b5ba" };

/* ── 칸 머리 — 이름 · 프로세스 문구 (가운데 정렬) ──
   260911 제작중/완성 뱃지와 꼬리표(외주 가공비 등)는 뺐다. 표 머리처럼 이름 두 줄만 두고,
   아래 공정 그림과는 박스를 가로지르는 선으로 나눈다(CompareBox). */
function RowHeader({ meta }: { meta: RowMeta }) {
  return (
    <p className="flex flex-col items-center text-center gap-0.5">
      <span
        className={`text-[14px] md:text-[16px] font-extrabold leading-[1.3] break-keep ${
          meta.mine ? "text-[#d22727]" : "text-[#555]"
        }`}
      >
        {meta.title}
      </span>
      {/* 두 칸 모두 회색 */}
      <span className="text-[12px] md:text-[14px] font-light leading-[1.35] break-keep text-[#8a8a8e]">
        {meta.subtitle}
      </span>
    </p>
  );
}

/* ── 설비 없는 곳 — 세로 3단계. 구간마다 트럭이 위에서 아래로 내려간다 ──
   가운데 세로축에 동그라미 · 그 아래 이름/장소 · 다음 구간 선 순으로 쌓는다.
   구간 선 오른쪽에 "운송"(트럭이 지날 때 굵게), 동그라미 왼쪽에 비용 동전. */
function OutsideTrack({ route, play, speed }: { route: OutsideRoute; play: boolean; speed: number }) {
  const D = route.duration * speed;
  const [, t1, t2] = route.times;
  const on = { backgroundColor: route.color, borderColor: route.color, color: "#ffffff" };

  /* 지금 트럭이 달리는 운송 구간 — 0: 재단→외부 강화, 1: 외부 강화→제작, null: 달리는 중 아님.
     그 구간 옆 "운송" 글자만 굵게 한다. 박스가 반복마다 새로 그려지므로 매번 처음부터 다시 센다. */
  const [seg, setSeg] = useState<number | null>(null);
  useEffect(() => {
    if (!play || D === 0) return;
    const at = (frac: number, v: number | null) => window.setTimeout(() => setSeg(v), frac * D * 1000);
    const ids = [at(0, 0), at(t1, null), at(t2, 1), at(1, null)];
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [play, t1, t2, D]);

  /* 구간별 키프레임 — 0 번 구간은 0~t1 에 달리고, 1 번 구간은 t2~1 에 달린다.
     채움선(scaleY)과 트럭 위치(y)는 같은 시점표를 쓴다. 트럭은 달리는 동안만 보인다. */
  const segs = [
    {
      frames: [0, 1, 1],
      ys: ["0%", "100%", "100%"],
      times: [0, t1, 1],
      /* 260911 등속 — easeInOut 은 짧은 구간에서 출발·도착이 느리고 가운데가 빨라 울컥거려 보였다 */
      ease: ["linear", "linear"] as const,
      op: [0, 1, 1, 0, 0],
      opTimes: [0, 0.02, t1 - 0.02, t1, 1],
    },
    {
      frames: [0, 0, 1],
      ys: ["0%", "0%", "100%"],
      times: [0, t2, 1],
      ease: ["linear", "linear"] as const,
      op: [0, 0, 1, 1, 0],
      opTimes: [0, t2, t2 + 0.02, 0.98, 1],
    },
  ];

  return (
    <div className="mt-5 flex flex-col items-center">
      {route.steps.map((s, i) => {
        const Icon = s.icon;
        const k = segs[i - 1];
        return (
          <Fragment key={s.name}>
            {k && (
              /* 260911 공정 간 간격 줄임 — 선 52/60 → 36/44px, 위아래 여백 6 → 4px */
              <div className="relative w-[2px] h-[36px] md:h-[44px] my-1 bg-[#e2e2e6]">
                <motion.div
                  className="absolute inset-0 origin-top"
                  style={{ backgroundColor: route.color }}
                  initial={{ scaleY: 0 }}
                  animate={play ? { scaleY: k.frames } : { scaleY: 0 }}
                  transition={{ duration: D, times: k.times, ease: [...k.ease] }}
                />
                {/* 트럭 — 선 위를 따라 내려간다. 뒤에 칸 바탕색을 깔아 선이 아이콘을 뚫고 보이지 않게 한다
                    (바탕과 같은 색이라 상자로 보이지 않는다). 흔들림 없이 일자로. */}
                {/* 260911 top(레이아웃 값) 대신 transform(y) 로 움직인다.
                    top 은 1px 단위로 끊겨 그려져서, 36~44px 을 3.5초에 걸쳐 천천히 내려가면
                    0.1초마다 한 칸씩 툭툭 끊겨 렉처럼 보였다. transform 은 픽셀 사이 위치까지
                    부드럽게 그려지고 GPU 가 합성한다.
                    구간 높이와 같은 투명 틀을 y: 0% → 100%(자기 높이 = 구간 높이)로 내리고,
                    트럭은 그 틀 맨 위에 붙여 둔다. */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-full z-10 pointer-events-none"
                  style={{ willChange: "transform, opacity" }}
                  initial={{ y: "0%", opacity: 0 }}
                  animate={play ? { y: k.ys, opacity: k.op } : { y: "0%", opacity: 0 }}
                  transition={{
                    y: { duration: D, times: k.times, ease: [...k.ease] },
                    opacity: { duration: D, times: k.opTimes, ease: "linear" },
                  }}
                >
                  <span
                    data-truck
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 block py-0.5 bg-[#f7f7f8] text-[#8a8a8e]"
                  >
                    <Truck size={20} strokeWidth={1.9} />
                  </span>
                </motion.span>
                {/* "운송" — 선 왼쪽(260911: 오른쪽 → 왼쪽). 트럭이 이 구간을 달리는 동안만 굵게 */}
                <span
                  data-seg-active={seg === i - 1 || undefined}
                  className={`absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] md:text-[13px] whitespace-nowrap transition-colors ${
                    seg === i - 1 ? "font-bold text-[#555]" : "font-medium text-[#9a9a9e]"
                  }`}
                >
                  운송
                </span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div className="relative">
                <motion.div
                  className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border-2 grid place-items-center"
                  initial={NODE_OFF}
                  animate={play ? on : NODE_OFF}
                  transition={{ delay: play ? route.nodeAt[i] * D : 0, duration: 0.25 * speed }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </motion.div>
                {/* 비용 동전 — 동그라미 왼쪽에서 튀어 올라 살짝 떠오르며 사라진다 */}
                {route.pops
                  .filter((p) => p.node === i)
                  .map((p) => (
                    <motion.span
                      key={`${p.at}${p.label}`}
                      className="absolute right-[calc(100%+4px)] top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-[3px] whitespace-nowrap pointer-events-none"
                      initial={{ opacity: 0, y: 6, scale: 0.6 }}
                      animate={
                        play
                          ? { opacity: [0, 1, 1, 0], y: [6, -6, -10, -14], scale: [0.6, 1.12, 1, 1] }
                          : { opacity: 0, y: 6, scale: 0.6 }
                      }
                      transition={{
                        delay: play ? p.at * D : 0,
                        duration: 0.9 * speed,
                        times: [0, 0.25, 0.7, 1],
                        ease: "easeOut",
                      }}
                    >
                      <span className="grid place-items-center w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full bg-[#f5b301] border border-[#d99a00] text-white text-[8.5px] md:text-[9.5px] font-extrabold leading-none shadow-[0_1px_3px_rgba(0,0,0,.2)]">
                        ₩
                      </span>
                      <span className="text-[11px] md:text-[13px] font-extrabold text-[#c27c00]">{p.label}</span>
                    </motion.span>
                  ))}
              </div>
              <p className="mt-1.5 text-[13px] md:text-[14px] font-bold text-[#444] leading-[1.3]">{s.name}</p>
              {s.place && (
                <p className="text-[11px] md:text-[11.5px] text-[#9a9a9e] leading-[1.35] whitespace-nowrap">
                  {s.place}
                </p>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

/* ── 청암홈윈도우 — 단계 없이 공장 하나 ──
   공장이 일하는 동안(제작중) 둘레의 점선 고리가 돌고, 공장 위로 재단 → 강화 → 제작 이
   같은 자리에서 차례로 튀어 오른다. 끝나면 고리는 사라지고 빨간 공장만 남는다.
   칸 높이는 왼쪽(세로 3단계)이 정하므로 남은 높이의 세로 가운데에 둔다. */
function FactoryTrack({ route, play, speed }: { route: InsideRoute; play: boolean; speed: number }) {
  const D = route.duration * speed;
  const n = route.tasks.length;
  const on = { backgroundColor: "#d22727", borderColor: "#d22727", color: "#ffffff" };

  return (
    <div className="flex-1 mt-5 pt-10 flex flex-col items-center justify-center">
      <div className="relative">
        {/* 일하는 동안 도는 점선 고리 */}
        <motion.span
          aria-hidden="true"
          className="absolute -inset-[7px] rounded-full border-2 border-dashed border-[#d22727]/50 animate-[spin_5s_linear_infinite] motion-reduce:animate-none"
          initial={{ opacity: 0 }}
          animate={play ? { opacity: [1, 1, 0] } : { opacity: 0 }}
          transition={{
            duration: D + 0.1 * speed,
            times: D > 0 ? [0, D / (D + 0.1 * speed), 1] : [0, 1, 1],
            ease: "linear",
          }}
        />
        <motion.div
          data-factory
          className="relative w-[60px] h-[60px] md:w-[68px] md:h-[68px] rounded-full border-2 grid place-items-center"
          initial={NODE_OFF}
          animate={play ? on : NODE_OFF}
          transition={{ duration: 0.25 * speed }}
        >
          <Factory size={28} strokeWidth={2} />
        </motion.div>
        {/* 공정 팝업 — 한 공장 위에서 재단 → 강화 → 제작 이 차례로 */}
        {route.tasks.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.span
              key={t.name}
              data-task={t.name}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 inline-flex items-center gap-1 whitespace-nowrap pointer-events-none"
              initial={{ opacity: 0, y: 6, scale: 0.6 }}
              animate={
                play
                  ? { opacity: [0, 1, 1, 0], y: [6, -6, -10, -14], scale: [0.6, 1.12, 1, 1] }
                  : { opacity: 0, y: 6, scale: 0.6 }
              }
              transition={{
                delay: play ? (i / n) * D + 0.1 * speed : 0,
                duration: 0.8 * speed,
                times: [0, 0.25, 0.7, 1],
                ease: "easeOut",
              }}
            >
              <span className="grid place-items-center w-[18px] h-[18px] rounded-full bg-[#d22727] text-white">
                <Icon size={11} strokeWidth={2.6} />
              </span>
              <span className="text-[13px] font-extrabold text-[#d22727]">{t.name}</span>
            </motion.span>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] md:text-[14px] font-bold text-[#444] leading-[1.3]">직영 공장</p>
      <p className="text-[11px] md:text-[11.5px] text-[#9a9a9e] leading-[1.35] whitespace-nowrap">
        {route.tasks.map((t) => t.name).join(" · ")}
      </p>
    </div>
  );
}

/* ── 비교 박스 — 한 박스 좌우 두 칸. 왼쪽 설비 없는 곳 · 가운데 VS · 오른쪽 청암 ──
   260911 위아래로 쌓으면 모바일에서 한 화면에 안 들어와 좌우로 바꿨다. */
function CompareBox({ play, speed }: { play: boolean; speed: number }) {
  /* 260911 표처럼 — 2×2 격자: 윗줄 머리(이름·프로세스) / 아랫줄 공정 그림.
     윗줄 칸에 아래 테두리를 줘서 두 칸의 나눔선이 한 높이로 이어지게 한다.
     (칸마다 따로 쌓으면 머리 높이가 다를 때 선이 어긋난다) */
  return (
    <div className="relative grid grid-cols-2 rounded-2xl border border-[#e6e6e8] bg-white overflow-hidden shadow-[0_12px_32px_-14px_rgba(0,0,0,.16)]">
      <div className="flex items-center justify-center bg-[#f7f7f8] border-r border-b border-[#e6e6e8] px-3 py-4 md:px-6 md:py-5">
        <RowHeader meta={OUTSIDE} />
      </div>
      <div className="flex items-center justify-center border-b border-[#e6e6e8] px-3 py-4 md:px-6 md:py-5">
        <RowHeader meta={INSIDE} />
      </div>
      <div className="flex flex-col bg-[#f7f7f8] border-r border-[#e6e6e8] px-3 pb-6 md:px-6 md:pb-8">
        <OutsideTrack route={OUTSIDE} play={play} speed={speed} />
      </div>
      <div className="flex flex-col px-3 pb-6 md:px-6 md:pb-8">
        <FactoryTrack route={INSIDE} play={play} speed={speed} />
      </div>
      {/* 가운데 구분선 위 VS */}
      <span className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-[#e6e6e8] text-[11px] md:text-[12px] font-extrabold tracking-wider text-[#333]">
        VS
      </span>
    </div>
  );
}

/* 섹션 실험실(/section-lab) 시안들도 같은 비교 박스를 쓰려고 내보낸다 */
export function RouteCompare() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  /* 움직임 줄이기 설정이면 바로 끝 모습 */
  const speed = reduce ? 0 : 1;
  const [run, setRun] = useState(0);

  /* 반복 — 설비 없는 쪽(긴 쪽)까지 끝나고 LOOP_GAP_S 초 뒤에 둘 다 처음부터 다시.
     run 이 바뀌면 박스 key 가 바뀌어 새로 그려지며 애니메이션이 처음부터 돈다.
     (260911 — "다시 보기" 버튼 대신) */
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(
      () => setRun((r) => r + 1),
      (OUTSIDE.duration + LOOP_GAP_S) * 1000,
    );
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <div ref={ref}>
      <CompareBox key={run} play={inView} speed={speed} />
      {/* 박스 그림자에 글자가 묻히지 않게 32px 띄운다 */}
      <p className="mt-8 text-[11.5px] text-[#bbb] break-keep leading-[1.6]">
        ※ 공정 흐름을 이해하기 쉽게 단순화한 그림입니다.
      </p>
    </div>
  );
}

export function WhyBasicSection() {
  return (
    /* 260911 B안 — 여백을 크게(py-16/24 → 24/36) 두고 키워드로 전달한다 */
    <section
      id="why-basic"
      className="w-full bg-white py-24 md:py-36 scroll-mt-[73px] min-[1550px]:scroll-mt-[83px]"
    >
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* ── 머리말 (가운데 정렬) ── */}
        {/* 캡션 규격은 다른 섹션(AwardsSection "믿을 수 있습니다")과 같게 — #999 · 16px · medium */}
        <motion.p
          {...rise}
          transition={{ duration: 0.5 }}
          className="text-center text-[#999] text-[16px] font-medium mb-3"
        >
          창호 업계가 말하지 않는 것
        </motion.p>
        <motion.h2
          {...rise}
          transition={{ duration: 0.5, delay: 0.04 }}
          className="text-center text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] break-keep"
        >
          지금까지도 창문에는
          <br />
          <span className="text-[#d22727]">강화유리가 드물었던 이유</span>
        </motion.h2>

        {/* ── ① 원 셋 ──
            점선 캡슐 안에서 서로 겹친다. PC 는 가로, 모바일은 폭이 모자라 세로로 겹친다.
            겹친 자리에서 앞 원의 테두리가 보이도록 원 바탕은 반투명. 원 안은 키워드 + 짧은 말 하나. */}
        <motion.div
          {...rise}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-16 md:mt-20 mx-auto w-fit rounded-[999px] border border-dashed border-[#d6d6db] p-3 md:p-4"
        >
          <div className="flex flex-col md:flex-row items-center">
            {CIRCLES.map((c, i) => (
              <div
                key={c.value}
                className={`relative grid place-items-center text-center w-[200px] h-[200px] md:w-[228px] md:h-[228px] rounded-full bg-[#f7f7f8]/70 border border-[#e6e6ea] ${
                  i > 0 ? "-mt-8 md:mt-0 md:-ml-8" : ""
                }`}
              >
                <div>
                  <p className="text-[28px] md:text-[32px] font-extrabold text-[#d22727] leading-[1.2] whitespace-nowrap">
                    {c.value}
                  </p>
                  <p className="mt-1.5 text-[16px] md:text-[18px] text-[#555] whitespace-nowrap">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 점 · 세로선 → 요약 박스 */}
        <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex flex-col items-center">
            <span className="mt-6 grid place-items-center w-4 h-4 rounded-full bg-[#d22727]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d22727]" />
            </span>
            <span className="w-px h-14 md:h-16 bg-[#d22727]/50" />
          </div>
          <div className="rounded-2xl bg-[#d22727] px-6 py-7 md:px-10 md:py-8 text-center text-white">
            <p className="text-[16px] md:text-[18px] font-bold leading-[1.6] break-keep">
              청암홈윈도우는 이 모든 과정을 직영 공장 한곳에서 끝냅니다.
            </p>
          </div>
        </motion.div>

        {/* ── ② 생산 과정 비교 ── */}
        {/* 섹션 안 소분류 — 메인 가이드(GlassTypeSection "LX 수퍼더블로이란 무엇인가요?")와 같은 규격.
            제목 #333 18/20px bold 한 줄 · mb-4, 본문 #999 16/17px · 줄높이 26px.
            위 요약 박스와는 여백을 크게(mt-24/32) 둔다. */}
        <motion.h3
          {...rise}
          transition={{ duration: 0.5 }}
          className="mt-24 md:mt-32 mb-4 text-[#333] text-[18px] md:text-[20px] font-bold break-keep"
        >
          같은 강화유리, 생산 과정이 다릅니다
        </motion.h3>
        <motion.p
          {...rise}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6 text-[#999] text-[16px] md:text-[17px] leading-[26px] break-keep"
        >
          재단부터 제작까지, 유리 한 장을 만들려면 거치는 과정입니다.
        </motion.p>
        <motion.div {...rise} transition={{ duration: 0.5, delay: 0.08 }}>
          <RouteCompare />
        </motion.div>
      </div>
    </section>
  );
}
