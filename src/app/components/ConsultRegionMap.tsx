import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAP_TO_TERRITORY,
  SEJONG_MAP_CODE,
  SEJONG_SUBLIST,
  TERRITORY_LABELS,
} from "@/lib/regionMap/territoryMapping";

/**
 * 상담 지역선택 지도 — 시도 클릭 → 시군구 드릴다운 (시군구 개편 2026-07-10).
 *
 * - 지도 데이터: public/geo/sido.json(시도 17) + sigungu-all.json(시군구 255, 온디맨드 로드).
 * - 투영: 자체 메르카토르(의존성 0). 지도UI 목업(v1.0)에서 검증한 로직의 React 판.
 * - 출력: ERP TERRITORY_MASTER 4자리 코드 (MAP_TO_TERRITORY 매핑, 검증 100%).
 * - 특수: 세종은 시도 클릭 시 읍·면 리스트(SEJONG_SUBLIST) 2차 선택.
 * - 모바일 폴백: 검색창(시군구명) 병행 — 작은 시군구 탭 난이도 보완.
 */

interface GeoFeature {
  type: string;
  properties: { name: string; code: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown };
}
interface GeoFC {
  features: GeoFeature[];
}

// 모듈 캐시 — 모달 재오픈 시 재fetch 방지.
let sidoCache: GeoFC | null = null;
let sggCache: GeoFC | null = null;

async function loadSido(): Promise<GeoFC> {
  if (!sidoCache) sidoCache = (await (await fetch("/geo/sido.json")).json()) as GeoFC;
  return sidoCache;
}
async function loadSgg(): Promise<GeoFC> {
  if (!sggCache) sggCache = (await (await fetch("/geo/sigungu-all.json")).json()) as GeoFC;
  return sggCache;
}

/* ---------- 투영 (메르카토르 + fit) ---------- */
function merc(c: number[]): [number, number] {
  return [(c[0] * Math.PI) / 180, Math.log(Math.tan(Math.PI / 4 + (c[1] * Math.PI) / 360))];
}
type Proj = (c: number[]) => [number, number];
function makeProj(features: GeoFeature[], W: number, H: number, pad: number): Proj {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const f of features) {
    const g = f.geometry;
    const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
    for (const p of polys)
      for (const r of p)
        for (const c of r) {
          const m = merc(c);
          if (m[0] < x0) x0 = m[0];
          if (m[0] > x1) x1 = m[0];
          if (m[1] < y0) y0 = m[1];
          if (m[1] > y1) y1 = m[1];
        }
  }
  const k = Math.min((W * (1 - pad)) / (x1 - x0), (H * (1 - pad)) / (y1 - y0));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return (c) => {
    const m = merc(c);
    return [(m[0] - cx) * k + W / 2, (cy - m[1]) * k + H / 2];
  };
}
function featPath(f: GeoFeature, proj: Proj): string {
  const g = f.geometry;
  const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  let d = "";
  for (const p of polys)
    for (const r of p) {
      d += r
        .map((c, i) => {
          const pt = proj(c);
          return (i ? "L" : "M") + pt[0].toFixed(1) + "," + pt[1].toFixed(1);
        })
        .join("") + "Z";
    }
  return d;
}
/** 가장 큰 폴리곤의 bbox 중심 + 넓이 (라벨 배치·표시 여부 판단). */
function labelPos(f: GeoFeature, proj: Proj): [number, number, number] | null {
  const g = f.geometry;
  const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  let best: [number, number, number] | null = null;
  for (const p of polys) {
    const r = p[0];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of r) {
      const pt = proj(c);
      if (pt[0] < x0) x0 = pt[0];
      if (pt[0] > x1) x1 = pt[0];
      if (pt[1] < y0) y0 = pt[1];
      if (pt[1] > y1) y1 = pt[1];
    }
    const a = (x1 - x0) * (y1 - y0);
    if (!best || a > best[2]) best = [(x0 + x1) / 2, (y0 + y1) / 2, a];
  }
  return best;
}
function shortSido(n: string): string {
  const m: Record<string, string> = {
    충청북도: "충북", 충청남도: "충남", 전라북도: "전북", 전북특별자치도: "전북",
    전라남도: "전남", 경상북도: "경북", 경상남도: "경남",
    제주특별자치도: "제주", 강원특별자치도: "강원",
  };
  if (m[n]) return m[n];
  return n.replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, "");
}

