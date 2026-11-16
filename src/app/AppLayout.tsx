import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { initUtm } from '@/lib/utm';
import { scrollToSection } from '@/lib/scrollToSection';

/**
 * 최상위 레이아웃: UTM 초기화 + Outlet
 * 모든 라우트(/,  /thanks, /admin/utm 등)에서 공통 실행
 */
export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    initUtm();
  }, []);

  // 다른 페이지에서 메인으로 돌아왔을 때 sessionStorage에 저장된 섹션으로 스크롤
  useEffect(() => {
    if (location.pathname === '/') {
      const targetId = sessionStorage.getItem('hw_scroll_to');
      if (targetId) {
        sessionStorage.removeItem('hw_scroll_to');
        // DOM 렌더링 후 스크롤. 261116 — 가맹점 목록처럼 데이터를 받아 늦게 생기는 요소도 있어 최대 5초 기다리고,
        // 가는 도중 위쪽 이미지가 불러와져 밀려도 끝까지 따라가는 scrollToSection 을 쓴다(offsetTop 은 섹션 안쪽 요소에선 틀림)
        const started = Date.now();
        const tryScroll = () => {
          const el = document.getElementById(targetId);
          if (el) scrollToSection(el, { offset: 72 });
          else if (Date.now() - started < 5000) setTimeout(tryScroll, 200);
        };
        setTimeout(tryScroll, 300);
      }
    }
  }, [location.pathname]);

  return (
    <>
      {/* 새 이동(PUSH)은 최상단, 뒤로가기(POP)는 이전 위치 복원 */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
