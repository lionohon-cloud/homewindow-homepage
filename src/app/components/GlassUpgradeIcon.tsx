import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * 일반유리 → 강화유리 픽토그램.
 *
 * 이벤트 배너의 "받침대 위 유리 두 장 + 화살표" 구성을 히어로용으로 줄인 것.
 * 히어로가 어두운 영상 위라 선은 흰색 계열로 잡고, 오른쪽(강화유리)만
 * 푸른 유리색·발광·반짝임으로 차이를 준다. 글자는 넣지 않는다 —
 * 바로 아래 줄("일반유리 → 강화유리")이 그 역할을 한다.
 *
 * 두 판의 크기를 일부러 다르게 뒀다. 오른쪽이 확실히 커야 "업그레이드"로 읽힌다.
 *
 * 라벨(일반유리 / 강화유리)은 SVG 안에 넣었다. 바깥 HTML 로 빼면 폭이 바뀔 때마다
 * 판 중심과 어긋나는데, 안에 두면 도형과 같은 좌표계라 항상 정확히 아래에 온다.
 *
 * 판때기가 아니라 "유리 한 장"으로 읽히게 하는 요소가 둘이다.
 * (오른쪽 옆면=두께면도 그렸었는데, 얇게 줄여도 별개의 꺾인 판처럼 읽혀서 뺐다.)
 *   · 비스듬한 하이라이트 — 유리 표면의 반사
 *   · 바닥 그림자 — 세워 둔 물건이라는 신호. 선이 아니라 가장자리가 풀리는
 *     방사형 그라데이션이라 실제 그림자처럼 번진다(filter 없이 = 가볍다).
 *
 * 강화유리 쪽 반짝임은 두 가지.
 *   · 유리면을 훑고 지나가는 빛줄기 (clipPath 로 판 안쪽만)
 *   · 네 갈래 별 4개가 시차를 두고 깜빡임
 * 애니메이션 정의는 styles/index.css 의 hw-glass-shine · hw-twinkle.
 *
 * 모바일·PC 두 군데서 동시에 그려지므로 gradient/clip id 는 useId 로 나눈다.
 */

interface Props {
  /** 렌더 폭(px). 높이는 비율(208:104)로 따라온다 */
  width?: number;
  className?: string;
}

/** 네 갈래 별 — 반짝임용 */
function star(cx: number, cy: number, r: number) {
  const t = r * 0.2;
  return (
    `M${cx},${cy - r}` +
    `Q${cx + t},${cy - t} ${cx + r},${cy}` +
    `Q${cx + t},${cy + t} ${cx},${cy + r}` +
    `Q${cx - t},${cy + t} ${cx - r},${cy}` +
    `Q${cx - t},${cy - t} ${cx},${cy - r}Z`
  );
}

/* 판 한 장 = 앞면 + 표면 하이라이트.
   (x, y) 는 왼쪽 위, w·h 는 앞면 크기, lift 는 오른쪽 위로 들린 정도(원근). */
type Pane = { x: number; y: number; w: number; h: number; lift: number };
const facePts = ({ x, y, w, h, lift }: Pane) =>
  `${x},${y + lift} ${x + w},${y} ${x + w},${y + h} ${x},${y + h + lift}`;
const gleamPts = ({ x, y, w, h, lift }: Pane) =>
  `${x + w * 0.16},${y + h + lift} ${x + w * 0.5},${y} ${x + w * 0.68},${y} ${x + w * 0.34},${y + h + lift}`;

/** 왼쪽 · 일반유리 — 작게 */
const PLAIN: Pane = { x: 15, y: 19, w: 32, h: 35, lift: 5 };
/** 강화유리 라벨 밑줄의 y(선 중심). 글자 잉크 아래끝이 87.8 이므로
    선 위끝 = 92 - 0.8 = 91.2, 글자와의 간격 3.4 가 된다. */
const UNDERLINE_Y = 92;

/** 오른쪽 · 강화유리 — 확실히 크게 */
const TEMPERED: Pane = { x: 105.6, y: 8, w: 46, h: 48, lift: 6 };

