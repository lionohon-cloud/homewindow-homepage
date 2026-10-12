/**
 * 260928 가맹점 지도 — 보증 섹션(WarrantySection) 아래.
 * 시안: 01. 홈페이지/260928 가맹점 지도 시안/가맹점지도_시안.html
 * 데이터: /api/franchise/list (ERP 업체 마스터 vendors, type=franchise). 상호는 ERP 이름을 그대로 쓴다 (261008).
 * 핀·목록은 선택이 서로 연동되고, 카드를 누르면 "인증 가맹점" 인증서가 뜬다 (261002).
 * 공개 항목은 프로필 사진·사업자등록번호·담당 지역뿐 — 연락처·주소·대표자는 싣지 않는다(data/franchises.ts 참고).
 *
 * 지도는 남쪽에서 북쪽을 내려다보는 40° 원근 + 두께(흰 입체).
 * d3-geo 를 새로 들이지 않도록 경로는 미리 계산해 둔 franchise-map.json 을 쓰고
 * (시안 페이지에서 추출), 핀 좌표만 아래 project() 로 같은 계산을 한다.
 * 각도·크기를 바꾸려면 시안에서 다시 추출해야 한다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, UserRound } from "lucide-react";
import certBg from "@/assets/franchise-cert-bg.webp";
import { useScrollLock } from "@/lib/useScrollLock";
import { SAMPLE_FRANCHISES, maskName, type Franchise } from "../data/franchises";

interface MapData {
  W: number;
  H: number;
  depth: number;
  tiltDeg: number;
  proj: { scale: number; translate: [number, number]; cx: number; baseY: number; D: number; k: number; tx: number; ty: number };
  land: string;
  provInner: string;
  muniInner: string;
  labels: { name: string; x: number; y: number }[];
  centers: Record<string, [number, number]>;
}

/** 지도가 실제로 차지하는 영역만 보이게 자른 viewBox — 육지 x 88~551, y 30~595 + 위쪽 핀·아래 두께/그림자 여백.
 *  (640×640 전체를 쓰면 좌우·위아래 빈 공간 때문에 지도가 작아 보였다) */
const VIEW = [80, 0, 480, 632] as const;
const PIN_SCALE = 1.3;
const PIN_SCALE_ON = 1.7; // 선택된 핀
const PIN_H = 34;          // 핀 높이(배율 1 기준, 끝~머리 위)
const PIN_GAP = 19;        // 같은 지역 핀이 겹칠 때 뒤 번호를 미는 가로 간격(번호가 보일 만큼)

/** 위경도 → 화면 좌표 (메르카토르 → 40° 기울기 → 화면 맞춤). 시안 build() 와 같은 계산 */
function project(m: MapData, lng: number, lat: number): [number, number] {
  const { scale, translate, cx, baseY, D, k, tx, ty } = m.proj;
  const x = translate[0] + scale * (lng * Math.PI) / 180;
  const y = translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const th = (m.tiltDeg * Math.PI) / 180;
  const dy = baseY - y;
  const s = D / (D + dy * Math.sin(th));
  const px = cx + (x - cx) * s;
  const py = baseY - dy * Math.cos(th) * s;
  return [tx + px * k, ty + py * k];
}

const shortProv = (n: string) =>
  n
    .replace(/(특별자치도|특별자치시|특별시|광역시)$/, "")
    .replace(/^충청북도$/, "충북").replace(/^충청남도$/, "충남")
    .replace(/^전라북도$/, "전북").replace(/^전라남도$/, "전남")
    .replace(/^경상북도$/, "경북").replace(/^경상남도$/, "경남")
    .replace(/^경기도$/, "경기").replace(/^강원도$/, "강원");

