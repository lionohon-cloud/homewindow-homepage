import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { nextSection, scrollToSection, useActiveSection } from "../nav/sections";

/**
 * 페이지 단계 이동 화살표 — PC·모바일 공용.
 *
 * 히어로 안에만 있던 장식용 화살표(클릭 안 되는 pointer-events-none 힌트)를 대신한다.
 * 하단 상담 바 위 가운데에 계속 떠 있고, 누르면 왼쪽 단계 메뉴와 똑같은 순서
 * (nav/sections.ts 의 sections)로 다음 섹션까지 부드럽게 내려간다.
 * 마지막 "사회공헌활동" 에서는 위를 가리키고, 누르면 "처음으로" 돌아간다.
 *
 * 왼쪽 단계 메뉴는 1550px 미만에서 숨지만(Navigation 의 min-[1550px]:block),
 * 이 화살표는 그 대신 쓰는 것이라 모바일에서도 그대로 나온다.
 */

/* 하단 고정 상담 바 높이 — BottomBar 의 h-[100px] md:h-[110px] 와 같아야 한다 */
const BAR_H_MOBILE = 100;
const BAR_H_DESKTOP = 110;
const GAP = 16;

/** 화면을 덮는 것이 떠 있는가 — 견적 모달·AI 상담·영상 팝업·모바일 사이드 메뉴.
    넷 다 body 를 잠그거나(overflow:hidden) 전용 표시를 남기므로 한 번에 본다. */
function overlayOpen(): boolean {
  const b = document.body;
  return b.hasAttribute("data-estimate-modal-open") || b.style.overflow === "hidden";
}

export function SectionStepArrow() {
  const location = useLocation();
  const onHome = location.pathname === "/";
  const active = useActiveSection(onHome);
  const [covered, setCovered] = useState(false);

  /* body 의 잠금·표시 변화를 지켜본다 (Navigation 이 견적 모달을 보는 방식과 같다) */
  useEffect(() => {
    if (!onHome) return;
    const check = () => setCovered(overlayOpen());
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "data-estimate-modal-open"] });
    return () => observer.disconnect();
  }, [onHome]);

  if (!onHome || covered) return null;

  const { target, isLast } = nextSection(active);
  const label = isLast ? "맨 처음으로 이동" : `다음 단계로 이동: ${target.label}`;

  return (
    <>
      {/* 위치는 CSS 로 잡는다 — 하단 바 높이 + 여백에 iOS 홈 인디케이터 영역까지 더해야 해서
          Tailwind 임의값 한 줄에 담기 어렵다. 살짝 오르내리는 신호는 움직임 줄이기 설정이면 멈춘다. */}
      <style>{`
        .hw-step-arrow {
          bottom: calc(${BAR_H_MOBILE}px + ${GAP}px + env(safe-area-inset-bottom, 0px));
        }
        @media (min-width: 768px) {
          .hw-step-arrow { bottom: calc(${BAR_H_DESKTOP}px + ${GAP}px + env(safe-area-inset-bottom, 0px)); }
        }
        @keyframes hw-step-arrow-cue { 0%,100% { transform: translateY(0) } 50% { transform: translateY(3px) } }
        .hw-step-arrow-cue { animation: hw-step-arrow-cue 1.8s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .hw-step-arrow-cue { animation: none } }
      `}</style>

      <button
        type="button"
        data-step-arrow
        onClick={() => scrollToSection(target.id)}
        aria-label={label}
        title={label}
        className="hw-step-arrow fixed left-1/2 -translate-x-1/2 z-40 w-[46px] h-[46px] rounded-full
                   bg-white/90 backdrop-blur-sm border border-black/10
                   shadow-[0_4px_16px_rgba(0,0,0,0.18)]
                   flex items-center justify-center cursor-pointer
                   hover:bg-white active:scale-95 transition-[background-color,transform] duration-200"
      >
        <svg
          className={isLast ? "" : "hw-step-arrow-cue"}
          width="20"
          height="12"
          viewBox="0 0 22 12"
          fill="none"
          aria-hidden="true"
          style={{ transform: isLast ? "rotate(180deg)" : undefined }}
        >
          <path d="M2 2l9 8 9-8" stroke="#2A2A2A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
