/**
 * 폼 제출 공통 함수
 * 4개 폼(HeroConsultSection, BottomBar, ConsultationModal, EstimateForm)에서 호출
 * GAS + GA4 병렬 전송
 */

import { getUtmData } from './utm';
import { getChannelMedia } from './channelMap';

// 상담접수 GAS (ConsultationModal/HeroConsultSection/BottomBar/EstimateForm 공용)
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export async function submitLead(params: {
  phone: string;
  entryForm: string;
  honeypot?: string;
}): Promise<boolean> {
  const { phone, entryForm, honeypot } = params;

  // Honeypot: 사람은 숨겨진 필드를 보지 못함. 값이 채워져 들어오면 봇으로 판단.
  // UX는 정상 제출처럼 보이게 하되 GAS/GA4로는 전송하지 않음.
  if (honeypot && honeypot.trim().length > 0) {
    sessionStorage.setItem('hw_just_submitted', '1');
    return true;
  }

  const utm = getUtmData();
  const channelMedia = getChannelMedia(utm.utm_source, utm.utm_medium);

  // ── (a) GAS — 구글시트 연동 ───────────────────────────────
  // 시트 스키마: A접수일시 B전화번호 C유입매체 D유입채널
  //            E~I utm_source/medium/campaign/content/term
  //            J visit_id K landing_path L referrer
  const gasPayload = {
    phone,
    channel_media: channelMedia,          // C열
    entry_form: entryForm,                // D열
    utm_source: utm.utm_source,           // E
    utm_medium: utm.utm_medium,           // F
    utm_campaign: utm.utm_campaign,       // G
    utm_content: utm.utm_content,         // H
    utm_term: utm.utm_term,               // I
    visit_id: utm.visit_id,               // J
    landing_path: utm.landing_path,       // K
    referrer: utm.referrer,               // L
    timestamp: new Date().toISOString(),
  };

  const gasPromise = fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(gasPayload),
  }).catch((err) => {
    console.error('[GAS 전송 실패]', err);
    throw err;
  });

  // ── (b) GA4 dataLayer.push ────────────────────────────────
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'generate_lead',
      lead_source: entryForm,
      channel_media: channelMedia,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      value: 1,
      currency: 'KRW',
    });
  } catch (err) {
    console.error('[GA4 dataLayer 실패]', err);
  }

  // ── 병렬 대기 ─────────────────────────────────────────────
  const results = await Promise.allSettled([gasPromise]);
  const gasOk = results[0].status === 'fulfilled';

  if (gasOk) {
    // /thanks 가드용 플래그
    sessionStorage.setItem('hw_just_submitted', '1');
  }

  return gasOk;
}
