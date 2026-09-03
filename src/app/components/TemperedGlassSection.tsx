import { motion } from "motion/react";
import { TemperedGlassLink } from "./TemperedGlassLink";
import { ArrowRight } from "lucide-react";
import { useDday } from "@/lib/dday";
import { ShortsPlayer } from "./tempered/ShortsPlayer";

/**
 * 강화유리 소개 — 보강재(materials)와 단열유리(glass) 사이.
 *
 * 머리말(배지 + 타이틀 + 서브카피) + 영상 두 덩어리.
 *
 * 슬림본(`강화유리 섹션/슬림/TemperedGlassSlimSection.tsx`)에는 앞에 배경영상
 * 히어로가 하나 더 있었는데 뺐다 — 페이지 맨 위 히어로와 영상·카피·CTA 가
 * 그대로 겹쳐서 같은 화면이 두 번 나온다.
 *
 * 슬림본에서 또 바꾼 것
 *   · "9,900원" → "무상 업그레이드" (히어로·이벤트 배너와 맞춤)
 *   · CTA 목적지 — /tempered-glass. 260902 에 상세페이지를 이 프로젝트로 옮기고
 *     Router.tsx 에 라우트를 등록해서 지금은 정상 이동한다.
 *
 * D-day 는 src/lib/dday.ts 의 PROMO_END 를 따른다.
 */

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
} as const;

/* 유튜브 쇼츠. 드라이브 링크를 넣어도 동작한다(ShortsPlayer 가 알아서 판별). */
const SHORTS_SRC = "https://www.youtube.com/shorts/30u-dW7YkNI";

const CHECKS = [
  "일반 유리는 길고 날카로운 조각으로 쪼개집니다",
  "강화유리는 같은 충격에도 깨지지 않습니다",
  "같은 두께인데 견디는 충격의 크기가 다릅니다",
];

export function TemperedGlassSection() {
  const dday = useDday();

  return (
    <section className="w-full bg-white py-16 md:py-24 border-t border-[#f3f3f3]">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* ── 머리말 ─────────────────────────────── */}
        <motion.div {...rise} transition={{ duration: 0.5 }} className="mb-12 md:mb-16">
          {/* 배지 — 빨간 알약에 문구, 옆에 남은 날. 흰 배경이라 두 번째 칩은 테두리로 뺀다. */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="inline-flex items-center bg-[#d22727] rounded-full px-3 py-1.5 text-[11.5px] md:text-[12.5px] font-bold text-white">
              9월 한정 무상업그레이드 진행중
            </span>
            <span className="inline-flex items-center border border-[#f0cfcf] bg-[#fdf3f3] rounded-full px-2.5 py-1.5 text-[11.5px] md:text-[12.5px] font-extrabold text-[#d22727] tabular-nums">
              {dday}
            </span>
          </div>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.25] break-keep -tracking-[.025em]">
            열과 충격에 강한
            <br />
            <span className="text-[#d22727]">강화유리</span>
          </h2>
          <p className="mt-4 text-base text-[#999] leading-6 break-keep">
            같은 두께라도 충격과 열에 훨씬 강합니다.
          </p>
        </motion.div>

        {/* ── 영상 ───────────────────────────────
            설명보다 실물을 먼저 보여준다. 세로(9:16) 쇼츠 1편.
            모바일 : 타이틀 → 부가설명 → 영상 → 체크리스트 (DOM 순서 그대로)
            PC     : 좌열에 글 3개(행 1·2·3), 우열(320px)에 영상 — 명시적 배치로 순서를 바꾼다 */}
        <div className="grid gap-y-5 md:grid-cols-[1fr_320px] md:gap-x-12 md:gap-y-4">
          <motion.h3
            {...rise}
            transition={{ duration: 0.5 }}
            className="text-[18px] md:text-[20px] font-bold text-[#333] leading-[1.4] break-keep md:col-start-1 md:row-start-1 md:self-end"
          >
            백 마디 설명보다{" "}
            <span className="hw-emphasis-dot text-[20px] md:text-[22px] text-[#d22727]">30초</span>면 충분합니다
          </motion.h3>

          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-[16px] md:text-[17px] text-[#999] leading-[26px] break-keep md:col-start-1 md:row-start-2"
          >
            일반 유리와 강화유리에 똑같은 충격을 준 실제 촬영 영상입니다. 두 유리가
            어떻게 다른지 직접 확인해 보세요.
            {/* 영상 설명과 프로모션 안내는 다른 이야기라 줄을 나눈다.
                PC 는 자리가 넉넉해서 한 줄 더 비운다. */}
            <br />
            <br className="hidden md:block" />
            9월 안에 계약하시면 LX 창호 선택 시 강화유리로{" "}
            <b className="font-bold text-[#666]">무상 업그레이드</b> 해 드립니다.
          </motion.p>

          <motion.div
            {...rise}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full md:col-start-2 md:row-start-1 md:row-span-3 md:self-center"
          >
            <ShortsPlayer src={SHORTS_SRC} title="강화유리 파손 비교 영상" />
          </motion.div>

          {/* 캡션은 영상 칸 밖 별도 행으로 뺐다.
              같이 두면 칸 높이에 캡션이 더해져, 왼쪽 버튼을 바닥에 붙였을 때
              영상 아랫줄보다 캡션 높이(29px)만큼 내려간다. */}
          <motion.p
            {...rise}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-[11.5px] text-[#bbb] text-center break-keep md:col-start-2 md:row-start-4 md:mt-3"
          >
            ※ 실제 촬영 영상입니다. 시험 조건은 KS 규격과 다를 수 있습니다.
          </motion.p>

          {/* 체크리스트 + 버튼 한 칸.
              PC 는 칸을 늘리고(self-stretch) 버튼을 mt-auto 로 바닥에 붙여
              오른쪽 영상의 아랫줄과 맞춘다. 모바일은 그냥 아래로 이어진다. */}
          <motion.div
            {...rise}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex flex-col md:col-start-1 md:row-start-3 md:self-stretch"
          >
            <ul className="grid gap-2.5">
              {CHECKS.map((t) => (
                <li
                  key={t}
                  className="relative pl-[22px] text-[13.5px] md:text-[14.5px] text-[#555] break-keep leading-[1.6] before:content-['✓'] before:absolute before:left-0 before:top-0 before:text-[#d22727] before:font-extrabold"
                >
                  {t}
                </li>
              ))}
            </ul>

            {/* 상세페이지로 — 라우트는 Router.tsx 에 아직 없다.
                디자인은 ReviewSection 의 "네이버 블로그에서 더 보기" 와 같은 아웃라인 알약.
                폭은 영상과 맞춘다(w-full) — self-start 면 글자 길이만큼만 늘어난다. */}
            <TemperedGlassLink
              className="mt-8 md:mt-auto w-full inline-flex items-center justify-center gap-2 h-[52px] px-6 bg-white border-2 border-[#D22727] text-[#D22727] text-[14px] md:text-[15px] font-bold rounded-full no-underline hover:bg-[#D22727] hover:text-white transition-all"
            >
              강화유리 자세히 보기
              <ArrowRight className="w-4 h-4" />
            </TemperedGlassLink>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
