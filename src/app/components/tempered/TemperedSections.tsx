import { motion, AnimatePresence } from "motion/react"
import React, { useEffect, useState } from "react"
import { ForgeMotion } from "./ForgeMotion"
import { GlassBreakSlider } from "./GlassBreakSlider"
import { TestFilm } from "./TestFilm"
import { ShortsPlayer } from "./ShortsPlayer"
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
  { k: "충격\n강도", a: "1배", b: "2~5배" },
  { k: "풍압\n저항", a: "1배", b: "약 2~3배" },
  { k: "열충격\n한계", a: "약 80℃", b: "약 180℃" },
  {
    k: "파손\n형태",
    a: "길고 날카로운 조각",
    b: "알갱이 또는 비산 억제",
    aBad: true,
  },
]

/* ── 영상 섹션 ────────────────────────────────────────────
   유튜브 / 구글 드라이브 링크를 그대로 붙여넣으면 된다(ID 만 넣어도 동작).
   공개 범위: 유튜브는 "일부 공개" 이상, 드라이브는 "링크가 있는 모든 사용자 — 뷰어".
   예) https://www.youtube.com/shorts/xxxxxxxxxxx
       https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing        */
const SHORTS_SRC = "https://www.youtube.com/shorts/30u-dW7YkNI"

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
  { id: "test", label: "시험 기준" },
  { id: "why", label: "왜 강한가" },
  { id: "break", label: "깨질 때" },
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

/** 자동 전환 간격. 전환 자체는 아래 duration-500 크로스페이드가 맡는다. */
const WHERE_AUTO_MS = 1200

