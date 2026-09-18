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
 *
 * 260917 조작 방식 — 모바일 오조작 방지
 *   예전: 투명한 range 입력이 사진 전체를 덮어, 터치한 자리로 디바이더가 튀었고
 *         사진 위에서는 페이지 스크롤도 막혀(touch-none) 내리려다 슬라이더가 움직였다.
 *   지금: · 터치 — 디바이더(손잡이 포함, 폭 48px 띠)를 잡고 밀 때만 움직인다.
 *                  사진의 다른 곳은 반응하지 않고, 세로 스와이프는 페이지 스크롤로 간다.
 *         · 마우스 — 예전처럼 아무 곳이나 누르고 끌면 움직인다.
 *         · 키보드 — 보이지 않는 range 입력(sr-only)으로 ←/→ 조작 그대로.
 */
export function GlassBreakSlider() {
  const [position, setPosition] = useState(50);
  const rootRef = useRef<HTMLDivElement>(null);
  const teasingRef = useRef(true);
  const draggingRef = useRef(false);

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

  const moveTo = (clientX: number) => {
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  /* 끌기 시작 — 포인터를 잡아 두면 손가락·마우스가 밖으로 나가도 계속 따라온다.
     이동·끝 이벤트는 거품으로 루트에 올라오므로 루트에서만 처리한다. */
  const startDrag = (e: React.PointerEvent<HTMLElement>, jump: boolean) => {
    teasingRef.current = false;
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* 포인터를 못 잡아도(드문 브라우저) 루트 위에서는 그대로 끌린다 */
    }
    if (jump) moveTo(e.clientX);
  };
  const endDrag = () => {
    draggingRef.current = false;
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-[#eee] select-none"
      /* 마우스만 아무 곳이나 눌러 옮길 수 있다. 터치는 아래 디바이더 띠에서만 시작한다. */
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') return;
        startDrag(e, true);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) moveTo(e.clientX);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
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
          draggable={false}
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
          draggable={false}
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

      {/* 디바이더 (보이는 선 + 손잡이) */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white drop-shadow-sm z-[3] pointer-events-none"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center">
          <MoveHorizontal size={20} color="#d22727" />
        </div>
      </div>

      {/* 잡는 띠 — 디바이더를 따라다니는 폭 48px 투명 영역. 여기서만 터치로 끌 수 있다.
          touch-none 은 이 띠에만 — 가로로 끄는 동안 페이지가 같이 움직이지 않게. 나머지 사진 위는 평소처럼 스크롤된다. */}
      <div
        data-slider-grab
        aria-hidden="true"
        className="absolute top-0 bottom-0 w-12 -translate-x-1/2 z-20 cursor-ew-resize touch-none"
        style={{ left: `${position}%` }}
        onPointerDown={(e) => {
          e.stopPropagation();
          startDrag(e, false);
        }}
      />

      {/* 키보드·스크린리더용 — 화면에는 안 보이고 포인터도 받지 않는다 */}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(position)}
        aria-label="파손 형태 비교"
        onChange={(e) => {
          teasingRef.current = false;
          setPosition(Number(e.target.value));
        }}
        className="sr-only"
      />
    </div>
  );
}
