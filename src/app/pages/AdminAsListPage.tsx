/**
 * AS 관리자 목록 — 폐기 안내 (2026-05-03 B안 ERP 단일화).
 *
 * 부사장님 결정: AS 관리는 ERP 시스템 (cahwindow-quote) 으로 일원화.
 * 본 페이지는 더 이상 사용하지 않음. 외부 링크 안내만.
 */
import { ExternalLink } from 'lucide-react';

const ERP_AS_URL = 'https://cahwindow-quote.pages.dev/admin/support';

export default function AdminAsListPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold mb-3">AS 관리 시스템 이전 안내</h1>
        <p className="text-[#aaa] mb-6 leading-relaxed">
          AS 접수 관리는 청암홈윈도우 ERP 시스템으로 통합되었습니다.
          <br />
          아래 링크에서 처리해주세요.
        </p>
        <a
          href={ERP_AS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          ERP AS 관리 페이지로 이동
          <ExternalLink size={18} />
        </a>
        <p className="text-xs text-[#666] mt-6">
          신규 접수 시 「📬 AS 알림」 체크된 사용자에게 메시지함 알림이
          자동 발송됩니다.
        </p>
      </div>
    </div>
  );
}
