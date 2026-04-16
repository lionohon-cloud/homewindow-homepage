import { useState, useEffect } from 'react';
import { CHANNEL_MASTER, type Channel } from '@/lib/channelMap';
import { Copy, QrCode, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

const LS_KEY = 'hw_utm_history';
const BASE_URL = 'https://homewindow.kr/';
const MAX_HISTORY = 50;

interface HistoryItem {
  id: string;
  createdAt: string;
  channel: string;
  campaign: string;
  url: string;
}

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export function Component() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [term, setTerm] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  // noindex 메타
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const handleGenerate = () => {
    if (!selectedChannel || !campaign.trim()) return;

    const params = new URLSearchParams();
    params.set('utm_source', selectedChannel.utm_source);
    params.set('utm_medium', selectedChannel.utm_medium);
    params.set('utm_campaign', campaign.trim());
    if (content.trim()) params.set('utm_content', content.trim());
    if (term.trim()) params.set('utm_term', term.trim());

    const url = `${BASE_URL}?${params.toString()}`;
    setGeneratedUrl(url);
    setQrUrl('');
    setCopied(false);

    // 이력 저장
    const item: HistoryItem = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString('ko-KR'),
      channel: selectedChannel.label,
      campaign: campaign.trim(),
      url,
    };
    const updated = [item, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQr = () => {
    if (!generatedUrl) return;
    // Google Chart API는 2024년 종료됨 → api.qrserver.com 사용 (무료, CORS 허용)
    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedUrl)}`
    );
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-['Pretendard',sans-serif]">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-extrabold text-[#333] mb-2">UTM 링크 생성기</h1>
          <p className="text-[#888] text-[14px]">마케팅 캠페인별 추적 URL을 생성하세요</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 md:p-8 mb-8">
          {/* 채널 선택 */}
          <div className="mb-5">
            <label className="block text-[13px] font-bold text-[#555] mb-2">
              채널 선택 <span className="text-[#D22727]">*</span>
            </label>
            <select
              value={selectedChannel ? `${selectedChannel.utm_source}|${selectedChannel.utm_medium}` : ''}
              onChange={(e) => {
                const [src, med] = e.target.value.split('|');
                const ch = CHANNEL_MASTER.find((c) => c.utm_source === src && c.utm_medium === med) || null;
                setSelectedChannel(ch);
              }}
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#D22727] bg-white"
            >
              <option value="">-- 채널을 선택하세요 --</option>
              {CHANNEL_MASTER.map((ch) => (
                <option key={`${ch.utm_source}|${ch.utm_medium}`} value={`${ch.utm_source}|${ch.utm_medium}`}>
                  {ch.label} ({ch.note})
                </option>
              ))}
            </select>
          </div>

          {/* utm_source / utm_medium (readonly) */}
          {selectedChannel && (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[12px] text-[#888] mb-1">utm_source</label>
                <input readOnly value={selectedChannel.utm_source} className="w-full border border-[#e5e5e5] rounded-lg px-4 py-2.5 text-[13px] bg-[#f7f7f5] text-[#888]" />
              </div>
              <div>
                <label className="block text-[12px] text-[#888] mb-1">utm_medium</label>
                <input readOnly value={selectedChannel.utm_medium} className="w-full border border-[#e5e5e5] rounded-lg px-4 py-2.5 text-[13px] bg-[#f7f7f5] text-[#888]" />
              </div>
            </div>
          )}

          {/* 캠페인명 */}
          <div className="mb-5">
            <label className="block text-[13px] font-bold text-[#555] mb-2">
              캠페인명 (utm_campaign) <span className="text-[#D22727]">*</span>
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="예: 2026_04_spring_promo"
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#D22727]"
            />
          </div>

          {/* 소재명 */}
          <div className="mb-5">
            <label className="block text-[13px] font-bold text-[#555] mb-2">소재명 (utm_content)</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: banner_a"
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#D22727]"
            />
          </div>

          {/* 키워드 */}
          <div className="mb-6">
            <label className="block text-[13px] font-bold text-[#555] mb-2">키워드 (utm_term)</label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="검색광고에만 사용"
              className="w-full border border-[#e5e5e5] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#D22727]"
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={!selectedChannel || !campaign.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[15px] rounded-xl transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            링크 생성
          </button>

          {/* 결과 */}
          {generatedUrl && (
            <div className="mt-6 p-4 bg-[#f7f7f5] rounded-xl border border-[#e5e5e5]">
              <p className="text-[12px] text-[#888] mb-2 font-bold">생성된 URL</p>
              <div className="flex items-start gap-2">
                <p className="flex-1 text-[13px] text-[#333] break-all font-mono leading-relaxed">{generatedUrl}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleCopy(generatedUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#333] text-white text-[13px] font-bold rounded-lg hover:bg-[#555] transition-colors"
                >
                  <Copy size={14} />
                  {copied ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={handleQr}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#e5e5e5] text-[#333] text-[13px] font-bold rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  <QrCode size={14} />
                  QR 생성
                </button>
              </div>
              {qrUrl && (
                <div className="mt-4 flex justify-center">
                  <img src={qrUrl} alt="QR Code" className="w-[200px] h-[200px] rounded-lg border border-[#e5e5e5]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 이력 */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 md:p-8">
            <h2 className="text-[16px] font-bold text-[#333] mb-4 flex items-center gap-2">
              <LinkIcon size={16} />
              생성 이력 ({history.length})
            </h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-[#f7f7f5] rounded-lg border border-[#eee]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-bold text-[#D22727] bg-[#fff0f0] px-2 py-0.5 rounded">{item.channel}</span>
                      <span className="text-[11px] text-[#aaa]">{item.createdAt}</span>
                    </div>
                    <p className="text-[12px] text-[#666] mb-1">{item.campaign}</p>
                    <p className="text-[11px] text-[#999] break-all font-mono">{item.url}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(item.url)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] hover:bg-[#eee] transition-colors"
                      title="복사"
                    >
                      <Copy size={13} className="text-[#666]" />
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e5e5] hover:bg-[#fee] transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={13} className="text-[#D22727]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
