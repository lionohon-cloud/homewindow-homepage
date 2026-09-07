import type { CSSProperties, ReactNode } from "react";

/**
 * 강화유리 창짝 턴테이블.
 *
 * 이미지 파일 없이 CSS 3D 로 창짝을 실제 두께가 있는 상자들로 조립한다.
 * 한 바퀴 돌리지 않고 정면 기준 좌우 15° 를 왕복한다 — 스탠드 선풍기처럼.
 * 프레임 4변(45° 절단 용접) + 안쪽 단 4변 + 유리 둘레 패킹 + 유리 + 핸들 = 상자 16개.
 * 유리가 반투명이라 돌면 뒤쪽 프레임이 비치고, 옆으로 서면 두께가 드러난다.
 *
 * 좌표계: 창짝 중심이 원점, y 는 아래가 +, z 는 보는 쪽이 +. 단위는 px 인데
 * 바깥 래퍼를 scale 로 줄여서 쓰므로 실제 화면 크기는 `height` 로 정한다.
 *
 * 애니메이션(회전·유리 빛)은 styles/index.css 의 hw-sash-* 에 있다.
 * 배경·받침대는 없다 — 히어로 영상 위에 창짝만 얹는 용도.
 */

interface Props {
  /** 화면에 그려질 창짝 높이(px). 폭은 비율로 따라온다 */
  height?: number;
  className?: string;
}

/* ── 창짝 치수 (월드 px) ── */
const W = 300; // 바깥 프레임 폭
const H = 420; // 바깥 프레임 높이
const D = 54; // 두께
const BAR = 36; // 프레임 살 폭
const OW = W - 2 * BAR; // 개구부
const OH = H - 2 * BAR;

/* 회전할 때 튀어나오는 여유까지 포함한 레이아웃 상자 */
const BOX_W = W * 1.16;
const BOX_H = H * 1.06;

type Faces = {
  front: string;
  back: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
  frontClass?: string;
  frontMore?: CSSProperties;
};

/* ── 재질 · 빛은 왼쪽 위 ── */
const CREAM: Faces = {
  front: "linear-gradient(165deg,#faf7f1 0%,#f1ebe1 55%,#e7dfd2 100%)",
  back: "#e4dcd0",
  left: "linear-gradient(180deg,#f3eee6,#e6dfd3)",
  right: "linear-gradient(180deg,#d9d0c3,#c9bfb0)",
  top: "#fcfaf6",
  bottom: "#c8bdae",
};
const REBATE: Faces = {
  front: "linear-gradient(165deg,#ebe4d8,#ddd4c6)",
  back: "#d6cdc0",
  left: "#e3dbcf",
  right: "#c5bbac",
  top: "#efe9df",
  bottom: "#b9ae9f",
};
const GASKET: Faces = {
  front: "#4a4a4d",
  back: "#434346",
  left: "#57575a",
  right: "#3a3a3d",
  top: "#5a5a5d",
  bottom: "#323234",
};
const GLASS: Faces = {
  front:
    "linear-gradient(155deg,rgba(255,255,255,.55) 0%,rgba(225,236,242,.22) 28%,rgba(200,218,228,.16) 50%,rgba(255,255,255,.34) 72%,rgba(210,226,236,.2) 100%)",
  frontClass: "hw-sash-glass",
  frontMore: {
    boxShadow:
      "inset 0 0 0 1px rgba(255,255,255,.6), inset 1px 1px 0 1px rgba(255,255,255,.28)",
  },
  back: "rgba(200,215,225,.14)",
  left: "linear-gradient(180deg,#b9dcd6,#8fbfb7)", // 유리 단면 — 청록빛
  right: "linear-gradient(180deg,#a8cfc8,#7fb0a8)",
  top: "#c6e3de",
  bottom: "#86b3ab",
};
/* 웜그레이 메탈 — 푸른 크롬이 아니라 샴페인 쪽으로 기운 회색 */
const METAL: Faces = {
  front:
    "linear-gradient(90deg,#9f968c 0%,#d9d1c6 34%,#efe9e0 48%,#c4bbaf 66%,#8c8378 100%)",
  back: "#8c8378",
  left: "#cfc7bb",
  right: "#746c62",
  top: "#e6dfd5",
  bottom: "#655d54",
};

type FaceName = keyof Pick<Faces, "front" | "back" | "left" | "right" | "top" | "bottom">;

interface BoxProps {
  w: number;
  h: number;
  d: number;
  x: number;
  y: number;
  z: number;
  faces: Faces;
  /** 면별 clip-path (45° 절단면 등) */
  clip?: Partial<Record<FaceName, string>>;
  /** 다른 살 안에 파묻혀 안 보이는 면 — 그리지 않는다(z-fighting 방지) */
  hide?: FaceName[];
}

/** 상자 하나 = 6면. 각 면을 상자 중심에 겹쳐 놓고 자기 법선 방향으로 절반만큼 밀어낸다. */
function Box({ w, h, d, x, y, z, faces, clip = {}, hide = [] }: BoxProps) {
  const face = (name: FaceName, fw: number, fh: number, transform: string): ReactNode => {
    if (hide.includes(name)) return null;
    const style: CSSProperties = {
      width: fw,
      height: fh,
      left: (w - fw) / 2,
      top: (h - fh) / 2,
      transform,
      background: faces[name],
      clipPath: clip[name],
      ...(name === "front" ? faces.frontMore : undefined),
    };
    const cls = "hw-sash-face" + (name === "front" && faces.frontClass ? ` ${faces.frontClass}` : "");
    return <div key={name} className={cls} style={style} />;
  };
  return (
    <div
      className="hw-sash-box"
      style={{ width: w, height: h, transform: `translate3d(${x - w / 2}px,${y - h / 2}px,${z}px)` }}
    >
      {face("front", w, h, `translateZ(${d / 2}px)`)}
      {face("back", w, h, `rotateY(180deg) translateZ(${d / 2}px)`)}
      {face("left", d, h, `rotateY(-90deg) translateZ(${w / 2}px)`)}
      {face("right", d, h, `rotateY(90deg) translateZ(${w / 2}px)`)}
      {face("top", w, d, `rotateX(90deg) translateZ(${h / 2}px)`)}
      {face("bottom", w, d, `rotateX(-90deg) translateZ(${h / 2}px)`)}
    </div>
  );
}

