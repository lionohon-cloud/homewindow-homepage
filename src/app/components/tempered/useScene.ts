import { useEffect, useRef, useState } from 'react';
import { clamp } from './motionEngine';

export interface SceneHandle {
  seek: (t: number) => void;
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
  time: () => number;
}

/**
 * 화면에 보일 때만 rAF 를 돌리는 타임라인 훅.
 *
 * draw(t) 는 ref 로 최신값을 유지하므로, 매 렌더마다 새 함수를 넘겨도
 * 루프가 재시작되지 않는다(씬 코드에서 useCallback 을 강요하지 않기 위함).
 *
 * prefers-reduced-motion 이면 마지막 프레임만 그리고 멈춘다.
 */
export function useScene(
  ref: React.RefObject<HTMLElement | null>,
  duration: number,
  draw: (t: number) => void,
  opts: { loop?: boolean; onTime?: (t: number) => void } = {},
): SceneHandle {
  const { loop = true, onTime } = opts;

  const drawRef = useRef(draw);
  drawRef.current = draw;
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;

  const tRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const runningRef = useRef(false);
  const visibleRef = useRef(false);
  const [handle] = useState<SceneHandle>(() => ({
    seek: () => {},
    play: () => {},
    pause: () => {},
    isPlaying: () => false,
    time: () => 0,
  }));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const render = (t: number) => {
      drawRef.current(t);
      onTimeRef.current?.(t);
    };

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      render(duration);
      return;
    }

    render(0);

    const step = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 1 / 20);
      lastRef.current = now;
      tRef.current += dt;
      if (tRef.current >= duration) {
        if (loop) tRef.current %= duration;
        else {
          tRef.current = duration;
          render(duration);
          runningRef.current = false;
          return;
        }
      }
      render(tRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    const play = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(step);
    };
    const pause = () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    handle.play = play;
    handle.pause = pause;
    handle.isPlaying = () => runningRef.current;
    handle.time = () => tRef.current;
    handle.seek = (v: number) => {
      tRef.current = clamp(v, 0, duration);
      render(tRef.current);
    };

    if (!('IntersectionObserver' in window)) {
      play();
      return () => pause();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visibleRef.current = e.isIntersecting;
          if (e.isIntersecting) play();
          else pause();
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      pause();
    };
    // duration/loop 이 바뀌면 루프를 다시 건다. draw 는 ref 라 의존성에서 제외.
  }, [ref, duration, loop, handle]);

  return handle;
}
