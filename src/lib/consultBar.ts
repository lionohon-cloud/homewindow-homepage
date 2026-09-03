import { useSyncExternalStore } from "react";

/**
 * GNB 아래로 내려오는 상단 접수 바의 열림 상태. **화면에 하나만 존재해야 한다.**
 *
 * 예전에는 히어로와 GNB 가 각자 useState 로 상태를 들고 각자 <ConsultationModal>
 * 을 렌더했다. 그래서 히어로 버튼으로 한 번, GNB 버튼으로 또 한 번 열면 똑같은
 * 바가 두 겹으로 쌓였다.
 *
 * 상태를 모듈 하나로 올려 두면 누가 열든 같은 바가 열린다. 렌더는 GNB 가 맡는다
 * (사이트 어디서나 떠 있으므로). 히어로 같은 다른 곳은 open() 만 부르면 된다.
 *
 * Context 대신 모듈 스토어를 쓴 이유는 Provider 로 트리를 감쌀 필요가 없어서다.
 *
 * 바가 하나여도 **어느 버튼으로 열었는지는 구분된다** — open() 에 출처를 같이 넘겨
 * 접수 시 entryForm 에 붙인다(예: "홈페이지 PC 상담모달-히어로").
 * 합치기 전에도 두 인스턴스가 같은 문자열을 찍고 있어서 구분이 안 됐는데, 이제 된다.
 */

/** 접수 바를 연 버튼. ERP entryForm 뒤에 붙는다 */
export type ConsultEntry = "히어로" | "GNB";

let open = false;
let entry: ConsultEntry = "GNB";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/**
 * 접수 바를 연다 — 어느 컴포넌트에서 불러도 같은 바가 열린다.
 *
 * 이미 열려 있으면 아무것도 하지 않는다. 폼이 이미 떠 있는데 다른 버튼을 눌렀다고
 * 닫히거나 출처가 바뀌면 이상하다. 출처는 **바를 실제로 띄운 버튼**으로 남는다.
 */
export function openConsultBar(from: ConsultEntry) {
  if (open) return;
  entry = from;
  open = true;
  emit();
}

/** 접수 바를 닫는다 */
export function closeConsultBar() {
  if (!open) return;
  open = false;
  emit();
}

/** 지금 열려 있는지. 바를 그리는 쪽(GNB)에서만 쓰면 된다 */
export function useConsultBarOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false, // 서버 렌더에서는 항상 닫힘
  );
}

/** 어느 버튼으로 열었는지 */
export function useConsultBarEntry(): ConsultEntry {
  return useSyncExternalStore(
    subscribe,
    () => entry,
    () => "GNB" as ConsultEntry,
  );
}
