/**
 * AS 관리자 페이지 인증 가드.
 * Supabase 세션 확인 후 통과/리다이렉트.
 */
import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { getSupabaseClient } from '@/lib/supabaseClient';

export function AsAuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const supa = getSupabaseClient();
        const { data } = await supa.auth.getSession();
        if (canceled) return;
        if (data.session) {
          setAllowed(true);
        } else {
          navigate('/admin/as/login', { replace: true });
        }
      } catch (e) {
        console.error('[AsAuthGuard]', e);
        navigate('/admin/as/login', { replace: true });
      } finally {
        if (!canceled) setChecking(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center text-[#999] text-[14px]">
        인증 확인 중...
      </div>
    );
  }

  if (!allowed) return null;
  return <>{children}</>;
}

/**
 * 현재 세션의 access token을 가져온다. 없으면 null.
 */
export async function getAdminToken(): Promise<string | null> {
  try {
    const supa = getSupabaseClient();
    const { data } = await supa.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}
