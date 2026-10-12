/**
 * 섹션으로 부드럽게 스크롤하되, 가는 도중에 위치가 바뀌어도 끝까지 따라간다.
 *
 * 260928 — GNB·왼쪽 인디케이터로 "15년 보증"을 누르면 가끔 "원데이 시공"에서 멈추던 문제.
 * 처음 누를 때의 위치만 기억하고 스크롤하는데, 지나가는 동안 위쪽 섹션의 지연 로딩 이미지가
 * 불러와지며 페이지가 길어져(측정: 약 900px) 목표가 아래로 밀려났다.
 * 이미지가 이미 다 불러와져 있으면 정상 이동해서 "가끔"으로 보였다.
 *
 * 스크롤이 멈췄는데 목표가 화면 맨 위에 없으면 다시 스크롤한다.
 * 도착한 뒤에도 잠깐(0.6초) 지켜보다가 위에서 밀리면 한 번 더 맞춘다.
 */
export function scrollToSection(el: HTMLElement, opts: { offset?: number; maxMs?: number } = {}) {
  const offset = opts.offset ?? 0;
  const deadline = performance.now() + (opts.maxMs ?? 5000);
  const targetY = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  const go = () => window.scrollTo({ top: targetY(), behavior: "smooth" });

  // 이동 중에 사용자가 직접 스크롤하면 따라가기를 멈춘다 (사용자와 싸우지 않게)
  let cancelled = false;
  const cancel = () => { cancelled = true; };
  const evs = ["wheel", "touchstart", "keydown"] as const;
  evs.forEach((e) => window.addEventListener(e, cancel, { passive: true, once: true }));
  const cleanup = () => evs.forEach((e) => window.removeEventListener(e, cancel));

  go();
  let lastY = -1;
  let stillFrames = 0;   // 스크롤이 멈춰 있는 프레임 수
  let settledAt = 0;     // 목표에 도착한 시각
  const tick = () => {
    if (cancelled || performance.now() > deadline) return cleanup();
    const off = Math.abs(el.getBoundingClientRect().top - offset);
    const y = window.scrollY;
    stillFrames = Math.abs(y - lastY) < 1 ? stillFrames + 1 : 0;
    lastY = y;

    if (off <= 2) {
      if (!settledAt) settledAt = performance.now();
      if (performance.now() - settledAt > 600) return cleanup(); // 자리 잡음
    } else {
      settledAt = 0;
      // 스크롤이 멈췄는데(또는 페이지 끝이라 더 못 가는 경우 제외) 목표와 어긋나 있으면 다시 이동
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
      if (stillFrames >= 6 && !atBottom) {
        stillFrames = 0;
        go();
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
