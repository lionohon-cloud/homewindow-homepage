/**
 * AS 접수 조회 — 부사장님 정책 (2026-05-03 B안):
 *   상태만 노출. 사진·내용·이메일·주소 등은 노출 X (정보 보호).
 *   수정·취소 기능 폐지 — 관리자 ERP 에서 처리.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';

interface AsLookupResult {
  reception_no: string;
  contractor_name: string;
  status: string;
  status_label: string;
  created_at: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  received: '접수 완료 — 검토 대기',
  scheduled: '일정 확정',
  in_progress: '처리 중',
  done: '처리 완료',
  canceled: '취소됨',
};

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  scheduled: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
  in_progress: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
  done: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  canceled: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
};

export function Component() {
  const navigate = useNavigate();
  const [contractorName, setContractorName] = useState('');
  const [receptionNo, setReceptionNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [record, setRecord] = useState<AsLookupResult | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRecord(null);

    const name = contractorName.trim();
    const no = receptionNo.trim().toUpperCase();
    if (!name || !no) {
      setErrorMsg('계약자명과 접수번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/as/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_name: name, reception_no: no }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '조회 실패');
        return;
      }
      setRecord(data as AsLookupResult);
    } catch (err) {
      console.error(err);
      setErrorMsg('네트워크 오류로 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/as')}
          className="flex items-center gap-2 text-[#888] hover:text-white text-sm mb-6"
        >
          <ArrowLeft size={16} />
          뒤로
        </button>

        <h1 className="text-2xl font-bold mb-2">AS 접수 조회</h1>
        <p className="text-[#888] text-sm mb-6">
          접수 시 받으신 「접수번호」와 「계약자명」을 입력하세요.
        </p>

        <form onSubmit={handleLookup} className="space-y-3 mb-6">
          <div>
            <label className="block text-xs text-[#aaa] mb-1.5">
              계약자명
            </label>
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              disabled={loading}
              placeholder="홍길동"
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white placeholder-[#555] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-[#aaa] mb-1.5">
              접수번호
            </label>
            <input
              type="text"
              value={receptionNo}
              onChange={(e) => setReceptionNo(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="AS-260503-00001"
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white placeholder-[#555] focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
          >
            <Search size={16} />
            {loading ? '조회 중…' : '조회하기'}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/40 rounded-lg px-4 py-3 text-sm text-red-300 mb-4">
            ⚠ {errorMsg}
          </div>
        )}

        {record && (
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="text-center mb-4">
              <p className="text-[12px] text-[#888] mb-1.5">접수번호</p>
              <p className="font-mono text-lg font-bold text-blue-300">
                {record.reception_no}
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-4 mb-4">
              <p className="text-[12px] text-[#888] mb-2">진행 상태</p>
              <div
                className={`inline-block rounded-lg border px-4 py-2 text-base font-bold ${
                  STATUS_COLORS[record.status] ?? STATUS_COLORS.received
                }`}
              >
                {STATUS_LABELS[record.status] ?? record.status_label}
              </div>
            </div>

            {record.created_at && (
              <div className="border-t border-[#2a2a2a] pt-4 text-xs text-[#888]">
                접수일시:{' '}
                <span className="text-white">
                  {new Date(record.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
            )}

            <div className="border-t border-[#2a2a2a] mt-4 pt-4 text-[11px] text-[#666] leading-relaxed">
              ⓘ 접수 내용·사진·처리 상세는 보안상 노출되지 않습니다.
              <br />
              자세한 진행 사항은 청암홈윈도우 (1661-4830) 으로 문의하세요.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
