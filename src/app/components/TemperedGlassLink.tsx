import type { ReactNode } from "react";
import { Link } from "react-router";

/**
 * 강화유리 상세페이지로 가는 링크. 히어로(모바일·PC)와 강화유리 섹션이 같이 쓴다.
 *
 * 목적지를 아래 한 줄로만 관리한다. 지금은 **사내망 초안 페이지**를 가리키는데,
 * 이 주소는 같은 네트워크 안에서만 열린다.
 *
 *   배포 전에는 반드시 프로젝트 안 라우트로 되돌릴 것:
 *     const TEMPERED_GLASS_URL = "/tempered-glass";
 *
 * 그 라우트는 이미 살아 있다(Router.tsx + pages/TemperedGlassPage.tsx).
 */
const TEMPERED_GLASS_URL = "/tempered-glass";

interface Props {
  className?: string;
  children: ReactNode;
}

export function TemperedGlassLink({ className, children }: Props) {
  /* 다른 출처(호스트·포트가 다름)면 react-router 의 <Link> 로는 못 간다 —
     <Link to> 는 값을 앱 안의 경로로 해석하기 때문이다. 그때만 <a> 를 쓴다. */
  if (/^https?:\/\//.test(TEMPERED_GLASS_URL)) {
    return (
      <a href={TEMPERED_GLASS_URL} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={TEMPERED_GLASS_URL} className={className}>
      {children}
    </Link>
  );
}
