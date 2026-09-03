import { useState } from "react";
import { motion } from "motion/react";
import { TemperedGlassLink } from "./TemperedGlassLink";
import heroVideo from "../../assets/hero-tempered.mp4";
import { openConsultBar } from "@/lib/consultBar";
import { HandwriteSept } from "./HandwriteSept";
import { SashTurntable } from "./SashTurntable";
import tempedTag from "@/assets/handwrite-tempered.svg";
import { useDday } from "@/lib/dday";

/* ══════════════════════════════════════════════════════════════════════
   260831 — 9월 강화유리 프로모션 기간 한정 히어로.

   강화유리 상세페이지의 히어로를 그대로 가져왔다(배경 영상 + 카피).
   기존 히어로("창호 교체, 이제 믿을 수 있는 곳에서")는 이 파일 맨 아래에
   주석으로 통째로 남겨 뒀다.

   ▸ 이벤트 끝나면 되돌리는 법
     1. 아래 HeroSection 을 통째로 지우고, 파일 끝의 주석 블록을 풀어 되살린다
     2. src/styles/fonts.css 의 Nanum Pen Script @import 삭제
     3. 안 쓰게 되는 파일 삭제 — src/assets/hero-tempered.mp4 (2.4MB),
        src/app/components/HandwriteSept.tsx
     4. 되살릴 때 필요한 것: src/assets/hero-bg.jpeg, ./VideoModal — 지우지 말 것
   ══════════════════════════════════════════════════════════════════════ */

const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
} as const;

