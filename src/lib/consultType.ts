/**
 * 상담 방법 선택 (2026-11 추가). 번호 인증이 끝나고 접수를 보내기 직전에 묻는다.
 * 견적 퍼널(public/request)의 상담 방법 창과 같은 질문·같은 값이다.
 *
 * 접수 전에 묻는 이유: 구글시트 연동(GAS)이 행 추가만 되고 이미 들어간 행을 고칠 수 없어서,
 * 고른 값을 첫 전송에 함께 실어야 시트에 남는다.
 * 고르지 않고 닫거나 화면을 벗어나면 '' 로 끝나고 접수는 그대로 진행된다 — 리드를 잃지 않는다.
 */

export const CONSULT_TYPES = ["방문상담", "일반상담"] as const;
export type ConsultType = (typeof CONSULT_TYPES)[number] | "";

export type ConsultTypeRequest = { resolve: (type: ConsultType) => void };
type ReqListener = (req: ConsultTypeRequest | null) => void;
const reqListeners = new Set<ReqListener>();
let current: ConsultTypeRequest | null = null;

export const onConsultTypeRequest = (fn: ReqListener) => {
  reqListeners.add(fn);
  fn(current);
  return () => void reqListeners.delete(fn);
};

/** 상담 방법 팝업을 띄운다. 고르면 그 값, 닫거나 벗어나면 '' */
export function requestConsultType(): Promise<ConsultType> {
  current?.resolve("");
  return new Promise<ConsultType>((resolve) => {
    current = {
      resolve: (type) => {
        current = null;
        reqListeners.forEach((fn) => fn(null));
        resolve(type);
      },
    };
    const req = current;
    reqListeners.forEach((fn) => fn(req));
  });
}
