/**
 * AS 관리자 상세 — 폐기 안내 (2026-05-03 B안 ERP 단일화).
 */
import { ExternalLink } from 'lucide-react';
import { useParams } from 'react-router';

const ERP_AS_BASE = 'https://cahwindow-quote.pages.dev/admin/support';

export default function AdminAsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const erpUrl = id ? `${ERP_AS_BASE}/${encodeURIComponent(id)}` : ERP_AS_BASE;
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold mb-3">ERP 시스템에서 처리됩니다</h1>
        <p className="text-[#aaa] mb-6 leading-relaxed">
          AS 접수의 상세 조회·처리는 ERP 시스템에서 진행해주세요.
        </p>
        <a
          href={erpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          ERP 에서 열기
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}
