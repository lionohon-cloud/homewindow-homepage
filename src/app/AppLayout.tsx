import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { initUtm } from '@/lib/utm';

/**
 * 최상위 레이아웃: UTM 초기화 + Outlet
 * 모든 라우트(/,  /thanks, /admin/utm)에서 공통 실행
 */
export default function AppLayout() {
  useEffect(() => {
    initUtm();
  }, []);

  return <Outlet />;
}
