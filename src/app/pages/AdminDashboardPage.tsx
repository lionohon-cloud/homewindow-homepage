import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, UserPlus, Activity, Clock, Eye, Target,
  TrendingUp, TrendingDown, Minus, RefreshCw,
} from 'lucide-react';

type Period = 'today' | '7d' | '30d' | '90d';

const PERIOD_LABELS: Record<Period, string> = {
  today: '오늘',
  '7d': '7일',
  '30d': '30일',
  '90d': '90일',
};

const LS_CACHE_KEY = 'hw_dashboard_cache';
const LS_TTL_MS = 5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────
interface OverviewMetric {
  current: number;
  previous: number;
  changePct: number | null;
}

interface DashboardData {
  period: Period;
  overview: {
    totalUsers: OverviewMetric;
    newUsers: OverviewMetric;
    sessions: OverviewMetric;
    averageSessionDuration: OverviewMetric;
    screenPageViews: OverviewMetric;
    conversions: OverviewMetric;
  };
  dailyTrend: Array<{ date: string; users: number; sessions: number }>;
  channels: Array<{ channel: string; sessions: number }>;
  regions: Array<{ region: string; users: number; sessions: number; avgDurationSec: number }>;
  cities: Array<{ city: string; users: number; sessions: number; avgDurationSec: number }>;
  devices: Array<{ device: string; sessions: number }>;
  hours: Array<{ hour: number; sessions: number }>;
  pages: Array<{ path: string; pageviews: number; users: number; avgDurationSec: number }>;
  entryForms: Array<{ leadSource: string; count: number }>;
  generatedAt: string;
  cached?: boolean;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────
function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

function formatDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}시`;
}

const DEVICE_LABEL: Record<string, string> = {
  desktop: 'PC',
  mobile: '모바일',
  tablet: '태블릿',
};

const CHART_COLORS = ['#D22727', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

// ─────────────────────────────────────────────────────────────
// KPI 카드
// ─────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  changePct,
  unit = '',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  changePct: number | null;
  unit?: string;
}) {
  const TrendIcon =
    changePct === null ? Minus : changePct > 0 ? TrendingUp : changePct < 0 ? TrendingDown : Minus;
  const trendColor =
    changePct === null
      ? 'text-gray-400'
      : changePct > 0
      ? 'text-emerald-600'
      : changePct < 0
      ? 'text-red-500'
      : 'text-gray-400';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#D22727]/10 flex items-center justify-center">
          <Icon size={18} className="text-[#D22727]" />
        </div>
        {changePct !== null && (
          <div className={`flex items-center gap-1 text-[12px] font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {Math.abs(changePct).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[13px] text-gray-500 mb-1">{label}</p>
      <p className="text-[22px] font-extrabold text-gray-900">
        {value}
        {unit && <span className="text-[14px] font-semibold text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 차트 블록 (공통 래퍼)
// ─────────────────────────────────────────────────────────────
function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export function Component() {
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // noindex 메타
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = '유입분석 대시보드 - 청암홈윈도우';
    return () => {
      meta.remove();
    };
  }, []);

  // 데이터 로드
  const load = async (p: Period, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // localStorage 5분 캐시
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(`${LS_CACHE_KEY}_${p}`);
        if (raw) {
          const { at, data: cached } = JSON.parse(raw);
          if (Date.now() - at < LS_TTL_MS) {
            setData(cached);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: p }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setData(json);
      localStorage.setItem(`${LS_CACHE_KEY}_${p}`, JSON.stringify({ at: Date.now(), data: json }));
    } catch (e: any) {
      setError(e?.message || '데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] md:text-[24px] font-extrabold text-gray-900">유입분석 대시보드</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              GA4 Data API 연동 ·{' '}
              {data?.generatedAt
                ? `갱신 ${new Date(data.generatedAt).toLocaleString('ko-KR')}`
                : '데이터 로드 중'}
              {data?.cached && ' (캐시)'}
            </p>
          </div>
          <button
            onClick={() => load(period, true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* 기간 선택 */}
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 pb-4 flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                period === p
                  ? 'bg-[#D22727] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-5 md:px-10 pt-6 space-y-6">
        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-[14px] text-red-700 font-semibold mb-2">데이터를 불러올 수 없습니다</p>
            <p className="text-[12px] text-red-600 mb-3">{error}</p>
            <button
              onClick={() => load(period, true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold rounded-lg"
            >
              재시도
            </button>
            <p className="text-[11px] text-red-500 mt-3">
              * 환경변수(GA4_PROPERTY_ID / GA4_SERVICE_ACCOUNT_EMAIL / GA4_PRIVATE_KEY) 설정 여부를 확인하세요.
            </p>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {loading && !data && <DashboardSkeleton />}

        {/* 본문 */}
        {data && <DashboardContent data={data} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[120px] bg-white rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="h-[300px] bg-white rounded-xl border border-gray-200 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[300px] bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="h-[300px] bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 본문 (데이터 바인딩)
// ─────────────────────────────────────────────────────────────
function DashboardContent({ data }: { data: DashboardData }) {
  const { overview } = data;

  const devicesWithLabel = useMemo(
    () => data.devices.map((d) => ({ ...d, deviceLabel: DEVICE_LABEL[d.device] || d.device })),
    [data.devices]
  );

  // 시간대: 0~23 전부 채우기 (없는 시간은 0)
  const hoursFilled = useMemo(() => {
    const map = new Map(data.hours.map((h) => [h.hour, h.sessions]));
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: formatHour(i),
      sessions: map.get(i) || 0,
    }));
  }, [data.hours]);

  const totalDeviceSessions = useMemo(
    () => data.devices.reduce((a, b) => a + b.sessions, 0),
    [data.devices]
  );

  return (
    <>
      {/* KPI 카드 6개 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={Users}
          label="총 방문자"
          value={formatNumber(overview.totalUsers.current)}
          changePct={overview.totalUsers.changePct}
        />
        <KpiCard
          icon={UserPlus}
          label="신규 방문자"
          value={formatNumber(overview.newUsers.current)}
          changePct={overview.newUsers.changePct}
        />
        <KpiCard
          icon={Activity}
          label="총 세션 수"
          value={formatNumber(overview.sessions.current)}
          changePct={overview.sessions.changePct}
        />
        <KpiCard
          icon={Clock}
          label="평균 체류시간"
          value={formatDuration(overview.averageSessionDuration.current)}
          changePct={overview.averageSessionDuration.changePct}
        />
        <KpiCard
          icon={Eye}
          label="페이지뷰"
          value={formatNumber(overview.screenPageViews.current)}
          changePct={overview.screenPageViews.changePct}
        />
        <KpiCard
          icon={Target}
          label="폼 전환"
          value={formatNumber(overview.conversions.current)}
          changePct={overview.conversions.changePct}
          unit="건"
        />
      </div>

      {/* a) 일별 방문자 트렌드 */}
      <ChartBlock title="일별 방문자 추이">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.dailyTrend.map((d) => ({ ...d, dateLabel: formatDate(d.date) }))}>
            <defs>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D22727" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D22727" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="dateLabel" stroke="#999" fontSize={12} />
            <YAxis stroke="#999" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="users"
              name="방문자"
              stroke="#D22727"
              strokeWidth={2}
              fill="url(#userGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBlock>

      <div className="grid md:grid-cols-2 gap-6">
        {/* b) 채널별 유입 Top 10 */}
        <ChartBlock title="채널별 유입 Top 10">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.channels} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" stroke="#999" fontSize={12} />
              <YAxis type="category" dataKey="channel" stroke="#999" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="sessions" name="세션" fill="#D22727" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>

        {/* e) 기기별 분포 */}
        <ChartBlock title="기기별 세션 분포">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={devicesWithLabel}
                dataKey="sessions"
                nameKey="deviceLabel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ deviceLabel, sessions }) =>
                  `${deviceLabel}: ${totalDeviceSessions > 0 ? ((sessions / totalDeviceSessions) * 100).toFixed(1) : 0}%`
                }
              >
                {devicesWithLabel.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      {/* c) 지역별 시/도 */}
      <ChartBlock title="지역별 유입 (시/도, Top 15)">
        <ResponsiveContainer width="100%" height={Math.max(320, data.regions.length * 28)}>
          <BarChart data={data.regions} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" stroke="#999" fontSize={12} />
            <YAxis type="category" dataKey="region" stroke="#999" fontSize={12} width={100} />
            <Tooltip />
            <Bar dataKey="users" name="방문자" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">지역</th>
                <th className="text-right py-2 font-semibold text-gray-700">방문자</th>
                <th className="text-right py-2 font-semibold text-gray-700">세션</th>
                <th className="text-right py-2 font-semibold text-gray-700">평균 체류</th>
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-gray-800">{r.region}</td>
                  <td className="py-2 text-right text-gray-800 font-semibold">{formatNumber(r.users)}</td>
                  <td className="py-2 text-right text-gray-600">{formatNumber(r.sessions)}</td>
                  <td className="py-2 text-right text-gray-600">{formatDuration(r.avgDurationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartBlock>

      {/* d) 도시별 Top 20 테이블 */}
      <ChartBlock title="도시별 유입 (Top 20)">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">도시</th>
                <th className="text-right py-2 font-semibold text-gray-700">방문자</th>
                <th className="text-right py-2 font-semibold text-gray-700">세션</th>
                <th className="text-right py-2 font-semibold text-gray-700">평균 체류</th>
              </tr>
            </thead>
            <tbody>
              {data.cities.map((c, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-gray-800">{c.city}</td>
                  <td className="py-2 text-right text-gray-800 font-semibold">{formatNumber(c.users)}</td>
                  <td className="py-2 text-right text-gray-600">{formatNumber(c.sessions)}</td>
                  <td className="py-2 text-right text-gray-600">{formatDuration(c.avgDurationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartBlock>

      <div className="grid md:grid-cols-2 gap-6">
        {/* f) 시간대별 방문 패턴 */}
        <ChartBlock title="시간대별 방문 패턴">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hoursFilled}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="hour" stroke="#999" fontSize={11} interval={1} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip labelFormatter={(h) => formatHour(Number(h))} />
              <Bar dataKey="sessions" name="세션" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>

        {/* h) 폼 접수 위치별 분석 */}
        <ChartBlock title="폼 접수 위치별 전환">
          {data.entryForms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <p className="text-[13px] text-gray-500 mb-2">데이터 없음</p>
              <p className="text-[11px] text-gray-400 max-w-[280px]">
                GA4 관리 &gt; 맞춤 측정기준에서 <code className="bg-gray-100 px-1">lead_source</code>를
                이벤트 범위로 등록하면 이 차트가 표시됩니다.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.entryForms} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" stroke="#999" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="leadSource"
                  stroke="#999"
                  fontSize={11}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="count" name="접수" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartBlock>
      </div>

      {/* g) 인기 페이지 */}
      <ChartBlock title="인기 페이지 Top 10">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">페이지</th>
                <th className="text-right py-2 font-semibold text-gray-700">페이지뷰</th>
                <th className="text-right py-2 font-semibold text-gray-700">방문자</th>
                <th className="text-right py-2 font-semibold text-gray-700">평균 체류</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-gray-800 font-mono text-[12px]">{p.path}</td>
                  <td className="py-2 text-right text-gray-800 font-semibold">
                    {formatNumber(p.pageviews)}
                  </td>
                  <td className="py-2 text-right text-gray-600">{formatNumber(p.users)}</td>
                  <td className="py-2 text-right text-gray-600">{formatDuration(p.avgDurationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartBlock>

      <p className="text-center text-[11px] text-gray-400 pt-4">
        GA4 속성 530849763 · 데이터는 최대 24~48시간 지연될 수 있습니다
      </p>
    </>
  );
}
