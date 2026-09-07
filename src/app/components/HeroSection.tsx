import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TemperedGlassLink } from "./TemperedGlassLink";
/* 히어로 배경 영상 — 유리 클로즈업(CF 스타일). PC 와 모바일이 서로 다른 파일이다.

   260907 시안 비교(/video-lab) 끝에 B 안으로 정하면서, 새 영상이 720×1280 세로라
   PC 에서 위아래가 크게 잘리는 문제가 있었다. 그래서 모바일에만 새 영상을 쓰고
   PC 는 쓰던 가로 영상을 그대로 둔다. 가로 원본이 생기면 PC 쪽만 바꾸면 된다.

   그 이전 히어로 영상(창가에서 뛰노는 아이)은 hero-tempered.mp4 로 남겨 뒀다. */
import heroVideoPc from "../../assets/hero-glass-closeup.mp4";
import heroVideoMo from "../../assets/hero-glass-closeup-mo.mp4";

/* 화면 폭으로 배경 영상을 가른다. md(768px) — 히어로 안의 모바일/PC 블록과 같은 경계.
   CSS 로 두 개를 겹쳐 놓고 숨기는 방법도 있지만, 그러면 안 보이는 쪽까지 받아 온다. */
function useHeroVideo() {
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

/* videoSrc 는 배경 영상 시안 비교용(/video-lab)으로만 넘긴다.
   안 넘기면 위에서 import 한 기본 영상을 쓰므로 실서비스 동작은 그대로다. */
export function HeroSection({ videoSrc }: { videoSrc?: string } = {}) {
  const heroVideo = useHeroVideo();

  /* 접수 바는 GNB 가 하나만 그린다(lib/consultBar.ts).
     여기서 따로 <ConsultationModal> 을 두면 GNB 것과 두 겹으로 열린다. */

  // 높이: 화면을 채우되 900px 를 넘지 않고(원본 규격), 내용이 더 길면 내용만큼 늘어난다.
  // min-h-fit 이 max-h 보다 우선하므로 짧은 화면에서 CTA 가 하단 고정바에 잘리지 않는다.
  return (
    <section className="relative w-full h-[100svh] min-h-fit max-h-[900px] bg-black overflow-hidden flex flex-col">
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
      <div className="flex md:hidden flex-col justify-end relative z-10 flex-1 max-w-screen-md mx-auto w-full px-6 pt-[70px] pb-[140px]">
        <motion.div
          {...rise}
          transition={{ duration: 0.5 }}
          className="inline-flex self-start items-center gap-2 mb-5"
        >
          {/* 상시버전 배지 — 행사가 아니라 "설비를 갖췄다" 는 사실만 알린다.
              이벤트판에서는 여기에 "이벤트 마감 D-XX" 가 들어간다. */}
          <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11.5px] font-bold text-white">강화유리 자체 생산</span>
          </div>
        </motion.div>

        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-[30px] text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)" }}
        >
          {/* 굵기 대비로 두 줄을 나눈다 — 상세페이지 히어로와 같은 형태 */}
          <span className="font-light">이제는 창호도</span>
          <br />
          <span className="font-extrabold">강화유리가 기본입니다</span>
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[15px] text-white/85 leading-[1.6] -tracking-[.02em] mb-7 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          휴대폰도 자동차도 유리가 사용되는 곳은 강화유리입니다.
          <br />
          <b className="font-extrabold text-white">집에서 가장 큰 유리만</b> 그대로였습니다.
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-col gap-3"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          {/* 260904 상시버전: 접수 버튼과 자세히 보기를 하나로 합쳤다.
              히어로에서는 행사를 걸지 않으므로 곧바로 상세페이지로 보낸다.
              접수는 바로 아래 번호 입력 섹션과 하단 고정바가 받는다. */}
          <TemperedGlassLink
            className="flex items-center justify-center h-[52px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[15.5px] rounded-xl no-underline transition-colors"
          >
            강화유리 자세히 보기
          </TemperedGlassLink>
        </motion.div>
      </div>

      {/* ── PC — 좌측 정렬, 세로 가운데. pt 는 고정 GNB(70px) 를 비우는 값 ── */}
      <div className="hidden md:flex flex-col justify-center relative z-10 flex-1 max-w-screen-md mx-auto w-full px-10 pt-[112px] pb-[112px]">
        <motion.div
          {...rise}
          transition={{ duration: 0.5 }}
          className="inline-flex self-start items-center gap-2 mb-5"
        >
          {/* 상시버전 배지 — 행사가 아니라 "설비를 갖췄다" 는 사실만 알린다.
              이벤트판에서는 여기에 "이벤트 마감 D-XX" 가 들어간다. */}
          <div className="flex items-center gap-2 bg-[#d22727] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[12.5px] font-bold text-white">강화유리 자체 생산</span>
          </div>
        </motion.div>

        <motion.h1
          {...rise}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-[40px] text-white leading-[1.25] mb-4 break-keep -tracking-[.025em]"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,.65)" }}
        >
          {/* 굵기 대비로 두 줄을 나눈다 — 상세페이지 히어로와 같은 형태 */}
          <span className="font-light">이제는 창호도</span>
          <br />
          <span className="font-extrabold">강화유리가 기본입니다</span>
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[19px] text-white/85 leading-[1.6] mb-8 break-keep"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}
        >
          휴대폰도 자동차도 유리가 사용되는 곳은 강화유리입니다.
          <br />
          <b className="font-extrabold text-white">집에서 가장 큰 유리만</b> 그대로였습니다.
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-row gap-3"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,.4))" }}
        >
          <TemperedGlassLink
            className="flex items-center justify-center h-[52px] w-[260px] bg-[#d22727] hover:bg-[#b81f1f] text-white font-bold text-[16.5px] rounded-xl no-underline transition-colors"
          >
            강화유리 자세히 보기
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
