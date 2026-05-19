/**
 * 모델 등급 → 무상보증 연한 매핑.
 * 부사장님 확정 전 default. 향후 ERP 측 confirm 받으면 갱신.
 */
export interface WarrantyInfo {
  label: string;    // "프레스티지 20년 무상보증"
  years: number;
  grade: string;
}

const MAP: Record<string, WarrantyInfo> = {
  프레스티지: { label: '프레스티지 20년 무상보증', years: 20, grade: '프레스티지' },
  PRESTIGE: { label: 'PRESTIGE 20년 무상보증', years: 20, grade: 'PRESTIGE' },
  시그니처: { label: '시그니처 15년 무상보증', years: 15, grade: '시그니처' },
  SIGNATURE: { label: 'SIGNATURE 15년 무상보증', years: 15, grade: 'SIGNATURE' },
  에코: { label: '에코 10년 무상보증', years: 10, grade: '에코' },
  ECO: { label: 'ECO 10년 무상보증', years: 10, grade: 'ECO' },
};

export function warrantyFromGrade(grade?: string): WarrantyInfo | null {
  if (!grade) return null;
  const key = grade.trim();
  return MAP[key] ?? null;
}
