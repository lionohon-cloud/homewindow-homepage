/**
 * 폼 제출 공통 함수
 * 4개 폼(HeroConsultSection, BottomBar, ConsultationModal, EstimateForm)에서 호출
 * GAS + GA4 병렬 전송
 */

import { getUtmData } from './utm';
import {
  getChannelMedia,
  buildErpUtm,
  buildErpInflowChannel,
} from './channelMap';
import {
  regionLabel,
  consultFieldLabel,
} from '@/app/components/ConsultRegionFieldModal';

// 상담접수 GAS (ConsultationModal/HeroConsultSection/BottomBar/EstimateForm 공용)
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** submitLead(Call1) 결과. docId 는 ERP 응답에서 파싱 — 2단계(지역·분야) 반영(Call2)에 사용. */
export interface SubmitLeadResult {
  ok: boolean;
  docId: string | null;
}

export async function submitLead(params: {
  phone: string;
  entryForm: string;
  honeypot?: string;
  /**
   * AI상담 셸 접수 마커 (시군구 개편 Phase E, 2026-07-10).
   *   설정 시 inflowChannel 이 AI_CHAT 으로 찍히고(모니터링 페이지 조회 키),
   *   summary(매크로 견적 문답 요약)가 ERP 에 함께 저장돼 팀장이 전화 전 맥락 파악.
   */
  aiChat?: { summary?: string };
  /**
   * 접수 시점에 이미 확정된 상담분야 (AI상담 분기 — 사장님 지시 2026-07-10).
   *   지도 팝업(Call2)을 닫거나 건너뛰어도 ERP 배지에 분야가 남도록 Call1 에 싣는다.
   */
  consultField?: string;
}): Promise<SubmitLeadResult> {
  const { phone, entryForm, honeypot, aiChat, consultField } = params;

  // Honeypot: 사람은 숨겨진 필드를 보지 못함. 값이 채워져 들어오면 봇으로 판단.
  // UX는 정상 제출처럼 보이게 하되 GAS/GA4로는 전송하지 않음.
  if (honeypot && honeypot.trim().length > 0) {
    sessionStorage.setItem('hw_just_submitted', '1');
    return { ok: true, docId: null };
  }

  const utm = getUtmData();
  const channelMedia = getChannelMedia(utm.utm_source, utm.utm_medium);

  // ── (a) GAS — 구글시트 연동 ───────────────────────────────
  // 시트 스키마: A접수일시 B전화번호 C유입매체 D유입채널
  //            E~I utm_source/medium/campaign/content/term
  //            J visit_id K landing_path L referrer
  // region/consult_field: 2단계 팝업(Call2)에서 받는 값. Call1 시점엔 아직 미선택 →
  // 시트 컬럼만 확보하도록 빈값으로 전송(GAS 는 시트에 append-only, 키로 update 안 함).
  // Call2 에서 GAS 재전송하면 같은 접수 건이 두 행으로 중복되므로 재전송하지 않음.
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
    region: '',                           // 지역 라벨 (Call2 미반영 → 빈값)
    // 상담분야 라벨 — AI상담 분기는 접수 시점에 이미 확정 → 시트에도 기록.
    consult_field: consultField ? consultFieldLabel(consultField) : '',
    timestamp: new Date().toISOString(),
  };

  // GAS 는 append-only 구글시트 로그(비필수). 응답을 기다리지 않는다.
  //  - GAS /exec 는 script.googleusercontent.com 으로 302 리다이렉트 → 왕복 2배(측정 2.5~3s).
  //    이 지연이 상담 접수 UX를 통째로 막던 주범이라, 화면 대기에서 분리한다.
  //  - keepalive: /thanks 이동·탭 종료 후에도 전송 완료 보장.
  //  - resolve 는 성공/실패 여부만 담아, ERP 가 실패했을 때의 폴백 판정에만 쓴다.
  const gasPromise: Promise<{ ok: boolean }> = fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(gasPayload),
    keepalive: true,
  })
    .then(() => ({ ok: true }))
    .catch((err) => {
      console.error('[GAS 전송 실패]', err);
      return { ok: false };
    });

  // ── (a-2) ERP — 청암홈윈도우 ERP 자동등록 ─────────────────
  // 사용자 확정 스펙대로 페이로드 구성. 실패해도 사용자 화면은 영향 없음.
  const erpPayload = {
    phone,
    // customerName, address: 폼에서 받지 않으므로 생략 (ERP 측 optional)
    utm: buildErpUtm(utm),
    // AI상담 셸 접수는 AI_CHAT 채널로 구분 (모니터링·통계 조회 키. 사장님 지시 2026-07-10)
    inflowChannel: aiChat
      ? { type: 'auto', code: 'AI_CHAT', label: 'AI 상담' }
      : buildErpInflowChannel(),
    status: '신규고객',
    category: 'INTAKE',
    consultationNotes: [],
    createdBy: 'homepage-form',
    managerId: null,
    // 매크로 견적 문답 요약 — ERP 상담 상세·입찰 알림에서 표시 (undefined 면 필드 생략)
    aiChatSummary: aiChat?.summary?.slice(0, 500) || undefined,
    // 접수 시점 확정 분야 (AI상담 분기) — ERP 가 FIELD_CODES 로 검증 후 저장.
    consultField: consultField || undefined,
    // createdAt은 ERP 서버에서 serverTimestamp() 설정
  };
  // ERP 응답 본문에서 docId 파싱 → 2단계(지역·분야) 반영(Call2)에 사용.
  // ok/docId 를 함께 담아 반환 (r.ok 만으론 docId 를 알 수 없음).
  const erpPromise: Promise<{ ok: boolean; docId: string | null }> = fetch(
    '/api/erp-lead',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(erpPayload),
    },
  )
    .then(async (r) => {
      const text = await r.text().catch(() => '');
      if (!r.ok) {
        console.error('[ERP 등록 실패]', r.status, text);
        // GA4 이벤트로 실패 추적
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'erp_lead_failed', { status: r.status });
          }
        } catch { /* ignore */ }
        return { ok: false, docId: null };
      }
      let docId: string | null = null;
      try {
        const json = JSON.parse(text) as { docId?: unknown };
        if (typeof json.docId === 'string') docId = json.docId;
      } catch { /* 파싱 실패 시 docId 없이 진행 */ }
      return { ok: true, docId };
    })
    .catch((err) => {
      console.error('[ERP 네트워크 실패]', err);
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'erp_lead_failed', { status: 'network' });
        }
      } catch { /* ignore */ }
      return { ok: false, docId: null };
    });

  // ── (b) GA4 이벤트 전송 — gtag.js + dataLayer 이중 전송 ──
  // gtag.js: index.html에 직접 설치된 GA4로 전송 (현재 주 경로)
  // dataLayer: 추후 GTM 복구 시 호환 유지
  const ga4Params = {
    lead_source: entryForm,
    channel_media: channelMedia,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    value: 1,
    currency: 'KRW',
  };

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', ga4Params);
    }
  } catch (err) {
    console.error('[GA4 gtag 실패]', err);
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'generate_lead',
      ...ga4Params,
    });
  } catch (err) {
    console.error('[GA4 dataLayer 실패]', err);
  }

  // ── ERP 우선 대기 ────────────────────────────────────────
  // 화면 진행에 필요한 건 ERP 응답(접수 확정 + docId)뿐이므로 ERP 만 기다린다.
  // GAS(느린 비필수 로그)는 백그라운드에서 계속 전송된다 → 대기 시간 ~5s → ~1s.
  // erpPromise 는 항상 { ok, docId } 로 resolve (실패도 .catch 에서 흡수).
  const erp = await erpPromise;

  // (2026-05-19) 광고차단 익스텐션이 script.googleusercontent.com 차단 환경 대응은
  // 이제 ERP 를 주 경로로 삼는 것으로 해결됨.
  // 단, ERP 가 실패한 경우엔 GAS 성공 여부를 폴백으로 확인해 잘못된 "전송 실패" 표시를 막는다.
  let submitted = erp.ok;
  if (!submitted) {
    const gas = await gasPromise;
    submitted = gas.ok;
  }

  if (submitted) {
    // /thanks 가드용 플래그
    sessionStorage.setItem('hw_just_submitted', '1');
  }

  return { ok: submitted, docId: erp.docId };
}

