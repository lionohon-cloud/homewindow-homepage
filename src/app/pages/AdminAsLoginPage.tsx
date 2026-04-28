import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export function Component() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 이미 로그인됐으면 목록으로
  useEffect(() => {
    (async () => {
      try {
        const supa = getSupabaseClient();
        const { data } = await supa.auth.getSession();
        if (data.session) navigate('/admin/as', { replace: true });
      } catch {
        /* env 없을 수도 있음 — 로그인 폼 보이기 */
      }
    })();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const supa = getSupabaseClient();
      const { error } = await supa.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      navigate('/admin/as', { replace: true });
    } catch (e) {
      console.error(e);
      setErrorMsg(
        '로그인에 실패했습니다. Supabase 환경변수가 누락됐을 수 있습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-[#222] text-white px-6 py-6 text-center">
          <h1 className="text-[20px] font-extrabold">AS 관리자 로그인</h1>
          <p className="text-[12px] text-white/60 mt-1">청암홈윈도우 내부용</p>
        </div>
        <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-[#444] block mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={loading}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-[#444] block mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
              className={inputCls}
            />
          </div>
          {errorMsg && (
            <div className="bg-[#fff5f5] border border-[#fecaca] text-[#c81e1e] text-[13px] rounded-lg px-3 py-2.5">
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#222] hover:bg-black disabled:bg-[#999] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn size={16} />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-[44px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] text-[#222] bg-white focus:border-[#222] outline-none transition-colors disabled:bg-[#f5f5f5]';
