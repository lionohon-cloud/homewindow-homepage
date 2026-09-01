import { useRef } from 'react';
import { Easing as E, mixc, track } from './motionEngine';
import { useScene } from './useScene';

/**
 * 제조 공정 씬 — 판유리 → 약 700℃ 가열 → 냉풍 급랭 → 표면 압축·내부 인장.
 * 0.75배속(내부 타임라인 9.1s → 실제 12.1s). 0단계는 읽을 시간을 위해 1.5s 확보.
 */

const COLD = '#a9c9e2';
const HOT = '#ff5a1f';
const COMP = '#2f6fd0';
const TENS = '#e0562f';

const SPEED = 0.75;
const INNER = 9.1;

/** [시작 시각, 자막] — 마지막 항목은 종료 시각 표시용 */
const PHASES: [number, string][] = [
  [0.0, '① 얇고 평평한 판유리를 강화로에 넣습니다.'],
  [1.55, '① 유리를 <b class="font-bold text-[#333]">약 700℃</b>까지 천천히 가열합니다.'],
  [3.95, '② 표면에 <b class="font-bold text-[#333]">찬 바람을 한꺼번에</b> 불어 급히 식힙니다.'],
  [
    5.45,
    '③ 표면은 먼저 굳고 속은 늦게 식으면서, <b class="font-bold text-[#333]">표면은 압축·내부는 인장</b> 상태로 고정됩니다.',
  ],
  [
    7.4,
    '표면이 서로를 눌러 잡고 있어, 같은 두께로도 <b class="font-bold text-[#333]">3~5배 강해집니다.</b>',
  ],
  [INNER, ''],
];

const PUFFS = 5;
const NOZZLE_X = Array.from({ length: PUFFS }, (_, i) => (i * 100) / (PUFFS - 1));

