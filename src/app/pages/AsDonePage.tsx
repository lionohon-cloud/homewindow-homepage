import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { CheckCircle2, Copy, Check } from 'lucide-react';

export function Component() {
  const navigate = useNavigate();
  const [receptionNo, setReceptionNo] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const no = sessionStorage.getItem('hw_as_done_no');
    const name = sessionStorage.getItem('hw_as_done_name');
    if (!no || !name) {
      navigate('/as', { replace: true });
      return;
    }
    setReceptionNo(no);
    setContractorName(name);
    // 1회용 — clean up so refresh redirects back
    sessionStorage.removeItem('hw_as_done_no');
    sessionStorage.removeItem('hw_as_done_name');
  }, [navigate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receptionNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!receptionNo) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-br from-[#D22727] to-[#b02020] text-white px-6 py-8 text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
            <CheckCircle2 size={36} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[22px] font-extrabold">AS 접수가 완료되었습니다</h1>
          <p className="text-white/80 text-[14px] mt-1">신속히 조치하도록 하겠습니다.</p>
        </div>

        <div className="px-6 py-7 space-y-5">
          <div className="bg-[#f7f7f7] rounded-xl px-4 py-4 text-center">
            <p className="text-[12px] text-[#888] mb-1.5">접수번호</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-[22px] font-extrabold text-[#222] tracking-wider">
                {receptionNo}
              </p>
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e5] hover:border-[#D22727] flex items-center justify-center transition-colors"
                title="접수번호 복사"
              >
                {copied ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} className="text-[#666]" />}
              </button>
            </div>
            <p className="text-[12px] text-[#888] mt-3">
              계약자명: <span className="font-semibold text-[#444]">{contractorName}</span>
            </p>
          </div>

          <div className="bg-[#fff8e1] border border-[#ffd24a] rounded-xl px-4 py-3 text-[12.5px] text-[#7a5800] leading-[1.6]">
            ※ 접수내용을 다시 보거나 수정·취소하실 때는{' '}
            <strong>계약자명과 접수번호 모두</strong>가 필요합니다. 보관해 주세요.
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Link
              to="/as/lookup"
              className="block text-center h-[48px] leading-[48px] bg-[#222] hover:bg-black text-white font-semibold rounded-xl transition-colors"
            >
              접수내역 조회
            </Link>
            <button
              onClick={() => navigate('/')}
              className="h-[48px] bg-white border border-[#e5e5e5] hover:bg-[#f8f8f8] text-[#666] font-semibold rounded-xl transition-colors"
            >
              메인으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
