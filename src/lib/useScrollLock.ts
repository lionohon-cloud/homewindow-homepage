import { useEffect } from "react";

/**
 * 팝업이 떠 있는 동안 뒤 페이지 스크롤을 막는다.
 * html 에 scrollbar-gutter: stable 이 걸려 있어(styles/index.css) 스크롤바가 사라져도 폭이 안 변한다.
 * 팝업이 여러 개 겹칠 수 있어 개수를 세고, 마지막 하나가 닫힐 때만 푼다.
 */
let locks = 0;
let prevOverflow = "";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks === 0) {
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) document.documentElement.style.overflow = prevOverflow;
    };
  }, [active]);
}
