import { motion, AnimatePresence } from "motion/react"
import React, { useEffect, useState } from "react"
import { Link } from "react-router"
import { ChevronLeft } from "lucide-react"
import heroVideo from "@/assets/Sequence 21.mp4"
import { Navigation } from "../components/Navigation"
import { Footer } from "../components/Footer"
import { BottomBar } from "../components/BottomBar"
import { ForgeMotion } from "../components/tempered/ForgeMotion"
import { GlassBreakSlider } from "../components/tempered/GlassBreakSlider"
import { TestFilm } from "../components/tempered/TestFilm"
import { TemperedConsultForm } from "../components/tempered/TemperedConsultForm"
import { ShortsPlayer } from "../components/tempered/ShortsPlayer"
import { HandwriteTag } from "../components/tempered/HandwriteTag"
import imgHighrise from "@/assets/where-highrise.webp"
import imgFamily from "@/assets/where-family.webp"
import imgLowfloor from "@/assets/where-lowfloor.webp"
import imgCompare from "@/assets/compare-normal-vs-tempered.webp"

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
} as const

const COMPARE: {
  k: string
  sub?: string
  a: string
  aSub?: string
  b: string
  bSub?: string
  aBad?: boolean
  ratio?: number // 강화유리 우위 비율 0~1 (bar 표시용)
}[] = [
  { k: "충격\n강도", a: "1배", b: "3~5배" },
  { k: "풍압\n저항", a: "1배", b: "약 3배" },
  { k: "열충격\n한계", a: "약 80℃", b: "약 180℃" },
  {
    k: "파손\n형태",
    a: "길고 날카로운 조각",
    b: "잘게 부서진 알갱이",
    aBad: true,
  },
]

/* ── 영상 섹션 ────────────────────────────────────────────
   구글 드라이브 공유 링크를 그대로 붙여넣으면 된다(파일 ID 만 넣어도 동작).
   드라이브에서 "링크가 있는 모든 사용자 — 뷰어" 로 공유돼 있어야 재생된다.
   예) https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing        */
const SHORTS_SRC =
  "https://drive.google.com/file/d/16WPncWS43B19XH8kVhhQXLqQdBrDVbRD/view?usp=drive_link"

