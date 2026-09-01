import { useRef, useState } from 'react';
import { Easing as E, clamp, track } from './motionEngine';
import { useScene } from './useScene';

/**
 * 시험 필름 — 타이틀 카드 → 낙구 충격 → 타이틀 카드 → 쇼트백 충격 (16.5s 루프).
 * 자동 재생하되 진행 바로 되돌려 볼 수 있다.
 */

const DUR = 16.5;
const S1 = 1.5; // 낙구 파트 시작
const S2 = 8.8; // 쇼트백 파트 시작
const DROP_IMPACT = 1.28; // 낙구 파트 로컬 시각
const SHOT_IMPACT = 3.85; // 쇼트백 파트 로컬 시각
const LIFT = 36;

const CAPS: [number, string][] = [
  [0.0, 'KS L 2002가 정한 두 가지 충격 시험을 이어서 보여드립니다.'],
  [
    S1,
    '정해진 높이에서 강철 구슬을 떨어뜨려 <b class="font-bold text-[#333]">버티는 정도</b>를 봅니다. 같은 두께라면 강화유리가 훨씬 큰 충격까지 견딥니다.',
  ],
  [7.4, ''],
  [
    S2,
    '<b class="font-bold text-[#333]">45kg</b> 추를 <b class="font-bold text-[#333]">75cm</b>에서 떨어뜨려 사람이 부딪히는 상황을 본뜹니다. <b class="font-bold text-[#333]">파괴되지 않고, 파편이 비산하지 않아야</b> 합니다.',
  ],
  [DUR, ''],
];

/** 낙구 — 방사형 균열 */
const CRACKS = [
  'M50 50 L38 31 L29 12',
  'M50 50 L63 34 L73 15',
  'M50 50 L74 52 L93 47',
  'M50 50 L61 69 L71 88',
  'M50 50 L40 71 L27 89',
  'M50 50 L26 54 L7 49',
  'M38 31 L63 34',
  'M74 52 L61 69',
  'M40 71 L26 54',
];

/** 낙구 — 날카로운 파편 [dx, dy, rot, height] */
const DROP_SHARDS: [number, number, number, number][] = [
  [-52, -30, -260, 26], [44, -38, 300, 30], [-64, 10, -220, 20], [58, 18, -340, 24],
  [-18, -52, 320, 28], [22, 48, -280, 22], [66, 4, 240, 18], [-70, -8, -180, 16],
  [36, -14, 260, 32], [-38, 30, 220, 24], [12, -44, -300, 20], [-8, 56, 180, 26],
  [50, 34, -240, 18], [-26, -22, 200, 22],
];

/** 쇼트백 — 유리 단면에서 튀는 파편 [top%, dx, dy, rot, height] */
const SHOT_SHARDS: [number, number, number, number, number][] = [
  [4, -16, -30, -190, 24], [15, 26, -24, 230, 30], [28, 40, -8, -280, 20],
  [44, 48, 8, 210, 28], [58, 36, 22, -190, 22], [71, 22, 32, 260, 26],
  [84, 12, 20, -140, 16], [38, -12, 4, 150, 18],
];

const SHOT_GRIT: [number, number][] = [
  [-16, -22], [19, -26], [-24, -6], [27, -9], [-13, 16],
  [22, 14], [-27, 28], [16, 32], [5, -33], [-4, 38],
];

