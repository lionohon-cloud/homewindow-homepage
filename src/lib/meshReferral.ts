export type MeshConsultChoice = 'mesh_only' | 'with_windows';

export interface MeshConsultResult {
  region: string;
  consultField: 'SAFETY_SCREEN' | 'WINDOW_QUOTE';
  meshReferralRequested: boolean;
}

/** 방충망 재확인 답변을 ERP가 오해 없이 처리할 수 있는 명시적 값으로 변환한다. */
export function resolveMeshConsultChoice(
  choice: MeshConsultChoice,
  region: string,
): MeshConsultResult {
  if (choice === 'mesh_only') {
    return {
      region,
      consultField: 'SAFETY_SCREEN',
      meshReferralRequested: true,
    };
  }

  return {
    region,
    consultField: 'WINDOW_QUOTE',
    meshReferralRequested: false,
  };
}