const WHERE = [
  {
    label: "거실 대형 창",
    d: "면적이 넓을수록 같은 바람에도 유리가 더 크게 휩니다.",
    img: "https://images.unsplash.com/photo-1665249934445-1de680641f50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  },
  {
    label: "발코니 확장 구간",
    d: "바깥 공기를 그대로 맞는 자리라 온도차 부담이 큽니다.",
    img: "https://images.unsplash.com/photo-1767403010227-b991d981ae8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  },
  {
    label: "고층 세대",
    d: "층이 높을수록 창에 걸리는 풍압이 커집니다.",
    img: imgHighrise,
  },
  {
    label: "아이·반려동물 있는 집",
    d: "뛰다 부딪히는 사고가 가장 잦은 곳입니다.",
    img: imgFamily,
  },
  {
    label: "저층·도로변",
    d: "바깥에서 물체가 날아와 부딪힐 위험이 있습니다.",
    img: imgLowfloor,
  },
]

/* 화면에 나오는 섹션 순서와 동일하게 유지할 것 */
const JUMP = [
  { id: "video", label: "실제 영상" },
  { id: "compare", label: "한눈 비교" },
  { id: "why", label: "왜 강한가" },
  { id: "break", label: "깨질 때" },
  { id: "test", label: "시험 기준" },
  { id: "where", label: "적용 부위" },
  { id: "apply", label: "상담 신청" },
]

function Section({
  id,
  children,
  className = "",
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    /* scroll-mt: 앵커로 이동할 때 고정 GNB(모바일 60px+테두리 / 1550px↑ 70px) 만큼 띄운다.
       없으면 섹션 상단이 GNB 뒤로 숨는다. 시각적 여백까지 두려고 각각 12px 더 준다. */
    <section id={id} className={`w-full scroll-mt-[73px] min-[1550px]:scroll-mt-[83px] ${className}`}>
      <div className="max-w-screen-md mx-auto px-6 md:px-10">{children}</div>
    </section>
  )
}

function WhereSlider(): React.ReactElement {
  const [current, setCurrent] = useState(0)
  const total = WHERE.length

  const prev = () => setCurrent((i) => (i - 1 + total) % total)
  const next = () => setCurrent((i) => (i + 1) % total)

  return (
    /* 모바일 230px 유지, PC 는 230 → 276(+20%) → 317(+15%) 로 키웠다.
       인라인 style 로 두면 브레이크포인트를 못 타므로 클래스로 옮겼다. */
    <div className="relative w-full rounded-2xl overflow-hidden h-[230px] md:h-[317px]">
      {WHERE.map((w, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <img
            src={w.img}
            alt={w.label}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* 하단 그라디언트 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 50%, rgba(0,0,0,.15) 75%, transparent 100%)",
            }}
          />
          {/* 텍스트 */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-8 md:pb-8">
            <p className="text-[22px] md:text-[26px] font-extrabold text-white leading-[1.2] mb-2 -tracking-[.02em]">
              {w.label}
            </p>
            <p className="text-[13.5px] md:text-[14.5px] text-white/70 leading-[1.65] break-keep max-w-[340px]">
              {w.d}
            </p>
          </div>
        </div>
      ))}

      {/* 이전/다음 버튼 */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3l5 5-5 5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 하단 도트 */}
      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {WHERE.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

function PriceReasonAccordion(): React.ReactElement {
  const [open, setOpen] = useState(false)
  return (
    /* 버튼 규격은 라이브 MaterialsSection 아코디언과 동일:
       border-2 #eaeaea · rounded-2xl · px-20 py-14 · hover 시 레드 5% · 회전하는 ▶ */
    <motion.div {...rise} transition={{ duration: 0.5, delay: 0.15 }} className="mt-5">
      <div className="border-2 border-[#eaeaea] rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between transition-all duration-300 hover:bg-[#d22727]/5 px-[20px] py-[14px] hover:cursor-pointer"
        >
          <h3 className="text-[#d22727] font-bold text-[16px] text-left break-keep">
            이 혜택이 가능한 이유가 궁금하신가요?
          </h3>
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#d22727] font-bold origin-center flex-shrink-0 ml-2 text-[16px]"
          >
            ▶
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-[20px] pb-5 pt-1">
              <p className="text-[15px] md:text-[17px] font-extrabold text-[#1a1a1a] leading-[1.4] mt-4 mb-2 break-keep">
                이 공정을{" "}
                <span className="text-[#d22727]">저희 공장에서 직접</span>{" "}
                합니다
              </p>
              <p className="text-[13px] md:text-[14px] leading-[1.75] text-[#666] break-keep">
                위 화면의 열처리 설비를{" "}
                <b className="font-semibold text-[#444]">강화로</b>라고 합니다.
                저희 공장에 강화로를 들이면서 유리를 직접 만들 수 있게 됐습니다.
                빠진 외주 가공비를{" "}
                <b className="font-semibold text-[#444]">
                  설비 증설 기념으로 돌려드리는 것
                </b>
                이 이번 무상 업그레이드입니다.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-bold text-[#d22727] tracking-[.12em] tabular-nums">
        {step}
      </span>
      <span className="flex-1 h-px bg-[#f0f0f0]" />
      <span className="text-[11px] font-bold text-[#bbb] tracking-[.08em] uppercase">
        {title}
      </span>
    </div>
  )
}

function useDday(targetDate: string): string {
  const diff = Math.ceil(
    (new Date(targetDate).setHours(23, 59, 59, 999) - Date.now()) / 86400000,
  )
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return "D-DAY"
  return "종료"
}

// href="#id" 를 그대로 쓰면 안 된다. 이 앱은 <ScrollRestoration /> 을 쓰는데, 네이티브
// 앵커 클릭이 만드는 해시 변경도 라우터가 새 내비게이션으로 감지해 스크롤을 맨 위로
// 되돌려 버린다(첫 클릭은 씹히고 두 번째부터 먹는 이유). URL 을 건드리지 않는 수동
// 스크롤로 우회한다 — Section 의 scroll-mt 를 그대로 타도록 scrollIntoView 를 쓴다.
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function Component() {
  // 탭 구분용 — 로컬 개발 서버(dev)에서만 "강화유리"로 바뀐다.
  // import.meta.env.DEV 는 프로덕션 빌드에서 항상 false 라 배포본은 자동으로
  // index.html 의 기본 타이틀("청암홈윈도우")로 돌아간다 — 되돌릴 필요 없음.
  useEffect(() => {
    if (import.meta.env.DEV) document.title = "강화유리"
  }, [])

  // 프로모션 종료일 — 매년 갱신 필요. 지난 날짜면 배지가 "종료"로 바뀐다.
  const dday = useDday("2026-09-30")
  return (
    // 상단 pt: 고정 GNB(모바일 60px / 1550px↑ 70px)
    // 하단 pb: 고정 BottomBar(100px / md 110px) — 두 값 모두 하우스 원본 규격
    <div className="relative w-full min-h-screen pt-[60px] min-[1550px]:pt-[70px] pb-[100px] md:pb-[110px] bg-white font-['Pretendard',sans-serif] overflow-x-hidden selection:bg-[#d22727] selection:text-white">
      <Navigation />

      <main className="w-full flex flex-col">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden">
          {/* 배경 영상 */}
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
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

          {/* 메인으로 돌아가기 — 모바일 전용.
              PC 는 GNB 로고와 브레드크럼(홈 › 강화유리)이 이미 같은 역할을 해서
              버튼까지 두면 복귀 동선이 셋으로 겹친다. 모바일은 GNB 가 로고+햄버거뿐이고
              브레드크럼도 없으므로 이 버튼이 유일한 복귀 수단이다.
              위치는 히어로 본문과 같은 열(px-6)에 맞춘다. */}
          <div className="md:hidden absolute inset-x-0 top-4 z-20 pointer-events-none">
            <div className="max-w-screen-md mx-auto px-6 md:px-10">
              <Link
                to="/"
                aria-label="메인으로 돌아가기"
                className="pointer-events-auto inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full bg-black/35 hover:bg-black/55 border border-white/25 backdrop-blur-sm text-white no-underline transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.4} />
                <span className="text-[13px] font-semibold whitespace-nowrap">메인으로</span>
              </Link>
            </div>
          </div>

          {/* MO — 전체 높이, 텍스트 하단 */}
          <div
            className="flex md:hidden flex-col justify-end relative z-10 px-6 pb-14"
            style={{ minHeight: "70svh" }}
          >
            <motion.div
              {...rise}
              transition={{ duration: 0.5 }}
              className="inline-flex self-start items-center gap-2 mb-5"
            >
              <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[11.5px] font-bold text-white">
                  9월 한정 프로모션
                </span>
              </div>
              <div className="flex items-center bg-white/15 border border-white/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-[11.5px] font-extrabold text-white tabular-nums">
                  {dday}
                </span>
              </div>
            </motion.div>

            <motion.h1
              {...rise}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-[30px] font-extrabold text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)" }}
            >
              열과 충격에 강한
              <br />
              <span className="text-[#ff6060]">강화유리</span>
            </motion.h1>

            <motion.p
              {...rise}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-white/80 leading-[1.7] mb-6 break-keep"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
            >
              같은 두께라도 충격과 열에 훨씬 강합니다. 9월 안에 계약하시면
              LX 창호 선택 시 강화유리로 업그레이드 해드립니다.{" "}
            </motion.p>

            <motion.div
              {...rise}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="flex flex-col items-start gap-1 mb-7"
            >
              <span
                className="text-[15px] font-semibold text-white/80 leading-tight break-keep"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
              >
                일반유리 <span className="text-white/40 mx-0.5">→</span>{" "}
                <b className="font-extrabold text-[#ff6060]">강화유리</b>
              </span>
              <span
                className="text-[32px] font-extrabold text-white leading-[1.1] -tracking-[.03em] break-keep"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,.6)" }}
              >
                <HandwriteTag size={42} className="inline-block align-baseline mr-2 translate-y-[12px] text-white">9월 한정</HandwriteTag>무상 업그레이드
              </span>
              <span
                className="text-[13px] text-white/60 leading-tight break-keep"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
              >
                LX 창호 선택 시
              </span>
            </motion.div>

            <motion.div
              {...rise}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="flex flex-col gap-3"
              style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
            >
              <button
                type="button"
                onClick={() => scrollToId("apply")}
                className="flex items-center justify-center h-[52px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[15.5px] rounded-xl transition-colors cursor-pointer"
              >
                무료 실측 상담 신청
              </button>
            </motion.div>
          </div>

          {/* PC — 기존 레이아웃
              min-h 30.8vw : 배경영상(16:9)이 과하게 잘리지 않도록 높이를 가로폭에 비례시킨다.
              내용 높이(≈590px)가 더 클 때는 무시되므로 FHD(1920) 미만에서는 지금과 동일하고,
              그 이상에서만 폭이 넓어진 만큼 높이도 함께 커져 잘리는 비율이 고정된다.
              1920 / 3.25 ≈ 590 → 3.25 를 유지하는 값이 30.8vw. */}
          <div className="hidden md:flex flex-col justify-center relative z-10 max-w-screen-md mx-auto px-10 pt-14 pb-20 min-h-[30.8vw]">
            <nav className="text-[12px] text-white/40 mb-6 flex items-center gap-1.5">
              <Link
                to="/"
                className="text-white/50 no-underline hover:text-white transition-colors"
              >
                홈
              </Link>
              <span className="text-white/20">›</span>
              <span className="text-white/40">강화유리</span>
            </nav>

            <motion.div
              {...rise}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-5"
            >
              <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[12.5px] font-bold text-white">
                  9월 한정 프로모션
                </span>
              </div>
              <div className="flex items-center bg-white/15 border border-white/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-[12.5px] font-extrabold text-white tabular-nums">
                  {dday}
                </span>
              </div>
            </motion.div>

            <motion.h1
              {...rise}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-[40px] font-extrabold text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)" }}
            >
              열과 충격에 강한
              <br />
              <span className="text-[#ff6060]">강화유리</span>
            </motion.h1>

            <motion.p
              {...rise}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[17px] text-white/80 leading-[1.7] mb-8 break-keep max-w-[480px]"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
            >
              같은 두께라도 충격과 열에 훨씬 강합니다. 9월 안에 계약하시면
              LX 창호 선택 시 강화유리로 업그레이드 해드립니다.{" "}
              <span className="text-white font-bold">추가 비용은 없습니다.</span>
            </motion.p>

            <motion.div
              {...rise}
              transition={{ duration: 0.55, delay: 0.15 }}
              /* 우측 설명이 2줄이라 items-baseline 이면 첫 줄에 맞춰져 둘째 줄이 흘러내린다.
                 items-end 로 두 블록의 아랫변을 맞추고, 큰 숫자의 디센더만큼만 내려 시각 정렬. */
              className="flex flex-col items-start gap-1.5 mb-8"
            >
              <span
                className="text-[17px] font-semibold text-white/80 leading-tight break-keep"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
              >
                일반유리 <span className="text-white/40 mx-1">→</span>{" "}
                <b className="font-extrabold text-[#ff6060]">강화유리</b>
              </span>
              <span
                className="text-[40px] font-extrabold text-white leading-[1.05] -tracking-[.03em] break-keep"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,.6)" }}
              >
                <HandwriteTag size={52} className="inline-block align-baseline mr-2 translate-y-[12px] text-white">9월 한정</HandwriteTag>무상 업그레이드
              </span>
              <span
                className="text-[14px] text-white/60 leading-tight break-keep"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
              >
                LX 창호 선택 시
              </span>
            </motion.div>

            <motion.div
              {...rise}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="flex flex-row gap-3"
              style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
            >
              <button
                type="button"
                onClick={() => scrollToId("apply")}
                className="flex items-center justify-center h-[52px] w-[220px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[16.5px] rounded-xl transition-colors cursor-pointer"
              >
                무료 실측 상담 신청
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── 01. 영상으로 보는 강화유리 ────────────────
            히어로 직후. 설명보다 먼저 실물을 보여주고, 아래 섹션들이 그 근거를 잇는다.
            세로(9:16) 쇼츠 1편.
            모바일 : 타이틀 → 부가설명 → 영상 → 체크리스트
            PC     : 좌열에 글 3개, 우열(320px)에 영상 */}
        <Section id="video" className="py-16 md:py-24 border-t border-[#f3f3f3]">
          {/* 모바일: 타이틀 → 부가설명 → 영상 → 체크리스트 (DOM 순서 그대로)
              PC: 좌측에 글 3개(행 1·2·3), 우측 열에 영상 — 명시적 배치로 순서를 바꾼다 */}
          <div className="grid gap-y-5 md:grid-cols-[1fr_320px] md:gap-x-12 md:gap-y-4">
            <motion.h2
              {...rise}
              transition={{ duration: 0.5 }}
              className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] break-keep -tracking-[.02em] md:col-start-1 md:row-start-1 md:self-end"
            >
              백 마디 설명보다<br />
              <span className="text-[#d22727]">30초면 충분</span>합니다
            </motion.h2>

            <motion.p
              {...rise}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] break-keep md:col-start-1 md:row-start-2"
            >
              일반 유리와 강화유리에 똑같은 충격을 준 실제 촬영 영상입니다.
              깨지는 순간의 차이를 먼저 확인해 보세요.
            </motion.p>

            <motion.div
              {...rise}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full max-w-[300px] md:max-w-none mx-auto md:mx-0 md:col-start-2 md:row-start-1 md:row-span-3 md:self-center"
            >
              <ShortsPlayer src={SHORTS_SRC} title="강화유리 파손 비교 영상" />
              <p className="mt-3 text-[11.5px] text-[#bbb] text-center break-keep">
                ※ 실제 촬영 영상입니다. 시험 조건은 KS 규격과 다를 수 있습니다.
              </p>
            </motion.div>

            <motion.ul
              {...rise}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="grid gap-2.5 md:col-start-1 md:row-start-3 md:self-start"
            >
              {[
                '일반 유리는 길고 날카로운 조각으로 쪼개집니다',
                '강화유리는 손톱만 한 알갱이로 부서집니다',
                '같은 두께인데 견디는 충격의 크기가 다릅니다',
              ].map((t) => (
                <li
                  key={t}
                  className="relative pl-[22px] text-[13.5px] md:text-[14.5px] text-[#555] break-keep leading-[1.6] before:content-['✓'] before:absolute before:left-0 before:top-0 before:text-[#d22727] before:font-extrabold"
                >
                  {t}
                </li>
              ))}
            </motion.ul>
          </div>
        </Section>

        {/* ── 02. 한눈 비교 ────────────────────────────── */}
        <Section
          id="compare"
          className="py-16 md:py-24 border-t border-[#f3f3f3]"
        >
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] mb-3 break-keep -tracking-[.02em]"
          >
            일반 유리 vs <span className="text-[#d22727]">강화유리</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] mb-8 break-keep"
          >
            같은 두께, 같은 자리에 들어가지만 성질이 다릅니다.
          </motion.p>

          {/* 비교 테이블 — 이미지 참고 레이아웃 */}
          <motion.div
            {...rise}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative rounded-2xl overflow-hidden border border-[#e0e0e0]"
          >
            {/* 강화유리 열 포인트 테두리 오버레이 */}
            <div
              className="absolute top-0 right-0 bottom-0 pointer-events-none rounded-r-2xl"
              style={{
                width: "calc((100% - 56px) / 2)",
                border: "2.5px solid #d22727",
                borderRadius: "0 16px 16px 0",
              }}
            />
            {/* 상단 이미지 + VS */}
            <div className="grid grid-cols-[1fr_56px_1fr]">
              {/* 한 장의 좌우 비교 사진을 두 칸에 절반씩 나눠 담는다.
                  img 를 칸의 2배 폭으로 깔고 오른쪽 칸만 -100% 밀면 정확히 반씩 잘린다.
                  (object-position 만으로는 칸 비율에 따라 절반이 안 맞는다) */}
              <div className="h-[120px] md:h-[150px] overflow-hidden relative">
                <img
                  src={imgCompare}
                  alt="교체 전 — 일반 유리"
                  className="absolute inset-y-0 left-0 h-full w-[200%] max-w-none object-cover"
                />
              </div>
              {/* VS */}
              <div className="flex items-center justify-center bg-white border-x border-[#e0e0e0]">
                <span className="text-[13px] font-extrabold text-[#1a1a1a] tracking-widest whitespace-nowrap">
                  VS
                </span>
              </div>
              <div className="h-[120px] md:h-[150px] overflow-hidden relative">
                <img
                  src={imgCompare}
                  alt="교체 후 — 강화유리"
                  className="absolute inset-y-0 left-[-100%] h-full w-[200%] max-w-none object-cover"
                />
              </div>
            </div>

            {/* 컬러 헤더 */}
            <div className="grid grid-cols-[1fr_56px_1fr]">
              <div className="py-3 flex items-center justify-center bg-[#555]">
                <span className="text-[13px] font-extrabold text-white tracking-wide">
                  일반 유리
                </span>
              </div>
              <div className="py-3 flex items-center justify-center bg-white border-x border-[#e0e0e0]">
                <span className="text-[12px] md:text-[13.5px] font-bold text-[#555555] whitespace-nowrap">
                  구분
                </span>
              </div>
              <div className="py-3 flex items-center justify-center bg-[#d22727]">
                <span className="text-[13px] font-extrabold text-white tracking-wide">
                  강화유리
                </span>
              </div>
            </div>

            {/* 행 */}
            {COMPARE.map((r, i) => (
              <motion.div
                key={r.k}
                {...rise}
                transition={{ duration: 0.4, delay: 0.06 * i }}
                className={`grid grid-cols-[1fr_56px_1fr] ${
                  i < COMPARE.length - 1 ? "border-b border-[#f0f0f0]" : ""
                }`}
              >
                {/* 일반 유리 값 */}
                <div className="px-3 md:px-4 py-4 flex flex-col items-center justify-center gap-1 text-center border-r border-[#f0f0f0] bg-white">
                  <span className="text-[13px] md:text-[13.5px] font-semibold leading-[1.4] break-keep text-[#777]">
                    {r.a}
                  </span>
                </div>

                {/* 구분 라벨 */}
                <div className="px-1 py-4 flex items-center justify-center bg-[#fafafa] border-x border-[#f0f0f0]">
                  <span className="text-[12px] md:text-[13.5px] font-bold text-[#555555] leading-[1.4] whitespace-pre-line text-center">
                    {r.k}
                  </span>
                </div>

                {/* 강화유리 값 */}
                <div className="px-3 md:px-4 py-4 flex flex-col items-center justify-center gap-1 text-center bg-[rgba(210,39,39,.025)]">
                  <span className="text-[13px] md:text-[13.5px] font-extrabold text-[#d22727] leading-[1.4] break-keep">
                    {r.b}
                  </span>
                  {r.bSub && (
                    <span
                      className={`text-[10.5px] font-semibold rounded-md px-2 py-0.5 ${
                        r.aBad
                          ? "text-[#1a7f4b] bg-[#e8f7ef]"
                          : "text-[#999] bg-[#f3f3f3]"
                      }`}
                    >
                      {r.bSub}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-[11.5px] text-[#bbb] mt-4 break-keep leading-[1.6]">
            ※ 위 수치는 강화유리라는 소재에 대해 동일 두께 기준으로 일반적으로 알려진
            비교값입니다. 특정 제품의 시험 결과가 아니며, 제품 규격·두께·시공 조건에 따라
            달라질 수 있습니다.
          </p>
        </Section>

        {/* ── 03. 왜 강한가 ─────────────────────────────── */}
        <Section id="why" className="py-16 md:py-24 border-t border-[#f3f3f3]">
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] mb-3 break-keep -tracking-[.02em]"
          >
            {" "}
            <span className="text-[#d22727]">강화유리는</span>
            <br />
            어떻게 만들어지나요?
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] mb-7 break-keep max-w-[460px]"
          >
            표면은 서로를 누르고, 속은 잡아당깁니다. 이 균형이 유리를 단단하게
            만들고, 깨질 때의 모양까지 바꿔 놓습니다.
          </motion.p>

          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <ForgeMotion />
          </motion.div>

          <PriceReasonAccordion />
        </Section>

        {/* ── 04. 깨질 때 차이 ──────────────────────────── */}
        <Section
          id="break"
          className="py-16 md:py-24 border-t border-[#f3f3f3]"
        >
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] mb-3 break-keep -tracking-[.02em]"
          >
            혹시 깨질까봐 걱정되시나요?
            <br />
            <span className="text-[#d22727]">강화유리는 다릅니다</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] mb-7 break-keep"
          >
            일반 유리는 칼처럼 길고 날카롭게 쪼개집니다. 강화유리는 손톱만 한
            알갱이로 부서집니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <GlassBreakSlider />
            <p className="text-[12px] text-[#bbb] text-center mt-3">
              좌우로 스와이프하여 파손 형태 차이를 확인해보세요.
            </p>
          </motion.div>
        </Section>

        {/* ── 05. 시험 기준 ─────────────────────────────── */}
        <Section id="test" className="py-16 md:py-24 border-t border-[#f3f3f3]">
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] mb-3 break-keep -tracking-[.02em]"
          >
            강화유리에는{" "}
            <span className="text-[#d22727]">따로 정해진 시험</span>이 있습니다
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] mb-7 break-keep"
          >
            국가표준{" "}
            <b className="font-semibold text-[#555]">KS L 2002(강화 유리)</b>는
            낙구 충격, 파쇄 시험, 사람이 부딪히는 상황을 본뜬 쇼트백 충격을
            규정하고 있습니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <TestFilm />
          </motion.div>
        </Section>


        {/* ── 06. 어디에 쓰이나 ────────────────────────── */}
        <Section
          id="where"
          className="py-16 md:py-24 border-t border-[#f3f3f3]"
        >
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[22px] md:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.3] mb-3 break-keep -tracking-[.02em]"
          >
            이런 자리일수록{" "}
            <span className="text-[#d22727]">차이가 큽니다</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[14px] md:text-[15.5px] text-[#777] leading-[1.75] mb-7 break-keep"
          >
            유리 면적이 넓거나, 사람이 부딪히기 쉽거나, 바람을 정면으로 받는
            곳입니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <WhereSlider />
          </motion.div>
        </Section>

        {/* ── 06. 상담 신청 ─────────────────────────────── */}
        <Section
          id="apply"
          className="py-16 md:py-24 border-t border-[#f3f3f3]"
        >
          <motion.div {...rise} transition={{ duration: 0.5 }}>
            <TemperedConsultForm />
          </motion.div>
        </Section>
      </main>

      <Footer />
      <BottomBar />
    </div>
  )
}
