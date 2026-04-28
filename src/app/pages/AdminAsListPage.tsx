import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, RefreshCw, Search } from 'lucide-react';
import { AsAuthGuard, getAdminToken } from '@/app/components/AsAuthGuard';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface AsListItem {
  id: string;
  reception_no: string;
  contractor_name: string;
  phone: string;
  address: string;
  email: string;
  status: string;
  created_at: string;
  photos: { path: string }[];
}

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'received', label: '접수 대기' },
  { value: 'scheduled', label: '일정 확정' },
  { value: 'in_progress', label: '처리 중' },
  { value: 'done', label: '처리 완료' },
  { value: 'canceled', label: '취소됨' },
];

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-[#dbeafe] text-[#1e40af]',
  scheduled: 'bg-[#fef3c7] text-[#92400e]',
  in_progress: 'bg-[#fef3c7] text-[#92400e]',
  done: 'bg-[#dcfce7] text-[#166534]',
  canceled: 'bg-[#f3f4f6] text-[#6b7280]',
};

const STATUS_LABEL: Record<string, string> = {
  received: '접수 대기',
  scheduled: '일정 확정',
  in_progress: '처리 중',
  done: '처리 완료',
  canceled: '취소됨',
};

export function Component() {
  return (
    <AsAuthGuard>
      <ListInner />
    </AsAuthGuard>
  );
}

function ListInner() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AsListItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = await getAdminToken();
      if (!token) {
        navigate('/admin/as/login');
        return;
      }
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (q.trim()) params.set('q', q.trim());
      params.set('page', String(page));

      const res = await fetch(`/api/as/admin/list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '조회 실패');
        return;
      }
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPageSize(data.pageSize || 20);
    } catch (e) {
      console.error(e);
      setErrorMsg('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, q, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    const supa = getSupabaseClient();
    await supa.auth.signOut();
    navigate('/admin/as/login', { replace: true });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-white border-b border-[#eee] px-4 py-4 md:px-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-[18px] md:text-[20px] font-extrabold text-[#222]">
            AS 접수 관리
          </h1>
          <button
            onClick={handleLogout}
            className="text-[13px] text-[#666] hover:text-[#D22727] inline-flex items-center gap-1"
          >
            <LogOut size={14} /> 로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
        {/* 필터 */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm mb-4 flex flex-col md:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="h-[42px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="계약자명 / 전화번호 / 접수번호 검색"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  load();
                }
              }}
              className="flex-1 h-[42px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] bg-white focus:border-[#222] outline-none"
            />
            <button
              onClick={() => {
                setPage(0);
                load();
              }}
              className="h-[42px] px-4 bg-[#222] hover:bg-black text-white text-[13px] font-semibold rounded-lg inline-flex items-center gap-1.5"
            >
              <Search size={14} /> 검색
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="h-[42px] w-[42px] border-2 border-[#e5e5e5] hover:bg-[#f8f8f8] rounded-lg flex items-center justify-center disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 결과 */}
        {errorMsg && (
          <div className="bg-[#fff5f5] border border-[#fecaca] text-[#c81e1e] text-[13px] rounded-lg px-4 py-3 mb-4">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#eee]">
                <tr className="text-left text-[#888]">
                  <th className="px-3 py-3 font-semibold">접수번호</th>
                  <th className="px-3 py-3 font-semibold">계약자</th>
                  <th className="px-3 py-3 font-semibold">연락처</th>
                  <th className="px-3 py-3 font-semibold hidden md:table-cell">주소</th>
                  <th className="px-3 py-3 font-semibold">사진</th>
                  <th className="px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3 font-semibold">접수일시</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-[#999]">조회 중...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-[#999]">접수내역이 없습니다.</td></tr>
                )}
                {items.map((it) => (
                  <tr
                    key={it.id}
                    onClick={() => navigate(`/admin/as/${it.id}`)}
                    className="border-b border-[#f3f3f3] hover:bg-[#f8f8f8] cursor-pointer"
                  >
                    <td className="px-3 py-3 font-mono text-[#333]">{it.reception_no}</td>
                    <td className="px-3 py-3 font-semibold text-[#222]">{it.contractor_name}</td>
                    <td className="px-3 py-3 text-[#444]">{it.phone}</td>
                    <td className="px-3 py-3 text-[#666] hidden md:table-cell truncate max-w-[260px]">
                      {it.address}
                    </td>
                    <td className="px-3 py-3 text-[#666]">{it.photos?.length || 0}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[it.status] || 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                        {STATUS_LABEL[it.status] || it.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#666] whitespace-nowrap">
                      {new Date(it.created_at).toLocaleString('ko-KR', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="border-t border-[#eee] px-4 py-3 flex items-center justify-between text-[13px]">
              <span className="text-[#666]">
                전체 {total}건 · {page + 1} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="px-3 py-1.5 border border-[#e5e5e5] rounded-md hover:bg-[#f8f8f8] disabled:opacity-40"
                >
                  이전
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page + 1 >= totalPages || loading}
                  className="px-3 py-1.5 border border-[#e5e5e5] rounded-md hover:bg-[#f8f8f8] disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
