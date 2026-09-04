import type { ReactNode } from "react";
import { Link } from "react-router";

/**
 * 강화유리 상세페이지로 가는 링크. 히어로(모바일·PC)와 강화유리 섹션이 같이 쓴다.
 *
 * 목적지를 아래 한 줄로만 관리한다.
 *
 * 260904 상시버전: 프로젝트 안 라우트를 본다(Router.tsx + pages/TemperedGlassPage.tsx).
 * 그 페이지는 행사 문구를 걷어낸 상시버전이다. 사내망 초안(4190)은 행사 문구가
 * 그대로 살아 있는 이관 전 원본이라, 여기서 그쪽을 가리키면 안 된다.
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
