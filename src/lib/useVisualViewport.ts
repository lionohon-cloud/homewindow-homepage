import { useEffect, useState } from "react";

/**
 * 키패드가 올라온 뒤 실제로 보이는 영역.
 *
 * `position: fixed; inset: 0` 은 **레이아웃 뷰포트** 기준이라 키패드가 떠도 높이가
 * 그대로다. 그 안에서 가운데 정렬하면 카드가 화면 한가운데 머물고, 키패드가 아래를
 * 덮으면서 제출 버튼이 잠긴다. `100dvh` 도 브라우저 크롬에는 반응하지만
 * 키패드에는 반응하지 않아 해결이 안 된다.
 *
 * visualViewport 는 키패드만큼 줄어든 실제 표시 영역을 알려준다.
 * 이 값으로 오버레이의 높이와 위치를 잡으면 카드가 항상 보이는 영역 가운데에 온다.
 *
 * 지원하지 않는 환경(구형 브라우저)에서는 null 을 돌려주므로,
 * 호출부는 그때 기존 방식(inset-0)으로 두면 된다.
 */
export interface VisibleArea {
  /** 보이는 영역 높이(px) */
  height: number;
  /** 문서 최상단에서 보이는 영역까지의 거리(px) */
  top: number;
}

export function useVisualViewport(active: boolean): VisibleArea | null {
  const [area, setArea] = useState<VisibleArea | null>(null);

  useEffect(() => {
    if (!active) {
      setArea(null);
      return;
    }
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;

    const update = () => setArea({ height: vv.height, top: vv.offsetTop });
    update();
    // resize = 키패드 열림/닫힘, scroll = 키패드가 뜬 채로 페이지가 밀릴 때
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return area;
}
