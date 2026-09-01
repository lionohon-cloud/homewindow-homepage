import { motion } from "motion/react";
import pcBg from "../../assets/event/promo-2609-pc-bg.webp";
import moBg from "../../assets/event/promo-2609-mo-bg.webp";

/**
 * 9월 강화유리 프로모션 배너.
 *
 * 검색 최적화를 위해 **글자를 이미지에 굽지 않는다.** 배경(도형·아이콘만 있는 그림)
 * 위에 실제 텍스트를 얹는다. 크롤러가 읽고, 확대해도 안 깨지고, 문구 수정도 쉽다.
 *
 * 좌표 잡은 방법
 *   글자가 있던 원본과 글자를 지운 배경을 픽셀 단위로 비교해 글자 자리의 사각형을
 *   뽑았다. 아래 값은 그 실측치를 배경 크기(PC 2716×908, MO 1020×1532)에 대한
 *   백분율로 옮긴 것이다. l/cx = 왼쪽 또는 가로 중심, cy = 세로 중심.
 *
 * 글자 크기는 cqw(컨테이너 폭의 %)라 배너가 커지든 작아지든 그림과 같은 비율로 따라간다.
 * @container 는 바깥 래퍼에만 준다 — 안쪽 요소에 같이 주면 cqw 가 뷰포트 기준으로 잡혀 깨진다.
 *
 * 기존 EventSection(다크 SUPER SALE 배너)은 EventSection.tsx 에 그대로 있다.
 */

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
} as const;

/** 배경 이미지 안에서 글자가 놓일 자리. 단위는 모두 % (cy 는 세로 중심). */
type Spot = {
  cy: number;
  l?: number; // 왼쪽 기준
  cx?: number; // 가로 중심 기준
  size: number; // cqw
  cls?: string;
  children: React.ReactNode;
};

/** 한 조각을 배경 위 제자리에 놓는다 */
function T({ cy, l, cx, size, cls = "", children }: Spot) {
  return (
    <span
      className={`absolute whitespace-nowrap leading-none ${cls}`}
      style={{
        top: `${cy}%`,
        ...(cx !== undefined
          ? { left: `${cx}%`, transform: "translate(-50%, -50%)" }
          : { left: `${l}%`, transform: "translateY(-50%)" }),
        fontSize: `${size}cqw`,
      }}
    >
      {children}
    </span>
  );
}

const BLUE = "text-[#1a6cf0]";
const DARK = "text-[#333]";
const GRAY = "text-[#8a8f98]";

/* "일반유리 → 강화유리" 는 원본에서 색을 직접 뽑아 맞췄다.
   일반유리·화살표 #434343 보통 굵기, 강화유리 #1b1b1b 에 잉크량이 1.8배(=훨씬 굵다).
   화살표는 파랑이 아니라 앞 글자와 같은 회색이다. */

/* ── PC (2716×908) ───────────────────────────────────────── */
function PcText() {
  return (
    <>
      {/* 왼쪽 카드 — 9월한정 특별가 */}
      <T cx={38.29} cy={41.19} size={1.26} cls="font-bold text-white">
        9월한정 특별가
      </T>
      <T cx={38.00} cy={49.12} size={1.41} cls="font-medium text-[#434343]">
        일반유리 <span className="font-bold">→</span>{" "}
        <span className="font-extrabold text-[#1b1b1b]">강화유리</span>
      </T>
      <T cx={37.96} cy={56.72} size={2.60} cls={`font-extrabold ${BLUE}`}>
        무상 업그레이드
      </T>
      <T l={28.87} cy={75.22} size={1.81} cls={`font-extrabold ${DARK}`}>
        계약금액
      </T>
      <T l={36.45} cy={74.34} size={3.92} cls={`font-extrabold ${BLUE}`}>
        10
        <span className="ml-[0.25cqw]" style={{ fontSize: "1.79cqw" }}>
          %
        </span>
        <span className={`ml-[0.58cqw] font-extrabold ${DARK}`} style={{ fontSize: "1.79cqw" }}>
          할인
        </span>
      </T>

      {/* 오른쪽 카드 — 추가 혜택 3종 */}
      <T cx={62.55} cy={10.68} size={1.25} cls="font-bold text-white">
        추가 혜택 3종
      </T>

      <T l={58.03} cy={20.70} size={1.15} cls={`font-bold ${DARK}`}>
        선금보증보험 적용
      </T>
      <T l={58.03} cy={26.43} size={0.85} cls={GRAY}>
        계약금은 안전하게,
      </T>
      <T l={58.03} cy={30.18} size={0.85} cls={GRAY}>
        할인은 확실하게
      </T>
      <T l={68.34} cy={25.66} size={2.05} cls={`font-extrabold ${BLUE}`}>
        10
        <span className="ml-[0.12cqw]" style={{ fontSize: "0.97cqw" }}>
          %
        </span>
      </T>

      <T l={58.03} cy={44.05} size={1.15} cls={`font-bold ${DARK}`}>
        방문 당일계약
      </T>
      <T l={58.03} cy={49.45} size={0.85} cls={GRAY}>
        방문 상담
      </T>
      <T l={58.10} cy={53.19} size={0.85} cls={GRAY}>
        당일 계약 확정 시
      </T>
      <T l={68.34} cy={47.91} size={2.05} cls={`font-extrabold ${BLUE}`}>
        10
        <span className="ml-[0.12cqw]" style={{ fontSize: "0.97cqw" }}>
          %
        </span>
      </T>

      <T l={58.03} cy={67.18} size={1.15} cls={`font-bold ${DARK}`}>
        시공 후기 작성
      </T>
      <T l={58.03} cy={72.69} size={0.85} cls={GRAY}>
        시공 완료 후
      </T>
      <T l={58.03} cy={76.43} size={0.85} cls={GRAY}>
        후기를 남겨주시면
      </T>
      <T l={68.56} cy={71.48} size={2.05} cls={`font-extrabold ${BLUE}`}>
        5
        <span className="ml-[0.12cqw]" style={{ fontSize: "0.97cqw" }}>
          %
        </span>
      </T>

      {/* 하단 안내 */}
      <T l={39.84} cy={89.76} size={0.85} cls={GRAY}>
        본 이벤트는 2026년 9월 30일 까지 계약 후 10월 중 시공 완료 고객에
      </T>
      <T l={39.84} cy={93.28} size={0.85} cls={GRAY}>
        한하여 적용됩니다.
      </T>
    </>
  );
}

