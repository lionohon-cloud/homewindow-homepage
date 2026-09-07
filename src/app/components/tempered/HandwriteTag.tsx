import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

/**
 * 손으로 써 내려가는 느낌으로 등장하는 짧은 문구.
 *
 * 원리: 글자는 실제 폰트('Nanum Pen Script')로 그리고, 그 위를 지그재그로 지나가는
 * 굵은 획을 왼쪽부터 그려 나가며 글자를 드러낸다. 경계가 곧게 쓸리지 않고
 * 펜이 오르내리듯 움직여 필기하는 인상을 준다.
 *
 * 폭을 재는 게 이 컴포넌트의 전부다. 세 번 물린 적이 있다.
 *  1. textLength 로 폭을 고정하면 자간이 늘어나고 SVG 박스에 빈 공간이 생겨
 *     뒤따르는 글자를 밀어낸다. 그래서 실제 글자 크기를 재서 박스를 딱 맞춘다.
 *  2. 웹폰트가 늦게 붙으면 처음 잰 값이 폴백 폰트(더 넓다) 기준으로 굳어
 *     "9월 한정" 과 다음 글자 사이가 20px 넘게 벌어진다. document.fonts.check 는
 *     로드된 뒤에도 false 를 돌려줘 믿을 수 없고, fonts.ready 도 폰트가 아직
 *     요청조차 안 된 시점이면 그냥 resolve 된다. 그래서 값이 안정될 때까지 다시 잰다.
 *  3. 가로 여백(PAD_X)은 앞뒤 글자와의 간격에 그대로 더해지고, 세로 여백(PAD_Y)은
 *     inline-block 의 baseline 위치를 바꾼다. 둘을 따로 둬야 한쪽만 건드릴 수 있다.
 */

const BASE_FONT = 56; // viewBox 기준 글자 크기 — 화면 크기는 size 로 맞춘다
const PAD_X = 0; // 앞뒤 글자와의 간격은 호출부의 margin 으로만 정한다
const PAD_Y = 5; // 이 값을 바꾸면 baseline 이 움직인다 — 호출부의 translate-y 도 같이 봐야 한다
const FONT_STACK = "'Nanum Pen Script', 'Gaegu', cursive";

/** 측정된 글자 상자를 좌→우로 훑는 지그재그 경로 */
function penPath(x: number, y: number, w: number, h: number) {
  const steps = Math.max(8, Math.round(w / 11));
  const top = y + h * 0.08;
  const bottom = y + h * 0.92;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const px = x - 10 + ((w + 20) * i) / steps;
    pts.push(`${px.toFixed(1)} ${(i % 2 === 0 ? top : bottom).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

interface Props {
  children: string;
  /** 화면에 보일 글자 크기(px) */
  size: number;
  className?: string;
  delay?: number;
  duration?: number;
}

export function HandwriteTag({
  children,
  size,
  className = '',
  delay = 0.55,
  duration = 1.15,
}: Props) {
  /* 모바일·PC 두 곳에 동시에 렌더되므로 mask id 가 겹치면 안 된다.
     같은 id 가 둘이면 브라우저가 먼저 만난 것만 써서 한쪽이 통째로 사라진다. */
  const maskId = `hw-${useId().replace(/:/g, '')}`;
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ x: 0, y: 14, w: children.length * BASE_FONT * 0.62, h: 48 });

  /** 잰 값이 달라졌을 때만 state 를 바꾼다(매 프레임 리렌더 방지). 잰 폭을 돌려준다. */
  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return null;
    let b: DOMRect;
    try {
      b = el.getBBox();
    } catch {
      return null; // 렌더 전이면 getBBox 가 던진다 — 다음 프레임에 다시
    }
    if (b.width <= 0) return null;
    setBox((prev) =>
      Math.abs(prev.x - b.x) < 0.5 &&
      Math.abs(prev.y - b.y) < 0.5 &&
      Math.abs(prev.w - b.width) < 0.5 &&
      Math.abs(prev.h - b.height) < 0.5
        ? prev
        : { x: b.x, y: b.y, w: b.width, h: b.height },
    );
    return b.width;
  }, []);

  useLayoutEffect(() => {
    // 폰트를 직접 요청해 두면 아래 루프가 훨씬 빨리 안정된다
    document.fonts?.load(`400 ${BASE_FONT}px 'Nanum Pen Script'`, children).catch(() => {});

    /* 폭이 몇 프레임 연속 같아질 때까지 다시 잰다.
       웹폰트 교체 시점을 이벤트로 잡으려던 시도가 전부 새서(위 주석 2) 값 자체를 본다. */
    let raf = 0;
    let last = -1;
    let stable = 0;
    const started = performance.now();

    const tick = () => {
      const w = measure();
      if (w !== null && Math.abs(w - last) < 0.5) stable += 1;
      else stable = 0;
      if (w !== null) last = w;
      if (stable < 3 && performance.now() - started < 3000) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [children, size, measure]);

  // 이 페이지 밖에서 폰트가 뒤늦게 붙는 경우까지 받아 준다
  useEffect(() => {
    const onDone = () => measure();
    document.fonts?.addEventListener('loadingdone', onDone);
    return () => document.fonts?.removeEventListener('loadingdone', onDone);
  }, [measure]);

  const vbW = box.w + PAD_X * 2;
  const vbH = box.h + PAD_Y * 2;
  const scale = size / BASE_FONT;

  return (
    <svg
      viewBox={`${box.x - PAD_X} ${box.y - PAD_Y} ${vbW} ${vbH}`}
      width={vbW * scale}
      height={vbH * scale}
      className={className}
      role="img"
      aria-label={children}
      style={{ overflow: 'visible' }}
    >
      <style>{`
        @keyframes ${maskId}-write { to { stroke-dashoffset: 0; } }
        .${maskId}-pen {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: ${maskId}-write ${duration}s cubic-bezier(.35,.05,.3,1) ${delay}s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .${maskId}-pen { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={box.x - 20} y={box.y - 20} width={box.w + 40} height={box.h + 40}>
          <path
            className={`${maskId}-pen`}
            d={penPath(box.x, box.y, box.w, box.h)}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={box.h * 1.05}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      <text
        ref={textRef}
        x="0"
        y={BASE_FONT}
        fill="currentColor"
        mask={`url(#${maskId})`}
        style={{
          fontFamily: FONT_STACK,
          fontSize: BASE_FONT,
          fontWeight: 400,
        }}
      >
        {children}
      </text>
    </svg>
  );
}
