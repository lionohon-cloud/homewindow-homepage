/**
 * 단지 연식 기반 창호 진단 — 랜딩퍼널 app.js 의 진단 엔진을 옮긴 것.
 *
 * 준공 연도로 그 시기 표준 창호 사양을 되짚고, 복도 유형·난방 방식을 얹어
 * "이 단지는 이런 상태일 가능성이 높다"까지 문장으로 만든다.
 *
 * 어디까지나 추정이다 — 세대별로 이미 교체한 집이 있어서 화면에도
 * "준공 기준 추정" 을 붙이고 마지막 줄에 현장 확인 권고를 남긴다.
 */

import type { Danji } from "./danjiSearch";

/** 연차 계산 기준 연도. 단지 DB 가 2026-07 기준이라 맞춰 고정했다. */
export const NOW = 2026;

interface Era {
  max: number;
  gen: string;
  type: string;
  glass: string;
  frame: string;
  uval: string;
  why: string;
}

/** 준공 시기별 창호 추정 사양. 단열 성능(U-value)은 창세트 기준 추정값. */
const WIN_ERA: Era[] = [
  {
    max: 1994,
    gen: "1세대",
    type: "알루미늄 단창 (구형)",
    glass: "단판유리 6mm",
    frame: "알루미늄 비단열 프레임",
    uval: "약 5.8 W/m²K",
    why: "알루미늄 단창은 단열·소음 성능이 현저히 낮아 교체 효과가 가장 크게 나타납니다.",
  },
  {
    max: 2004,
    gen: "2세대",
    type: "알루미늄 이중창",
    glass: "복층유리 12~16mm",
    frame: "알루미늄 프레임 (단열바 없음)",
    uval: "약 3.4 W/m²K",
    why: "프레임이 남아 있어도 롤러·크리센트 수명이 지나 개폐가 뻑뻑해지고 창틀 틈으로 바람이 들어옵니다.",
  },
  {
    max: 2012,
    gen: "3세대",
    type: "PVC 이중창",
    glass: "일반 복층유리 (로이 미적용)",
    frame: "PVC 단열 프레임",
    uval: "약 2.3 W/m²K",
    why: "프레임은 멀쩡해도 유리 단열이 지금 기준에 못 미쳐, 겨울 결로가 유리면에서 먼저 시작됩니다.",
  },
  {
    max: 2019,
    gen: "4세대",
    type: "PVC 이중창 (로이)",
    glass: "로이 복층유리",
    frame: "PVC 단열 프레임",
    uval: "약 1.6 W/m²K",
    why: "단열 사양은 기준을 만족하지만 10년 전후로 기밀재와 하드웨어가 먼저 내려앉습니다.",
  },
  {
    max: 9999,
    gen: "신축",
    type: "PVC 또는 시스템창",
    glass: "로이 복층유리 이상",
    frame: "PVC·알루미늄 단열 프레임",
    uval: "약 1.2 W/m²K",
    why: "창호 노후보다 시공 하자나 기밀 불량이 원인인 경우가 많아 하자 범위를 먼저 확인합니다.",
  },
];

export function ageLabel(age: number): string {
  return age <= 5
    ? "신축 (5년 이하)"
    : age <= 15
      ? "준신축 (6~15년)"
      : age <= 25
        ? "노후 (16~25년)"
        : "장기 노후 (26년 이상)";
}

export function ageVerdict(age: number): string {
  return age <= 5
    ? "양호합니다."
    : age <= 10
      ? "점검이 필요합니다."
      : age <= 20
        ? "교체를 검토해보세요."
        : "교체가 필요합니다.";
}

