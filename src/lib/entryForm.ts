/**
 * 접수 출처 문자열 — submitLead 의 entryForm 으로 넘어가 구글시트 D열(유입채널)에
 * 그대로 기록된다. 형식은 메인과 동일하게 "<출처> <기기> <위치>".
 *
 *   메인      홈페이지 모바일 하단바 · 홈페이지 PC 메인 · AI채팅 모바일
 *   이 페이지  강화유리상세 모바일 하단바 · 강화유리상세 PC 상담모달
 *
 * 출처를 "홈페이지" 와 분리해야 시트에서 이 상세페이지 유입만 걸러낼 수 있다.
 * 위치 이름은 메인이 쓰던 어휘(하단바·상담모달)를 그대로 따른다.
 */

/** 이 페이지에서 발생한 접수의 출처. 시트 필터의 기준값이 되므로 함부로 바꾸지 말 것. */
export const TEMPERED_SOURCE = '강화유리상세';

/** 접수 폼이 놓인 자리. 시트에서 어느 자리가 잘 먹는지 보려고 나눠 둔다. */
export const ENTRY_WHERE = {
  /** 하단 고정 CTA 바 */
  bottomBar: '하단바',
  /** 히어로의 "무료 실측 상담 신청" 이 여는 모달 */
  heroModal: '상담모달',
  /** 페이지 하단 07 접수 섹션의 폼 */
  form: '접수폼',
} as const;

/** "강화유리상세 모바일 하단바" 처럼 조립한다. 기기 구분 기준은 메인과 같은 768px. */
export function temperedEntryForm(where: string): string {
  const device = window.innerWidth >= 768 ? 'PC' : '모바일';
  return `${TEMPERED_SOURCE} ${device} ${where}`;
}
