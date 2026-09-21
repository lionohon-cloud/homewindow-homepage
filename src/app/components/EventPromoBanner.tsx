import { motion } from "motion/react";
/* 260917 10월 이벤트 이미지로 교체 (원본: 홈윈도우 업무\2. 온라인 마케팅\홈페이지\260825 9월 이벤트\
   "260825 9월 이벤트-4.png" · "260825 9월 이벤트 mo-4.png" → webp). 9월판 파일은 지우지 않고 남겨 뒀다. */
import pcBg from "../../assets/event/promo-2610-pc-bg.webp";
import moImg from "../../assets/event/promo-2610-mo.webp";
import { ShortsPlayer } from "./tempered/ShortsPlayer";

/**
 * 강화유리 프로모션 배너 (260917 10월 이벤트).
 *
 * 260917 — PC 는 예전처럼 배경(글자 없음) 위에 글자를 얹는다.
 *          모바일 새 이미지(mo-4)는 글자까지 구워져 나와서 글자를 얹지 않고, 내용은 alt 로 전한다.
 *          영상 자리(흰 카드)는 두 이미지 모두 예전과 같은 위치라 값을 그대로 쓴다.
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


/* ── PC (2716×908) ───────────────────────────────────────────
   260903 개편. 모바일(mo-3)과 같은 구성의 가로형.
   머리말("9월엔 유리만 강화한 게 아닙니다" / "유리도 강화하고…")은 배경에 구워져 있다 —
   글자로 얹는 건 아래 다섯 덩어리와 영상뿐이다.

   좌표 잡은 방법
     글자 있는 원본이 없어 픽셀 차이를 못 쓴다. 대신 배경 안의 도형(회색·파란 알약,
     노란 태그, 파란 띠, 흰 카드)을 색으로 찾아 그 상자의 중심·왼끝에 글자를 앉혔다.
     아래 %는 배경 2716×908 에 대한 실측치다. */

/** 배경에서 색으로 찾아낸 영상 자리 (2716×908 기준 %) */
const PC_VIDEO_BOX = { left: 49.19, top: 29.19, width: 20.29, height: 43.17 };

function PcText() {
  return (
    <>
      {/* 유리 비교 카드 위의 라벨 두 개 */}
      <T cx={33.12} cy={35.08} size={0.61} cls="font-bold text-black">
        일반유리
      </T>
      <T cx={44.57} cy={35.08} size={0.61} cls="font-bold text-white">
        강화유리
      </T>

      {/* 카드 하단 파란 알약 */}
      <T cx={39.95} cy={65.75} size={1.04} cls="font-extrabold text-white">
        강화유리 무상 업그레이드
      </T>

      {/* 노란 말풍선 태그 */}
      <T cx={40.85} cy={76.32} size={0.72} cls="font-extrabold text-[#014ec5]">
        선착순 EVENT
      </T>

      {/* 파란 띠 — 쿠폰 아이콘 오른쪽부터. 노란 태그와 왼끝을 맞춘다.
          "200세대 한정 | 계약금" 은 흰색, "10% 추가 할인" 은 옅은 노랑(#fffbbd). */}
      <T l={38.14} cy={81.06} size={1.66} cls="font-extrabold text-white">
        200세대 한정
        <span className="mx-[1.1cqw] font-normal opacity-60" style={{ fontSize: "1.3cqw" }}>
          |
        </span>
        계약금{" "}
        <span className="text-[#fffbbd]">
          <span style={{ fontSize: "2.15cqw" }}>10</span>
          <span className="ml-[0.12cqw]" style={{ fontSize: "1.3cqw" }}>
            %
          </span>{" "}
          추가 할인
        </span>
      </T>

      {/* 하단 안내 — 띠(y 695~777) 아래. 모바일처럼 띠 기준 가운데 정렬이고,
          띠와의 간격은 모바일과 같은 비율(높이의 3.7% ≈ 34px)로 띄웠다.
          띠 중심 x = (828+1884)/2 = 1356 → 49.93% */}
      {/* 260917 모바일 이미지 문구와 같게 — 마감 10/31, 시공 완료 조건은 빠졌다 */}
      <T cx={49.93} cy={90.6} size={0.85} cls="text-[#434343]">
        본 이벤트는 2026년 10월 31일 까지 계약하신 고객에 한하여 적용됩니다.
      </T>
    </>
  );
}

