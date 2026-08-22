/**
 * handleRequestProxy 회귀 테스트.
 *
 * 이 함수는 세 경로가 함께 쓴다 — 랜딩퍼널 접수(/api/request/lead)와
 * 문자 인증 발송·확인(/api/request/sms/*). 시트 연동을 붙이면서 성공 응답의 본문
 * 처리를 바꿨으므로, **훅을 넘기지 않는 두 SMS 경로가 종전과 똑같이 도는 것**을
 * 여기서 못 박는다.
 *
 * 기존 홈페이지 접수(/api/erp-lead)는 이 함수를 쓰지 않는 별도 구현이므로 영향이 없다.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequestProxy } from './requestProxy.ts';

const ENV = { EXTERNAL_LEAD_API_KEY: 'test-key', ERP_API_BASE: 'https://erp.test' };

function postRequest(body: unknown): Request {
  return new Request('https://homewindow.kr/api/request/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** 전역 fetch 를 잠시 바꿔 ERP 응답을 흉내 낸다. */
async function withStubbedErp<T>(
  respond: () => Response,
  run: (calls: { count: number; init?: RequestInit }) => Promise<T>,
): Promise<T> {
  const original = globalThis.fetch;
  const calls: { count: number; init?: RequestInit } = { count: 0 };
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    calls.count += 1;
    calls.init = init;
    return respond();
  }) as unknown as typeof fetch;
  try {
    return await run(calls);
  } finally {
    globalThis.fetch = original;
  }
}

const identity = (input: unknown) => input;

// ── SMS 두 경로의 회귀 (훅을 넘기지 않는 호출) ──────────────

test('훅 없이 부르면 성공 응답의 상태와 본문이 그대로 통과한다', async () => {
  const erpBody = '{"ok":true,"token":"signed-token"}';
  const response = await withStubbedErp(
    () => new Response(erpBody, { status: 200, headers: { 'Content-Type': 'application/json' } }),
    () => handleRequestProxy(postRequest({ tel: '01012345678' }), ENV, '/api/x', identity),
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), erpBody);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('훅 없이 부르면 오류 응답도 그대로 통과한다', async () => {
  const erpBody = '{"ok":false,"code":"RATE_LIMIT"}';
  const response = await withStubbedErp(
    () => new Response(erpBody, { status: 429 }),
    () => handleRequestProxy(postRequest({ tel: '01012345678' }), ENV, '/api/x', identity),
  );

  assert.equal(response.status, 429);
  assert.equal(await response.text(), erpBody);
});

test('본문 없는 응답에서도 예외 없이 그대로 통과한다', async () => {
  const response = await withStubbedErp(
    () => new Response(null, { status: 204 }),
    () => handleRequestProxy(postRequest({ tel: '01012345678' }), ENV, '/api/x', identity),
  );

  assert.equal(response.status, 204);
});

// ── 랜딩퍼널 접수 경로 (훅을 넘기는 호출) ────────────────────

test('ERP 가 성공하면 훅에 원본 body 와 ERP 응답을 넘긴다', async () => {
  const seen: Array<{ rawBody: unknown; erpResult: Record<string, unknown> }> = [];
  const response = await withStubbedErp(
    () => new Response('{"ok":true,"receiptNo":"R-1","docId":"D-1"}', { status: 200 }),
    () =>
      handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity, (args) => {
        seen.push(args);
      }),
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '{"ok":true,"receiptNo":"R-1","docId":"D-1"}');
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0].rawBody, { 연락처: '01012345678' });
  assert.equal(seen[0].erpResult.receiptNo, 'R-1');
});

test('ERP 가 실패하면 훅을 부르지 않는다', async () => {
  let called = 0;
  const response = await withStubbedErp(
    () => new Response('{"ok":false}', { status: 400 }),
    () =>
      handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity, () => {
        called += 1;
      }),
  );

  assert.equal(response.status, 400);
  assert.equal(called, 0);
});

test('ERP 가 200 을 주면서 ok:false 면 훅을 부르지 않는다', async () => {
  let called = 0;
  await withStubbedErp(
    () => new Response('{"ok":false,"error":"중복"}', { status: 200 }),
    () =>
      handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity, () => {
        called += 1;
      }),
  );

  assert.equal(called, 0);
});

test('훅이 예외를 던져도 접수 응답은 성공 그대로 돌아간다', async () => {
  const response = await withStubbedErp(
    () => new Response('{"ok":true,"receiptNo":"R-2"}', { status: 200 }),
    () =>
      handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity, () => {
        throw new Error('시트 전송 준비 실패');
      }),
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '{"ok":true,"receiptNo":"R-2"}');
});

test('ERP 응답이 JSON 이 아니어도 접수 응답을 뒤집지 않는다', async () => {
  let called = 0;
  const response = await withStubbedErp(
    () => new Response('<html>gateway</html>', { status: 200 }),
    () =>
      handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity, () => {
        called += 1;
      }),
  );

  assert.equal(response.status, 200);
  assert.equal(called, 0);
});

test('ERP 연결 자체가 끊기면 502 로 알린다', async () => {
  const response = await withStubbedErp(
    () => { throw new Error('connection reset'); },
    () => handleRequestProxy(postRequest({ 연락처: '01012345678' }), ENV, '/api/x', identity),
  );

  assert.equal(response.status, 502);
});
