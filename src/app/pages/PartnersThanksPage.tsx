import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

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
    if (!sessionStorage.getItem('hw_partners_just_submitted')) {
      navigate('/partners', { replace: true });
      return;
    }
    sessionStorage.removeItem('hw_partners_just_submitted');
    setAllowed(true);

    // GA4 lead_confirmed 이벤트 (파트너스 출처 라벨)
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'lead_confirmed', { lead_source: 'partners' });
      }
    } catch {
      /* ignore */
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_confirmed', lead_source: 'partners' });

    // noindex
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
    <section className="bg-[#f4f7fb] min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-20">
      <div className="max-w-md md:max-w-xl w-full text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.45 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1f6fff] mx-auto mb-8 flex items-center justify-center shadow-[0px_10px_20px_0px_rgba(31,111,255,0.27)]"
        >
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black mb-4"
        >
          상담 접수가<br className="sm:hidden" /> 완료되었습니다!
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-['Pretendard',sans-serif] font-medium text-base md:text-lg leading-[1.6] text-[#666] mb-10"
        >
          담당자가 확인 후 연락드리겠습니다
        </motion.p>

        {/* YouTube iframe (반응형 16:9) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full aspect-video rounded-2xl overflow-hidden border border-[#e4eaf2] shadow-[0_8px_30px_rgba(0,0,0,0.06)] mb-10 bg-[#f4f7fb]"
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/5KdfNZi1UC8?rel=0"
            title="청암홈윈도우 파트너 안내 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </motion.div>

        {/* 파트너스 홈으로 돌아가기 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/partners')}
          className="w-full md:w-auto md:px-14 bg-[#1f6fff] text-white font-['Pretendard',sans-serif] font-bold text-lg py-4 rounded-[28px] shadow-[0px_10px_7.3px_0px_rgba(31,111,255,0.27)] hover:bg-[#1557d6] active:bg-[#1557d6] transition-colors cursor-pointer"
        >
          홈으로 돌아가기
        </motion.button>
      </div>
    </section>
  );
}