/**
 * Call2 — 접수 건에 지역·상담분야 추가 반영.
 * POST /api/erp-lead-update (docId, region, consultField, consultFieldText?). GA4 이벤트도 함께 발송.
 * 시군구 개편 (2026-07-10): region = TERRITORY 4자리 시군구 코드 (ERP 는 과도기에 9권역도 수용).
 *   consultFieldText = 상담분야 「직접입력」 자유 텍스트 (consultField='ETC' 동반).
 * 실패해도 throw 하지 않음(고객 흐름을 막지 않는다). 결과 boolean 만 반환.
 */
export async function submitLeadDetail(
  docId: string,
  region: string,
  consultField: string,
  consultFieldText?: string,
): Promise<boolean> {
  let ok = false;
  try {
    const res = await fetch('/api/erp-lead-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, region, consultField, consultFieldText }),
    });
    ok = res.ok;
    if (!ok) {
      const t = await res.text().catch(() => '');
      console.error('[ERP 상세 반영 실패]', res.status, t);
    }
  } catch (err) {
    console.error('[ERP 상세 반영 네트워크 실패]', err);
    ok = false;
  }

  // GA4: Call2 성공 시 신규 이벤트 (gtag + dataLayer 이중 전송, generate_lead 패턴 동일).
  if (ok) {
    const ga4Params = {
      region,
      consult_field: consultField,
      region_label: regionLabel(region),
      consult_field_label: consultFieldLabel(consultField),
    };
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'consult_detail_submitted', ga4Params);
      }
    } catch (err) {
      console.error('[GA4 gtag 실패]', err);
    }
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consult_detail_submitted',
        ...ga4Params,
      });
    } catch (err) {
      console.error('[GA4 dataLayer 실패]', err);
    }
  }

  return ok;
}
