import { motion } from "motion/react";
import pcBg from "../../assets/event/promo-2609-pc-bg.webp";
import moBg from "../../assets/event/promo-2609-mo-bg.webp";

/**
 * 추석맞이 할인 배너.
 *
 * 260904 상시버전: 글자를 코드로 얹지 않고 **이미지 한 장**으로 간다.
 * 앞선 강화유리 프로모션 배너는 배경(도형만) 위에 실제 텍스트를 얹어 SEO 를 챙겼는데,
 * 이번 시안은 글자가 이미지에 구워져 있어 그럴 자리가 없다.
 * 대신 alt 에 배너 내용을 담아 크롤러와 스크린리더가 읽을 수 있게 했다.
 *
 * 텍스트를 다시 코드로 얹는 방식으로 돌아가려면 이벤트판(260827 원본)의
 * EventPromoBanner.tsx 를 참고하면 된다 — 좌표 잡는 법까지 주석에 남아 있다.
 */

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
} as const;

/** 배너에 적힌 내용 — 이미지에 구워져 있어 alt 로만 전달된다 */
const ALT =
  "추석맞이 할인. 우리집 새단장, 지금이 가장 좋은 기회. 9월 한정 제품가 15% 할인. " +
  "단열은 UP 난방비 DOWN, 뛰어난 차음성으로 소음 걱정 끝, 고기밀성 구조로 외풍 감소, " +
  "15년 무상보증 평생 사후관리. 이번 추석, 소중한 가족을 위한 최고의 선물 — " +
  "따뜻하고 쾌적한 공간을 만들어 드립니다.";

/** 배너 바탕색 — 좌우 페이드에 쓴다 */
const EDGE_COLOR = "#f8dfc2";
/**
 * 페이드 폭. GNB 로고 시작선((화면폭 − 1280) / 2 + 40)에서 180 더 들어간다.
 * 로고선에서 딱 끊으면 사라질 거리가 모자라 경계가 보인다 — 넉넉해야 자연스럽다.
 */
const EDGE_W = "max(220px, calc((100% - 1280px) / 2 + 220px))";
/**
 * 두 구간으로 나눈 mask.
 *   0~40%   꽉 덮는다 (인디케이터 글자가 이 안에 들어온다)
 *   40~100% 서서히 사라진다
 * 한 번에 #000 → transparent 로 두면 시작 지점에 선이 보인다.
 * 중간값을 촘촘히 찍어 완만하게 떨어지는 곡선을 만들면 그 선이 사라진다.
 */
const edgeMask = (side: "left" | "right") =>
  `linear-gradient(to ${side === "left" ? "right" : "left"},` +
  " #000 0%, #000 40%," +
  " rgba(0,0,0,.94) 50%, rgba(0,0,0,.82) 58%, rgba(0,0,0,.66) 66%," +
  " rgba(0,0,0,.48) 74%, rgba(0,0,0,.31) 82%, rgba(0,0,0,.17) 89%," +
  " rgba(0,0,0,.07) 95%, transparent 100%)";

export function EventPromoBanner() {
  return (
    <section className="w-full bg-[#f7efe2] overflow-hidden" aria-label="추석맞이 할인">
      {/* PC — 가로형. 2716px 에서 멈추고 그 이상은 양옆이 섹션 배경으로 남는다.
          배경색이 이미지 가장자리색이라 이어 붙은 것처럼 보인다. */}
      <motion.div {...reveal} className="hidden md:block relative w-full max-w-[2716px] mx-auto">
        <img
          src={pcBg}
          alt={ALT}
          width={2716}
          height={908}
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />
        {/* 좌우 페이드 — 이 배너는 그림이 가장자리까지 꽉 차서 화면 왼쪽에 고정된
            섹션 인디케이터 글자가 묻힌다. 배너 바탕색으로 양옆을 덮어 글자를 살린다.

            폭은 GNB 로고 시작선보다 180 더 들어간다. 로고선에서 딱 끊으면 사라질
            거리가 모자라 경계가 보인다.

            색은 mask 로 흐리게 만든다 — 배경 자체를 그라데이션으로 두고 또 mask 를 걸면
            두 번 옅어져서 정작 글자 자리가 덜 덮인다. 배경은 단색, 흐려지는 건 mask 담당.
            같은 mask 가 backdrop-blur 에도 걸려서 흐림도 같이 사라진다. */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            aria-hidden
            className={`absolute inset-y-0 ${side}-0 pointer-events-none`}
            style={{
              width: EDGE_W,
              background: EDGE_COLOR,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              maskImage: edgeMask(side),
              WebkitMaskImage: edgeMask(side),
            }}
          />
        ))}
      </motion.div>

      {/* 모바일 — 세로형 */}
      <motion.div {...reveal} className="block md:hidden relative w-full">
        <img
          src={moBg}
          alt={ALT}
          width={1612}
          height={2000}
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />
      </motion.div>
    </section>
  );
}
