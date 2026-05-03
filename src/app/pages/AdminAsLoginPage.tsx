/**
 * AS 관리자 로그인 — 폐기 안내 (2026-05-03 B안 ERP 단일화).
 *
 * 관리자 로그인은 ERP 시스템 (cahwindow-quote) 의 Google 로그인 사용.
 */
import { ExternalLink } from 'lucide-react';

const ERP_LOGIN_URL = 'https://cahwindow-quote.vercel.app/login';

export default function AdminAsLoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">관리자 로그인 이전</h1>
        <p className="text-[#aaa] mb-6 leading-relaxed">
          AS 관리자 페이지는 ERP 시스템에서 처리됩니다.
          <br />
          ERP 시스템에 Google 계정으로 로그인하세요.
        </p>
        <a
          href={ERP_LOGIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          ERP 시스템 로그인
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}