/**
 * 경기도(31) 시군구 표시 단순화 — "수원시장안구" → "수원시" (사장님 지시 2026-07-10).
 * 서울·인천 등 다른 시도는 자치구가 독립 시군구라 그대로 둔다.
 * 경기 6개 시(수원·성남·안양·안산·고양·용인)만 「시명+구」 형태 → 시명으로 접는다.
 * 시민은 시까지만 선택; 구는 ERP 가 주소로 자동 판정(matchAddressToTerritoryCodes)한다.
 */
function collapseGyeonggiSi(mapName: string): string {
  const m = mapName.match(/^(.+?시)(.+구)$/);
  return m ? m[1] : mapName;
}

/** 경기 시명(예: "수원시") → 대표 TERRITORY 코드(그 시 첫 구, 예: 수원시장안구 0087). */
const GYEONGGI_SI_TO_TERRITORY: Record<string, { code: string; label: string }> = {
  수원시: { code: "0087", label: "경기 수원시" },
  성남시: { code: "0091", label: "경기 성남시" },
  안양시: { code: "0094", label: "경기 안양시" },
  안산시: { code: "0096", label: "경기 안산시" },
  고양시: { code: "0098", label: "경기 고양시" },
  용인시: { code: "0101", label: "경기 용인시" },
};

const W = 560, H = 610;
// 모바일 (사장님 지시 2026-07-10): 어르신도 찍기 쉽게 지도를 화면에 꽉 채운다.
//   세로 캔버스 + 본토 기준 fit (제주는 하단에 살짝 걸쳐도 OK — 검색·부분 클릭으로 보완).
const MOBILE_H = 920;
const JEJU_SIDO_CODE = "39";
const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 639px)").matches;

export interface RegionSelection {
  /** ERP TERRITORY_MASTER 4자리 코드 */
  territoryCode: string;
  /** 표시 라벨 (예: "경기 수원시 장안구") */
  label: string;
}

interface ConsultRegionMapProps {
  onSelect: (sel: RegionSelection) => void;
}