function WhereSlider(): React.ReactElement {
  const [current, setCurrent] = useState(0)
  const total = WHERE.length

  /* 마우스를 올린 동안에는 멈춘다 — 읽는 중에 넘어가면 곤란하다. */
  const [paused, setPaused] = useState(false)
  /* 사용자가 직접 넘겼을 때 타이머를 처음부터 다시 센다.
     이 값이 없으면 직접 넘긴 직후 남은 시간만큼만 있다가 또 넘어간다. */
  const [restart, setRestart] = useState(0)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCurrent((i) => (i + 1) % total), WHERE_AUTO_MS)
    return () => clearInterval(id)
  }, [paused, restart, total])

  const prev = () => {
    setCurrent((i) => (i - 1 + total) % total)
    setRestart((n) => n + 1)
  }
  const next = () => {
    setCurrent((i) => (i + 1) % total)
    setRestart((n) => n + 1)
  }
  const goTo = (i: number) => {
    setCurrent(i)
    setRestart((n) => n + 1)
  }

  return (
    /* 모바일 230px 유지, PC 는 230 → 276(+20%) → 317(+15%) 로 키웠다.
       인라인 style 로 두면 브레이크포인트를 못 타므로 클래스로 옮겼다. */
    <div
      className="relative w-full rounded-2xl overflow-hidden h-[230px] md:h-[317px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
        className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
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
        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
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
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full cursor-pointer"
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
                외주 가공 단계가 빠지면서{" "}
                <b className="font-semibold text-[#444]">
                  품질과 납기를 저희가 직접 관리
                </b>
                할 수 있게 됐습니다.
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


/* ══════════════════════════════════════════════════════════════════════
   강화유리 본문 섹션 01~06 — 상세페이지에 있던 것을 메인에 그대로 끼워 넣는다.

   260907 통합버전: 이 버전에는 강화유리 상세페이지(/tempered-glass)가 없다.
   대신 메인 히어로와 번호 접수 섹션 사이에 이 블록이 통째로 들어간다.

   상세페이지에 있던 것 중 여기 없는 것
     · 히어로(배경 영상 + 카피)  — 메인 히어로가 그 자리를 대신한다
     · 07 상담 신청 폼           — 바로 아래 번호 접수 섹션과 겹쳐서 뺐다.
                                   되살리려면 07 블록을 이 파일 끝에 붙이면 된다
     · GNB · Footer · 하단 고정바 — 메인 것을 그대로 쓴다

   섹션 id(video·compare·test·why·break·where)는 그대로 뒀다.
   ══════════════════════════════════════════════════════════════════════ */

export function TemperedSections() {
  return (
    <>
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
              className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] break-keep md:col-start-1 md:row-start-1 md:self-end"
            >
              백 마디 설명보다<br />
              <span className="text-[#d22727]">30초면 충분</span>합니다
            </motion.h2>

            <motion.p
              {...rise}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep md:col-start-1 md:row-start-2"
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
                '강화유리는 가공 방식에 따라 알갱이로 부서지거나, 깨져도 파편이 흩어지지 않습니다',
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
            className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
          >
            일반 유리 vs <span className="text-[#d22727]">강화유리</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[#999] text-[16px] md:text-[18px] leading-[26px] mb-8 break-keep"
          >
            같은 두께, 같은 자리에 들어가지만 성질이 다릅니다.
          </motion.p>

          {/* 비교 테이블 — 강화유리 쪽이 "들려 있는 카드".
              구조는 회색 블록(일반) | 구분 | 흰 카드(강화) 세 덩어리다. 표 전체를 감싸는
              테두리는 없다 — 있으면 카드가 표 안에 갇혀 보인다.

              카드가 표보다 위(20px)·아래(16px)로 나오는데, 그 자리를 빈 채로 두면 통만
              커 보인다. 위는 사진을 -mt 로 끌어올려 꽉 채우고, 아래는 마지막 칸의 패딩을
              늘려 카드 여백처럼 만든다. 그림자·흰 바탕은 셀 뒤에, 빨간 테두리는 셀 위에
              따로 깐다(한 요소로 하면 사진이 테두리를 덮는다).

              열 폭을 바꿀 때는 grid-cols 의 fr 과 아래 RIGHT_W 를 같이 고쳐야 한다.
              RIGHT_W = (100% - 가운데칸 64px) x 1.16/(0.84+1.16) = 58%. */}
          <motion.div
            {...rise}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative pt-5 pb-4"
          >
            {/* 카드 바탕 — 흰 배경 + 그림자. 셀들 뒤에 깔린다.
                구분 칸은 배경이 없어 그림자가 라벨 뒤로 살짝 비친다 */}
            <div
              aria-hidden
              className="absolute top-0 right-0 bottom-0 rounded-2xl bg-white shadow-[0_18px_40px_-12px_rgba(210,39,39,.32),0_6px_16px_rgba(0,0,0,.10)]"
              style={{ width: "calc((100% - 64px) * 0.58)" }}
            />
            <div className="relative grid grid-cols-[0.84fr_64px_1.16fr]">
              {/* ── 사진 행 ── 한 장을 좌우 반씩 나눠 담는다.
                  img 를 칸의 2배 폭으로 깔고 오른쪽 칸만 -100% 밀면 정확히 반씩 잘린다. */}
              {/* 행 높이는 오른쪽 사진(-mt 제외분)이 정하고, 왼쪽은 그 높이를 그대로 채운다.
                  위에 회색 띠를 남기면 비어 보인다. */}
              <div className="relative self-stretch overflow-hidden rounded-tl-2xl bg-[#eeeef0]">
                <img
                  src={imgCompare}
                  alt="교체 전 — 일반 유리"
                  className="absolute inset-y-0 left-0 h-full w-[200%] max-w-none object-cover"
                />
              </div>
              <div className="self-stretch flex items-center justify-center border-x border-t border-[#ececec]">
                <span className="text-[13px] font-extrabold text-[#1a1a1a] tracking-widest whitespace-nowrap">
                  VS
                </span>
              </div>
              {/* -mt-5 : 카드 상단(바깥 pt-5)까지 사진이 올라가 빈틈 없이 채운다 */}
              <div className="relative h-[150px] md:h-[190px] -mt-5 rounded-t-2xl overflow-hidden">
                <img
                  src={imgCompare}
                  alt="교체 후 — 강화유리"
                  className="absolute inset-y-0 left-[-100%] h-full w-[200%] max-w-none object-cover"
                />
              </div>

              {/* ── 헤더 행 ── */}
              <div className="py-3 flex items-center justify-center bg-[#8a8a8e]">
                <span className="text-[12.5px] font-bold text-white tracking-wide">일반 유리</span>
              </div>
              <div className="py-3 flex items-center justify-center border-x border-[#ececec]">
                <span className="text-[12px] md:text-[13.5px] font-bold text-[#555555] whitespace-nowrap">
                  구분
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-center bg-[#d22727]">
                <span className="text-[14px] md:text-[15px] font-extrabold text-white tracking-wide">
                  강화유리
                </span>
              </div>

              {/* ── 값 행 ── */}
              {COMPARE.map((r, i) => {
                const last = i === COMPARE.length - 1
                return (
                  <React.Fragment key={r.k}>
                    <div
                      className={`px-3 md:px-4 py-4 flex flex-col items-center justify-center text-center bg-[#f7f7f8] ${
                        last ? "rounded-bl-2xl" : "border-b border-[#e8e8ea]"
                      }`}
                    >
                      <span className="text-[12.5px] md:text-[13px] font-medium leading-[1.4] break-keep text-[#9a9a9e]">
                        {r.a}
                      </span>
                    </div>
                    <div
                      className="px-1 py-4 flex items-center justify-center border-x border-b border-[#ececec]"
                    >
                      <span className="text-[12px] md:text-[13.5px] font-bold text-[#555555] leading-[1.4] whitespace-pre-line text-center">
                        {r.k}
                      </span>
                    </div>
                    {/* 마지막 칸: -mb-4 로 카드 하단까지 내려가고, 늘어난 만큼 pb 를 더해
                        값은 제자리에 두고 아래만 카드 여백이 되게 한다 */}
                    <div
                      className={`px-3 md:px-5 flex flex-col items-center justify-center gap-1.5 text-center bg-[rgba(210,39,39,.035)] ${
                        last
                          ? "pt-5 pb-9 -mb-4 rounded-b-2xl"
                          : "py-5 border-b border-[rgba(210,39,39,.09)]"
                      }`}
                    >
                      <span className="text-[15px] md:text-[16.5px] font-extrabold text-[#d22727] leading-[1.35] break-keep">
                        {r.b}
                      </span>
                      {r.bSub && (
                        <span
                          className={`text-[10.5px] font-semibold rounded-md px-2 py-0.5 ${
                            r.aBad ? "text-[#1a7f4b] bg-[#e8f7ef]" : "text-[#999] bg-[#f3f3f3]"
                          }`}
                        >
                          {r.bSub}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            {/* 카드 테두리 — 셀 위에 그린다. 바탕과 크기·위치가 같아야 한다 */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 bottom-0 rounded-2xl border-[2.5px] border-[#d22727]"
              style={{ width: "calc((100% - 64px) * 0.58)" }}
            />
          </motion.div>

          <p className="text-[11.5px] text-[#bbb] mt-7 break-keep leading-[1.6]">
            ※ 위 수치는 강화유리라는 소재에 대해 동일 두께 기준으로 일반적으로 알려진
            비교값입니다. 특정 제품의 시험 결과가 아니며, 가공 방식과 제품 규격·두께·시공
            조건에 따라 달라질 수 있습니다.
          </p>
        </Section>

        {/* ── 03. 시험 기준 ─────────────────────────────── */}
        <Section id="test" className="py-16 md:py-24 border-t border-[#f3f3f3]">
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
          >
            강화유리에는{" "}
            <span className="text-[#d22727]">따로 정해진 시험</span>이 있습니다
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[#999] text-[16px] md:text-[18px] leading-[26px] mb-7 break-keep"
          >
            <b className="font-semibold text-[#555]">국가표준</b>은 낙구 충격,
            파쇄 시험, 사람이 부딪히는 상황을 본뜬 쇼트백 충격을 규정하고
            있습니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <TestFilm />
          </motion.div>
        </Section>


        {/* ── 04. 왜 강한가 ─────────────────────────────── */}
        <Section id="why" className="py-16 md:py-24 border-t border-[#f3f3f3]">
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
          >
            {" "}
            <span className="text-[#d22727]">강화유리는</span>
            <br />
            어떻게 만들어지나요?
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[#999] text-[16px] md:text-[18px] leading-[26px] mb-7 break-keep max-w-[460px]"
          >
            표면은 서로를 누르고, 속은 잡아당깁니다. 식히는 속도를 어떻게
            잡느냐에 따라 단단함의 정도와 깨질 때의 모양이 달라집니다.
          </motion.p>

          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <ForgeMotion />
          </motion.div>

          <PriceReasonAccordion />
        </Section>

        {/* ── 05. 깨질 때 차이 ──────────────────────────── */}
        <Section
          id="break"
          className="py-16 md:py-24 border-t border-[#f3f3f3]"
        >
          <motion.h2
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
          >
            혹시 깨질까봐 걱정되시나요?
            <br />
            <span className="text-[#d22727]">강화유리는 다릅니다</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[#999] text-[16px] md:text-[18px] leading-[26px] mb-7 break-keep"
          >
            일반 유리는 칼처럼 길고 날카롭게 쪼개집니다. 강화유리는 가공 방식에
            따라 알갱이로 부서지거나, 깨지더라도 파편이 흩어지지 않습니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <GlassBreakSlider />
            <p className="text-[12px] text-[#bbb] text-center mt-3">
              좌우로 스와이프하여 파손 형태 차이를 확인해보세요.
            </p>
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
            className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep"
          >
            이런 자리일수록{" "}
            <span className="text-[#d22727]">차이가 큽니다</span>
          </motion.h2>
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[#999] text-[16px] md:text-[18px] leading-[26px] mb-7 break-keep"
          >
            유리 면적이 넓거나, 사람이 부딪히기 쉽거나, 바람을 정면으로 받는
            곳입니다.
          </motion.p>
          <motion.div {...rise} transition={{ duration: 0.5, delay: 0.1 }}>
            <WhereSlider />
          </motion.div>
        </Section>
    </>
  )
}