/**
 * 45° 절단 용접 프레임 링.
 * 가로살은 전체 폭, 세로살은 전체 높이로 잡고 앞·뒷면을 사다리꼴로 잘라 모서리에서
 * 45° 로 만나게 한다. 뒷면은 좌우가 뒤집혀 보이므로 세로살 clip 도 뒤집는다.
 */
function MitredRing({
  w, h, bar, d, z, faces,
}: { w: number; h: number; bar: number; d: number; z: number; faces: Faces }) {
  const b = `${bar}px`;
  const bb = `calc(100% - ${bar}px)`;
  const horiz = (top: boolean) =>
    top ? `polygon(0 0,100% 0,${bb} 100%,${b} 100%)` : `polygon(${b} 0,${bb} 0,100% 100%,0 100%)`;
  const vert = (left: boolean) =>
    left ? `polygon(0 0,100% ${b},100% ${bb},0 100%)` : `polygon(0 ${b},100% 0,100% 100%,0 ${bb})`;
  const mid = `polygon(${b} 0,${bb} 0,${bb} 100%,${b} 100%)`;
  const hideEnds: FaceName[] = ["left", "right"];
  return (
    <>
      <Box w={w} h={bar} d={d} x={0} y={-(h / 2 - bar / 2)} z={z} faces={faces}
        clip={{ front: horiz(true), back: horiz(true), top: mid, bottom: mid }} hide={hideEnds} />
      <Box w={w} h={bar} d={d} x={0} y={h / 2 - bar / 2} z={z} faces={faces}
        clip={{ front: horiz(false), back: horiz(false), top: mid, bottom: mid }} hide={hideEnds} />
      <Box w={bar} h={h} d={d} x={-(w / 2 - bar / 2)} y={0} z={z} faces={faces}
        clip={{ front: vert(true), back: vert(false) }} />
      <Box w={bar} h={h} d={d} x={w / 2 - bar / 2} y={0} z={z} faces={faces}
        clip={{ front: vert(false), back: vert(true) }} />
    </>
  );
}

export function SashTurntable({ height = 220, className = "" }: Props) {
  const s = height / BOX_H;

  /* 안쪽 단 — 개구부 안쪽에 한 단 들어간 살, 앞면이 프레임보다 12 뒤 */
  const RB = 14, RD = 24, RZ = -(D / 2) + RD / 2 + 12;
  /* 패킹 — 단 안쪽 얇은 테 */
  const GW = OW - 2 * RB, GH = OH - 2 * RB, GK = 3, GZ = RZ + 2;
  /* 핸들 — 오른쪽 살 앞면, 아래로 향한 레버 */
  const HX = W / 2 - BAR / 2, HZ = D / 2;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: BOX_W * s, height: BOX_H * s }}
      aria-hidden="true"
    >
      {/* 바닥에 닿지 않고 살짝 떠 있는 느낌의 그림자.
          창짝이 옆으로 설수록 좁아지도록 회전과 같은 18초 주기로 폭이 변한다. */}
      <div
        className="hw-sash-shadow"
        style={{
          width: `${((W * 0.68) / BOX_W) * 100}%`,
          height: `${(30 / BOX_H) * 100}%`,
          bottom: `${(-16 / BOX_H) * 100}%`,
        }}
      />
      <div
        className="hw-sash-scene"
        style={{ width: BOX_W, height: BOX_H, transform: `scale(${s})` }}
      >
        <div
          className="hw-sash-tilt"
          style={{ transform: `translate(${BOX_W / 2}px,${BOX_H / 2}px) rotateX(-6deg)` }}
        >
          <div className="hw-sash-turn">
            <MitredRing w={W} h={H} bar={BAR} d={D} z={0} faces={CREAM} />
            <MitredRing w={OW} h={OH} bar={RB} d={RD} z={RZ} faces={REBATE} />
            <Box w={GW} h={GK} d={RD - 4} x={0} y={-(GH / 2 - GK / 2)} z={GZ} faces={GASKET} />
            <Box w={GW} h={GK} d={RD - 4} x={0} y={GH / 2 - GK / 2} z={GZ} faces={GASKET} />
            <Box w={GK} h={GH - 2 * GK} d={RD - 4} x={-(GW / 2 - GK / 2)} y={0} z={GZ} faces={GASKET} />
            <Box w={GK} h={GH - 2 * GK} d={RD - 4} x={GW / 2 - GK / 2} y={0} z={GZ} faces={GASKET} />
            <Box w={GW - 2 * GK + 2} h={GH - 2 * GK + 2} d={8} x={0} y={0} z={GZ} faces={GLASS} />
            <Box w={26} h={70} d={7} x={HX} y={-6} z={HZ + 3.5} faces={METAL} />
            <Box w={14} h={22} d={16} x={HX} y={-22} z={HZ + 7 + 8} faces={METAL} />
            <Box w={13} h={96} d={12} x={HX} y={26} z={HZ + 7 + 8 + 2} faces={METAL} />
          </div>
        </div>
      </div>
    </div>
  );
}
