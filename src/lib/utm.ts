/**
 * UTM 파싱/저장/읽기 유틸리티
 * - 랜딩 시 1회 initUtm() 실행
 * - 폼 제출 시 getUtmData()로 저장된 UTM 읽기
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const SS_PREFIX = 'hw_';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export interface UtmData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  visit_id: string;
  landing_path: string;
  referrer: string;
}

// ── cookie helpers ──────────────────────────────────────────
function setCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)};max-age=${COOKIE_MAX_AGE};path=/;SameSite=Lax`;
}

function getCookie(key: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

// ── referrer 기반 자동분류 ──────────────────────────────────
function classifyReferrer(ref: string): { source: string; medium: string } {
  if (!ref) return { source: 'direct', medium: 'none' };

  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (host.includes('naver.com')) return { source: 'naver_organic', medium: 'organic' };
    if (host.includes('google.com') || host.includes('google.co.kr')) return { source: 'google_organic', medium: 'organic' };
    if (host.includes('daum.net') || host.includes('kakao.com')) return { source: 'daum_organic', medium: 'organic' };
    return { source: host, medium: 'referral' };
  } catch {
    return { source: 'direct', medium: 'none' };
  }
}

// ── visit_id 생성 ───────────────────────────────────────────
function generateVisitId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── 메인 함수 ───────────────────────────────────────────────

/**
 * 랜딩 시 1회 실행. first-touch 원칙: 이미 저장된 값이 있으면 덮어쓰지 않음.
 */
export function initUtm(): void {
  // 이미 초기화된 세션이면 스킵
  if (sessionStorage.getItem(`${SS_PREFIX}utm_source`)) return;

  const params = new URLSearchParams(window.location.search);

  // URL에 utm_source가 있으면 UTM 파라미터 사용
  const hasUtm = params.has('utm_source');

  if (hasUtm) {
    for (const key of UTM_KEYS) {
      const val = params.get(key) || '';
      sessionStorage.setItem(`${SS_PREFIX}${key}`, val);
      if (val) setCookie(`${SS_PREFIX}${key}`, val);
    }
  } else {
    // referrer 기반 자동분류
    const classified = classifyReferrer(document.referrer);
    sessionStorage.setItem(`${SS_PREFIX}utm_source`, classified.source);
    sessionStorage.setItem(`${SS_PREFIX}utm_medium`, classified.medium);
    setCookie(`${SS_PREFIX}utm_source`, classified.source);
    setCookie(`${SS_PREFIX}utm_medium`, classified.medium);
    // campaign/content/term은 빈 문자열
    for (const key of ['utm_campaign', 'utm_content', 'utm_term'] as const) {
      sessionStorage.setItem(`${SS_PREFIX}${key}`, '');
    }
  }

  // visit_id
  if (!sessionStorage.getItem(`${SS_PREFIX}visit_id`)) {
    sessionStorage.setItem(`${SS_PREFIX}visit_id`, generateVisitId());
  }

  // landing_path & referrer
  sessionStorage.setItem(`${SS_PREFIX}landing_path`, window.location.pathname);
  sessionStorage.setItem(`${SS_PREFIX}referrer`, document.referrer);
}

/**
 * 저장된 UTM 데이터 읽기. sessionStorage 우선, fallback으로 cookie.
 */
export function getUtmData(): UtmData {
  const get = (key: string) =>
    sessionStorage.getItem(`${SS_PREFIX}${key}`) || getCookie(`${SS_PREFIX}${key}`) || '';

  return {
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
    utm_content: get('utm_content'),
    utm_term: get('utm_term'),
    visit_id: get('visit_id'),
    landing_path: get('landing_path'),
    referrer: get('referrer'),
  };
}
