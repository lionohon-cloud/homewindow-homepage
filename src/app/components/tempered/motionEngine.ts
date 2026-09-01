/**
 * 모션 엔진 — 값 하나를 시간에 따라 움직이는 최소 코어.
 *
 * 원본 `모션 엔진/engine.jsx` 의 Easing / track 과 수식·시그니처가 동일하다.
 * 다만 이 프로젝트는 이미 motion/react 를 쓰므로, 여기서는 keyframe 으로 표현하기
 * 어려운 것(온도 카운트업·파편 비산·진자 반동처럼 여러 값이 한 타임라인에서
 * 서로 다른 이징으로 움직이는 씬)만 담당한다.
 * 섹션 등장 같은 단순 연출은 그대로 motion/react 를 쓸 것.
 */

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** t ∈ [0,1] → [0,1]. back / elastic 은 1을 넘어 오버슈트한다. */
export const Easing = {
  linear: (t: number) => t,

  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),

  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} as const;

export type EaseFn = (t: number) => number;

/**
 * 엔진의 주력 함수 — 시각 t 가 구간 [a,b] 를 지나는 동안 from → to 로 보간.
 * 구간 밖은 자동으로 from / to 에 고정되므로 조건문이 필요 없다.
 *
 *   opacity: track(t, 0.2, 0.9, 0, 1)
 *   width:   track(t, 1.0, 1.9, 0, 460, Easing.easeInOutQuart)
 */
export function track(
  t: number,
  a: number,
  b: number,
  from: number,
  to: number,
  ease: EaseFn = Easing.easeOutCubic,
): number {
  return from + (to - from) * ease(clamp((t - a) / (b - a), 0, 1));
}

/** 색 보간. #rrggbb 와 rgb() 를 모두 받으므로 결과를 다시 넣어 연쇄 보간할 수 있다. */
function parseCol(c: string): [number, number, number] {
  if (c.charAt(0) === '#') {
    return [
      parseInt(c.substr(1, 2), 16),
      parseInt(c.substr(3, 2), 16),
      parseInt(c.substr(5, 2), 16),
    ];
  }
  const m = c.match(/-?\d+(\.\d+)?/g) ?? ['0', '0', '0'];
  return [+m[0], +m[1], +m[2]];
}

export function mixc(c1: string, c2: string, p: number): string {
  const a = parseCol(c1);
  const b = parseCol(c2);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * p)},${Math.round(
    a[1] + (b[1] - a[1]) * p,
  )},${Math.round(a[2] + (b[2] - a[2]) * p)})`;
}