/* ── 모바일 (1020×1532) ──────────────────────────────────── */
function MoText() {
  return (
    <>
      <T cx={49.31} cy={23.30} size={3.72} cls="font-bold text-white">
        9월한정 특별가
      </T>
      <T cx={50.0} cy={28.59} size={4.16} cls="font-medium text-[#434343]">
        일반유리 <span className="font-bold">→</span>{" "}
        <span className="font-extrabold text-[#1b1b1b]">강화유리</span>
      </T>
      <T cx={50.0} cy={33.55} size={7.69} cls={`font-extrabold ${BLUE}`}>
        무상 업그레이드
      </T>
      <T cx={50.0} cy={45.56} size={11.83} cls={`font-extrabold ${BLUE}`}>
        <span className={`mr-[2cqw] font-extrabold ${DARK}`} style={{ fontSize: "5.17cqw" }}>
          계약금액
        </span>
        10
        <span className="ml-[0.4cqw]" style={{ fontSize: "6.59cqw" }}>
          %
        </span>
        <span className={`ml-[1.6cqw] font-extrabold ${DARK}`} style={{ fontSize: "6.59cqw" }}>
          할인
        </span>
      </T>

      <T cx={49.90} cy={54.37} size={3.72} cls="font-bold text-white">
        추가 혜택 3종
      </T>

      <T l={34.90} cy={59.73} size={3.34} cls={`font-bold ${DARK}`}>
        선금보증보험 적용
      </T>
      <T l={35.29} cy={62.79} size={2.37} cls={GRAY}>
        계약금은 안전하게,
      </T>
      <T l={35.29} cy={65.01} size={2.37} cls={GRAY}>
        할인은 확실하게
      </T>
      <T l={69.41} cy={61.95} size={6.50} cls={`font-extrabold ${BLUE}`}>
        10
        <span className="ml-[0.4cqw]" style={{ fontSize: "3.09cqw" }}>
          %
        </span>
      </T>

      <T l={35.29} cy={71.47} size={3.34} cls={`font-bold ${DARK}`}>
        방문 당일계약
      </T>
      <T l={35.69} cy={74.54} size={2.37} cls={GRAY}>
        방문 상담
      </T>
      <T l={35.69} cy={76.76} size={2.37} cls={GRAY}>
        당일 계약 확정 시
      </T>
      <T l={69.61} cy={73.89} size={6.50} cls={`font-extrabold ${BLUE}`}>
        10
        <span className="ml-[0.4cqw]" style={{ fontSize: "3.09cqw" }}>
          %
        </span>
      </T>

      <T l={35.10} cy={83.49} size={3.34} cls={`font-bold ${DARK}`}>
        시공 후기 작성
      </T>
      <T l={35.69} cy={86.55} size={2.37} cls={GRAY}>
        시공 완료 후
      </T>
      <T l={35.49} cy={88.77} size={2.37} cls={GRAY}>
        후기를 남겨주시면
      </T>
      <T l={70.39} cy={85.83} size={6.50} cls={`font-extrabold ${BLUE}`}>
        5
        <span className="ml-[0.4cqw]" style={{ fontSize: "3.09cqw" }}>
          %
        </span>
      </T>

      <T l={25.29} cy={94.58} size={2.16} cls={GRAY}>
        본 이벤트는 2026년 9월 30일 까지 계약 후 10월 중 시공 완료 고객에
      </T>
      <T l={25.29} cy={96.67} size={2.16} cls={GRAY}>
        한하여 적용됩니다.
      </T>
    </>
  );
}

export function EventPromoBanner() {
  return (
    <section className="w-full bg-[#f2f8fe] overflow-hidden" aria-label="9월 한정 프로모션">
      {/* PC — 가로형. 2716px 에서 멈추고 그 이상은 양옆이 섹션 배경으로 남는다.
          배경색이 이미지 가장자리색이라 이어 붙은 것처럼 보인다. */}
      <motion.div
        {...reveal}
        className="@container hidden md:block relative w-full max-w-[2716px] mx-auto"
      >
        <img
          src={pcBg}
          alt=""
          aria-hidden="true"
          width={2716}
          height={908}
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />
        <PcText />
      </motion.div>

      {/* 모바일 — 세로형 */}
      <motion.div {...reveal} className="@container block md:hidden relative w-full">
        <img
          src={moBg}
          alt=""
          aria-hidden="true"
          width={1020}
          height={1532}
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />
        <MoText />
      </motion.div>
    </section>
  );
}