/** 가맹점 목록: 운영은 /api/franchise/list, 개발 서버에서만 예시 데이터로 대체 */
function useFranchises() {
  const [list, setList] = useState<Franchise[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/franchise/list")
      .then((r) => (r.ok && r.headers.get("content-type")?.includes("json") ? r.json() : Promise.reject()))
      .then((d: { items?: Franchise[] }) => alive && setList(d.items ?? []))
      .catch(() => alive && setList(import.meta.env.DEV ? SAMPLE_FRANCHISES : []));
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

export function FranchiseMap() {
  const [map, setMap] = useState<MapData | null>(null);
  // 지도가 화면에 들어오면 1호점부터 차례로 핀이 꽂힌다 (한 번만)
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // 등장 애니메이션이 끝나면 꺼 둔다 — 선택한 핀을 맨 앞으로 옮길 때(DOM 순서 변경)
  // 브라우저가 옮겨진 핀들의 애니메이션을 처음부터 다시 재생하던 문제 (260928)
  const [dropDone, setDropDone] = useState(false);
  useEffect(() => {
    const el = mapBoxRef.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, map]);
  const franchises = useFranchises();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null); // 선택한 가맹점 id
  const listRef = useRef<HTMLDivElement>(null);
  const [cert, setCert] = useState<Franchise | null>(null); // 인증서 모달

  // 지도 경로(약 90KB)는 필요할 때 따로 불러온다 — 첫 화면 번들에 넣지 않음
  useEffect(() => {
    import("@/assets/franchise-map.json").then((m) => setMap(m.default as unknown as MapData));
  }, []);

  const pins = useMemo(() => {
    if (!map || !franchises) return [];
    return franchises
      .map((f) => {
        const ll = f.lat != null && f.lng != null ? ([f.lng, f.lat] as [number, number]) : f.area ? map.centers[f.area] : undefined;
        if (!ll) return null;
        const [x, y] = project(map, ll[0], ll[1]);
        return { f, x, y };
      })
      .filter((p): p is { f: Franchise; x: number; y: number } => !!p)
      // 같은 시·군 가맹점은 좌표가 똑같아 핀이 포개진다 → 앞 번호는 제자리, 뒤 번호를 오른쪽으로 조금씩 밀어
      // 뒤에 살짝 겹쳐 보이게 한다(번호가 보일 만큼)
      .map((p, i, all) => {
        const before = all.slice(0, i).filter((q) => Math.abs(q.x - p.x) < 1 && Math.abs(q.y - p.y) < 1).length;
        return before ? { ...p, x: p.x + before * PIN_GAP, stack: before } : { ...p, stack: 0 };
      })
      // 먼(북쪽) 핀부터 → 가까운 핀이 위에. 겹친 핀은 앞 번호가 위에
      .sort((a, b) => a.y - b.y || b.stack - a.stack);
  }, [map, franchises]);

  const selectedPin = pins.find((p) => p.f.id === selected) ?? null;
  useEffect(() => {
    if (!inView || !pins.length) return;
    const t = setTimeout(() => setDropDone(true), 150 + pins.length * 110 + 900);
    return () => clearTimeout(t);
  }, [inView, pins.length]);
  // 꽂히는 순서 = 목록 순서(호점 번호순 → 번호 없는 업체는 이름순, API 에서 정렬해 온다)
  const orderOf = useMemo(() => new Map((franchises ?? []).map((f, i) => [f.id, i])), [franchises]);

  const rows = useMemo(
    () =>
      (franchises ?? []).filter(
        (f) =>
          !query || `${f.name} ${f.region ?? ""} ${f.area ?? ""}`.includes(query),
      ),
    [franchises, query],
  );

  // 운영에서 데이터가 없으면 블록 자체를 숨긴다
  if (franchises && franchises.length === 0) return null;

  const squash = Math.max(0.25, Math.cos(((map?.tiltDeg ?? 40) * Math.PI) / 180) * 0.55);
  // 핀 ↔ 목록 선택 연동
  const pick = (f: Franchise, fromMap: boolean) => {
    const next = selected === f.id ? null : f.id;
    setSelected(next);
    if (!fromMap || next == null) return;
    // 핀으로 고르면 목록에서 그 카드가 보이게 — 검색어가 있으면 풀고, 목록 안에서만 스크롤
    if (query) setQuery("");
    requestAnimationFrame(() => {
      const box = listRef.current;
      const card = box?.querySelector<HTMLElement>(`[data-id="${f.id}"]`);
      if (box && card) box.scrollTo({ top: card.offsetTop - box.offsetTop - 4, behavior: "smooth" });
    });
  };

  return (
    <div className="mt-12 md:mt-16" aria-label="전국 가맹점">

      <div className="grid md:grid-cols-[1.08fr_.92fr] gap-8 md:gap-5 md:items-stretch">
      {/* 지도 */}
      <div ref={mapBoxRef} className={`relative w-full max-w-[480px] mx-auto md:max-w-none ${inView ? "fm-in" : ""} ${dropDone ? "fm-done" : ""}`} style={{ aspectRatio: `${VIEW[2]} / ${VIEW[3]}` }}>
        {map && (
          <svg viewBox={VIEW.join(" ")} className="w-full h-full overflow-visible" role="img" aria-label="전국 가맹점 지도">
            <defs>
              {/* 윗면 원근감: 먼 북쪽은 밝은 회색 → 가까운 남쪽(남해안·제주)은 흰색.
                  화면 좌표 기준(userSpaceOnUse) — 북쪽 끝 y≈30, 남해안 y≈470 */}
              <linearGradient id="fm-top" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="470">
                <stop offset="0" stopColor="#dcdce1" />
                <stop offset=".5" stopColor="#efeff2" />
                <stop offset="1" stopColor="#ffffff" />
              </linearGradient>
              <radialGradient id="fm-glow">
                <stop offset="0" stopColor="#ff2a2a" stopOpacity=".75" />
                <stop offset="1" stopColor="#ff2a2a" stopOpacity="0" />
              </radialGradient>
              <filter id="fm-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <path id="fm-land" d={map.land} />
            </defs>
            {/* 바닥 그림자 → 옆면(1px 씩 쌓은 두께) → 윗면 */}
            <use href="#fm-land" transform={`translate(0,${map.depth + 10})`} fill="#000" opacity=".55" filter="url(#fm-shadow)" />
            {Array.from({ length: map.depth }, (_, i) => {
              const n = map.depth - i; // 아래(두꺼운 쪽)부터 그린다
              const t = 1 - n / map.depth;
              const c = Math.round(141 + (201 - 141) * t);
              return <use key={n} href="#fm-land" transform={`translate(0,${n})`} fill={`rgb(${c},${c},${c + 6})`} />;
            })}
            <use href="#fm-land" fill="url(#fm-top)" />
            <path d={map.muniInner} fill="none" stroke="#e0e0e4" strokeWidth=".5" />
            <path d={map.provInner} fill="none" stroke="#c4c4cb" strokeWidth=".8" strokeLinejoin="round" />
            {map.labels
              .filter((l) => !/^(서울|인천|대전|광주|대구|울산|부산|세종)/.test(l.name))
              .map((l) => (
                <text key={l.name} x={l.x} y={l.y} textAnchor="middle" className="fill-[#8b8b93] text-[11px] font-semibold pointer-events-none">
                  {shortProv(l.name)}
                </text>
              ))}

            {[...pins].sort((a, b) => (a.f.id === selected ? 1 : 0) - (b.f.id === selected ? 1 : 0)).map(({ f, x, y }) => {
              const on = selected === f.id;
              const order = orderOf.get(f.id) ?? 0; // 꽂히는 순서
              return (
                <g
                  key={f.id}
                  transform={`translate(${x},${y})`}
                  className="fm-pin cursor-pointer"
                  style={{ ["--d" as string]: `${-(((order + 1) * 0.37) % 2.6).toFixed(2)}s`, ["--i" as string]: order }}
                  onClick={() => pick(f, true)}
                >
                  {/* 바닥(빛·파동·흰 점)은 핀이 꽂힌 뒤 퍼지며 나타난다 */}
                  <g className="fm-ground">
                    <ellipse className="fm-glow" rx="13" ry={13 * squash} fill="url(#fm-glow)" />
                    <ellipse className="fm-ripple" rx="9" ry={9 * squash} fill="none" stroke="#ff3b3b" strokeWidth={on ? 1.6 : 1.2} />
                    <ellipse rx="4.5" ry={4.5 * squash} fill="#fff" opacity=".95" />
                  </g>
                  {/* 핀 몸통 — 위에서 떨어져 꽂힌다 */}
                  <g className="fm-drop">
                  {/* 핀 크기 1.3배 (260928). CSS 애니메이션이 fm-drop 의 transform 을 쓰므로 크기는 안쪽 g 에서 */}
                  <g style={{ transform: `scale(${on ? PIN_SCALE_ON : PIN_SCALE})`, transformOrigin: "0 0", transition: "transform .28s cubic-bezier(.3,1.6,.5,1)" }}>
                  <path
                    d="M0,0 C-3,-7 -12,-12 -12,-22 A12,12 0 1 1 12,-22 C12,-12 3,-7 0,0Z"
                    fill={on ? "#D22727" : "#2a2a2e"}
                    stroke="#fff"
                    strokeWidth="1.2"
                    className="transition-colors"
                  />
                  <circle cy="-22" r="7.5" fill="#fff" />
                  <text y="-18.5" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#2a2a2e">
                    {f.no ?? "•"}
                  </text>
                  </g>
                  </g>
                  <title>{f.name}</title>
                </g>
              );
            })}
          </svg>
        )}
        {map && selectedPin && <PinPlate pin={selectedPin} onClose={() => setSelected(null)} onCert={() => setCert(selectedPin.f)} />}
      </div>

      {/* 목록 — PC 는 지도 오른쪽, 지도 높이에 맞춰 목록만 스크롤 */}
      <div className="md:relative">
        <div className="md:absolute md:inset-0 flex flex-col min-h-0">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value.trim())}
          placeholder="지역으로 찾기 (예: 남양주, 부산)"
          className="w-full bg-[#2b2b2b] border border-[#3a3a3a] focus:border-[#666] outline-none text-[#eee] placeholder:text-[#777] rounded-xl px-4 py-3 md:py-2.5 text-[14px] md:text-[13px] mb-3"
        />
        <p className="text-[13px] text-[#888] mb-2.5">{rows.length}곳</p>
        <div ref={listRef} className="relative flex flex-col gap-2 max-h-[460px] md:max-h-none md:flex-1 md:min-h-0 overflow-y-auto pr-1 fm-scroll">
          {rows.map((f) => (
            <button
              key={f.id}
              data-id={f.id}
              type="button"
              onClick={() => {
                setSelected(f.id);
                setCert(f);
              }}
              className={`group text-left rounded-xl border px-3.5 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                selected === f.id ? "border-[#D22727] bg-[#2f2626]" : "border-[#333] bg-[#2b2b2b] hover:border-[#555]"
              }`}
            >
              <Avatar f={f} size={46} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold text-white">{f.name}</span>
                  <BadgeCheck className="w-4 h-4 text-[#D22727] shrink-0" aria-label="인증 가맹점" />
                  {f.region && <span className="ml-auto pl-2 shrink-0 text-[12px] font-semibold text-[#888]">{f.region}</span>}
                </div>
                {f.bizNo && <p className="text-[12.5px] text-[#999] mt-0.5 tabular-nums whitespace-nowrap">사업자등록번호 {f.bizNo}</p>}
              </div>
            </button>
          ))}
        </div>
        </div>
      </div>
      </div>

      <CertModal f={cert} onClose={() => setCert(null)} />
    </div>
  );
}

