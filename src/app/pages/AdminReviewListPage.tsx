/**
 * 후기 관리자 페이지 — ERP 이전 안내.
 *
 * 부사장님 결정 (AS와 동일 패턴): 후기 승인/거절 관리도 ERP (cahwindow-quote) 에서 처리.
 * 홈페이지는 작성 플로우와 공개용 API 호출만 담당.
 */
import { ExternalLink } from "lucide-react";

const ERP_REVIEW_URL = "https://cahwindow-quote.pages.dev/admin/reviews";

export function Component() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-bold mb-3">후기 관리 시스템 안내</h1>
        <p className="text-[#aaa] mb-6 leading-relaxed">
          후기 승인/거절/수정은 청암홈윈도우 ERP에서 처리합니다.
          <br />
          아래 링크에서 진행해 주세요.
        </p>
        <a
          href={ERP_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#b8945a] hover:bg-[#a07f48] text-[#1a1210] font-bold px-6 py-3 rounded-lg transition"
        >
          ERP 후기 관리로 이동
          <ExternalLink size={18} />
        </a>
        <p className="text-xs text-[#666] mt-6">
          신규 후기 접수 시 관리자에게 알림이 발송됩니다.
        </p>
      </div>
    </div>
  );
}