export function ForgeMotion() {
  const rootRef = useRef<HTMLDivElement>(null);

  const tempRef = useRef<HTMLSpanElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const bandTopRef = useRef<HTMLSpanElement>(null);
  const bandMidRef = useRef<HTMLSpanElement>(null);
  const bandBotRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const heaterTopRef = useRef<HTMLDivElement>(null);
  const heaterBotRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const arrowsRef = useRef<HTMLDivElement>(null);
  const arrTopRef = useRef<HTMLDivElement>(null);
  const arrMidRef = useRef<HTMLDivElement>(null);
  const arrBotRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef<HTMLDivElement>(null);
  const puffRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nozzleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const capRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useScene(rootRef, INNER / SPEED, (raw) => {
    const t = raw * SPEED;

    // 가열 → 급랭
    const heat =
      track(t, 2.05, 3.65, 0, 1, E.easeInOutQuad) *
      (1 - track(t, 4.0, 5.0, 0, 1, E.easeInOutQuad));
    const stress =
      track(t, 5.4, 6.6, 0, 1, E.easeOutCubic) *
      (1 - track(t, 8.65, INNER, 0, 1, E.easeInQuad));

    if (tempRef.current) {
      tempRef.current.textContent = `${Math.round(20 + heat * 680)}℃`;
      tempRef.current.style.color =
        heat > 0.06 ? mixc('#999999', HOT, Math.min(1, heat * 1.6)) : '#999999';
    }

    const base = mixc(COLD, HOT, heat);
    if (bandTopRef.current) bandTopRef.current.style.background = mixc(base, COMP, stress * 0.85);
    if (bandBotRef.current) bandBotRef.current.style.background = mixc(base, COMP, stress * 0.85);
    if (bandMidRef.current) bandMidRef.current.style.background = mixc(base, TENS, stress * 0.78);

    if (plateRef.current) {
      const sy =
        track(t, 2.05, 3.65, 1, 1.06, E.easeInOutQuad) *
        (1 - 0.06 * track(t, 4.0, 5.0, 0, 1, E.easeInOutQuad));
      // 세로 중앙 정렬은 Tailwind 의 `-translate-y-1/2`(CSS translate 속성)가 이미 맡는다.
      // transform 에 translateY(-50%) 를 또 넣으면 두 속성이 합성돼 절반 높이만큼 더 올라간다.
      plateRef.current.style.transform = `scaleY(${sy})`;
    }
    if (glowRef.current) {
      glowRef.current.style.boxShadow = `0 0 ${heat * 34}px ${heat * 12}px rgba(255,110,40,${heat * 0.5})`;
    }

    // 히터 코일 — 가열 구간에만 나타나 벌겋게 달아오른다
    const hIn = Math.min(track(t, 1.75, 2.1, 0, 1), 1 - track(t, 3.95, 4.4, 0, 1, E.easeInQuad));
    const hGlow = heat * hIn;
    [heaterTopRef.current, heaterBotRef.current].forEach((h) => {
      if (!h) return;
      h.style.opacity = String(hIn);
      h.style.boxShadow = `0 0 ${hGlow * 16}px ${hGlow * 5}px rgba(255,110,40,${hGlow * 0.6})`;
      h.style.filter = `brightness(${1 + hGlow * 0.55}) saturate(${1 + hGlow * 1.2})`;
    });

    // 냉풍 — "후~" 하고 넓게 퍼지는 바람 덩어리
    const jf = Math.max(
      0,
      track(t, 3.9, 4.3, 0, 1, E.easeOutCubic) - track(t, 5.05, 5.45, 0, 1, E.easeInQuad),
    );
    nozzleRefs.current.forEach((n) => {
      if (n) n.style.opacity = String(jf);
    });
    puffRefs.current.forEach((p, i) => {
      if (!p) return;
      const dir = i < PUFFS ? 1 : -1; // 앞쪽 PUFFS 개는 위, 뒤쪽은 아래
      const phase = (i % PUFFS) * 0.19 + (dir === 1 ? 0 : 0.11);
      const prog = (t * 1.15 + phase) % 1;
      const env = Math.sin(prog * Math.PI);
      p.style.opacity = String(jf * env * 0.95);
      p.style.transform = `translateY(${dir * prog * 13}px) scale(${0.5 + prog * 1.15},${0.45 + prog})`;
    });
    if (hazeRef.current) {
      hazeRef.current.style.opacity = String(jf * (0.55 + 0.45 * Math.sin(t * 2.4)));
    }

    // 응력 화살표 — 위 압축 ↓, 아래 압축 ↑, 내부 인장 ↕
    if (arrowsRef.current) arrowsRef.current.style.opacity = String(stress);
    const squeeze = Math.sin(t * 3.2) * stress * 1.6;
    if (arrTopRef.current) arrTopRef.current.style.transform = `translateY(${squeeze}px)`;
    if (arrBotRef.current) arrBotRef.current.style.transform = `translateY(${-squeeze}px)`;
    if (arrMidRef.current) {
      arrMidRef.current.style.transform = `scaleY(${1 + stress * 0.06 * Math.sin(t * 3.2)})`;
    }
    if (marksRef.current) {
      marksRef.current.style.opacity = String(stress);
      // 위와 같은 이유로 translateY(-50%) 는 클래스에 맡기고 X 이동만 준다
      marksRef.current.style.transform = `translateX(${track(t, 5.4, 6.6, 10, 0, E.easeOutCubic)}px)`;
    }

    // 자막 — 활성 항목만 보이게 (전부 같은 그리드 칸에 겹쳐 있어 높이는 고정)
    for (let i = PHASES.length - 2; i >= 0; i--) {
      if (t >= PHASES[i][0]) {
        const [a] = PHASES[i];
        const b = PHASES[i + 1][0];
        const op = Math.min(track(t, a, a + 0.28, 0, 1), track(t, b - 0.28, b, 1, 0));
        capRefs.current.forEach((p, j) => {
          if (!p) return;
          p.style.opacity = j === i ? String(op) : '0';
          p.setAttribute('aria-hidden', j === i ? 'false' : 'true');
        });
        break;
      }
    }
  });

  return (
    <div ref={rootRef} className="bg-white border border-[#e5e5e5] rounded-xl p-4 md:p-5 w-full">
      <div className="flex items-center justify-between gap-2.5 mb-2.5">
        <span className="text-[12px] font-bold text-[#666] bg-[#f5f5f5] rounded-full px-2.5 py-1.5 whitespace-nowrap">
          열처리 강화 공정
        </span>
        <span ref={tempRef} className="text-[13px] font-bold text-[#999] tabular-nums">
          20℃
        </span>
      </div>

      <div className="relative h-[158px] md:h-[212px] bg-[#fafbfc] rounded-[9px] overflow-hidden">
        {/* 히터 코일 */}
        <div
          ref={heaterTopRef}
          className="absolute left-[13%] w-[48%] h-1.5 rounded-[3px] top-[22px] md:top-[30px] opacity-0"
          style={{
            background: 'repeating-linear-gradient(90deg,#caa08c 0 8px,#b07c62 8px 16px)',
          }}
        />
        <div
          ref={heaterBotRef}
          className="absolute left-[13%] w-[48%] h-1.5 rounded-[3px] bottom-[22px] md:bottom-[30px] opacity-0"
          style={{
            background: 'repeating-linear-gradient(90deg,#caa08c 0 8px,#b07c62 8px 16px)',
          }}
        />

        {/* 유리면을 훑는 옅은 공기층 */}
        <div
          ref={hazeRef}
          className="absolute left-[9%] w-[56%] top-1/2 h-[66px] -translate-y-1/2 rounded-[50%] blur-[6px] opacity-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%,rgba(146,198,240,.34),rgba(146,198,240,0) 70%)',
          }}
        />

        {/* 냉풍 노즐 + 바람 덩어리 */}
        {(['top', 'bottom'] as const).map((side, rowIdx) =>
          NOZZLE_X.map((x, i) => {
            const idx = rowIdx * PUFFS + i;
            const isTop = side === 'top';
            return (
              <span key={`${side}-${i}`}>
                <span
                  ref={(el) => {
                    nozzleRefs.current[idx] = el;
                  }}
                  className="absolute w-[11px] h-[5px] -ml-[5.5px] bg-[#9fb3c8] opacity-0"
                  style={{
                    left: `calc(9% + ${x}% * 0.56)`,
                    [isTop ? 'top' : 'bottom']: '12px',
                    borderRadius: isTop ? '2px 2px 1px 1px' : '1px 1px 2px 2px',
                  }}
                />
                <span
                  ref={(el) => {
                    puffRefs.current[idx] = el;
                  }}
                  className="absolute w-10 h-[26px] -ml-5 rounded-[50%] blur-[3px] opacity-0 pointer-events-none"
                  style={{
                    left: `calc(9% + ${x}% * 0.56)`,
                    [isTop ? 'top' : 'bottom']: '18px',
                    transformOrigin: isTop ? '50% 0' : '50% 100%',
                    background: `radial-gradient(ellipse at 50% ${isTop ? '0%' : '100%'},rgba(146,198,240,.6),rgba(146,198,240,.22) 55%,rgba(146,198,240,0) 78%)`,
                  }}
                />
              </span>
            );
          }),
        )}

        {/* 유리 단면 */}
        <div
          ref={plateRef}
          className="absolute left-[11%] top-1/2 w-[52%] h-11 md:h-[58px] -translate-y-1/2 rounded-[3px] overflow-hidden flex flex-col shadow-[0_0_0_1px_rgba(120,150,175,.35)]"
        >
          <span ref={bandTopRef} className="block w-full flex-1 bg-[#a9c9e2]" />
          <span ref={bandMidRef} className="block w-full flex-[1.5] bg-[#a9c9e2]" />
          <span ref={bandBotRef} className="block w-full flex-1 bg-[#a9c9e2]" />
          {/* 유리 질감 — 색 밴드 위에 얹는 광택 */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.1) 30%,rgba(255,255,255,0) 55%,rgba(255,255,255,.3))',
            }}
          />
        </div>
        <div
          ref={glowRef}
          className="absolute left-[11%] top-1/2 w-[52%] h-11 md:h-[58px] -translate-y-1/2 rounded-md pointer-events-none"
        />

        {/* 응력 화살표 */}
        <div
          ref={arrowsRef}
          className="absolute left-[11%] w-[52%] top-1/2 h-[70px] md:h-[90px] -translate-y-1/2 flex flex-col justify-between items-center font-extrabold pointer-events-none opacity-0 z-[2]"
        >
          <div
            ref={arrTopRef}
            className="text-[11px] md:text-[13px] leading-none text-[#2f6fd0] [word-spacing:10px] md:[word-spacing:14px] [text-shadow:0_0_3px_rgba(250,251,252,.9)]"
          >
            ↓ ↓ ↓ ↓ ↓
          </div>
          <div
            ref={arrMidRef}
            className="text-[11px] md:text-[13px] leading-none text-[#e0562f] [word-spacing:10px] md:[word-spacing:14px] [text-shadow:0_0_3px_rgba(250,251,252,.9)]"
          >
            ↕ ↕ ↕
          </div>
          <div
            ref={arrBotRef}
            className="text-[11px] md:text-[13px] leading-none text-[#2f6fd0] [word-spacing:10px] md:[word-spacing:14px] [text-shadow:0_0_3px_rgba(250,251,252,.9)]"
          >
            ↑ ↑ ↑ ↑ ↑
          </div>
        </div>

        {/* 응력 라벨 */}
        <div
          ref={marksRef}
          className="absolute right-[3%] top-1/2 w-[31%] -translate-y-1/2 flex flex-col gap-1 opacity-0"
        >
          <div className="text-[10.5px] md:text-[12px] font-bold leading-tight flex items-center gap-[5px] whitespace-nowrap text-[#2f6fd0]">
            <i className="not-italic text-[12px]">↓</i>
            <span>
              표면 압축
              <small className="block text-[9.5px] md:text-[11px] font-medium text-[#bbb]">
                안쪽으로 눌러 잡는 힘
              </small>
            </span>
          </div>
          <div className="text-[10.5px] md:text-[12px] font-bold leading-tight flex items-center gap-[5px] whitespace-nowrap text-[#e0562f]">
            <i className="not-italic text-[12px]">↕</i>
            <span>
              내부 인장
              <small className="block text-[9.5px] md:text-[11px] font-medium text-[#bbb]">
                바깥으로 당기는 힘
              </small>
            </span>
          </div>
          <div className="text-[10.5px] md:text-[12px] font-bold leading-tight flex items-center gap-[5px] whitespace-nowrap text-[#2f6fd0]">
            <i className="not-italic text-[12px]">↑</i>
            <span>표면 압축</span>
          </div>
        </div>
      </div>

      {/* 자막 — 그리드 한 칸에 전부 겹쳐 두어 행 높이가 가장 긴 자막으로 고정된다 */}
      <div className="grid mt-3">
        {PHASES.map(([, text], i) => (
          <p
            key={i}
            ref={(el) => {
              capRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="[grid-area:1/1] text-[14.5px] md:text-[15.5px] leading-[22px] md:leading-6 text-[#666] break-keep opacity-0"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ))}
      </div>
    </div>
  );
}