export function GlassUpgradeIcon({ width = 168, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const id = (k: string) => `${k}-${uid}`;

  /* 밑줄 길이 = 라벨의 실제 가로폭. 웹폰트가 늦게 오면 폭이 달라지므로
     fonts.ready 뒤에 한 번 더 잰다. */
  const labelRef = useRef<SVGTextElement>(null);
  const [underline, setUnderline] = useState<{ x1: number; x2: number } | null>(null);
  const measure = () => {
    const el = labelRef.current;
    if (!el) return;
    const b = el.getBBox();
    if (b.width > 0) setUnderline({ x1: b.x, x2: b.x + b.width });
  };
  useLayoutEffect(measure, []);
  useEffect(() => {
    document.fonts?.ready.then(measure);
  }, []);

  return (
    <svg
      width={width}
      height={(width * 104) / 208}
      viewBox="0 0 208 104"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("plain")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity=".04" />
        </linearGradient>
        <linearGradient id={id("temp")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fdcff" stopOpacity=".5" />
          <stop offset="1" stopColor="#3f9dff" stopOpacity=".18" />
        </linearGradient>
        <linearGradient id={id("shine")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* 화살표 — 왼쪽은 흐리고 오른쪽으로 갈수록 밝아진다.
            userSpaceOnUse 를 써야 한다: 몸통이 수평선이라 bbox 높이가 0 이고,
            기본값(objectBoundingBox)이면 그 선이 아예 안 그려진다. */}
        <linearGradient
          id={id("arrow")}
          gradientUnits="userSpaceOnUse"
          x1="63.1"
          y1="0"
          x2="89.6"
          y2="0"
        >
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#dff1ff" stopOpacity=".95" />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor="#7cc9ff" stopOpacity=".5" />
          <stop offset="1" stopColor="#7cc9ff" stopOpacity="0" />
        </radialGradient>
        {/* 바닥 그림자 — 가운데가 짙고 가장자리가 풀린다 */}
        <radialGradient id={id("shadow")}>
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset=".55" stopColor="#000" stopOpacity=".22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("shadowLit")}>
          <stop offset="0" stopColor="#1b4a78" stopOpacity=".6" />
          <stop offset=".45" stopColor="#2f7fd0" stopOpacity=".28" />
          <stop offset="1" stopColor="#3f9dff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("clipL")}>
          <polygon points={facePts(PLAIN)} />
        </clipPath>
        <clipPath id={id("clipR")}>
          <polygon points={facePts(TEMPERED)} />
        </clipPath>
      </defs>

      {/* ══ 왼쪽 · 일반유리 ══ */}
      <ellipse cx="32" cy="61" rx="26" ry="7" fill={`url(#${id("shadow")})`} />
      <polygon
        points={facePts(PLAIN)}
        fill={`url(#${id("plain")})`}
        stroke="#fff"
        strokeOpacity=".48"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${id("clipL")})`}>
        <polygon points={gleamPts(PLAIN)} fill="#fff" fillOpacity=".14" />
      </g>

      {/* ══ 가운데 · 화살표 ══
          면이 아니라 선으로 — 유리 두 장이 면이라 화살표까지 채우면 무거워진다.
          꼬리에서 머리로 갈수록 밝아지는 그라데이션을 stroke 에 준다.
          꼬리 30 → 25.5 (-15%), 머리 9.5×15 → 7.6×12 (-20%).
          화살표가 짧아진 만큼 사이 간격도 63 → 58.6 으로 좁혔다.
          히어로가 좌측정렬이라 왼쪽 판은 두고 화살표부터 오른쪽 전부를 4.4 당겼다. */}
      <g
        fill="none"
        stroke={`url(#${id("arrow")})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M63.1,38 H88.6" />
        <path d="M82,32 89.6,38 82,44" />
      </g>

      {/* ══ 오른쪽 · 강화유리 ══ */}
      {/* 글로우는 viewBox 안에 완전히 들어와야 한다 — <svg> 는 기본이 overflow:hidden 이라
          가장자리를 넘으면 아직 불투명한 지점에서 잘려 직선 자국이 남는다.
          cy - ry = 0, cy + ry = 68, cx ± rx = 84~184 로 사방이 상자 안. */}
      <ellipse cx="129.6" cy="34" rx="50" ry="34" fill={`url(#${id("glow")})`} />
      <ellipse cx="128.6" cy="65" rx="32" ry="8.5" fill={`url(#${id("shadowLit")})`} />
      <polygon
        points={facePts(TEMPERED)}
        fill={`url(#${id("temp")})`}
        stroke="#dff1ff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${id("clipR")})`}>
        <polygon points={gleamPts(TEMPERED)} fill="#fff" fillOpacity=".26" />
        {/* 기울기는 <g>, 좌우 이동은 CSS — 한 요소에 겹치면 서로 덮어쓴다 */}
        <g transform="rotate(14 105 33)">
          <rect
            className="hw-glass-shine"
            x="92"
            y="-12"
            width="17"
            height="96"
            fill={`url(#${id("shine")})`}
          />
        </g>
      </g>

      {/* ══ 라벨 ══ 각 판의 가로 중심에 맞춘다 */}
      <g
        textAnchor="middle"
        style={{ textShadow: "0 1px 6px rgba(0,0,0,.6)" }}
        className="[font-family:inherit]"
      >
        {/* 둘 다 흰색 — 유리가 파랗게 빛나는데 라벨까지 빨강이면 색이 부딪힌다.
            강조는 굵기(200 vs 800)와 크기(15 vs 17)로만 준다.
            크기는 달라도 베이스라인(y)은 같아야 두 라벨이 한 줄로 읽힌다.
            한글은 획이 베이스라인까지 꽉 차서 밑줄을 한참 내려야 안 붙는다.
            그만큼 상자 아래를 104 로 늘렸다(94 였으면 밑줄이 잘린다). */}
        <text x="33" y="86" fontSize="15" fontWeight="200" fill="#fff" fillOpacity=".8">
          일반유리
        </text>
        <text ref={labelRef} x="131.6" y="86" fontSize="17" fontWeight="700" fill="#fff">
          강화유리
        </text>
        {/* 밑줄 — text-decoration 은 SVG <text> 에서 text-underline-offset 이 먹지 않아
            (3 → 5 → 9 로 올려도 그대로) 글자 아래 획에 붙어 버린다. 선을 직접 긋되
            길이는 런타임 실측(getBBox)으로 맞춘다 — 좌표를 박으면 폰트가 바뀔 때 어긋난다. */}
        {underline && (
          <line
            x1={underline.x1}
            x2={underline.x2}
            y1={UNDERLINE_Y}
            y2={UNDERLINE_Y}
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* ══ 반짝임 ══ */}
      <g fill="#eaf7ff">
        <path className="hw-twinkle" d={star(167.6, 15, 6.6)} />
        <path className="hw-twinkle" style={{ animationDelay: "-.8s" }} d={star(99.6, 19, 4.4)} />
        <path className="hw-twinkle" style={{ animationDelay: "-1.5s" }} d={star(161.6, 50, 4.8)} />
        <path className="hw-twinkle" style={{ animationDelay: "-2s" }} d={star(114.6, 4, 3.4)} />
      </g>
    </svg>
  );
}
