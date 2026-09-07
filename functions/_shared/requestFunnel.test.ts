import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RequestInputError,
  forwardErp,
  normalizeLead,
  normalizeSmsSend,
  normalizeSmsVerify,
} from './requestFunnel.ts';

const FLOW_ID = '018f47a0-e5d2-4fe2-8f54-57562212f99f';

function rawLead(overrides: Record<string, unknown> = {}) {
  return {
    flowId: FLOW_ID,
    연락처: '010-1234-5678',
    인증토큰: 'signed-phone-verification-token',
    접수경로: '단지견적',
    거주형태: '아파트',
    경로: 'apt',
    상담권역: '서울 강남구',
    법정동: '역삼동',
    단지명: '테스트아파트',
    준공연도: 2001,
    연차: 25,
    세대수: 500,
    동수: 8,
    최고층: 25,
    복도유형: '계단식',
    난방방식: '지역난방',
    시공사: '청암건설',
    창호세대: '2세대',
    창호종류: '알루미늄 이중창',
    단열성능: '약 3.4 W/m²K',
    평형: '30평대',
    교체범위: '집 전체',
    교체시기: '3개월 이내',
    헤드라인: 'A',
    동의방식: '견적 받기 버튼 클릭',
    동의문구버전: '2024-01-01',
    접수시각: '2026-08-13T05:12:00.000Z',
    utm: {
      utm_source: 'naver',
      utm_campaign: 'summer',
      landing_path: '/request/?utm_source=naver',
      referrer: 'https://search.naver.com/',
      ignored: 'do-not-forward',
    },
    ...overrides,
  };
}

test('Korean funnel payload is normalized to the ERP contract', () => {
  const result = normalizeLead(rawLead());
  assert.equal(result.phone, '01012345678');
  assert.equal(result.intakeRequestId, FLOW_ID);
  assert.equal(result.phoneVerificationToken, 'signed-phone-verification-token');
  assert.equal(result.address, '서울 강남구 역삼동 테스트아파트');
  assert.deepEqual(result.inflowChannel, {
    type: 'auto', code: 'WEB_FORM', label: '홈페이지 견적 퍼널',
  });
  assert.equal(result.consultField, 'WINDOW_REPLACE');
  assert.deepEqual(result.utm, {
    utm_source: 'naver',
    utm_campaign: 'summer',
    landing_path: '/request/?utm_source=naver',
    referrer: 'https://search.naver.com/',
  });
  assert.deepEqual(Object.keys(result.requestFunnelSnap).sort(), [
    'residenceType', 'path', 'region', 'legalDong', 'complexName',
    'completionYear', 'buildingAge', 'householdCount', 'buildingCount', 'maxFloor',
    'corridorType', 'heatingType', 'builder', 'windowGeneration',
    'windowTypeEstimate', 'insulationEstimate', 'areaPyeong', 'replacementScope',
    'replacementTiming', 'headlineVariant', 'consentMethod', 'consentVersion', 'submittedAt',
  ].sort());
});

test('region/house lead omits empty optional snapshot fields for the strict ERP schema', () => {
  const result = normalizeLead(rawLead({
    접수경로: '지역선택',
    거주형태: '주택',
    경로: 'house',
    상담권역: '경기 성남시',
    법정동: '',
    단지명: '',
    준공연도: null,
    연차: null,
    세대수: null,
    동수: null,
    최고층: null,
    복도유형: '',
    난방방식: '',
    시공사: '',
    창호세대: '',
    창호종류: '',
    단열성능: '',
    평형: '',
    교체범위: '',
    교체시기: '',
    헤드라인: '',
    동의방식: '상담 신청하기 버튼 클릭',
  }));

  assert.deepEqual(result.requestFunnelSnap, {
    residenceType: '주택',
    path: 'house',
    region: '경기 성남시',
    consentMethod: '상담 신청하기 버튼 클릭',
    consentVersion: '2024-01-01',
    submittedAt: '2026-08-13T05:12:00.000Z',
  });
  assert.equal(
    Object.values(result.requestFunnelSnap).some((value) => value === '' || value === null),
    false,
  );
  assert.equal(result.address, '경기 성남시');
});

test('flowId and phone verification token are mandatory', () => {
  assert.throws(() => normalizeLead(rawLead({ flowId: '' })), RequestInputError);
  assert.throws(() => normalizeLead(rawLead({ 인증토큰: '' })), RequestInputError);
  assert.throws(() => normalizeLead(rawLead({ flowId: 'not-a-uuid' })), RequestInputError);
});

test('apartment path keeps its complex name requirement', () => {
  assert.throws(() => normalizeLead(rawLead({ 단지명: '' })), /단지명 값이 필요합니다/);
});

test('field limits and formats reject malformed lead payloads', () => {
  assert.throws(() => normalizeLead(rawLead({ 단지명: '가'.repeat(151) })), /너무 깁니다/);
  assert.throws(() => normalizeLead(rawLead({ 준공연도: 1800 })), /준공연도/);
  assert.throws(() => normalizeLead(rawLead({ 연락처: '0212345678' })), /연락처/);
});

test('SMS adapters require one flowId across send and verify', () => {
  assert.deepEqual(normalizeSmsSend({ tel: '010-1234-5678', flowId: FLOW_ID }), {
    tel: '01012345678', flowId: FLOW_ID,
  });
  assert.deepEqual(normalizeSmsVerify({ tel: '01012345678', code: '123456', flowId: FLOW_ID }), {
    tel: '01012345678', code: '123456', flowId: FLOW_ID,
  });
  assert.throws(() => normalizeSmsSend({ tel: '01012345678' }), /flowId/);
  assert.throws(() => normalizeSmsVerify({ tel: '01012345678', code: '123456' }), /flowId/);
});

test('ERP forward keeps payload/status and sends client IP only as a header', async () => {
  let captured: { input?: RequestInfo | URL; init?: RequestInit } = {};
  const fetcher: typeof fetch = async (input, init) => {
    captured = { input, init };
    return new Response(JSON.stringify({ ok: false, code: 'OTP_EXPIRED' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  const response = await forwardErp(
    fetcher,
    'https://erp.example/api/external/inbound-customers',
    'server-secret',
    { phone: '01012345678' },
    '203.0.113.7',
  );
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { ok: false, code: 'OTP_EXPIRED' });
  const headers = new Headers(captured.init?.headers);
  assert.equal(headers.get('authorization'), 'Bearer server-secret');
  assert.equal(headers.get('x-request-client-ip'), '203.0.113.7');
  assert.deepEqual(JSON.parse(String(captured.init?.body)), { phone: '01012345678' });
});
