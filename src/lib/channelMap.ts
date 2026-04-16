/**
 * UTM → CRM 유입경로 한글 매핑 테이블
 * AdminUtmPage 드롭다운 + submitLead CRM 매핑에서 공유 사용
 */

export interface Channel {
  utm_source: string;
  utm_medium: string;
  label: string;    // CRM source 한글 값
  note: string;     // 비고
}

export const CHANNEL_MASTER: readonly Channel[] = [
  { utm_source: 'naver_powerlink', utm_medium: 'cpc',      label: '네이버 파워링크',   note: '검색광고' },
  { utm_source: 'naver_gfa',       utm_medium: 'display',  label: '네이버 GFA',        note: '디스플레이' },
  { utm_source: 'naver_shopping',  utm_medium: 'cpc',      label: '네이버 쇼핑검색',   note: '쇼핑검색광고' },
  { utm_source: 'naver_blog',      utm_medium: 'referral', label: '네이버 블로그',     note: '자사운영' },
  { utm_source: 'naver_cafe',      utm_medium: 'referral', label: '네이버 카페',       note: '체험단/후기' },
  { utm_source: 'instagram',       utm_medium: 'ad',       label: '인스타그램 광고',   note: '피드/스토리' },
  { utm_source: 'instagram',       utm_medium: 'bio',      label: '인스타그램 프로필', note: '프로필 링크' },
  { utm_source: 'instagram',       utm_medium: 'referral', label: '인스타그램 게시물', note: '일반 포스트' },
  { utm_source: 'kakao_moment',    utm_medium: 'display',  label: '카카오 모먼트',     note: '디스플레이' },
  { utm_source: 'kakao_channel',   utm_medium: 'social',   label: '카카오톡 채널',     note: '메시지' },
  { utm_source: 'google',          utm_medium: 'cpc',      label: '구글 검색광고',     note: 'Google Ads' },
  { utm_source: 'youtube',         utm_medium: 'video_ad', label: '유튜브 광고',       note: '동영상' },
  { utm_source: 'meta',            utm_medium: 'ad',       label: '페이스북 광고',     note: 'Meta Ads' },
  { utm_source: 'soomgo',          utm_medium: 'referral', label: '숨고',              note: '숨고 플랫폼' },
  { utm_source: 'sms',             utm_medium: 'sms',      label: '문자 캠페인',       note: 'SMS/MMS' },
  { utm_source: 'qr',              utm_medium: 'qr',       label: '오프라인 QR',       note: '전단/명함/현장' },
  { utm_source: 'naver_organic',   utm_medium: 'organic',  label: '네이버 유기검색',   note: '자동분류' },
  { utm_source: 'google_organic',  utm_medium: 'organic',  label: '구글 유기검색',     note: '자동분류' },
  { utm_source: 'daum_organic',    utm_medium: 'organic',  label: '다음 유기검색',     note: '자동분류' },
  { utm_source: 'direct',          utm_medium: 'none',     label: '직접 유입',         note: '자동분류' },
] as const;

/**
 * utm_source + utm_medium 조합으로 CRM 한글 채널명 반환.
 * 매핑에 없으면 utm_source 원본을 그대로 반환.
 */
export function getChannelLabel(utmSource: string, utmMedium: string): string {
  const match = CHANNEL_MASTER.find(
    (ch) => ch.utm_source === utmSource && ch.utm_medium === utmMedium
  );
  if (match) return match.label;

  // medium만 매칭
  const sourceMatch = CHANNEL_MASTER.find((ch) => ch.utm_source === utmSource);
  if (sourceMatch) return sourceMatch.label;

  // fallback: 원본 그대로
  return utmSource || '기타';
}

/**
 * 유입매체 (구글시트 C열 기록용) — "네이버 파워링크 검색광고" 포맷.
 * label + ' ' + note 조합. 매핑에 없으면 utm_source/utm_medium 원본 fallback.
 */
export function getChannelMedia(utmSource: string, utmMedium: string): string {
  const match = CHANNEL_MASTER.find(
    (ch) => ch.utm_source === utmSource && ch.utm_medium === utmMedium
  );
  if (match) return `${match.label} ${match.note}`;

  // source만 매칭
  const sourceMatch = CHANNEL_MASTER.find((ch) => ch.utm_source === utmSource);
  if (sourceMatch) return `${sourceMatch.label} ${sourceMatch.note}`;

  // fallback: 원본
  if (!utmSource) return '기타';
  return utmMedium ? `${utmSource} ${utmMedium}` : utmSource;
}
