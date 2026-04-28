import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { AsAuthGuard, getAdminToken } from '@/app/components/AsAuthGuard';

interface AsDetail {
  id: string;
  reception_no: string;
  contractor_name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  status: string;
  admin_memo: string | null;
  photos: { path: string; name: string; size: number; mime: string }[];
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: 'received', label: '접수 대기' },
  { value: 'scheduled', label: '일정 확정' },
  { value: 'in_progress', label: '처리 중' },
  { value: 'done', label: '처리 완료' },
  { value: 'canceled', label: '취소됨' },
];

export function Component() {
  return (
    <AsAuthGuard>
      <DetailInner />
    </AsAuthGuard>
  );
}

function DetailInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const token = await getAdminToken();
        if (!token) {
          navigate('/admin/as/login');
          return;
        }
        const res = await fetch(`/api/as/admin/get?id=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || '조회 실패');
          return;
        }
        const found = data as AsDetail;
        setRecord(found);
        setStatus(found.status);
        setMemo(found.admin_memo || '');

        // 사진 signed URL
        const urls: string[] = [];
        for (const p of found.photos || []) {
          try {
            const r = await fetch(`/api/as/admin/photo-url?path=${encodeURIComponent(p.path)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            urls.push(r.ok ? d.url : '');
          } catch {
            urls.push('');
          }
        }
        setPhotoUrls(urls);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const token = await getAdminToken();
      if (!token) {
        navigate('/admin/as/login');
        return;
      }
      const res = await fetch('/api/as/admin/update', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: record.id, status, admin_memo: memo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '저장 실패');
        return;
      }
      setRecord({ ...record, status, admin_memo: memo });
    } catch (e) {
      console.error(e);
      setErrorMsg('네트워크 오류');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center text-[#999] text-[14px]">
        조회 중...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <button
            onClick={() => navigate('/admin/as')}
            className="inline-flex items-center gap-1 text-[#666] mb-4"
          >
            <ArrowLeft size={16} /> 목록으로
          </button>
          <p className="text-[#999]">{errorMsg || '접수내역을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/admin/as')}
          className="inline-flex items-center gap-1 text-[#666] hover:text-[#333] text-[14px] mb-4"
        >
          <ArrowLeft size={16} /> 목록으로
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-[#222] text-white px-6 py-5 md:px-8 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/60">접수번호</p>
              <p className="text-[20px] font-extrabold tracking-wider font-mono">
                {record.reception_no}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-white/60">접수일시</p>
              <p className="text-[13px]">
                {new Date(record.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8 space-y-4 border-b border-[#eee]">
            <Row label="계약자명" value={record.contractor_name} />
            <Row label="연락처">
              <a href={`tel:${record.phone}`} className="text-[#D22727] underline font-semibold">
                {record.phone}
              </a>
            </Row>
            <Row label="이메일">
              <a href={`mailto:${record.email}`} className="text-[#D22727] underline">
                {record.email}
              </a>
            </Row>
            <Row label="주소" value={record.address} />
            <Row label="AS 상세내용">
              <div className="whitespace-pre-wrap bg-[#fafafa] rounded-lg px-3 py-2.5 text-[13.5px] text-[#333] leading-[1.7]">
                {record.description}
              </div>
            </Row>
            {record.photos.length > 0 && (
              <Row label={`첨부 사진 (${record.photos.length})`}>
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url, i) =>
                    url ? (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-24 h-24 rounded-lg overflow-hidden border border-[#e5e5e5] hover:border-[#D22727]"
                      >
                        <img src={url} alt={record.photos[i]?.name || ''} className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div
                        key={i}
                        className="w-24 h-24 rounded-lg border border-[#e5e5e5] flex items-center justify-center text-[#ccc]"
                      >
                        <ImageIcon size={24} />
                      </div>
                    )
                  )}
                </div>
              </Row>
            )}
          </div>

          {/* 관리자 영역 */}
          <div className="px-6 py-6 md:px-8 bg-[#fafafa] space-y-4">
            <h3 className="text-[14px] font-bold text-[#222]">관리자 영역</h3>
            <Row label="상태">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
                className="h-[42px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="관리자 메모">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={saving}
                rows={4}
                maxLength={4000}
                placeholder="처리 일정, 담당자 노트 등"
                className="w-full px-3 py-2.5 border-2 border-[#e5e5e5] rounded-lg text-[14px] bg-white focus:border-[#222] outline-none resize-none"
              />
            </Row>
            {errorMsg && (
              <div className="bg-[#fff5f5] border border-[#fecaca] text-[#c81e1e] text-[13px] rounded-lg px-4 py-3">
                {errorMsg}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-[48px] bg-[#D22727] hover:bg-[#b02020] disabled:bg-[#ccc] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={16} /> {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4">
      <p className="text-[12px] text-[#888] md:w-[110px] md:pt-1.5 md:flex-shrink-0">{label}</p>
      <div className="text-[14px] text-[#333] flex-1">{children ?? value}</div>
    </div>
  );
}