export function HeroSection() {
  /* 접수 바는 GNB 가 하나만 그린다(lib/consultBar.ts).
     여기서 따로 <ConsultationModal> 을 두면 GNB 것과 두 겹으로 열린다. */
  const dday = useDday(); // 종료일은 src/lib/dday.ts 의 PROMO_END 한 곳에서 관리

  // 높이: 화면을 채우되 900px 를 넘지 않고(원본 규격), 내용이 더 길면 내용만큼 늘어난다.
  // min-h-fit 이 max-h 보다 우선하므로 짧은 화면에서 CTA 가 하단 고정바에 잘리지 않는다.
  return (
    <section className="relative w-full h-[100svh] min-h-fit max-h-[900px] bg-black overflow-hidden flex flex-col">
      <video
        src={heroVideo}
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
      <div className="flex md:hidden flex-col justify-end relative z-10 flex-1 max-w-screen-md mx-auto w-full px-6 pt-[70px] pb-[140px]">
        <motion.div
          {...rise}
          transition={{ duration: 0.5 }}
          className="inline-flex self-start items-center gap-2 mb-9"
        >
          {/* 배지 하나로 — 마감 문구와 남은 날을 굳이 나눌 이유가 없다 */}
          <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11.5px] font-bold text-white">이벤트 마감</span>
            <span className="text-[11.5px] font-extrabold text-white tabular-nums">{dday}</span>
          </div>
        </motion.div>

        {/* 핵심 한 덩어리 — 일반유리→강화유리 무상 업그레이드.
            상세페이지 히어로에 있던 "열과 충격에 강한 강화유리" 헤드라인과
            설명 문단은 뺐다. 메인 히어로에서는 혜택이 먼저 읽혀야 한다. */}
        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="flex flex-col items-start gap-1 mb-1.5"
        >
          {/* 일반유리 대비 없이 강화유리 창짝 하나만 천천히 돌린다.
              이전의 두 판 픽토그램은 GlassUpgradeIcon.tsx 에 그대로 있다 —
              되돌리려면 <GlassUpgradeIcon width={311} className="block -ml-2.5 mb-1" /> */}
          <div className="relative w-fit -ml-4 mb-5">
            <SashTurntable height={188} />
            {/* 손글씨 "강화유리" + 창짝을 가리키는 화살표. 창짝 오른쪽 아래에 걸친다.
                크기·위치를 창짝 상자에 대한 %로 잡아서 창짝이 커지면 같이 커진다.
                흰 선이라 밝은 배경에서 묻히므로 그림자를 두 겹 준다. */}
            <img
              src={tempedTag}
              alt="강화유리"
              className="absolute pointer-events-none select-none
                         drop-shadow-[0_2px_8px_rgba(0,0,0,.55)]
                         [filter:drop-shadow(0_2px_8px_rgba(0,0,0,.55))_drop-shadow(0_0_2px_rgba(0,0,0,.45))]"
              /* 폭은 글씨 크기 기준으로 잡는다. 잉크 상자에서 글씨가 차지하는 비율이
                 65.77/90.27 이라, 글씨를 104px 로 두려면 폭이 97% 여야 한다.
                 left 는 화살표 머리 위치. 창짝 상자 기준으로 78% 가 유리 오른쪽 끝,
                 94% 가 프레임 바깥 끝이므로 70% 면 머리가 유리면 위로 들어온다. */
              style={{ left: "72%", top: "49%", width: "97%" }}
            />
          </div>
          {/* 손글씨(HandwriteSept)는 잠시 뺐다. 되살리려면 이 span 을 아래로 바꾸면 된다.
                <span className="flex items-center gap-2 …">
                  <HandwriteSept width={78} className="shrink-0 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,.6)]" />
                  무상 업그레이드
                </span>                                                            */}
          <span
            className="text-[25.6px] font-extrabold text-white leading-[1.1] -tracking-[.03em] break-keep"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,.6)" }}
          >
            <span className="font-light">9월한정</span> 무상 업그레이드
          </span>
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[15px] text-white/85 leading-[1.6] mb-4 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          오직 <b className="font-extrabold text-white">청암홈윈도우에서만</b> 가능한 혜택입니다.
        </motion.p>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="text-[13px] font-light text-white/55 leading-tight mb-7 break-keep"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
        >
          LX 제품군 한정
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-col gap-3"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          <button
            type="button"
            onClick={() => openConsultBar("히어로")}
            className="flex items-center justify-center h-[52px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[15.5px] rounded-xl transition-colors cursor-pointer"
          >
            무료 실측 상담 신청
          </button>
          {/* 같은 페이지의 단열유리 섹션(#glass)이 아니라 강화유리 상세페이지로 보낸다 */}
          <TemperedGlassLink
            className="flex items-center justify-center h-[48px] bg-white/10 border border-white/25 text-white font-semibold text-[14.5px] rounded-xl no-underline backdrop-blur-sm"
          >
            자세히 보기
          </TemperedGlassLink>
        </motion.div>
      </div>

      {/* ── PC — 좌측 정렬, 세로 가운데. pt 는 고정 GNB(70px) 를 비우는 값 ── */}
      <div className="hidden md:flex flex-col justify-center relative z-10 flex-1 max-w-screen-md mx-auto w-full px-10 pt-[112px] pb-[112px]">
        <motion.div
          {...rise}
          transition={{ duration: 0.5 }}
          className="inline-flex self-start items-center gap-2 mb-9"
        >
          {/* 배지 하나로 — 마감 문구와 남은 날을 굳이 나눌 이유가 없다 */}
          <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[12.5px] font-bold text-white">이벤트 마감</span>
            <span className="text-[12.5px] font-extrabold text-white tabular-nums">{dday}</span>
          </div>
        </motion.div>

        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="flex flex-col items-start gap-1.5 mb-5"
        >
          <div className="relative w-fit -ml-5 mb-5">
            <SashTurntable height={238} />
            {/* 손글씨 "강화유리" + 창짝을 가리키는 화살표. 창짝 오른쪽 아래에 걸친다.
                크기·위치를 창짝 상자에 대한 %로 잡아서 창짝이 커지면 같이 커진다.
                흰 선이라 밝은 배경에서 묻히므로 그림자를 두 겹 준다. */}
            <img
              src={tempedTag}
              alt="강화유리"
              className="absolute pointer-events-none select-none
                         drop-shadow-[0_2px_8px_rgba(0,0,0,.55)]
                         [filter:drop-shadow(0_2px_8px_rgba(0,0,0,.55))_drop-shadow(0_0_2px_rgba(0,0,0,.45))]"
              /* 폭은 글씨 크기 기준으로 잡는다. 잉크 상자에서 글씨가 차지하는 비율이
                 65.77/90.27 이라, 글씨를 104px 로 두려면 폭이 97% 여야 한다.
                 left 는 화살표 머리 위치. 창짝 상자 기준으로 78% 가 유리 오른쪽 끝,
                 94% 가 프레임 바깥 끝이므로 70% 면 머리가 유리면 위로 들어온다. */
              style={{ left: "72.7%", top: "49%", width: "97%" }}
            />
          </div>
          {/* 손글씨는 잠시 뺀 상태 — 모바일 쪽 주석에 되살리는 형태를 적어 뒀다 */}
          <span
            className="text-[32px] font-extrabold text-white leading-[1.05] -tracking-[.03em] break-keep"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,.6)" }}
          >
            <span className="font-light">9월한정</span> 무상 업그레이드
          </span>
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[19px] text-white/85 leading-[1.6] mb-2 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          오직 <b className="font-extrabold text-white">청암홈윈도우에서만</b> 가능한 혜택입니다.
        </motion.p>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="text-[14px] font-light text-white/55 leading-tight mb-8 break-keep"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}
        >
          LX 제품군 한정
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-row gap-3"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          <button
            type="button"
            onClick={() => openConsultBar("히어로")}
            className="flex items-center justify-center h-[52px] w-[220px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[16.5px] rounded-xl transition-colors cursor-pointer"
          >
            무료 실측 상담 신청
          </button>
          <TemperedGlassLink
            className="flex items-center justify-center h-[52px] w-[160px] bg-white/10 border border-white/25 hover:bg-white/15 text-white font-semibold text-[14.5px] rounded-xl no-underline transition-colors backdrop-blur-sm"
          >
            자세히 보기
          </TemperedGlassLink>
        </motion.div>
      </div>

    </section>
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