export function ConsultRegionMap({ onSelect }: ConsultRegionMapProps) {
  const [sido, setSido] = useState<GeoFC | null>(null);
  const [sgg, setSgg] = useState<GeoFC | null>(null);
  const [curSido, setCurSido] = useState<string | null>(null); // 지도 시도 2자리
  const [sejongOpen, setSejongOpen] = useState(false);
  const [pending, setPending] = useState<RegionSelection | null>(null);
  const [q, setQ] = useState("");
  const [loadErr, setLoadErr] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // 핀치 확대·팬 (사장님 지시 2026-07-10 — 모바일 손가락 확대). zoomVb=null 이면 기본 전체보기.
  const [zoomVb, setZoomVb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<{
    mode: "none" | "pinch" | "pan";
    dist: number;
    vb0: { x: number; y: number; w: number; h: number };
    midVbX: number; midVbY: number;
    panX: number; panY: number;
    moved: boolean;
  }>({ mode: "none", dist: 0, vb0: { x: 0, y: 0, w: 0, h: 0 }, midVbX: 0, midVbY: 0, panX: 0, panY: 0, moved: false });
  // 더블탭 = 확인 없이 바로 선택 진행 (사장님 지시 2026-07-10).
  const lastTapRef = useRef<{ code: string; ts: number } | null>(null);
  // 핀치 안내 오버레이 (사장님 지시 2026-07-10 — 확대 제스처를 손 이모티콘으로 보여주기).
  const [pinchHint, setPinchHint] = useState(IS_MOBILE);

  useEffect(() => {
    loadSido().then(setSido).catch(() => setLoadErr(true));
    // 시군구도 미리 백그라운드 로드 (검색·드릴다운 대기 제거)
    loadSgg().then(setSgg).catch(() => setLoadErr(true));
  }, []);

  const sidoNameByCode = useMemo(() => {
    const m = new Map<string, string>();
    sido?.features.forEach((f) => m.set(f.properties.code, f.properties.name));
    return m;
  }, [sido]);

  // 현재 화면 피처들 + 투영
  const view = useMemo(() => {
    if (!sido) return null;
    const feats =
      curSido && sgg
        ? sgg.features.filter((f) => f.properties.code.slice(0, 2) === curSido)
        : sido.features;
    const canvasH = IS_MOBILE ? MOBILE_H : H;
    // 모바일 전국 뷰: 본토(제주 제외) 기준으로 fit → 본토가 화면 폭을 꽉 채움 (제주 하단 일부 잘림 허용).
    const fitFeats =
      IS_MOBILE && !curSido
        ? feats.filter((f) => f.properties.code !== JEJU_SIDO_CODE)
        : feats;
    const pad = IS_MOBILE ? (curSido ? 0.02 : 0.006) : 0.09;
    const proj = makeProj(fitFeats.length ? fitFeats : feats, W, canvasH, pad);
    return {
      feats,
      proj,
      mode: curSido ? ("sgg" as const) : ("kr" as const),
      canvasH,
    };
  }, [sido, sgg, curSido]);

  // 검색 인덱스 (시군구 + 세종 읍면). 경기 "시+구"는 시 대표 하나로 접음.
  const searchIndex = useMemo(() => {
    const items: { key: string; full: string; territoryCode: string }[] = [];
    const gyeonggiSiDone = new Set<string>();
    if (sgg) {
      const seen = new Set<string>();
      for (const f of sgg.features) {
        const c = f.properties.code;
        if (c === SEJONG_MAP_CODE || seen.has(c)) continue;
        seen.add(c);
        // 경기 "시+구" → "경기 수원시" 한 항목만 (구는 검색에서 숨김).
        if (c.slice(0, 2) === "31") {
          const si = collapseGyeonggiSi(f.properties.name);
          const rep = GYEONGGI_SI_TO_TERRITORY[si];
          if (rep) {
            if (!gyeonggiSiDone.has(si)) {
              gyeonggiSiDone.add(si);
              items.push({ key: rep.code, full: rep.label, territoryCode: rep.code });
            }
            continue;
          }
        }
        const t = MAP_TO_TERRITORY[c];
        if (!t) continue;
        items.push({ key: c, full: TERRITORY_LABELS[t] ?? f.properties.name, territoryCode: t });
      }
    }
    for (const s of SEJONG_SUBLIST) {
      items.push({ key: s.code, full: s.label, territoryCode: s.code });
    }
    return items;
  }, [sgg]);

  const hits = q.trim()
    ? searchIndex.filter((x) => x.full.includes(q.trim())).slice(0, 8)
    : [];

  // 화면(전국↔시도) 전환 시 핀치 안내 4.5초 표시 후 자동 숨김 (모바일만).
  useEffect(() => {
    if (!IS_MOBILE) return;
    setPinchHint(true);
    const t = setTimeout(() => setPinchHint(false), 7000);
    return () => clearTimeout(t);
  }, [curSido]);

  const pick = (territoryCode: string, labelOverride?: string) => {
    setQ("");
    setSejongOpen(false);
    setPending({
      territoryCode,
      label: labelOverride ?? TERRITORY_LABELS[territoryCode] ?? territoryCode,
    });
  };

  const handleFeatureClick = (f: GeoFeature) => {
    // 팬·핀치 제스처 끝에 발생하는 클릭은 선택으로 치지 않는다.
    if (gestureRef.current.moved) return;
    const code = f.properties.code;
    if (!curSido) {
      // 시도 클릭
      if (code === SEJONG_MAP_CODE.slice(0, 2)) {
        setSejongOpen(true); // 세종: 읍·면 리스트 2차 선택
        setPending(null);
        return;
      }
      setCurSido(code);
      setPending(null);
      setZoomVb(null);
      return;
    }
    // 경기 "시+구" 폴리곤: 어느 구를 눌러도 그 시 대표 코드+시 라벨로 선택 (구는 ERP 주소 판정).
    if (curSido === "31") {
      const si = collapseGyeonggiSi(f.properties.name);
      const rep = GYEONGGI_SI_TO_TERRITORY[si];
      if (rep) {
        pick(rep.code, rep.label);
        confirmIfDoubleTap(rep.code, rep.label);
        return;
      }
    }
    // 그 외 시군구 클릭
    const t = MAP_TO_TERRITORY[code];
    if (t) {
      pick(t);
      confirmIfDoubleTap(t, TERRITORY_LABELS[t] ?? t);
    }
  };

  /** 같은 지역을 450ms 안에 두 번 탭하면 확인 버튼 없이 바로 진행. */
  const confirmIfDoubleTap = (territoryCode: string, label: string) => {
    const now = Date.now();
    const last = lastTapRef.current;
    lastTapRef.current = { code: territoryCode, ts: now };
    if (last && last.code === territoryCode && now - last.ts < 450) {
      onSelect({ territoryCode, label });
    }
  };

  const goNational = () => {
    setCurSido(null);
    setSejongOpen(false);
    setPending(null);
    setZoomVb(null);
  };

  if (loadErr) {
    // 지도 로드 실패 폴백 — 검색만으로도 진행 가능해야 하나 인덱스도 실패한 상황 → 안내.
    return (
      <div className="text-center py-8 text-[13px] text-[#999]">
        지도를 불러오지 못했어요. 새로고침하거나 「잘 모르겠어요」로 건너뛰어 주세요.
      </div>
    );
  }
  if (!view) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-[#eee] border-t-[#D22727] rounded-full animate-spin" />
      </div>
    );
  }

  const { feats, proj, mode, canvasH } = view;
  const vb = zoomVb ?? { x: 0, y: 0, w: W, h: canvasH };

  // ── 핀치 확대·팬 (viewBox 조작 — 라벨·터치영역이 같이 커져 어르신 UX에 유리) ──
  const MIN_W = W / 5; // 최대 5배 확대
  const clampVb = (v: { x: number; y: number; w: number; h: number }) => {
    const w = Math.min(W, Math.max(MIN_W, v.w));
    const h = (w * canvasH) / W;
    const x = Math.min(Math.max(v.x, 0), W - w);
    const y = Math.min(Math.max(v.y, 0), canvasH - h);
    return { x, y, w, h };
  };
  const clientToVb = (cx: number, cy: number) => {
    const rect = mapWrapRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: vb.x + ((cx - rect.left) / rect.width) * vb.w,
      y: vb.y + ((cy - rect.top) / rect.height) * vb.h,
    };
  };
  const onTouchStart = (e: React.TouchEvent) => {
    setPinchHint(false);
    const g = gestureRef.current;
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const mid = clientToVb((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
      g.mode = "pinch";
      g.dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      g.vb0 = { ...vb };
      g.midVbX = mid.x;
      g.midVbY = mid.y;
      g.moved = true; // 핀치 후 클릭 무시
    } else if (e.touches.length === 1) {
      g.mode = "pan";
      g.panX = e.touches[0].clientX;
      g.panY = e.touches[0].clientY;
      g.moved = false;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const g = gestureRef.current;
    const rect = mapWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (g.mode === "pinch" && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (d < 10) return;
      const newW = g.vb0.w * (g.dist / d);
      const midClientX = (a.clientX + b.clientX) / 2;
      const midClientY = (a.clientY + b.clientY) / 2;
      const nw = Math.min(W, Math.max(MIN_W, newW));
      const nh = (nw * canvasH) / W;
      const next = clampVb({
        x: g.midVbX - ((midClientX - rect.left) / rect.width) * nw,
        y: g.midVbY - ((midClientY - rect.top) / rect.height) * nh,
        w: nw,
        h: nh,
      });
      setZoomVb(next.w >= W ? null : next);
    } else if (g.mode === "pan" && e.touches.length === 1 && zoomVb) {
      const t = e.touches[0];
      const dx = t.clientX - g.panX;
      const dy = t.clientY - g.panY;
      if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
      g.panX = t.clientX;
      g.panY = t.clientY;
      setZoomVb((cur) =>
        cur
          ? clampVb({
              ...cur,
              x: cur.x - dx * (cur.w / rect.width),
              y: cur.y - dy * (cur.h / rect.height),
            })
          : cur,
      );
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const g = gestureRef.current;
    if (e.touches.length === 0) {
      g.mode = "none";
      // moved 플래그는 click 이벤트(touchend 직후 발생)가 소비하도록 잠깐 유지 후 해제.
      if (g.moved) setTimeout(() => { g.moved = false; }, 80);
    }
  };
  // 선택 하이라이트할 지도코드. 경기 시 선택 시엔 그 시의 모든 구 폴리곤을 함께 강조.
  const selectedMapCodes = new Set<string>(
    pending
      ? Object.entries(MAP_TO_TERRITORY)
          .filter(([, t]) => t === pending.territoryCode)
          .map(([mc]) => mc)
      : [],
  );
  if (pending && curSido === "31" && sgg) {
    const selSi = Object.entries(GYEONGGI_SI_TO_TERRITORY).find(
      ([, v]) => v.code === pending.territoryCode,
    )?.[0];
    if (selSi) {
      for (const f of sgg.features) {
        if (f.properties.code.slice(0, 2) === "31" && collapseGyeonggiSi(f.properties.name) === selSi) {
          selectedMapCodes.add(f.properties.code);
        }
      }
    }
  }

  return (
    <div>
      {/* 검색 (모바일 폴백) */}
      <div className="sticky top-0 z-30 bg-white pb-2.5" ref={searchRef}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 지역명 검색 (예: 종로, 수원, 창원)"
          className="w-full h-[44px] border-[1.5px] border-[#e5e5e5] rounded-xl px-4 text-[14px] outline-none focus:border-[#D22727]"
        />
        {hits.length > 0 && (
          <div className="absolute top-[47px] left-0 right-0 bg-white border border-[#e5e5e5] rounded-xl shadow-xl z-40 overflow-hidden">
            {hits.map((h) => (
              <button
                key={h.key}
                type="button"
                onClick={() => pick(h.territoryCode, h.full)}
                className="block w-full text-left px-4 py-3.5 min-h-[48px] text-[15px] hover:bg-[#fff8f8] cursor-pointer"
              >
                {h.full}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div
        ref={mapWrapRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: zoomVb ? "none" : "pan-y" }}
        className="relative bg-[#fdfbf9] border-y border-[#eee4dc] -mx-3 rounded-none sm:mx-0 sm:border sm:rounded-xl overflow-hidden"
      >
        <button
          type="button"
          onClick={mode === "sgg" ? goNational : undefined}
          className={`absolute top-2.5 left-3 z-10 text-[12.5px] font-bold px-3 py-1 rounded-full border ${
            mode === "sgg"
              ? "text-[#D22727] border-[#f2c9c2] bg-white cursor-pointer hover:bg-[#fff8f8]"
              : "text-[#999] border-[#e5e5e5] bg-white/90"
          }`}
        >
          {mode === "sgg" ? "← 전국 지도" : "전국"}
        </button>
        {zoomVb && (
          <button
            type="button"
            onClick={() => setZoomVb(null)}
            className="absolute top-2.5 right-3 z-10 text-[12.5px] font-bold px-3 py-1 rounded-full border text-[#D22727] border-[#f2c9c2] bg-white cursor-pointer hover:bg-[#fff8f8]"
          >
            ↺ 확대 초기화
          </button>
        )}
        {pinchHint && (
          <div className="pointer-events-none absolute top-12 left-0 right-0 z-20 flex justify-center">
            <div className="flex items-center gap-2.5 rounded-full bg-black/55 px-4 py-2 text-white backdrop-blur-[2px]">
              <span className="text-[22px] leading-none animate-pulse">🤏</span>
              <span className="text-left">
                <span className="block text-[12.5px] font-bold leading-tight">두 손가락을 벌려 확대할 수 있어요</span>
                <span className="block text-[11px] opacity-80 leading-tight">같은 지역 두 번 누르면 바로 선택</span>
              </span>
            </div>
          </div>
        )}
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          className="block w-full h-auto select-none"
        >
          {feats.map((f, i) => {
            const isSel = mode === "sgg" && selectedMapCodes.has(f.properties.code);
            return (
              <path
                key={f.properties.code + i}
                d={featPath(f, proj)}
                onClick={() => handleFeatureClick(f)}
                className="cursor-pointer transition-colors"
                fill={isSel ? "#D22727" : "#f1e9e2"}
                stroke={isSel ? "#a01d1d" : "#d8ccc2"}
                strokeWidth={0.8}
                onMouseEnter={(e) => {
                  if (!isSel) (e.target as SVGPathElement).setAttribute("fill", "#f6d9d4");
                }}
                onMouseLeave={(e) => {
                  if (!isSel) (e.target as SVGPathElement).setAttribute("fill", "#f1e9e2");
                }}
              >
                <title>{f.properties.name}</title>
              </path>
            );
          })}
          {(() => {
            // 경기(31) 시군구 뷰: "시명+구" 폴리곤은 시별로 라벨 1개만(가장 큰 폴리곤) + 시명으로 접기.
            const isGyeonggi = mode === "sgg" && curSido === "31";
            const siLabeled = new Set<string>();
            return feats.map((f, i) => {
              const lp = labelPos(f, proj);
              if (!lp) return null;
              const small = mode === "sgg";
              const collapsed = isGyeonggi ? collapseGyeonggiSi(f.properties.name) : f.properties.name;
              const isCollapsedSi = isGyeonggi && collapsed !== f.properties.name;
              if (isCollapsedSi) {
                // 이미 이 시 라벨을 그렸으면 스킵 (시당 1회).
                if (siLabeled.has(collapsed)) return null;
                siLabeled.add(collapsed);
              } else if (small && lp[2] <= 560) {
                return null; // 좁은 구는 라벨 생략(호버·검색 보완)
              }
              const isSel = mode === "sgg" && selectedMapCodes.has(f.properties.code);
              return (
                <text
                  key={"l" + f.properties.code + i}
                  x={lp[0].toFixed(1)}
                  y={(lp[1] + 4).toFixed(1)}
                  textAnchor="middle"
                  className="pointer-events-none"
                  fontSize={small ? 10.5 : 13}
                  fontWeight={small ? 600 : 700}
                  fill={isSel ? "#fff" : "#4a423c"}
                >
                  {mode === "kr" ? shortSido(f.properties.name) : collapsed}
                </text>
              );
            });
          })()}
        </svg>
      </div>

      {/* 세종 읍·면 2차 선택 */}
      {sejongOpen && (
        <div className="mt-2.5 border border-[#eee4dc] rounded-xl p-3">
          <p className="text-[12.5px] text-[#999] mb-2">세종특별자치시 — 읍·면을 선택해 주세요</p>
          <div className="grid grid-cols-3 gap-1.5">
            {SEJONG_SUBLIST.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => pick(s.code)}
                className="h-[40px] px-1 border-[1.5px] border-[#e5e5e5] rounded-lg text-[12.5px] font-semibold hover:border-[#D22727] hover:bg-[#fff8f8] cursor-pointer"
              >
                {s.label.replace("세종 ", "")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택 확인 바 */}
      {pending && (
        <div className="sticky bottom-0 z-30 mt-2.5 flex items-center justify-between gap-3 bg-[#fff3f1] border border-[#f2c9c2] rounded-xl px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold text-[#2A2A2A] truncate">{pending.label}</div>
            <div className="text-[11.5px] text-[#999]">이 지역이 맞나요?</div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(pending)}
            className="shrink-0 bg-[#D22727] hover:bg-[#a01d1d] text-white text-[14px] font-extrabold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            이 지역으로 선택
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[12px] text-[#999]">
        두 손가락으로 확대할 수 있어요 · 같은 지역을 두 번 누르면 바로 선택돼요
      </p>
    </div>
  );
}
