import { useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import imgNormal from '@/assets/tempered-break-normal.webp';
import imgToughened from '@/assets/tempered-break-toughened.webp';
import { Easing as E, track } from './motionEngine';
import { useScene } from './useScene';

/**
 * 일반 유리 vs 강화유리 파손 형태 비교.
 * GlassTypeSection / SafetyNetSection 의 Before-After 슬라이더와 같은 규격.
 *
 * 진입 시 디바이더가 한 번 좌우로 움직여 조작 가능함을 알린다(사용자가 만지면 즉시 중단).
 */
export function GlassBreakSlider() {
  const [position, setPosition] = useState(50);
  const rootRef = useRef<HTMLDivElement>(null);
  const teasingRef = useRef(true);

  useScene(
    rootRef,
    2.6,
    (t) => {
      if (!teasingRef.current) return;
      setPosition(
        50 +
          track(t, 0.35, 1.1, 0, 17, E.easeInOutCubic) -
          track(t, 1.1, 1.9, 0, 34, E.easeInOutCubic) +
          track(t, 1.9, 2.5, 0, 17, E.easeInOutCubic),
      );
    },
    { loop: false },
  );

  /* 주의: 여기서 언마운트 시 teasingRef 를 false 로 내리면 안 된다.
     StrictMode 는 개발 중 마운트→언마운트→재마운트를 하는데, ref 는 그 사이에도
     살아남아 재마운트 뒤 티저가 영구히 꺼져 버린다. 티저는 사용자가 만졌을 때만 멈춘다. */

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-[#eee] touch-none"
    >
      {/* 아래 레이어 — 일반 유리.
          isolate 로 자체 쌓임 맥락을 만든다. 없으면 안쪽 캡션의 z-10 이 이 레이어를 뚫고
          상위로 올라가, 위 레이어가 이미지를 덮어도 글자만 남아 보인다. */}
      <div className="absolute inset-0 z-[1] isolate">
        <img
          src={imgNormal}
          alt="일반 유리 파손 형태"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/[.12]" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%)' }}
        />
        <div className="absolute left-4 bottom-4 z-10 text-white drop-shadow-md">
          <p className="text-[12px] md:text-[14px] opacity-80">일반 유리</p>
          <p className="text-[16px] md:text-[18px] font-bold">날카로운 대형 파편</p>
        </div>
      </div>

      {/* 위 레이어 — 강화유리 */}
      <div
        className="absolute inset-0 overflow-hidden z-[2] isolate"
        style={{ clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)` }}
      >
        <img
          src={imgToughened}
          alt="강화유리 파손 형태"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%)' }}
        />
        <div className="absolute right-4 bottom-4 z-10 text-white text-right drop-shadow-md">
          <p className="text-[12px] md:text-[14px] opacity-80">강화유리</p>
          <p className="text-[16px] md:text-[18px] font-bold">알갱이 또는 비산 억제</p>
        </div>
      </div>

      {/* 디바이더 */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize drop-shadow-sm z-[3]"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center pointer-events-none">
          <MoveHorizontal size={20} color="#d22727" />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        aria-label="파손 형태 비교"
        onPointerDown={() => { teasingRef.current = false; }}
        onChange={(e) => {
          teasingRef.current = false;
          setPosition(Number(e.target.value));
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
      />
    </div>
  );
}
