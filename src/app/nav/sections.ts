import { useEffect, useState } from "react";

/**
 * 메인 페이지 단계(섹션) 목록과 이동·감지 로직 — 한 곳에서만 관리한다.
 *
 * 예전에는 이 세 가지가 Navigation.tsx 안에 지역 변수·지역 함수로 갇혀 있어
 * 왼쪽 단계 메뉴만 쓸 수 있었다. 하단 단계 화살표(SectionStepArrow)가 같은
 * 순서·같은 목적지를 써야 하므로 밖으로 뺐다. 목록을 고칠 일이 있으면 여기만 고친다.
 */

export type Section = { id: string; label: string };

/* 화면에 나오는 순서와 같아야 한다 — 현재 섹션 감지가 뒤에서부터 "화면 가운데를 지난 첫 섹션" 을 찾는다.
   260911 통합안: 강화유리가 히어로 바로 다음(why-basic "강화유리가 드물었던 이유")으로 올라왔다.
   그 아래 강화유리 본문(01~06)·번호 접수까지 따로 항목이 없으므로 이벤트 배너 전까지 "강화유리" 가 켜진다.
   예전 자리(자재품질 ~ 단열유리 사이, id "tempered")의 티저 섹션은 통합안에서 빠졌다. */
export const sections: Section[] = [
  { id: "hero", label: "처음으로" },
  { id: "why-basic", label: "강화유리" },
  { id: "event", label: "이벤트" },
  { id: "awards", label: "수상내역" },
  { id: "insurance", label: "안심보증" },
  { id: "production", label: "자동화 제조 공장" },
  { id: "brands", label: "취급 브랜드" },
  { id: "materials", label: "자재품질" },
  { id: "glass", label: "단열유리" },
  { id: "safety", label: "방충망" },
  { id: "installation", label: "원데이 시공" },
  { id: "warranty", label: "업계 최장 15년 보증" },
  { id: "review", label: "시공 후기" },
  { id: "corporate", label: "사회공헌활동" },
];

/* 고정 GNB 에 제목이 가리지 않도록 빼 주는 높이.
   섹션들이 이미 달고 있는 scroll-mt 값과 같게 맞췄다(모바일 60px+테두리, 1550px↑ 70px+테두리, 여유 13px).
   scroll-margin 은 scrollIntoView·앵커에서만 먹고 window.scrollTo 에는 안 먹어서,
   여기서 좌표를 직접 보정한다. */
const GNB_OFFSET_MOBILE = 73;
const GNB_OFFSET_DESKTOP = 83;

export function gnbOffset(): number {
  if (typeof window === "undefined") return GNB_OFFSET_MOBILE;
  return window.matchMedia("(min-width: 1550px)").matches ? GNB_OFFSET_DESKTOP : GNB_OFFSET_MOBILE;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** 문서 최상단 기준 절대 y.
    offsetTop 은 offsetParent(가장 가까운 position 요소) 기준이라 래퍼가 하나만 끼어도 어긋난다. */
export function absoluteTop(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/* ── 프로그램(코드)이 건 부드러운 스크롤 보호 ────────────────────────────
   히어로 스냅 스테퍼(useSnapStepper)는 스크롤이 160ms 멎으면 가장 가까운 장면 자리로
   끌어당긴다. 메뉴·화살표가 건 이동이 히어로 구간을 지나갈 때 이게 끼어들면 목적지가
   틀어지므로, 이동이 끝날 때까지 "지금은 코드가 움직이는 중" 이라고 알려 준다.
   GNB 숨김 판정도 이 동안에는 쉰다. */
let progTarget: number | null = null;
let progUntil = 0;

export function isProgrammaticScroll(): boolean {
  if (progTarget === null) return false;
  /* 목적지에 닿았거나(1px 오차) 너무 오래됐으면 푼다 — 짧은 이동에서 계속 잠겨 있지 않게 */
  if (performance.now() > progUntil || Math.abs(window.scrollY - progTarget) <= 1) {
    progTarget = null;
    return false;
  }
  return true;
}

/** 지정 섹션으로 부드럽게 이동. 그런 id 가 없으면 false. */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  /* hero 는 보정하면 음수라 자연히 0 이 된다 — 따로 분기하지 않는다 */
  const top = Math.min(Math.max(0, Math.round(absoluteTop(el) - gnbOffset())), maxScroll);

  progTarget = top;
  progUntil = performance.now() + 3000;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return true;
}

/** 지금 활성 단계의 "다음" 목적지. 마지막 단계면 맨 처음으로 돌아간다. */
export function nextSection(activeId: string): { target: Section; isLast: boolean } {
  const i = sections.findIndex((s) => s.id === activeId);
  const idx = i < 0 ? 0 : i;
  if (idx >= sections.length - 1) return { target: sections[0], isLast: true };
  return { target: sections[idx + 1], isLast: false };
}

/**
 * 지금 보고 있는 섹션 id.
 * 뒤에서부터 훑어 "상단이 화면 중앙보다 위" 인 첫 섹션을 고른다 — 직접 스크롤해도 따라온다.
 * (Navigation 이 쓰던 판정을 그대로 옮긴 것)
 */
export function useActiveSection(enabled = true): string {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    if (!enabled) return;
    let ticking = false;

    const update = () => {
      let current = sections[0].id;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
          current = sections[i].id;
          break;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  return active;
}