export interface Diagnosis {
  danji: Danji;
  age: number;
  /** 준공 연도가 없으면 null — 이때는 사양을 추정하지 않는다 */
  era: Era | null;
  ageLabel: string;
  verdict: string;
  /** 노후도 게이지 채움 비율 0~100. 20년을 만점으로 본다. */
  gauge: number;
  /** 분석 문장 — 연식 → 창호 함의 → 단지 구조 → 주의, 최대 5줄 */
  notes: string[];
  /** 접었다 펴는 단지 기본정보 */
  facts: { label: string; value: string }[];
}

export function diagnose(d: Danji): Diagnosis {
  const age = d.year ? NOW - d.year : 0;
  const era = d.year ? (WIN_ERA.find((x) => d.year <= x.max) ?? WIN_ERA[WIN_ERA.length - 1]) : null;

  const notes: string[] = [];
  if (d.year && era) {
    notes.push(
      `${d.year}년 준공 단지로 ${age}년이 지났습니다. ` +
        (age >= 26
          ? "창호 노후화 가능성이 높습니다."
          : age >= 16
            ? "창호 교체를 검토할 시기입니다."
            : age >= 6
              ? "창호 상태 점검이 필요한 시기입니다."
              : "창호 자체는 아직 양호할 가능성이 큽니다."),
    );
    notes.push(era.why);
  } else {
    notes.push(
      "공개 자료에 준공 연도가 없어 창호 사양을 추정하지 못했습니다. 통화로 확인해 드리겠습니다.",
    );
  }

  if (d.corridor === "복도식") {
    notes.push(
      "복도식 구조라 주방·현관 쪽 창이 외기에 그대로 노출됩니다. 결로가 이 두 곳에서 먼저 나타납니다.",
    );
  } else if (d.corridor === "계단식") {
    notes.push(
      "계단식 구조라 거실 발코니 전면창이 시공 물량의 대부분을 차지합니다. 확장 세대는 창이 더 커집니다.",
    );
  } else if (d.corridor === "혼합식") {
    notes.push(
      "계단식과 복도식이 섞인 단지로 동·호수에 따라 창 구성이 달라집니다. 실측 전 도면을 확인합니다.",
    );
  }

  if (d.heating === "중앙난방" || d.heating === "지역난방") {
    notes.push(
      `${d.heating} 단지라 세대에서 온도를 조절할 폭이 좁습니다. 창호 단열만 잡아도 겨울 체감 차이가 큽니다.`,
    );
  } else if (d.heating?.startsWith("개별난방")) {
    notes.push(
      "개별난방 단지라 창호 단열 개선분이 난방비에 바로 반영됩니다. 회수 기간을 계산해 안내드릴 수 있습니다.",
    );
  }

  notes.push("세대별 개별 교체 이력이 있을 수 있어 현장 확인을 권장합니다.");

  const facts = [
    d.year ? { label: "준공 연도", value: `${d.year}년` } : null,
    d.year ? { label: "노후도", value: ageLabel(age) } : null,
    d.households ? { label: "총 세대수", value: `${d.households.toLocaleString()}세대` } : null,
    d.buildings ? { label: "동 수", value: `${d.buildings}개 동` } : null,
    d.topFloor ? { label: "최고 층수", value: `${d.topFloor}층` } : null,
    d.corridor ? { label: "복도 유형", value: d.corridor } : null,
    d.heating ? { label: "난방 방식", value: d.heating } : null,
    d.builder ? { label: "시공사", value: d.builder } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return {
    danji: d,
    age,
    era,
    ageLabel: ageLabel(age),
    verdict: ageVerdict(age),
    gauge: Math.min(age / 20, 1) * 100,
    notes: notes.slice(0, 5),
    facts,
  };
}

/** 창호 추정 사양 4줄. 준공 연도가 없으면 빈 배열. */
export function windowSpec(g: Diagnosis): { label: string; value: string }[] {
  if (!g.era) return [];
  return [
    { label: "창호 종류", value: g.era.type },
    { label: "유리 사양", value: g.era.glass },
    { label: "프레임", value: g.era.frame },
    { label: "단열 성능", value: g.era.uval },
  ];
}