/** 원형 프로필 — 사진이 없으면 기본 아이콘 */
function Avatar({ f, size, light }: { f: Franchise; size: number; light?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center ${light ? "bg-[#f0f0f2] ring-1 ring-[#e2e2e6]" : "bg-[#3a3a3d] ring-1 ring-[#4a4a4e]"}`}
      style={{ width: size, height: size }}
    >
      {f.photo ? (
        <img src={f.photo} alt={f.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <UserRound className={light ? "text-[#b5b5bb]" : "text-[#77777d]"} style={{ width: size * 0.5, height: size * 0.5 }} />
      )}
    </span>
  );
}

/** 가맹점 인증서 — 본사 인증서 양식(franchise-cert-bg.webp, 1333×2000) 위에 글자를 얹는다.
 *  위치는 양식 이미지 기준 %(가로 1333, 세로 2000), 글자 크기는 인증서 폭에 비례(cqw) */
const CERT_CEO = "권오환"; // 본사 대표이사

function CertModal({ f, onClose }: { f: Franchise | null; onClose: () => void }) {
  useScrollLock(!!f);
  useEffect(() => {
    if (!f) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [f, onClose]);
  if (!f) return null;

  const field = "absolute left-[39%] right-[13.5%] -translate-y-1/2 text-left font-semibold text-[#495055] truncate";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[116px] md:pb-[150px]" role="dialog" aria-modal="true" aria-label="가맹점 인증서">
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      {/* 인증서 + 아래 닫기 버튼 (폭은 화면 높이에 맞춰 줄어든다: 버튼 높이 46px 을 빼고 계산) */}
      <div className="relative fm-cert flex flex-col gap-2.5" style={{ width: "min(100%, 460px, calc((100vh - 2rem - 150px - 46px) * 0.6665))" }}>
      <div
        className="relative shadow-2xl rounded-md bg-white font-['Nanum_Myeongjo','Noto_Serif_KR','Batang','AppleMyungjo',serif]"
        style={{ aspectRatio: "1333 / 2000", width: "100%", containerType: "inline-size" }}
      >
        <img src={certBg} alt="청암홈윈도우 가맹점 인증서" className="absolute inset-0 w-full h-full rounded-md" />

        {/* 상호 · 대표자 · 사업자등록번호 (양식의 세로 구분선 오른쪽) */}
        <p className={field} style={{ top: "43.8%", fontSize: "3.7cqw" }}>{f.name}</p>
        <p className={field} style={{ top: "49.5%", fontSize: "3.7cqw" }}>{maskName(f.rep)}</p>
        <p className={`${field} tabular-nums`} style={{ top: "55%", fontSize: "3.7cqw" }}>{f.bizNo}</p>

        {/* 대표이사 성명 — 서명선 위 */}
        <p className="absolute left-[42%] w-[22.6%] -translate-y-full text-center font-bold text-[#495055]" style={{ top: "85.3%", fontSize: "4.2cqw", letterSpacing: "0.35em", paddingLeft: "0.35em" }}>
          {CERT_CEO}
        </p>
      </div>
        <button type="button" onClick={onClose} className="self-center h-9 px-7 rounded-md bg-white text-[#333] text-[13.5px] font-bold hover:bg-[#f1f1f1] cursor-pointer transition-colors">
          닫기
        </button>
      </div>
    </div>
  );
}

/** 모바일 전용: 선택한 핀 위에 뜨는 정보 플레이트.
 *  좌우 끝 핀은 판이 화면 밖으로 안 나가게 옆으로 비키고, 지도 위쪽(북쪽) 핀은 판을 핀 아래에 띄운다 */
function PinPlate({ pin, onClose, onCert }: { pin: { f: Franchise; x: number; y: number }; onClose: () => void; onCert: () => void }) {
  const { f, x, y } = pin;
  const leftPct = ((x - VIEW[0]) / VIEW[2]) * 100;
  const headTop = ((y - PIN_H * PIN_SCALE_ON - 6 - VIEW[1]) / VIEW[3]) * 100; // 핀 머리 위
  const below = headTop < 24;                                                  // 위에 공간이 없으면 아래로
  const topPct = below ? ((y + 10 - VIEW[1]) / VIEW[3]) * 100 : headTop;
  const shift = leftPct < 30 ? 18 : leftPct > 70 ? 82 : 50; // 판 안에서 꼬리 위치(%)
  return (
    <div
      key={f.id}
      className="md:hidden absolute z-10 w-[244px] fm-plate"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translate(-${shift}%, ${below ? "0" : "-100%"})` }}
    >
      <div className="relative bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.35)] px-3 py-3 text-left">
        <button type="button" onClick={onClose} aria-label="닫기" className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center text-[#999] text-[18px] leading-none cursor-pointer">×</button>
        <div className="flex items-center gap-2.5 pr-5">
          <Avatar f={f} size={38} light />
          <div className="min-w-0">
            <p className="text-[14px] font-extrabold text-[#222] truncate">{f.name}</p>
            {f.bizNo && <p className="text-[11.5px] text-[#888] tabular-nums whitespace-nowrap">사업자등록번호 {f.bizNo}</p>}
          </div>
        </div>
        <button type="button" onClick={onCert} className="mt-2.5 w-full h-[34px] rounded-lg bg-[#222] text-white text-[12.5px] font-bold flex items-center justify-center gap-1 cursor-pointer">
          <BadgeCheck className="w-3.5 h-3.5" /> 인증서 보기
        </button>
        {/* 꼬리 — 판이 핀 위면 아래쪽, 핀 아래면 위쪽 */}
        <span className={`absolute ${below ? "-top-[6px]" : "-bottom-[6px]"} w-3 h-3 bg-white rotate-45 -translate-x-1/2`} style={{ left: `${shift}%` }} />
      </div>
    </div>
  );
}
