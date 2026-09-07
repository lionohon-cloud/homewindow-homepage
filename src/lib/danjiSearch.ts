/**
 * 아파트 단지 검색 — 랜딩퍼널(전달용_청암랜딩퍼널/search.html)의 검색 로직을 옮긴 것.
 *
 * 데이터는 국토교통부 K-apt 공개자료(2026-07 기준) 21,651개 단지.
 * 원본 퍼널은 1.6MB DB 를 HTML 에 인라인했지만, 여기는 메인페이지라
 * 번들에 넣으면 첫 로딩을 통째로 잡아먹는다. public/data 에 두고
 * 검색창을 처음 건드릴 때 한 번만 받아 온다(gzip 약 0.5MB).
 */

/** 압축 저장 포맷 — 반복되는 문자열은 사전(p)에 모으고 행(d)은 인덱스만 갖는다 */
interface RawDB {
  v: string;
  p: {
    sido: string[];
    sgg: string[];
    dong: string[];
    heat: string[];
    corr: string[];
    type: string[];
    builder: string[];
    zone: string[];
  };
  /** [0]명 [3]동 [4]준공 [5]세대수 [6]동수 [7]최고층 [8]복도 [9]난방 [10]유형 [11]시공사 [12]권역 */
  d: (string | number)[][];
}

export interface Danji {
  /** 원본 배열의 인덱스 — 다음 단계로 넘길 때 행을 다시 찾는 열쇠 */
  idx: number;
  name: string;
  zone: string;
  dong: string;
  year: number;
  households: number;
  buildings: number;
  topFloor: number;
  corridor: string;
  heating: string;
  type: string;
  builder: string;
}

const DATA_URL = "/data/danji-2026-07.json";

/** 화면에 "전국 N개 단지" 로 쓰는 값. 데이터 파일을 갈면 이 값도 같이 고쳐야 한다.
 *  (DB 는 지연 로드라 화면을 그릴 시점엔 아직 개수를 모른다) */
export const DANJI_COUNT = 21651;

let dbPromise: Promise<RawDB> | null = null;
let names: string[] | null = null;
let chos: string[] | null = null;

/** 여러 번 불러도 요청은 한 번만 나간다 */
export function loadDanjiDB(): Promise<RawDB> {
  if (!dbPromise) {
    dbPromise = fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`단지 데이터를 불러오지 못했습니다 (${r.status})`);
        return r.json() as Promise<RawDB>;
      })
      .catch((e) => {
        dbPromise = null; // 실패는 캐시하지 않는다 — 다음 입력에서 다시 시도
        throw e;
      });
  }
  return dbPromise;
}

const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

/** "래미안" → "ㄹㅁㅇ". 한글이 아닌 글자는 그대로 둔다. */
export function toCho(str: string): string {
  let o = "";
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    o += c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : ch;
  }
  return o;
}

/** 이름·초성 인덱스는 한 번만 만든다(21,651개 × 2). */
function buildIndex(db: RawDB) {
  if (names) return;
  names = db.d.map((r) => String(r[0]).replace(/\s/g, ""));
  chos = names.map(toCho);
}

function toDanji(db: RawDB, i: number): Danji {
  const r = db.d[i];
  const P = db.p;
  return {
    idx: i,
    name: String(r[0]),
    zone: P.zone[r[12] as number] ?? "",
    dong: P.dong[r[3] as number] ?? "",
    year: r[4] as number,
    households: r[5] as number,
    buildings: r[6] as number,
    topFloor: r[7] as number,
    corridor: P.corr[r[8] as number] ?? "",
    heating: P.heat[r[9] as number] ?? "",
    type: P.type[r[10] as number] ?? "",
    builder: P.builder[r[11] as number] ?? "",
  };
}

export const MIN_QUERY = 2;
/** 화면에 실제로 뿌리는 개수. 나머지는 "더 있습니다" 로만 알린다. */
export const VISIBLE = 8;

export interface SearchResult {
  items: Danji[];
  /** 조건에 맞는 전체 개수(최대 400 에서 끊긴다) */
  total: number;
}

/**
 * 공백을 무시하고 부분 일치로 찾는다. 초성만 입력하면(ㄹㅁㅇ) 초성으로 찾는다.
 * 정렬은 매치 위치가 앞선 것 → 세대수 큰 것 순. 원본 퍼널과 같은 규칙이다.
 */
export function searchDanji(db: RawDB, raw: string): SearchResult {
  const q = raw.replace(/\s/g, "");
  if (q.length < MIN_QUERY) return { items: [], total: 0 };

  buildIndex(db);
  const isCho = /^[ㄱ-ㅎ]+$/.test(q);
  const table = (isCho ? chos : names) as string[];

  const hit: number[] = [];
  for (let i = 0; i < table.length; i++) {
    if (table[i].indexOf(q) >= 0) {
      hit.push(i);
      if (hit.length >= 400) break; // 너무 짧은 질의로 전체를 훑지 않게 상한
    }
  }

  hit.sort((a, b) => {
    const pa = table[a].indexOf(q);
    const pb = table[b].indexOf(q);
    if (pa !== pb) return pa - pb;
    return (db.d[b][5] as number) - (db.d[a][5] as number);
  });

  return {
    items: hit.slice(0, VISIBLE).map((i) => toDanji(db, i)),
    total: hit.length,
  };
}

/** 목록에 한 줄로 붙는 부가 정보 — "서울 강동구 둔촌동 · 2024년 준공 · 12,032세대" */
export function danjiMeta(d: Danji): string {
  return [
    [d.zone, d.dong].filter(Boolean).join(" "),
    d.year ? `${d.year}년 준공` : "",
    d.households ? `${d.households.toLocaleString()}세대` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
