import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import AppLayout from './AppLayout';
import HomePage from './pages/HomePage';

// 새 배포로 옛 청크 해시가 사라졌을 때, 사용자 브라우저가 옛 HTML을 캐시 중이면
// "Failed to fetch dynamically imported module" 에러가 남.
// 해결: 청크 import 실패 시 1회만 hard reload 해서 새 HTML/청크 받게 함.
// sessionStorage 플래그로 무한루프 방지.
const RELOAD_FLAG = 'hw_chunk_reload';
function lazyWithRetry<T extends () => Promise<unknown>>(factory: T): T {
  return (async () => {
    try {
      return await factory();
    } catch (err) {
      const isChunkError =
        err instanceof TypeError &&
        /dynamically imported module|Importing a module script failed/i.test(
          err.message,
        );
      if (isChunkError && !sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        return new Promise(() => {}); // 리로드 동안 대기
      }
      throw err;
    }
  }) as T;
}

// 정상 로드되면 reload 플래그 클리어 (다음 배포 때 다시 동작하도록)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    sessionStorage.removeItem(RELOAD_FLAG);
  });
}

function ChunkErrorBoundary() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Pretendard, sans-serif',
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        일시적인 오류가 발생했습니다
      </h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.removeItem(RELOAD_FLAG);
          window.location.reload();
        }}
        style={{
          padding: '12px 24px',
          background: '#d22727',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        새로고침
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ChunkErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'thanks',
        lazy: lazyWithRetry(() => import('./pages/ThanksPage')),
      },
      /* 260907 통합버전 — 강화유리 상세페이지 라우트를 뺐다.
         그 본문은 메인(HomePage)의 <TemperedSections /> 로 들어가 있다. */
      /* 히어로 시안 비교용. 개발 서버에서만 등록되므로 빌드 산출물에는 들어가지 않는다. */
      ...(import.meta.env.DEV
        ? [
            {
              path: 'hero-lab',
              lazy: lazyWithRetry(() => import('./pages/HeroLabPage')),
            },
            /* 히어로 배경 영상 시안 비교. GNB · 히어로 · 하단 CTA 만 올린다. */
            {
              path: 'video-lab',
              lazy: lazyWithRetry(() => import('./pages/HeroVideoLabPage')),
            },
            /* 히어로 문구 시안 비교. 배경 영상·레이아웃은 고정, 글자만 바뀐다. */
            {
              path: 'copy-lab',
              lazy: lazyWithRetry(() => import('./pages/HeroCopyLabPage')),
            },
            /* 히어로 다음 섹션(강화유리가 드물었던 이유) 레이아웃 시안 비교 */
            {
              path: 'section-lab',
              lazy: lazyWithRetry(() => import('./pages/SectionLabPage')),
            },
            /* E안 스크롤 스토리의 진행 방식 비교 (신호형 · 장면별 멈춤 · 추천 조합). */
            {
              path: 'scroll-lab',
              lazy: lazyWithRetry(() => import('./pages/HeroScrollLabPage')),
            },
          ]
        : []),
      {
        path: 'partners',
        lazy: lazyWithRetry(() => import('./pages/PartnersPage')),
      },
      {
        path: 'partners/thanks',
        lazy: lazyWithRetry(() => import('./pages/PartnersThanksPage')),
      },
      {
        path: 'faq',
        lazy: lazyWithRetry(() => import('./pages/FaqPage')),
      },
      {
        path: 'faq/general',
        lazy: lazyWithRetry(() => import('./pages/FaqGeneralPage')),
      },
      /* 260923 가맹전환 — 개인정보처리방침 (푸터 · 상담 동의 모달에서 연결) */
      {
        path: 'privacy',
        lazy: lazyWithRetry(() => import('./pages/PrivacyPolicyPage')),
      },
      {
        path: 'as',
        lazy: lazyWithRetry(() => import('./pages/AsReceptionPage')),
      },
      {
        path: 'as/done',
        lazy: lazyWithRetry(() => import('./pages/AsDonePage')),
      },
      {
        path: 'as/lookup',
        lazy: lazyWithRetry(() => import('./pages/AsLookupPage')),
      },
      {
        path: 'admin/as/login',
        lazy: lazyWithRetry(() => import('./pages/AdminAsLoginPage')),
      },
      {
        path: 'admin/as',
        lazy: lazyWithRetry(() => import('./pages/AdminAsListPage')),
      },
      {
        path: 'admin/as/:id',
        lazy: lazyWithRetry(() => import('./pages/AdminAsDetailPage')),
      },
      {
        path: 'admin/utm',
        lazy: lazyWithRetry(() => import('./pages/AdminUtmPage')),
      },
      {
        path: 'admin/dashboard',
        lazy: lazyWithRetry(() => import('./pages/AdminDashboardPage')),
      },
      {
        path: 'review/new',
        lazy: lazyWithRetry(() => import('./pages/ReviewNewPage')),
      },
      {
        path: 'review/type',
        lazy: lazyWithRetry(() => import('./pages/ReviewTypePage')),
      },
      {
        path: 'review/write',
        lazy: lazyWithRetry(() => import('./pages/ReviewWritePage')),
      },
      {
        path: 'review/done',
        lazy: lazyWithRetry(() => import('./pages/ReviewDonePage')),
      },
      {
        path: 'review',
        lazy: lazyWithRetry(() => import('./pages/ReviewListPage')),
      },
      {
        path: 'review/:id',
        lazy: lazyWithRetry(() => import('./pages/ReviewDetailPage')),
      },
      {
        path: 'admin/reviews',
        lazy: lazyWithRetry(() => import('./pages/AdminReviewListPage')),
      },
      {
        path: 'admin/reviews/:id',
        lazy: lazyWithRetry(() => import('./pages/AdminReviewDetailPage')),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
