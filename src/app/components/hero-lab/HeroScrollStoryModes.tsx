import { useEffect, useRef, useState } from "react";
import { StoryScene, fxFromPlay, useStoryLayout, type ScrollStory, type StoryLayout } from "./HeroScrollStory";

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
 *
 * 장면은 세 단계다.  0: ① 영상 위 첫 문장  1: ② 사진 위 문장  2: 결론(검정→커짐→갈라짐→CTA)
 * 재생 값은 a(①→② 전환)와 b(결론 연출) 두 개이고, 그림은 HeroScrollStory 의 StoryScene 을 그대로 쓴다.
 */

export type StoryMode = "signal" | "snap" | "combo";
type Stage = 0 | 1 | 2;

/* 재생 시간(ms).
   260914 체감 속도 개선 — 장면 순서·문구·그림은 그대로 두고 재생 시간만 약 28% 줄인다.
   빠르게 내리는 사람이 "멈췄다" 고 느끼던 구간을 짧게 하되, 문구는 읽을 수 있는 속도를 지킨다. */
const A_FWD = 500; //   ① → ②                (700 → 500, −28.6%)
const A_BACK = 320; //  ② → ① (올릴 때)      (450 → 320, −28.9%)
const A_RUSH = 260; //  ① → ② 중인데 이미 결론까지 가야 할 때 — 남은 전환을 짧게 끝낸다(C)
const B_BACK = 640; //  결론 → ② (올릴 때)    (900 → 640, −28.9%)

/* 스크롤 입력 제한 — 한 장면을 재생하는 동안 다음 입력을 받지 않는 시간.
   재생 시간을 줄인 만큼 같이 줄여야 "연속으로 굴려도 안 먹는" 느낌이 사라진다.
   LOCK_TAIL  : 전환이 끝난 뒤 다음 동작을 받기까지의 여유   (150 → 110, −26.7%)
   PUSH_GRACE : 휠을 쉬지 않고 굴릴 때 다음 단계로 인정하기까지의 여유 (400 → 290, −27.5%)
   FRESH_GAP  : 이만큼 끊기면 새 동작으로 본다 (트랙패드 관성을 한 덩어리로 묶는 기준, 유지) */
const LOCK_TAIL = 110;
const PUSH_GRACE = 290;
const FRESH_GAP = 160;

/* bFwd = 결론 연출(검정 → "하지만" → 커짐 → 갈라짐) 재생 시간.
   260911 "하지만" 한 박자를 넣으면서 2200 → 2800 (combo 1800 → 2300).
   260914 운영에 쓰는 snap 만 2800 → 2000 (−28.6%). 장면 안의 시간 비율(T 표)은 그대로라
   "하지만" 이 뜨고 머무는 호흡도 같은 비율로 짧아진다. signal·combo 시안 값은 건드리지 않는다. */
const MODE = {
  /* th1·th2 = 고정 구간 진행률 몇 % 에서 장면 1·2 가 시작되는지 */
  signal: { screens: 2.4, th1: 0.06, th2: 0.45, bFwd: 2800 },
  snap: { screens: 1.5, bFwd: 2000 },
  /* settleMs — 장면 1 경계를 넘고 이 시간 안에 장면 2 경계까지 넘으면 "빨리 지나가는 중" 으로 보고
     ② 를 건너뛴다. 1.5화면이면 모바일에서 두 경계 사이가 약 430px 이다. */
  combo: { screens: 1.5, th1: 0.08, th2: 0.42, bFwd: 2300, settleMs: 140 },
} as const;

/**
 * 목표 장면을 받아 a·b 를 시간으로 움직인다.
 * 순서 — 내려갈 땐 a 다음 b, 올라갈 땐 b 다음 a. 여러 장면을 한 번에 건너뛰어도 차례대로 재생한다.
 */
function useStagePlayer(target: Stage, o: { bFwd: number; skipUnplayed?: boolean; settleMs?: number }) {
  const [ab, setAb] = useState({ a: 0, b: 0 });
  const cur = useRef({ a: 0, b: 0 });
  const goal = useRef({ a: 0, b: 0 });
  const raf = useRef(0);
  const prevTs = useRef(0);
  const opt = useRef(o);
  opt.current = o;

  const tick = (ts: number) => {
    const dt = prevTs.current ? Math.min(64, ts - prevTs.current) : 16;
    prevTs.current = ts;
    const g = goal.current;
    let { a, b } = cur.current;
    if (b > g.b) {
      b = Math.max(g.b, b - dt / B_BACK);
    } else if (a !== g.a) {
      const dur = a < g.a ? (opt.current.skipUnplayed && g.b > b ? A_RUSH : A_FWD) : A_BACK;
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

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return ab;
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
  /* 260917 — 스크롤 안내 화살표를 눌렀을 때 할 일. 휠·터치와 같은 잠금(lockUntil)을 써야 해서
     아래 effect 안에서 채운다. */
  const nextRef = useRef<() => void>(() => {});

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

    /* 화살표 한 번 = 한 단계. ① → ② → 결론, 결론에서 누르면 히어로 다음 섹션으로 내려간다.
       전환 재생 중(lockUntil 전)에 연달아 누른 건 무시한다 — 장면을 건너뛰지 않게. */
    nextRef.current = () => {
      if (performance.now() < lockUntil) return;
      const s = stageRef.current;
      if (s < 2) {
        go((s + 1) as Stage);
        return;
      }
      const g = geom();
      const outer = layout.outerRef.current;
      if (!g || !outer) return;
      /* 부드럽게 내려가는 동안 구간 안 스크롤로 잡혀 장면 자리로 되돌려지지 않게 잠깐 잠근다 */
      lockUntil = performance.now() + 1000;
      window.scrollTo({ top: Math.round(g.top + outer.offsetHeight), behavior: "smooth" });
    };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const fresh = now - lastWheel > FRESH_GAP;
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
        if (inZone() && performance.now() >= lockUntil) snapToNearest();
      }, FRESH_GAP);
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

  return () => nextRef.current();
}

function SnapStory({ story }: { story: ScrollStory }) {
  const layout = useStoryLayout(MODE.snap.screens);
  const [stage, setStage] = useState<Stage>(0);
  const { a, b } = useStagePlayer(stage, { bFwd: MODE.snap.bFwd });
  /* next — 스크롤 안내 화살표를 눌렀을 때 (260917) */
  const next = useSnapStepper(layout, stage, setStage);
  /* 스크롤 안내 화살표는 결론 장면까지 계속 둔다 — 한 번씩 내려야 넘어가는 방식이라
     장면마다 "더 내리면 된다" 는 신호가 필요하고, 결론 뒤에도 아래로 본문이 이어진다.
     히어로가 위로 밀려 올라가면 화살표도 같이 화면 밖으로 나간다. */
  const fx = { ...fxFromPlay(a, b), hintOp: 1 };
  /* 단계 게이지 — ① 은 처음부터 한 칸 차 있고, ② 칸은 a(①→② 전환), ③ 칸은 b(결론 연출) 만큼 찬다 */
  return <StoryScene story={story} fx={fx} layout={layout} onNext={next} steps={[1, a, b]} />;
}

export function HeroScrollStoryLab({ story, mode }: { story: ScrollStory; mode: StoryMode }) {
  if (mode === "snap") return <SnapStory story={story} />;
  return <SignalStory story={story} combo={mode === "combo"} />;
}
