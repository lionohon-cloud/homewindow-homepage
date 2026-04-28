import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Search, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

interface AsRecord {
  id: string;
  reception_no: string;
  contractor_name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  photos: { path: string; name: string; size: number; mime: string }[];
  photo_urls: string[];
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: '접수 대기',
  scheduled: '일정 확정',
  in_progress: '처리 중',
  done: '처리 완료',
  canceled: '취소됨',
};

export function Component() {
  const navigate = useNavigate();
  const [contractorName, setContractorName] = useState('');
  const [receptionNo, setReceptionNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [record, setRecord] = useState<AsRecord | null>(null);

  // 수정 모드 상태
  const [editing, setEditing] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRecord(null);
    setEditing(false);

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
      setRecord(data);
      setEditAddress(data.address);
      setEditEmail(data.email);
      setEditDescription(data.description);
    } catch (err) {
      console.error(err);
      setErrorMsg('네트워크 오류로 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!record) return;
    setErrorMsg('');
    setSaving(true);
    try {
      const res = await fetch('/api/as/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_name: record.contractor_name,
          reception_no: record.reception_no,
          address: editAddress,
          email: editEmail,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '수정 실패');
        return;
      }
      setRecord({
        ...record,
        address: editAddress,
        email: editEmail,
        description: editDescription,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('네트워크 오류로 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    if (!window.confirm('정말 접수를 취소하시겠습니까? 다시 되돌릴 수 없습니다.')) return;
    setErrorMsg('');
    setSaving(true);
    try {
      const res = await fetch('/api/as/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_name: record.contractor_name,
          reception_no: record.reception_no,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '취소 실패');
        return;
      }
      setRecord({ ...record, status: 'canceled' });
      setEditing(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('네트워크 오류로 취소에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = record?.status === 'received';

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4 md:py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-[#666] hover:text-[#333] text-[14px] mb-4"
        >
          <ArrowLeft size={16} /> 메인으로
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-[#222] text-white px-6 py-6 md:px-8">
            <h1 className="text-[22px] md:text-[26px] font-extrabold">AS 접수내역 조회</h1>
            <p className="text-[13px] text-white/70 mt-1">계약자명과 접수번호를 모두 입력해 주세요.</p>
          </div>

          <form onSubmit={handleLookup} className="px-6 py-6 md:px-8 md:py-7 space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-[#444] mb-1.5 block">계약자명</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                disabled={loading}
                placeholder="홍길동"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#444] mb-1.5 block">접수번호</label>
              <input
                type="text"
                value={receptionNo}
                onChange={(e) => setReceptionNo(e.target.value.toUpperCase())}
                disabled={loading}
                placeholder="AS-26042800001"
                className={`${inputCls} font-mono tracking-wider`}
              />
            </div>
            {errorMsg && (
              <div className="bg-[#fff5f5] border border-[#fecaca] text-[#c81e1e] text-[13px] rounded-lg px-4 py-3">
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#222] hover:bg-black disabled:bg-[#999] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Search size={16} />
              {loading ? '조회 중...' : '조회하기'}
            </button>
            <div className="text-center text-[13px] text-[#666]">
              <Link to="/as" className="text-[#D22727] underline font-medium">
                새 AS 접수하기
              </Link>
            </div>
          </form>
        </div>

        {/* 결과 */}
        {record && (
          <div className="mt-6 bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-5 md:px-8 border-b border-[#eee] flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#888]">접수번호</p>
                <p className="text-[18px] font-extrabold text-[#222] tracking-wider font-mono">
                  {record.reception_no}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                  record.status === 'received'
                    ? 'bg-[#dbeafe] text-[#1e40af]'
                    : record.status === 'done'
                    ? 'bg-[#dcfce7] text-[#166534]'
                    : record.status === 'canceled'
                    ? 'bg-[#f3f4f6] text-[#6b7280]'
                    : 'bg-[#fef3c7] text-[#92400e]'
                }`}
              >
                {STATUS_LABELS[record.status] || record.status}
              </span>
            </div>

            <div className="px-6 py-5 md:px-8 space-y-4">
              <Row label="계약자명" value={record.contractor_name} />
              <Row label="연락처" value={record.phone} />

              <Row label="주소">
                {editing ? (
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <span>{record.address}</span>
                )}
              </Row>

              <Row label="이메일">
                {editing ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <span>{record.email}</span>
                )}
              </Row>

              <Row label="AS 상세내용">
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className={`${inputCls} resize-none`}
                  />
                ) : (
                  <span className="whitespace-pre-wrap">{record.description}</span>
                )}
              </Row>

              {record.photos.length > 0 && (
                <Row label={`첨부 사진 (${record.photos.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {record.photo_urls.map((url, i) =>
                      url ? (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-20 h-20 rounded-lg overflow-hidden border border-[#e5e5e5] hover:border-[#D22727]"
                        >
                          <img src={url} alt={record.photos[i]?.name || ''} className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <div
                          key={i}
                          className="w-20 h-20 rounded-lg border border-[#e5e5e5] flex items-center justify-center text-[#ccc]"
                        >
                          <ImageIcon size={24} />
                        </div>
                      )
                    )}
                  </div>
                </Row>
              )}

              <Row label="접수일시" value={new Date(record.created_at).toLocaleString('ko-KR')} />
            </div>

            <div className="px-6 py-4 md:px-8 bg-[#fafafa] border-t border-[#eee]">
              {!canEdit && record.status !== 'canceled' && (
                <p className="text-[13px] text-[#666] text-center">
                  이미 처리가 시작되어 수정·취소할 수 없습니다. 담당자에게 연락해 주세요.
                </p>
              )}
              {canEdit && !editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 h-[44px] bg-[#222] hover:bg-black text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit size={14} /> 수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 h-[44px] bg-white border border-[#fecaca] text-[#c81e1e] hover:bg-[#fff5f5] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} /> 접수 취소
                  </button>
                </div>
              )}
              {editing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 h-[44px] bg-[#D22727] hover:bg-[#b02020] disabled:bg-[#ccc] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save size={14} /> {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditAddress(record.address);
                      setEditEmail(record.email);
                      setEditDescription(record.description);
                    }}
                    disabled={saving}
                    className="flex-1 h-[44px] bg-white border border-[#e5e5e5] hover:bg-[#f8f8f8] text-[#666] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <X size={14} /> 취소
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-[44px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] text-[#222] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]';

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4">
      <p className="text-[12px] text-[#888] md:w-[120px] md:pt-1 md:flex-shrink-0">{label}</p>
      <div className="text-[14px] text-[#333] flex-1">{children ?? value}</div>
    </div>
  );
}
