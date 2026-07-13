export const MESH_CONSULT_OPTIONS = [
  {
    choice: 'mesh_only',
    label: '네, 방충망만 할게요 (제휴사에서 연락 부탁드려요)',
  },
  {
    choice: 'with_windows',
    label: '아니오, 창호랑 같이 하고 싶어요',
  },
  {
    choice: 'other_consult',
    label: '아니에요 괜찮아요',
  },
] as const;

export type MeshConsultChoice =
  (typeof MESH_CONSULT_OPTIONS)[number]['choice'];

export interface MeshConsultResult {
  region: string;
  consultField: 'SAFETY_SCREEN' | 'WINDOW_QUOTE';
  meshReferralRequested: boolean;
}

/** 방충망 재확인 답변을 ERP가 오해 없이 처리할 수 있는 명시적 값으로 변환한다. */
export function resolveMeshConsultChoice(
  choice: MeshConsultChoice,
  region: string,
): MeshConsultResult | null {
  if (choice === 'mesh_only') {
    return {
      region,
      consultField: 'SAFETY_SCREEN',
      meshReferralRequested: true,
    };
  }

  if (choice === 'with_windows') {
    return {
      region,
      consultField: 'WINDOW_QUOTE',
      meshReferralRequested: false,
    };
  }

  // 「아니에요 괜찮아요」는 접수를 확정하지 않고 공통 상담분야 선택으로 돌아간다.
  return null;
}