/* ── 모바일 (896×1200) ────────────────────────────────────────
   260902 개편. 혜택 3종 나열 대신 "유리 → 강화유리 / 영상 / 선착순 할인" 3단.
   흰 카드 자리에는 배경에 아무것도 없고 영상 플레이어를 덮어 놓는다. */

/** 배너 안 영상. 유튜브·드라이브 링크를 그대로 넣으면 된다(ShortsPlayer 가 판별). */
const PROMO_VIDEO = "https://www.youtube.com/watch?v=tuxuvYdPZaY";

/** 영상이 들어갈 흰 카드 자리 — 배경(896×1200)에서 실측한 값 */
const MO_VIDEO_BOX = { left: 6.03, top: 52.17, width: 88.06, height: 30.83 };

/* 260917 — 모바일 이미지에 글자가 구워져 나와 글자를 얹는 MoText 는 뺐다.
   글자를 다시 코드로 얹어야 하면 이벤트판(260827 원본) EventPromoBanner.tsx 의 MoText 를 가져오면 된다.
   이미지에 적힌 내용은 스크린리더·검색엔진이 읽도록 alt 로 옮겼다. */
const MO_ALT =
  "10월엔 유리만 강화한 게 아닙니다. 유리도 강화하고 혜택도 강화했습니다. " +
  "일반유리를 강화유리로, 강화유리 무상 업그레이드. " +
  "선착순 EVENT 200세대 한정, 계약금 10% 추가 할인. " +
  "본 이벤트는 2026년 10월 31일 까지 계약하신 고객에 한하여 적용됩니다.";

export function EventPromoBanner() {
  return (
    <section className="w-full bg-[#f2f8fe] overflow-hidden md:flex md:justify-center" aria-label="10월 한정 강화유리 프로모션">
      {/* PC — 가로형. 2716px 에서 멈추고 그 이상은 양옆이 섹션 배경으로 남는다.
          배경색이 이미지 가장자리색이라 이어 붙은 것처럼 보인다. */}
      <motion.div
        {...reveal}
        /* 260917 — 가로 3:1 배경에서 내용은 가운데 40% 뿐이라 태블릿~노트북 폭에서 너무 작아졌다.
           최소 1700px 로 잡고 섹션 flex 가운데 정렬(motion 의 transform 과 안 겹치게) — 좁은 화면에선 양옆 여백(배경)만 잘려 나간다. */
        className="@container hidden md:block relative shrink-0 w-[max(100%,1700px)] max-w-[2716px]"
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
        {/* 배경의 빈 흰 카드 자리에 영상을 덮는다. 카드는 1.41:1, 영상은 16:9 라
            위아래에 검은 레터박스가 생긴다 — 잘라내지 않고 온전히 보여 주는 쪽. */}
        <div
          className="absolute"
          style={{
            left: `${PC_VIDEO_BOX.left}%`,
            top: `${PC_VIDEO_BOX.top}%`,
            width: `${PC_VIDEO_BOX.width}%`,
            height: `${PC_VIDEO_BOX.height}%`,
          }}
        >
          <ShortsPlayer
            src={PROMO_VIDEO}
            aspect="auto"
            loop
            title="강화유리 이벤트 영상"
            className="h-full rounded-xl shadow-none !bg-black"
          />
        </div>
      </motion.div>

      {/* 모바일 — 세로형 */}
      <motion.div {...reveal} className="@container block md:hidden relative w-full">
        <img
          src={moImg}
          alt={MO_ALT}
          width={896}
          height={1200}
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />
        {/* 배경의 빈 흰 카드 자리에 영상을 덮는다.
            aspect="auto" 라야 상자 비율을 강제하지 않고 이 칸을 그대로 채운다. */}
        <div
          className="absolute"
          style={{
            left: `${MO_VIDEO_BOX.left}%`,
            top: `${MO_VIDEO_BOX.top}%`,
            width: `${MO_VIDEO_BOX.width}%`,
            height: `${MO_VIDEO_BOX.height}%`,
          }}
        >
          <ShortsPlayer
            src={PROMO_VIDEO}
            aspect="auto"
            loop
            title="강화유리 이벤트 영상"
            /* 카드는 2.13:1, 영상은 16:9 라 좌우에 레터박스가 생긴다.
               유튜브 플레이어가 만드는 검은 띠와 같은 색이어야 이음매가 안 보여서
               상자 배경을 기본 #111 이 아니라 순검정으로 둔다. */
            className="h-full rounded-xl shadow-none !bg-black"
          />
        </div>
      </motion.div>
    </section>
  );
}
