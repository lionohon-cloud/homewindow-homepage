import { useCallback, useEffect, useRef, useState } from "react";
import { StoryScene, fxFromPlay, useStoryLayout, type ScrollStory, type StoryLayout } from "./HeroScrollStory";
import { isProgrammaticScroll, prefersReducedMotion } from "../../nav/sections";

/**
 * E안 스토리의 "진행 방식" 실험 — /scroll-lab 전용.
 *
 * E안은 스크롤한 거리만큼 연출이 진행된다(스크럽). 빨리 내리는 사람에게는
 * 연출이 빨리감기처럼 번쩍하고 지나가는 문제가 있어, 같은 그림을 세 가지 방식으로 돌려 본다.
 *
 *   signal  A · 신호형   스크롤은 "다음 장면 시작" 신호로만 쓰고, 전환은 정해진 시간 동안 끝까지 재생.
 *                        빨리 지나가도 ①→②→결론을 순서대로 다 재생한다. 길이는 E안과 같은 2.4화면.
 *   snap    B · 장면별 멈춤  고정 구간 안에서는 스크롤을 잠그고, 한 번 내릴 때마다 한 장면씩.
 *                        전환이 끝나기 전엔 다음 장면으로 안 넘어간다. 결론 뒤부터는 평소 스크롤.
 *   combo   C · 추천 조합  신호형 + 빠르게 지나가면 ② 를 건너뛰고 결론 연출로 바로 + 길이 1.5화면.
 *   auto    D · 자동 재생   260913 운영 채택. 스크롤을 신호로 쓰지 않는다 — 히어로가 화면에 있는 동안
 *                        시간이 흘러 장면이 저절로 넘어가고, 휠·트랙패드·터치는 브라우저가 그대로 처리한다.
 *
 * 장면은 세 단계다.  0: ① 영상 위 첫 문장  1: ② 사진 위 문장  2: 결론(검정→커짐→갈라짐→CTA)
 * 재생 값은 a(①→② 전환)와 b(결론 연출) 두 개이고, 그림은 HeroScrollStory 의 StoryScene 을 그대로 쓴다.
 */

export type StoryMode = "signal" | "snap" | "combo" | "auto";
type Stage = 0 | 1 | 2;

/* 재생 시간(ms) */
const A_FWD = 700; //   ① → ②
const A_BACK = 450; //  ② → ① (올릴 때)
const A_RUSH = 260; //  ① → ② 중인데 이미 결론까지 가야 할 때 — 남은 전환을 짧게 끝낸다(C)
const B_BACK = 900; //  결론 → ② (올릴 때)

/* 260913 체감 지연 완화 — 장면 연출은 그대로 두고 "기다리는 시간" 만 줄인다.
   LOCK_TAIL: 전환이 끝난 뒤 다음 동작을 받기까지의 여유 (150 → 80)
   PUSH_GRACE: 휠을 쉬지 않고 굴릴 때 다음 단계로 인정하기까지의 여유 (400 → 180) */
const LOCK_TAIL = 80;
const PUSH_GRACE = 180;

/* bFwd = 결론 연출(검정 → "하지만" → 커짐 → 갈라짐) 재생 시간.
   260911 "하지만" 한 박자를 넣으면서 2200 → 2800 (combo 1800 → 2300).
   260913 snap 만 2800 → 1500 — 장면 순서·내용은 그대로고 재생 속도만 올린다.
   히어로를 벗어나기까지의 대기가 이 값에 그대로 얹히던 것이 체감 지연의 주범이었다. */
const MODE = {
  /* th1·th2 = 고정 구간 진행률 몇 % 에서 장면 1·2 가 시작되는지 */
  signal: { screens: 2.4, th1: 0.06, th2: 0.45, bFwd: 2800 },
  snap: { screens: 1.5, bFwd: 1500 },
  /* settleMs — 장면 1 경계를 넘고 이 시간 안에 장면 2 경계까지 넘으면 "빨리 지나가는 중" 으로 보고
     ② 를 건너뛴다. 1.5화면이면 모바일에서 두 경계 사이가 약 430px 이다. */
  combo: { screens: 1.5, th1: 0.08, th2: 0.42, bFwd: 2300, settleMs: 140 },
  /* D · 자동 재생 — 합계 5.7초. screens 0 = 히어로에 여분 스크롤 높이를 두지 않는다(딱 한 화면).
     hold0 첫 문구 유지 → aFwd ①→② 전환 → hold1 두 번째 문구 유지 → bFwd 결론 연출. */
  auto: { screens: 0, hold0: 1400, aFwd: 600, hold1: 1500, bFwd: 2200 },
} as const;

