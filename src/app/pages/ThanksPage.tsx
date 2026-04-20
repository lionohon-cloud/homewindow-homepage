import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle } from 'lucide-react';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function Component() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // 보안 가드: 폼 제출 없이 직접 접근 차단
    if (!sessionStorage.getItem('hw_just_submitted')) {
      navigate('/', { replace: true });
      return;
    }
    sessionStorage.removeItem('hw_just_submitted');
    setAllowed(true);

    // GA4 lead_confirmed 이벤트 (gtag + dataLayer 이중 전송)
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'lead_confirmed');
      }
    } catch {
      /* ignore */
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_confirmed' });

    // noindex 메타 태그 동적 삽입
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [navigate]);

  if (!allowed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col items-center justify-center px-6 font-['Pretendard',sans-serif]">
      {/* 상단: 접수 완료 */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#D22727] flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-white text-[24px] md:text-[28px] font-extrabold text-center">
          상담 접수가 완료되었습니다!
        </h1>
        <p className="text-[#999] text-[14px] md:text-[16px] mt-2 text-center">
          전문 상담사가 빠르게 연락드리겠습니다
        </p>
      </div>

      {/* 중앙: YouTube 영상 */}
      <div className="w-full max-w-[640px] mb-8">
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <iframe
            src="https://www.youtube.com/embed/AgwRn5PNW7w?autoplay=1&rel=0&mute=1"
            title="청암홈윈도우 소개"
            className="absolute inset-0 w-full h-full rounded-xl"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>

      {/* 하단: 홈으로 돌아가기 */}
      <button
        onClick={() => navigate('/')}
        className="px-8 py-3.5 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-xl transition-colors"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
