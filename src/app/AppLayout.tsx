import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { initUtm } from '@/lib/utm';

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
        // DOM 렌더링 후 스크롤
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, [location.pathname]);

  return <Outlet />;
}