/**
 * 목표 장면을 받아 a·b 를 시간으로 움직인다.
 * 순서 — 내려갈 땐 a 다음 b, 올라갈 땐 b 다음 a. 여러 장면을 한 번에 건너뛰어도 차례대로 재생한다.
 */
function useStagePlayer(
  target: Stage,
  o: {
    bFwd: number;
    /** ①→② 전환 시간. 안 주면 기존 A_FWD(700ms) — snap·signal·combo 는 그대로다. */
    aFwd?: number;
    skipUnplayed?: boolean;
    settleMs?: number;
    /** true 면 프레임을 굴리지 않는다. 값은 그대로 멈춘다(자동 재생의 일시정지용). */
    paused?: boolean;
  },
) {
  const [ab, setAb] = useState({ a: 0, b: 0 });
  const cur = useRef({ a: 0, b: 0 });
  const goal = useRef({ a: 0, b: 0 });
  const raf = useRef(0);
  const prevTs = useRef(0);
  const opt = useRef(o);
  opt.current = o;

  const tick = (ts: number) => {
    if (opt.current.paused) {
      /* 멈춘 동안에는 다음 프레임을 예약하지 않는다 — 풀리면 아래 효과가 다시 굴린다 */
      raf.current = 0;
      prevTs.current = 0;
      return;
    }
    const dt = prevTs.current ? Math.min(64, ts - prevTs.current) : 16;
    prevTs.current = ts;
    const g = goal.current;
    let { a, b } = cur.current;
    if (b > g.b) {
      b = Math.max(g.b, b - dt / B_BACK);
    } else if (a !== g.a) {
      const dur = a < g.a ? (opt.current.skipUnplayed && g.b > b ? A_RUSH : (opt.current.aFwd ?? A_FWD)) : A_BACK;
      a = a < g.a ? Math.min(g.a, a + dt / dur) : Math.max(g.a, a - dt / dur);
    } else if (b < g.b) {
      b = Math.min(g.b, b + dt / opt.current.bFwd);
    }
    cur.current = { a, b };
    setAb({ a, b });
    if (a === g.a && b === g.b) {
      raf.current = 0;
      prevTs.current = 0;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const apply = () => {
      const c = cur.current;
      goal.current =
        target === 0
          ? { a: 0, b: 0 }
          : target === 1
            ? { a: 1, b: 0 }
            : /* ② 를 아직 시작도 안 했으면 건너뛴다(C) — 첫 문장이 그대로 어두워지며 결론으로 */
              { a: opt.current.skipUnplayed && c.a === 0 ? 0 : 1, b: 1 };
      if (!raf.current) {
        prevTs.current = 0;
        raf.current = requestAnimationFrame(tick);
      }
    };
    const c = cur.current;
    if (target === 1 && opt.current.settleMs && c.a === 0 && c.b === 0) {
      const id = window.setTimeout(apply, opt.current.settleMs);
      return () => window.clearTimeout(id);
    }
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  /* 일시정지가 풀리면 남은 전환을 이어서 굴린다 */
  useEffect(() => {
    if (o.paused) return;
    const c = cur.current;
    const g = goal.current;
    if ((c.a !== g.a || c.b !== g.b) && !raf.current) {
      prevTs.current = 0;
      raf.current = requestAnimationFrame(tick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.paused]);

  /* 화면 밖에서 첫 장면으로 즉시 되돌린다 — 되감기(A_BACK·B_BACK)가 아니라 그 자리에서 0.
     보이지 않을 때만 부르므로 눈에 띄는 깜빡임이 없다. */
  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    prevTs.current = 0;
    cur.current = { a: 0, b: 0 };
    goal.current = { a: 0, b: 0 };
    setAb({ a: 0, b: 0 });
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { a: ab.a, b: ab.b, reset };
}

/* ── A · 신호형 / C · 추천 조합 — 스크롤 위치로 목표 장면만 정한다 ── */
function SignalStory({ story, combo }: { story: ScrollStory; combo: boolean }) {
  const cfg = combo ? MODE.combo : MODE.signal;
  const layout = useStoryLayout(cfg.screens);
  const target: Stage = layout.t >= cfg.th2 ? 2 : layout.t >= cfg.th1 ? 1 : 0;
  const { a, b } = useStagePlayer(target, {
    bFwd: cfg.bFwd,
    skipUnplayed: combo,
    settleMs: combo ? MODE.combo.settleMs : undefined,
  });
  return <StoryScene story={story} fx={fxFromPlay(a, b)} layout={layout} />;
}

/* ── B · 장면별 멈춤 ── */

/* 장면별로 멈춰 서는 스크롤 위치 (고정 구간 진행률) */
const SNAP_AT = [0, 0.5, 1] as const;

/**
 * 고정 구간 안에서 휠·터치를 잠그고, 한 번의 동작마다 장면을 하나씩 넘긴다.
 *   · 동작 하나 = 장면 하나. 트랙패드 관성처럼 이어지는 이벤트는 같은 동작으로 본다(160ms 끊김 기준).
 *   · 전환 재생 중에는 넘기지 않는다.
 *   · 결론 장면에서 아래로 / 첫 장면에서 위로 새로 내리면 잠금을 풀어 평소처럼 스크롤된다.
 *   · 아래에서 올라오며 관성으로 구간 안에 멈추면, 가장 가까운 장면 자리로 맞춘다.
 */
function useSnapStepper(layout: StoryLayout, stage: Stage, setStage: (s: Stage) => void) {
  const stageRef = useRef(stage);
  stageRef.current = stage;

  useEffect(() => {
    let lockUntil = 0;
    let lastWheel = 0;
    let wheelMode: "locked" | "native" | "outside" = "outside";
    let touchY = 0;
    let touchMode: "locked" | "native" | "outside" | null = null;
    let stepped = false;
    let idleTimer = 0;

    const geom = () => {
      const outer = layout.outerRef.current;
      const inner = layout.innerRef.current;
      if (!outer || !inner) return null;
      const range = outer.offsetHeight - inner.offsetHeight;
      if (range <= 0) return null;
      return { top: outer.getBoundingClientRect().top + window.scrollY, range };
    };
    const inZone = () => {
      const g = geom();
      if (!g) return false;
      const y = window.scrollY;
      return y >= g.top - 2 && y <= g.top + g.range + 2;
    };
    const jumpTo = (s: Stage) => {
      const g = geom();
      if (!g) return;
      /* 화면이 고정돼 있어 순간 이동해도 눈에 보이는 변화는 없다 */
      window.scrollTo({ top: Math.round(g.top + SNAP_AT[s] * g.range), behavior: "instant" as ScrollBehavior });
    };
    const setS = (s: Stage) => {
      stageRef.current = s;
      setStage(s);
    };
    const go = (s: Stage) => {
      const prev = stageRef.current;
      if (s === prev) return;
      setS(s);
      jumpTo(s);
      const dur = s > prev ? (s === 2 ? MODE.snap.bFwd : A_FWD) : prev === 2 ? B_BACK : A_BACK;
      lockUntil = performance.now() + dur + LOCK_TAIL;
    };
    const snapToNearest = () => {
      const g = geom();
      if (!g) return;
      const p = (window.scrollY - g.top) / g.range;
      const s: Stage = p < 0.25 ? 0 : p < 0.75 ? 1 : 2;
      if (s !== stageRef.current) setS(s);
      jumpTo(s);
    };
    const atEnd = (dir: number) => (dir > 0 && stageRef.current === 2) || (dir < 0 && stageRef.current === 0);

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const fresh = now - lastWheel > 160;
      lastWheel = now;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const zone = inZone();
      const idle = now >= lockUntil;
      if (fresh) wheelMode = !zone ? "outside" : idle && atEnd(dir) ? "native" : "locked";
      else if (wheelMode === "outside" && zone) {
        wheelMode = "locked";
        snapToNearest();
      }
      if (wheelMode !== "locked") return;
      /* 마우스 휠을 쉬지 않고 계속 굴리는 경우 — 전환이 끝나고 조금 지나면 다음 동작으로 인정 */
      const pushOn = idle && now - lockUntil > PUSH_GRACE && Math.abs(e.deltaY) >= 50;
      if (pushOn && atEnd(dir)) {
        wheelMode = "native";
        return;
      }
      e.preventDefault();
      if (!idle || !(fresh || pushOn)) return;
      const next = stageRef.current + dir;
      if (next >= 0 && next <= 2) go(next as Stage);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchMode = null;
      stepped = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY; // + = 페이지를 아래로 내리는 방향
      if (dy === 0) return;
      const zone = inZone();
      const idle = performance.now() >= lockUntil;
      if (touchMode === null) touchMode = !zone ? "outside" : idle && atEnd(Math.sign(dy)) ? "native" : "locked";
      else if (touchMode === "outside" && zone) {
        touchMode = "locked";
        snapToNearest();
      }
      if (touchMode !== "locked") return;
      if (e.cancelable) e.preventDefault();
      if (!stepped && idle && Math.abs(dy) > 28) {
        const next = stageRef.current + Math.sign(dy);
        if (next >= 0 && next <= 2) go(next as Stage);
        stepped = true;
      }
    };

    const onScroll = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        /* 메뉴·화살표가 건 부드러운 스크롤이 이 구간을 지나가는 중이면 손대지 않는다.
           프레임이 한 번 밀려 160ms 넘게 멎으면 여기서 목적지를 가로채 버린다. */
        if (isProgrammaticScroll()) return;
        if (inZone() && performance.now() >= lockUntil) snapToNearest();
      }, 160);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function SnapStory({ story }: { story: ScrollStory }) {
  const layout = useStoryLayout(MODE.snap.screens);
  const [stage, setStage] = useState<Stage>(0);
  const { a, b } = useStagePlayer(stage, { bFwd: MODE.snap.bFwd });
  useSnapStepper(layout, stage, setStage);
  /* "더 내리면 된다" 는 신호는 화면 하단에 상시로 떠 있는 단계 이동 버튼
     (components/SectionStepArrow.tsx)이 대신한다 — 히어로 안에 따로 두지 않는다. */
  return <StoryScene story={story} fx={fxFromPlay(a, b)} layout={layout} />;
}


/* ── D · 자동 재생 (260913 운영 채택) ──────────────────────────────────────
   스크롤을 신호로 쓰지 않는다. 히어로가 화면에 들어와 있는 동안 시간이 흐르고,
   사용자의 휠·트랙패드·터치는 처음부터 끝까지 브라우저가 그대로 처리한다.
   useSnapStepper 를 부르지 않으므로 wheel/touchmove 리스너 자체가 등록되지 않는다 —
   preventDefault·스크롤 잠금·스냅 복귀가 "꺼지는" 게 아니라 아예 존재하지 않는다.

   진행표 (합계 5.7초). 끝나면 CTA 상태로 멈추고 반복하지 않는다.
     0.0s  ① 영상 + 첫 문장
     1.4s  ①→② 전환 시작 (0.6초)
     3.5s  결론 연출 시작 (2.2초)
     5.7s  끝 — CTA                                                        */
const AUTO_STEPS: { at: number; stage: Stage }[] = [
  { at: 0, stage: 0 },
  { at: MODE.auto.hold0, stage: 1 },
  { at: MODE.auto.hold0 + MODE.auto.aFwd + MODE.auto.hold1, stage: 2 },
];
const AUTO_TOTAL = AUTO_STEPS[2].at + MODE.auto.bFwd;

/* 화면에 얼마나 걸쳐 있는지로 재생 상태를 정한다 — 기준이 셋이라 히스테리시스가 생긴다.
   0.35~0.9 사이에서는 아무 판정도 하지 않아, 조금 위아래로 움직이는 것만으로는
   재생이 끊기지도 처음으로 되돌아가지도 않는다. */
const IN_VIEW = 0.9; //  이만큼 보이면 재생
const OUT_VIEW = 0.35; // 이 아래로 내려가면 일시정지 — 값은 그대로 둔다
const GONE = 0.01; //     사실상 화면 밖 — 다음에 돌아오면 첫 장면부터

/** 시계 하나로 장면을 넘긴다. 스크롤은 건드리지 않고, 보이는 정도와 탭 상태만 본다. */
function useAutoPlay(layout: StoryLayout, resetRef: React.MutableRefObject<() => void>) {
  const [reduce] = useState(prefersReducedMotion);
  const [stage, setStage] = useState<Stage>(0);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    /* 움직임 줄이기 — 전환을 아예 재생하지 않고 최종 장면만 보여준다(아래 AutoStory) */
    if (reduce) return;
    const host = layout.innerRef.current;
    if (!host) return;

    let elapsed = 0;
    let prevTs = 0;
    let raf = 0;
    let ready = false; //     배경 영상·글꼴이 준비됐는가
    let inView = false; //    IN_VIEW 이상 보이는가
    let needsReset = false; // 완전히 나갔다 → 다음 진입 때 처음부터
    let stopped = false;

    const running = () => ready && inView && !document.hidden;

    const applyStage = (t: number) => {
      let s: Stage = 0;
      for (const step of AUTO_STEPS) if (t >= step.at) s = step.stage;
      setStage(s);
    };

    const frame = (ts: number) => {
      raf = 0;
      if (stopped || !running()) {
        prevTs = 0;
        return;
      }
      /* 백그라운드에 있다 돌아오면 ts 차이가 크게 벌어진다 — 한 프레임 분량으로 자른다.
         (useStagePlayer 의 tick 도 같은 방식으로 막고 있다) */
      const dt = prevTs ? Math.min(64, ts - prevTs) : 16;
      prevTs = ts;
      elapsed = Math.min(AUTO_TOTAL, elapsed + dt);
      applyStage(elapsed);
      if (elapsed >= AUTO_TOTAL) {
        prevTs = 0; // 끝 — 반복하지 않는다
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      const go = running();
      setPaused(!go);
      if (go && !raf) {
        prevTs = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const resetAll = () => {
      elapsed = 0;
      prevTs = 0;
      setStage(0);
      resetRef.current();
    };

    /* ── 시작 시점 — 배경 영상이 그릴 수 있고 글꼴이 들어온 뒤 ──
       둘 중 하나가 끝내 안 오더라도 이야기는 시작해야 하므로 2초에서 끊는다. */
    const video = host.querySelector("video");
    const waits: Promise<unknown>[] = [];
    if (document.fonts?.ready) waits.push(document.fonts.ready);
    if (video && video.readyState < 3 /* HAVE_FUTURE_DATA */) {
      waits.push(
        new Promise<void>((res) => {
          const done = () => {
            video.removeEventListener("canplay", done);
            res();
          };
          video.addEventListener("canplay", done);
        }),
      );
    }
    const guard = new Promise<void>((res) => window.setTimeout(res, 2000));
    Promise.race([Promise.all(waits), guard]).then(() => {
      if (stopped) return;
      ready = true;
      kick();
    });

    /* ── 얼마나 보이는지 ── */
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(
        (entries) => {
          const r = entries[entries.length - 1].intersectionRatio;
          if (r <= GONE) {
            inView = false;
            needsReset = true;
            resetAll(); // 화면 밖에서 되돌려야 되감기가 눈에 안 보인다
          } else if (r < OUT_VIEW) {
            inView = false; // 값은 그대로 — 조금 되올리면 이어서 재생
          } else if (r >= IN_VIEW) {
            if (needsReset) {
              needsReset = false;
              resetAll();
            }
            inView = true;
          }
          kick();
        },
        { threshold: [0, GONE, OUT_VIEW, IN_VIEW, 1] },
      );
      io.observe(host);
    } else {
      inView = true; // IntersectionObserver 가 없으면 그냥 재생한다 (useScene.ts 와 같은 처리)
    }

    /* ── 백그라운드 탭 ── */
    const onVis = () => {
      prevTs = 0; // 돌아왔을 때 첫 dt 가 튀지 않게
      kick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return { stage, paused, reduce };
}

function AutoStory({ story }: { story: ScrollStory }) {
  /* screens 0 — 여분 스크롤 높이를 두지 않는다. 재는 구조(outerRef·innerRef·lastRef·splitY)는
     그대로라 검정이 갈라지는 가로선 위치 계산은 지금과 똑같이 동작한다. */
  const layout = useStoryLayout(MODE.auto.screens);
  const resetRef = useRef<() => void>(() => {});
  const { stage, paused, reduce } = useAutoPlay(layout, resetRef);
  const { a, b, reset } = useStagePlayer(stage, {
    bFwd: MODE.auto.bFwd,
    aFwd: MODE.auto.aFwd,
    paused,
  });
  resetRef.current = reset;
  /* 움직임 줄이기 설정이면 전환을 건너뛰고 결론 문구와 CTA 를 바로 띄운다 */
  return <StoryScene story={story} fx={reduce ? fxFromPlay(1, 1) : fxFromPlay(a, b)} layout={layout} />;
}

export function HeroScrollStoryLab({ story, mode }: { story: ScrollStory; mode: StoryMode }) {
  if (mode === "auto") return <AutoStory story={story} />;
  if (mode === "snap") return <SnapStory story={story} />;
  return <SignalStory story={story} combo={mode === "combo"} />;
}
