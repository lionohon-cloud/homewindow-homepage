import type { ReactNode } from "react";
import { useNavigate } from "react-router";

/**
 * 강화유리 본문(#video)으로 이동하는 버튼. 현재는 쓰는 곳이 없지만(히어로는
 * 이제 상담 모달을 직접 연다), TemperedGlassSection.tsx 가 되살아나면 다시 쓴다.
 *
 * 260907 통합버전: 상세페이지가 없다. 본문이 메인 히어로 바로 아래(#video)에
 * 들어가 있어 페이지를 옮기지 않고 같은 화면 안에서 그 자리로 내려간다.
 *
 * <a href="#video"> 를 그대로 쓰면 AppLayout 의 <ScrollRestoration/> 이 이걸
 * "새 이동(PUSH)"으로 보고 최상단으로 스크롤해 버린다 — 예전에 겪은 것과 같은
 * 버그다. 그래서 버튼 + 수동 스크롤로 처리한다. 다른 페이지에 있을 때는
 * 메인으로 이동한 뒤 스크롤한다 — Navigation.tsx 의 scrollToSection 과 같은 방식.
 */
const TEMPERED_SECTION_ID = "video";

interface Props {
  className?: string;
  children: ReactNode;
}

export function TemperedGlassLink({ className, children }: Props) {
  const navigate = useNavigate();

  const go = () => {
    if (window.location.pathname !== "/") {
      sessionStorage.setItem("hw_scroll_to", TEMPERED_SECTION_ID);
      navigate("/");
      return;
    }
    const el = document.getElementById(TEMPERED_SECTION_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button type="button" onClick={go} className={className}>
      {children}
    </button>
  );
}