export function TestFilm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);

  // 파트 컨테이너
  const p1Ref = useRef<HTMLDivElement>(null);
  const p2Ref = useRef<HTMLDivElement>(null);
  const t1Ref = useRef<HTMLDivElement>(null);
  const t2Ref = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  const capRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // 낙구
  const dropFieldRef = useRef<HTMLDivElement>(null);
  const ballARef = useRef<HTMLSpanElement>(null);
  const ballBRef = useRef<HTMLSpanElement>(null);
  const planeARef = useRef<HTMLDivElement>(null);
  const planeBRef = useRef<HTMLDivElement>(null);
  const crackGroupRef = useRef<SVGGElement>(null);
  const crackRefs = useRef<(SVGPathElement | null)[]>([]);
  const burstRef = useRef<HTMLDivElement>(null);
  const dShardRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dResARef = useRef<HTMLDivElement>(null);
  const dResBRef = useRef<HTMLDivElement>(null);
  const impactPctRef = useRef(56);
  const lastWRef = useRef(0);

  // 쇼트백
  const camRef = useRef<HTMLDivElement>(null);
  const armARef = useRef<HTMLDivElement>(null);
  const armBRef = useRef<HTMLDivElement>(null);
  const envRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kgRefs = useRef<(HTMLElement | null)[]>([]);
  const faceARef = useRef<HTMLSpanElement>(null);
  const faceBRef = useRef<HTMLSpanElement>(null);
  const glassBRef = useRef<HTMLDivElement>(null);
  const sShardRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const gritRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sRingRef = useRef<HTMLSpanElement>(null);
  const sResARef = useRef<HTMLDivElement>(null);
  const sResBRef = useRef<HTMLDivElement>(null);
  const camOriginRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const shotStageRef = useRef<HTMLDivElement>(null);

  // 진행 바
  const pgRef = useRef<HTMLSpanElement>(null);
  const knRef = useRef<HTMLSpanElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);

  /** 낙구 충돌 지점은 폭에 따라 유리면 위치가 달라지므로 실측한다. */
  function measureDrop() {
    const f = dropFieldRef.current;
    const p = planeARef.current;
    const b = ballARef.current;
    if (!f || !p || !b) return;
    const fr = f.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    if (fr.height <= 0 || pr.height <= 0) return;
    // 구슬은 유리 '위'에 놓여야 한다. 중심(0.5)을 유리면에 맞추면 반쯤 잠겨 보이므로,
    // 아랫면이 유리면에 닿도록 지름의 0.82 만큼 올린다(0.18 은 접촉감을 주는 겹침).
    impactPctRef.current = ((pr.top + pr.height * 0.5 - br.height * 0.82 - fr.top) / fr.height) * 100;
    if (burstRef.current) {
      burstRef.current.style.top = `${((pr.top + pr.height * 0.5 - fr.top) / fr.height) * 100}%`;
    }
  }

  /** 쇼트백 카메라 원점 = 왼쪽 쇠구슬 정지 위치. 클로즈업 때 정중앙에 오도록 이동량도 잰다. */
  function measureShot() {
    const st = shotStageRef.current;
    const arm = armARef.current;
    const cam = camRef.current;
    if (!st || !arm || !cam) return;
    const rect = st.getBoundingClientRect();
    if (!rect.width) return;
    const camT = cam.style.transform;
    const armT = arm.style.transform;
    cam.style.transform = 'none';
    arm.style.transform = 'rotate(0deg)';
    const ball = arm.querySelector('[data-ball]') as HTMLElement | null;
    if (ball) {
      const b = ball.getBoundingClientRect();
      const bx = b.left + b.width / 2 - rect.left;
      const by = b.top + b.height / 2 - rect.top;
      cam.style.transformOrigin = `${bx}px ${by}px`;
      camOriginRef.current = { x: bx, y: by, cx: rect.width / 2 - bx, cy: rect.height / 2 - by };
    }
    cam.style.transform = camT;
    arm.style.transform = armT;
  }

  const film = useScene(rootRef, DUR, (t) => {
    const w = rootRef.current?.offsetWidth ?? 0;
    if (w !== lastWRef.current) {
      lastWRef.current = w;
      measureDrop();
      measureShot();
    }

    // 타이틀 카드
    if (t1Ref.current) {
      t1Ref.current.style.opacity = String(
        Math.min(track(t, 0.1, 0.45, 0, 1), track(t, 1.15, S1, 1, 0)),
      );
    }
    if (t2Ref.current) {
      t2Ref.current.style.opacity = String(
        Math.min(track(t, 7.45, 7.8, 0, 1), track(t, 8.45, S2, 1, 0)),
      );
    }

    const on1 = t >= 1.2 && t < 7.6;
    const on2 = t >= 8.5;
    if (p1Ref.current) p1Ref.current.style.opacity = on1 ? '1' : '0';
    if (p2Ref.current) p2Ref.current.style.opacity = on2 ? '1' : '0';
    if (on1) drawDrop(clamp(t - S1, 0, 5.8));
    if (on2) drawShot(clamp(t - S2, 0, 7.6));

    if (tagRef.current) {
      tagRef.current.textContent = t < 7.45 ? '① 낙구 충격 시험' : '② 쇼트백 충격 시험';
    }
    if (valRef.current && !on2) valRef.current.textContent = on1 ? '강철 구슬 낙하' : '';

    // 자막
    for (let i = CAPS.length - 2; i >= 0; i--) {
      if (t >= CAPS[i][0]) {
        const a = CAPS[i][0];
        const b = CAPS[i + 1][0];
        const op = Math.min(track(t, a, a + 0.3, 0, 1), track(t, b - 0.3, b, 1, 0));
        capRefs.current.forEach((p, j) => {
          if (!p) return;
          p.style.opacity = j === i ? String(op) : '0';
          p.setAttribute('aria-hidden', j === i ? 'false' : 'true');
        });
        break;
      }
    }

    // 진행 바
    const pct = clamp(t / DUR, 0, 1) * 100;
    if (pgRef.current) pgRef.current.style.width = `${pct}%`;
    if (knRef.current) knRef.current.style.left = `${pct}%`;
    seekRef.current?.setAttribute('aria-valuenow', String(Math.round(pct)));
  });

  /** ── 1부 · 낙구 ─────────────────────────────── */
  function drawDrop(t: number) {
    const fade = 1 - track(t, 5.35, 5.8, 0, 1, E.easeInQuad);
    const IMPACT = impactPctRef.current;
    const fall = track(t, 0.35, DROP_IMPACT, 2, IMPACT, E.easeInQuad);
    const appear = track(t, 0.1, 0.35, 0, 1);

    // 일반 유리 — 관통
    const through = track(t, DROP_IMPACT, 2.25, 0, 46, E.easeInQuad);
    if (ballARef.current) {
      ballARef.current.style.top = `${fall + through}%`;
      ballARef.current.style.opacity = String(appear * (1 - track(t, 1.95, 2.35, 0, 1)) * fade);
    }

    // 균열 — 충돌 순간 중심에서 퍼진다 (dash 방식은 non-scaling-stroke 와 충돌)
    const cp = track(t, DROP_IMPACT, 1.95, 0, 1, E.easeOutQuart);
    crackGroupRef.current?.setAttribute(
      'transform',
      `translate(50 50) scale(${0.32 + cp * 0.68}) translate(-50 -50)`,
    );
    crackRefs.current.forEach((l, i) => {
      if (l) l.style.opacity = t < DROP_IMPACT ? '0' : String(clamp(cp * 1.6 - i * 0.09, 0, 1) * fade);
    });

    const sp = track(t, DROP_IMPACT, 2.6, 0, 1, E.easeOutQuart);
    const sg = track(t, DROP_IMPACT, 3.1, 0, 1, E.easeInQuad);
    const sf = (1 - track(t, 2.9, 3.6, 0, 1)) * fade;
    dShardRefs.current.forEach((el, i) => {
      if (!el) return;
      const [dx, dy] = DROP_SHARDS[i];
      el.style.transform = `translate(${dx * sp}px,${dy * sp + 34 * sg}px) rotate(${DROP_SHARDS[i][2] * sp}deg)`;
      el.style.opacity = String(sf * track(t, DROP_IMPACT, 1.42, 0, 1));
    });
    if (planeARef.current) {
      planeARef.current.style.opacity = String((1 - track(t, DROP_IMPACT, 1.7, 0, 0.25)) * fade);
    }

    // 강화유리 — 튕김
    const up1 = track(t, DROP_IMPACT, 1.66, 0, 23, E.easeOutQuad);
    const dn1 = track(t, 1.66, 2.06, 0, 23, E.easeInQuad);
    const up2 = track(t, 2.06, 2.27, 0, 8, E.easeOutQuad);
    const dn2 = track(t, 2.27, 2.48, 0, 8, E.easeInQuad);
    if (ballBRef.current) {
      ballBRef.current.style.top = `${fall - (up1 - dn1 + up2 - dn2)}%`;
      ballBRef.current.style.opacity = String(appear * fade);
    }
    const shake = Math.sin((t - DROP_IMPACT) * 52) * track(t, DROP_IMPACT, 1.9, 2.5, 0, E.easeOutQuad);
    if (planeBRef.current) {
      planeBRef.current.style.transform = `perspective(420px) rotateX(58deg) translateX(${t > DROP_IMPACT ? shake : 0}px)`;
      planeBRef.current.style.opacity = String(fade);
    }
    [[0, DROP_IMPACT], [1, 1.5]].forEach(([idx, start]) => {
      const el = ringRefs.current[idx as number];
      if (!el) return;
      const rp = track(t, start as number, (start as number) + 0.85, 0, 1, E.easeOutCubic);
      el.style.transform = `scale(${0.3 + rp * 2.4})`;
      el.style.opacity = String((t >= (start as number) ? (1 - rp) * 0.8 : 0) * fade);
    });

    const rv = clamp(track(t, 2.7, 3.15, 0, 1, E.easeOutBack), 0, 1) * fade;
    [dResARef.current, dResBRef.current].forEach((r) => {
      if (!r) return;
      r.style.opacity = String(rv);
      r.style.transform = `translateY(${(1 - rv) * 8}px)`;
    });
  }

  /** ── 2부 · 쇼트백 ───────────────────────────── */
  function drawShot(t: number) {
    const fade = 1 - track(t, 7.15, 7.6, 0, 1, E.easeInQuad);

    const n = Math.round(track(t, 0.25, 1.45, 0, 45, E.easeOutCubic));
    kgRefs.current.forEach((el) => {
      if (el) el.textContent = String(n);
    });
    if (valRef.current) valRef.current.textContent = t < 1.85 ? `${n}kg` : '45kg · 75cm 낙하';

    // 카메라 — 클로즈업(구슬 정중앙) → 줌아웃
    const zk = track(t, 1.85, 2.7, 1, 0, E.easeInOutQuart);
    const { cx, cy } = camOriginRef.current;
    if (camRef.current) {
      camRef.current.style.transform = `translate(${cx * zk}px,${cy * zk}px) scale(${track(t, 1.85, 2.7, 3.4, 1, E.easeInOutQuart)})`;
    }
    const wide = track(t, 2.05, 2.75, 0, 1, E.easeOutCubic) * fade;
    envRefs.current.forEach((e) => {
      if (e) e.style.opacity = String(wide);
    });
    if (armBRef.current) armBRef.current.style.opacity = String(wide);
    if (armARef.current) armARef.current.style.opacity = String(fade);

    // 진자 — 추는 회전축 왼쪽 아래에 매달려 있어 +각도가 '왼쪽 위로 들어올림'
    const base =
      track(t, 1.85, 2.9, 0, LIFT, E.easeInOutQuad) - track(t, 3.2, SHOT_IMPACT, 0, LIFT, E.easeInQuad);
    const swing = (s: number) =>
      s *
      (track(t, SHOT_IMPACT, 4.4, 0, 19, E.easeOutQuad) -
        track(t, 4.4, 5.0, 0, 19, E.easeInQuad) +
        track(t, 5.0, 5.35, 0, 7, E.easeOutQuad) -
        track(t, 5.35, 5.7, 0, 7, E.easeInQuad));
    if (armARef.current) armARef.current.style.transform = `rotate(${base + swing(-1)}deg)`;
    if (armBRef.current) armBRef.current.style.transform = `rotate(${base + swing(1)}deg)`;

    // 일반 유리 — 날카로운 조각이 사방으로
    const burst = track(t, SHOT_IMPACT, 4.55, 0, 1, E.easeOutQuad);
    const drop = track(t, SHOT_IMPACT, 5.05, 0, 1, E.easeInQuad);
    const gone = 1 - track(t, 4.95, 5.55, 0, 1);
    if (faceARef.current) {
      faceARef.current.style.opacity = String(
        (t < SHOT_IMPACT ? 1 : 1 - track(t, SHOT_IMPACT, SHOT_IMPACT + 0.18, 0, 1)) * fade,
      );
    }
    sShardRefs.current.forEach((el, i) => {
      if (!el) return;
      const [, dx, dy, rot] = SHOT_SHARDS[i];
      el.style.transform = `translate(${dx * burst}px,${dy * burst + 58 * drop}px) rotate(${rot * burst}deg)`;
      el.style.opacity = t < SHOT_IMPACT ? '0' : String(gone);
    });
    gritRefs.current.forEach((el, i) => {
      if (!el) return;
      const [gx, gy] = SHOT_GRIT[i];
      el.style.transform = `translate(${gx * burst}px,${gy * burst + 46 * drop}px)`;
      el.style.opacity = t < SHOT_IMPACT ? '0' : String(gone * 0.9);
    });

    // 강화유리 — 얇은 판이 순간 휘었다 복원
    const flex =
      Math.sin(Math.max(0, t - SHOT_IMPACT) * 18) * track(t, SHOT_IMPACT, 4.95, 1, 0, E.easeOutQuad);
    if (glassBRef.current) {
      glassBRef.current.style.transform = `skewX(${flex * 5}deg) translateX(${flex * 2}px)`;
    }
    if (faceBRef.current) faceBRef.current.style.opacity = String(fade);
    if (sRingRef.current) {
      const rp = track(t, SHOT_IMPACT, 4.75, 0, 1, E.easeOutCubic);
      sRingRef.current.style.transform = `scale(${0.3 + rp * 2.8})`;
      sRingRef.current.style.opacity = String((t >= SHOT_IMPACT ? (1 - rp) * 0.85 : 0) * fade);
    }

    const rv = clamp(track(t, 4.85, 5.3, 0, 1, E.easeOutBack), 0, 1) * fade;
    [sResARef.current, sResBRef.current].forEach((r) => {
      if (!r) return;
      r.style.opacity = String(rv);
      r.style.transform = `translateY(${(1 - rv) * 8}px)`;
    });
  }

  /** 진행 바 조작 */
  const scrubTo = (clientX: number) => {
    const el = seekRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    film.seek(clamp((clientX - r.left) / r.width, 0, 1) * DUR);
  };
  const draggingRef = useRef(false);

  const togglePlay = () => {
    if (film.isPlaying()) {
      film.pause();
      setPlaying(false);
    } else {
      film.play();
      setPlaying(true);
    }
  };

  return (
    <div ref={rootRef} className="bg-white border border-[#e5e5e5] rounded-xl p-4 md:p-5 w-full">
      <div className="flex items-center justify-between gap-2.5 mb-2.5">
        <span
          ref={tagRef}
          className="text-[12px] font-bold text-[#666] bg-[#f5f5f5] rounded-full px-2.5 py-1.5 whitespace-nowrap"
        >
          ① 낙구 충격 시험
        </span>
        <span ref={valRef} className="text-[13px] font-bold text-[#999] tabular-nums" />
      </div>

      <div className="relative h-[210px] md:h-[276px] bg-[#fafbfc] rounded-[9px] overflow-hidden">
        {/* ── 1부 · 낙구 ── */}
        <div ref={p1Ref} className="absolute inset-0 flex opacity-0">
          {(['A', 'B'] as const).map((side) => {
            const isA = side === 'A';
            return (
              <div
                key={side}
                className={`flex-1 relative pt-[26px] ${isA ? '' : 'border-l border-dashed border-[#e3e6ea]'}`}
              >
                <div
                  className={`absolute top-2 inset-x-0 text-center text-[11.5px] md:text-[13px] font-bold ${isA ? 'text-[#999]' : 'text-[#d22727]'}`}
                >
                  {isA ? '일반 유리' : '강화유리'}
                </div>
                <div ref={isA ? dropFieldRef : undefined} className="absolute inset-x-0 top-6 bottom-0">
                  <span
                    ref={isA ? ballARef : ballBRef}
                    /* 구슬 지름: 원래 17/21 → 1.7배(29/36) → 여기서 다시 +25% (36/45).
                       좌우 중앙 정렬용 -ml 은 항상 지름의 절반으로 함께 맞춘다.
                       z-10: 유리판이 DOM 상 뒤에 있어 기본 순서로는 구슬을 덮어버린다. */
                    className="absolute left-1/2 z-10 w-[36px] h-[36px] md:w-[45px] md:h-[45px] -ml-[18px] md:-ml-[22.5px] rounded-full shadow-[0_4px_8px_rgba(0,0,0,.3)]"
                    style={{
                      top: '2%',
                      background:
                        'radial-gradient(circle at 32% 28%,#c8cdd4,#6f7681 55%,#3f444c)',
                    }}
                  />
                  <div
                    ref={isA ? planeARef : planeBRef}
                    className="absolute left-[9%] right-[9%] bottom-[30px] h-[62px]"
                    style={{ transform: 'perspective(420px) rotateX(58deg)' }}
                  >
                    <div
                      className="absolute inset-0 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(120,150,175,.45)]"
                      style={{
                        background:
                          'linear-gradient(150deg,rgba(174,203,224,.55),rgba(206,226,238,.3))',
                      }}
                    />
                    {isA && (
                      <svg
                        className="absolute inset-0 w-full h-full overflow-visible"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <g ref={crackGroupRef}>
                          {CRACKS.map((d, i) => (
                            <path
                              key={i}
                              ref={(el) => {
                                crackRefs.current[i] = el;
                              }}
                              d={d}
                              vectorEffect="non-scaling-stroke"
                              fill="none"
                              stroke="#f4f7fa"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              opacity={0}
                              style={{ filter: 'drop-shadow(0 0 1px rgba(40,70,95,.9))' }}
                            />
                          ))}
                        </g>
                      </svg>
                    )}
                    {!isA &&
                      [0, 1].map((i) => (
                        <span
                          key={i}
                          ref={(el) => {
                            ringRefs.current[i] = el;
                          }}
                          className="absolute left-1/2 top-1/2 w-[26px] h-[26px] -mt-[13px] -ml-[13px] rounded-full border-2 border-[rgba(210,39,39,.75)] opacity-0"
                        />
                      ))}
                  </div>
                  {isA && (
                    <div ref={burstRef} className="absolute left-1/2 top-[60%] w-0 h-0">
                      {DROP_SHARDS.map(([, , , h], i) => (
                        <span
                          key={i}
                          ref={(el) => {
                            dShardRefs.current[i] = el;
                          }}
                          className="absolute -left-[3px] -top-[11px] w-[6px] opacity-0"
                          style={{
                            height: `${h}px`,
                            background:
                              'linear-gradient(180deg,rgba(240,248,253,.95),rgba(162,199,224,.9))',
                            clipPath: 'polygon(50% 0,100% 85%,10% 100%)',
                            filter: 'drop-shadow(0 0 1px rgba(70,105,135,.7))',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div
                  ref={isA ? dResARef : dResBRef}
                  className={`absolute inset-x-1.5 bottom-1.5 text-center text-[11px] md:text-[12.5px] font-bold py-1.5 px-1 rounded-full break-keep leading-tight opacity-0 ${
                    isA ? 'text-[#b3241f] bg-[#fdeceb]' : 'text-[#1a7f4b] bg-[#e9f6ef]'
                  }`}
                >
                  {isA ? '길고 날카로운 파편' : '깨지지 않음'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 2부 · 쇼트백 (측면 뷰) ── */}
        <div ref={p2Ref} className="absolute inset-0 opacity-0">
          <div ref={shotStageRef} className="absolute inset-0">
            <div ref={camRef} className="absolute inset-0">
              {(['A', 'B'] as const).map((side, ci) => {
                const isA = side === 'A';
                return (
                  <div
                    key={side}
                    className={`absolute top-0 bottom-0 w-1/2 ${isA ? 'left-0' : 'left-1/2'}`}
                  >
                    <div
                      ref={(el) => {
                        envRefs.current[ci] = el;
                      }}
                      className="absolute inset-0 opacity-0"
                    >
                      {!isA && (
                        <span className="absolute left-0 top-4 bottom-[52px] border-l border-dashed border-[#e3e6ea]" />
                      )}
                      <div
                        className={`absolute top-1.5 md:top-2 inset-x-0 text-center text-[11px] md:text-[13px] font-bold ${isA ? 'text-[#999]' : 'text-[#d22727]'}`}
                      >
                        {isA ? '일반 유리' : '강화유리'}
                      </div>
                      <div className="absolute top-7 md:top-[34px] left-[10%] right-[6%] h-[3px] bg-[#dfe3e8] rounded-sm" />
                      <div className="absolute bottom-[60px] md:bottom-[76px] left-[14%] right-[6%] h-[3px] bg-[#dfe3e8] rounded-sm" />
                      {/* 유리 측면 — 이음매 없는 얇은 단면 */}
                      <div
                        ref={isA ? undefined : glassBRef}
                        className="absolute w-2 md:w-[11px] top-11 md:top-[54px] bottom-16 md:bottom-20"
                        style={{ left: 'calc(62% + 18px)' }}
                      >
                        <span
                          ref={isA ? faceARef : faceBRef}
                          className="absolute inset-0 rounded-[1px] shadow-[0_0_0_.5px_rgba(103,140,168,.55)]"
                          style={{
                            background:
                              'linear-gradient(90deg,rgba(139,181,209,.85),rgba(222,239,248,.55) 45%,rgba(139,181,209,.85))',
                          }}
                        />
                        <span className="absolute -inset-x-1 -top-1 h-[7px] bg-[#c9d0d8] rounded-sm" />
                        <span className="absolute -inset-x-1 -bottom-1 h-[7px] bg-[#c9d0d8] rounded-sm" />
                        {isA &&
                          SHOT_SHARDS.map(([top, , , , h], i) => (
                            <span
                              key={i}
                              ref={(el) => {
                                sShardRefs.current[i] = el;
                              }}
                              className="absolute left-0 w-[5px] opacity-0"
                              style={{
                                top: `${top}%`,
                                height: `${h}px`,
                                background:
                                  'linear-gradient(180deg,rgba(228,242,250,.85),rgba(150,190,215,.9))',
                                clipPath: 'polygon(50% 0,100% 82%,12% 100%)',
                                filter: 'drop-shadow(0 0 1px rgba(90,125,150,.5))',
                              }}
                            />
                          ))}
                        {isA &&
                          SHOT_GRIT.map((_, i) => (
                            <span
                              key={`g${i}`}
                              ref={(el) => {
                                gritRefs.current[i] = el;
                              }}
                              className="absolute left-1/2 top-1/2 w-[3px] h-[3px] -mt-[1.5px] -ml-[1.5px] rounded-[1px] bg-[#a9c6da] opacity-0"
                            />
                          ))}
                        {!isA && (
                          <span
                            ref={sRingRef}
                            className="absolute left-1/2 top-[46%] w-[18px] h-[18px] -mt-[9px] -ml-[9px] rounded-full border-2 border-[rgba(210,39,39,.7)] opacity-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* 와이어 + 쇠구슬 */}
                    <div
                      ref={isA ? armARef : armBRef}
                      className="absolute left-[62%] top-7 md:top-[35px] w-0.5 h-[74px] md:h-[100px] bg-[#cfd5dc] origin-top"
                    >
                      <div
                        data-ball
                        className="absolute left-1/2 top-full -translate-x-1/2 w-[34px] h-[34px] md:w-[46px] md:h-[46px] rounded-full flex items-center justify-center text-white font-extrabold text-[10.5px] md:text-[13.5px] whitespace-nowrap shadow-[0_2px_6px_rgba(0,0,0,.28)] [text-shadow:0_1px_2px_rgba(0,0,0,.5)]"
                        style={{
                          background:
                            'radial-gradient(circle at 32% 28%,#d9dee5,#7b828d 55%,#464c55)',
                        }}
                      >
                        <b
                          ref={(el) => {
                            kgRefs.current[ci] = el;
                          }}
                        >
                          0
                        </b>
                        <i className="not-italic text-[8px] md:text-[10px] font-bold opacity-90 ml-px">
                          kg
                        </i>
                      </div>
                    </div>

                    <div
                      ref={isA ? sResARef : sResBRef}
                      className={`absolute inset-x-[6%] bottom-3.5 md:bottom-[18px] text-center text-[11px] md:text-[12.5px] font-bold py-1.5 px-1 rounded-full break-keep leading-tight opacity-0 ${
                        isA ? 'text-[#b3241f] bg-[#fdeceb]' : 'text-[#1a7f4b] bg-[#e9f6ef]'
                      }`}
                    >
                      {isA ? '길고 날카로운 파편' : '버팀 · 비산 없음'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 타이틀 카드 */}
        {[
          { ref: t1Ref, no: 'TEST 01', title: '낙구 충격 시험', sub: '강철 구슬 낙하' },
          { ref: t2Ref, no: 'TEST 02', title: '쇼트백 충격 시험', sub: '45kg 추 · 75cm 낙하' },
        ].map((c) => (
          <div
            key={c.no}
            ref={c.ref}
            className="absolute inset-0 z-[5] bg-[#fafbfc] flex flex-col items-center justify-center gap-[7px] text-center opacity-0"
          >
            <small className="text-[10px] md:text-[11px] tracking-[.16em] font-bold text-[#bbb]">
              {c.no}
            </small>
            <b className="text-[19px] md:text-[24px] font-extrabold text-[#333] -tracking-[.02em]">
              {c.title}
            </b>
            <span className="text-[12px] md:text-[13.5px] text-[#999]">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* 트랜스포트 */}
      <div className="relative flex items-center gap-2.5 mt-2.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? '정지' : '재생'}
          className="shrink-0 w-[26px] h-[26px] rounded-full bg-[#f1f2f4] hover:bg-[#e6e8eb] text-[#666] text-[10px] leading-none flex items-center justify-center transition-colors"
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          onClick={() => {
            film.seek(0);
            film.play();
            setPlaying(true);
          }}
          aria-label="처음부터"
          className="shrink-0 w-[26px] h-[26px] rounded-full bg-[#f1f2f4] hover:bg-[#e6e8eb] text-[#666] text-[10px] leading-none flex items-center justify-center transition-colors"
        >
          ↺
        </button>
        <div
          ref={seekRef}
          role="slider"
          aria-label="시험 영상 진행"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          tabIndex={0}
          className="relative flex-1 h-[22px] flex items-center cursor-pointer touch-none"
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            film.pause();
            setPlaying(false);
            scrubTo(e.clientX);
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) scrubTo(e.clientX);
          }}
          onPointerUp={() => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            film.play();
            setPlaying(true);
          }}
          onKeyDown={(e) => {
            const d = e.key === 'ArrowRight' ? 0.5 : e.key === 'ArrowLeft' ? -0.5 : 0;
            if (!d) return;
            e.preventDefault();
            film.pause();
            setPlaying(false);
            film.seek(film.time() + d);
          }}
        >
          <span className="absolute inset-x-0 h-1 rounded-full bg-[#eceef0]" />
          <span
            className="absolute top-1/2 w-0.5 h-[9px] -mt-[4.5px] -ml-px rounded-sm bg-[#cfd3d8]"
            style={{ left: `${(S1 / DUR) * 100}%` }}
          />
          <span
            className="absolute top-1/2 w-0.5 h-[9px] -mt-[4.5px] -ml-px rounded-sm bg-[#cfd3d8]"
            style={{ left: `${((S2 - 1.4) / DUR) * 100}%` }}
          />
          <span ref={pgRef} className="absolute left-0 h-1 rounded-full bg-[#d22727] w-0" />
          <span
            ref={knRef}
            className="absolute w-3 h-3 -ml-1.5 rounded-full bg-white border-2 border-[#d22727] shadow-[0_1px_3px_rgba(0,0,0,.2)]"
            style={{ left: 0 }}
          />
        </div>
      </div>

      <div className="grid mt-3">
        {CAPS.map(([, text], i) => (
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

      <p className="mt-2 text-[11px] md:text-[12px] leading-[17px] text-[#bbb] break-keep">
        ※ 국가표준(KS)에 정해진 시험 방법을 이해하기 쉽게 표현한 화면입니다. 정확한 시험 조건과 합격
        기준은 KS 규격을 따르며, 강화유리라는 소재의 일반적인 기준을 안내한 것입니다.
      </p>
    </div>
  );
}
