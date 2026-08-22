import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildLeadSheetRow, normalizeLead } from './requestFunnel.ts';
import {
  LEAD_SHEET_KV_PREFIX,
  deliverLeadSheet,
  postLeadSheet,
  resolveGasLeadUrl,
} from './leadSheet.ts';

const FLOW_ID = '018f47a0-e5d2-4fe2-8f54-57562212f99f';
const RECEIPT = 'CAH-260813-ABCD12';

/** 시트 열 순서. GAS 가 키 이름으로 열을 고르므로 이름이 어긋나면 그 열이 통째로 빈다. */
const SHEET_KEYS = [
  'phone', 'channel_media', 'entry_form',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'visit_id', 'landing_path', 'referrer',
  'region', 'consult_field', 'timestamp',
];

function rawLead(overrides: Record<string, unknown> = {}) {
  return {
    flowId: FLOW_ID,
    연락처: '010-1234-5678',
    인증토큰: 'signed-phone-verification-token',
    거주형태: '아파트',
    경로: 'apt',
    상담권역: '서울 강남구',
    단지명: '테스트아파트',
    동의방식: '견적 받기 버튼 클릭',
    동의문구버전: '2024-01-01',
    접수시각: '2026-08-13T05:12:00.000Z',
    utm: {
      utm_source: 'naver',
      utm_medium: 'cpc',
      landing_path: '/request/?utm_source=naver',
      referrer: 'https://search.naver.com/',
    },
    ...overrides,
  };
}

function fakeKv() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => { store.set(key, value); },
  } as unknown as KVNamespace & { store: Map<string, string> };
}

const noSleep = async () => {};

// ── 행 구성 ────────────────────────────────────────────────

test('키 집합이 기존 홈페이지 접수의 웹훅 payload 와 일치한다', () => {
  // GAS 는 키 이름으로 열을 고르므로, 기존 홈페이지가 보내는 키와 어긋나면 그 열이 통째로 빈다.
  // 기준을 이 파일 안의 배열이 아니라 실제 홈페이지 코드에서 뽑아야 대조가 성립한다.
  const source = readFileSync(new URL('../../src/lib/submitLead.ts', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('const gasPayload = {'));
  // `phone,` 같은 단축 속성 표기도 함께 잡는다.
  const keys = [...block.slice(0, block.indexOf('};')).matchAll(/^\s{4}(\w+)\s*[,:]/gm)]
    .map((m) => m[1]);

  assert.ok(keys.length > 0, '홈페이지 payload 키를 뽑지 못했습니다');
  assert.deepEqual([...keys].sort(), [...SHEET_KEYS].sort());
  assert.deepEqual([...keys].sort(), Object.keys(buildLeadSheetRow(rawLead())).sort());
});

test('시트 행은 값이 없는 항목도 빈 문자열로 채운다', () => {
  const row = buildLeadSheetRow(rawLead({ utm: {} }));
  assert.deepEqual(Object.keys(row), SHEET_KEYS);
  for (const [key, value] of Object.entries(row)) {
    assert.equal(typeof value, 'string', `${key} 가 문자열이 아닙니다`);
  }
  assert.equal(row.utm_source, '');
  assert.equal(row.visit_id, '');
});

test('UTM 없는 직접유입 건도 행이 만들어진다', () => {
  const row = buildLeadSheetRow(rawLead({ utm: undefined }));
  assert.deepEqual(Object.keys(row), SHEET_KEYS);
  assert.equal(row.utm_source, '');
});

test('유입채널은 ERP 에 저장되는 라벨과 같은 값이다', () => {
  const row = buildLeadSheetRow(rawLead());
  assert.equal(row.entry_form, normalizeLead(rawLead()).inflowChannel.label);
  assert.equal(row.entry_form, '홈페이지 견적 퍼널');
});

test('유입매체는 ERP 저장값을 그대로 쓰므로 대개 공란이다', () => {
  assert.equal(buildLeadSheetRow(rawLead()).channel_media, '');
  const withMedia = buildLeadSheetRow(rawLead({
    utm: { inflowMedia: '네이버 파워링크' },
  }));
  assert.equal(withMedia.channel_media, '네이버 파워링크');
});

test('전화번호는 ERP 저장 표기와 같은 하이픈 형식으로 넣는다', () => {
  assert.equal(buildLeadSheetRow(rawLead()).phone, '010-1234-5678');
  assert.equal(
    buildLeadSheetRow(rawLead({ 연락처: '0111234567' })).phone,
    '011-123-4567',
  );
});

test('접수일시는 전송 시각이 아니라 요청에 담긴 접수시각을 쓴다', () => {
  assert.equal(buildLeadSheetRow(rawLead()).timestamp, '2026-08-13T05:12:00.000Z');
});

test('UTM 값은 그대로 옮겨 담는다', () => {
  const row = buildLeadSheetRow(rawLead());
  assert.equal(row.utm_source, 'naver');
  assert.equal(row.utm_medium, 'cpc');
  assert.equal(row.landing_path, '/request/?utm_source=naver');
  assert.equal(row.referrer, 'https://search.naver.com/');
});

// ── 전송 ───────────────────────────────────────────────────

test('웹훅은 기존 홈페이지와 같은 형식으로 보낸다', async () => {
  const row = buildLeadSheetRow(rawLead());
  let captured: { url: string; init: RequestInit } | null = null;
  const fetcher = (async (url: string, init: RequestInit) => {
    captured = { url, init };
    return new Response('{"result":"success"}', { status: 200 });
  }) as unknown as typeof fetch;

  const result = await postLeadSheet(fetcher, 'https://example.test/exec', row);

  assert.equal(result.ok, true);
  assert.equal(captured!.url, 'https://example.test/exec');
  assert.equal(captured!.init.method, 'POST');
  assert.equal(
    (captured!.init.headers as Record<string, string>)['Content-Type'],
    'text/plain;charset=utf-8',
  );
  assert.deepEqual(JSON.parse(captured!.init.body as string), row);
});

test('환경변수가 비면 코드 상수로 폴백한다', () => {
  assert.match(resolveGasLeadUrl(undefined), /^https:\/\/script\.google\.com\/macros\//);
  assert.equal(resolveGasLeadUrl('  '), resolveGasLeadUrl(undefined));
  assert.equal(resolveGasLeadUrl('https://example.test/exec'), 'https://example.test/exec');
});

test('5xx 는 재시도하고 성공하면 sent 로 기록한다', async () => {
  const kv = fakeKv();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return new Response('', { status: calls < 3 ? 500 : 200 });
  }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  assert.equal(calls, 3);
  const stored = JSON.parse(kv.store.get(`${LEAD_SHEET_KV_PREFIX}${RECEIPT}`)!);
  assert.equal(stored.state, 'sent');
});

test('응답을 받지 못하면 중복을 피해 재시도하지 않고 사서함에 남긴다', async () => {
  const kv = fakeKv();
  let calls = 0;
  const fetcher = (async () => { calls += 1; throw new Error('network'); }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  // 시트에 행이 들어갔는지 알 수 없으므로 다시 보내지 않는다. 중복보다 누락을 택한다.
  assert.equal(calls, 1);
  const stored = JSON.parse(kv.store.get(`${LEAD_SHEET_KV_PREFIX}${RECEIPT}`)!);
  assert.equal(stored.state, 'failed');
  assert.equal(stored.row.phone, '010-1234-5678');
});

test('5xx 만 이어지면 재시도를 다 쓰고 사서함에 남긴다', async () => {
  const kv = fakeKv();
  let calls = 0;
  const fetcher = (async () => { calls += 1; return new Response('', { status: 503 }); }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  assert.equal(calls, 3);
  assert.equal(JSON.parse(kv.store.get(`${LEAD_SHEET_KV_PREFIX}${RECEIPT}`)!).state, 'failed');
});

test('4xx 는 다시 보내도 같은 결과이므로 재시도하지 않는다', async () => {
  const kv = fakeKv();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return new Response('', { status: 400 });
  }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  assert.equal(calls, 1);
});

test('이미 보낸 접수번호면 한 번도 보내지 않는다', async () => {
  const kv = fakeKv();
  kv.store.set(`${LEAD_SHEET_KV_PREFIX}${RECEIPT}`, JSON.stringify({ state: 'sent' }));
  let calls = 0;
  const fetcher = (async () => { calls += 1; return new Response('', { status: 200 }); }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  assert.equal(calls, 0);
});

test('KV 바인딩이 없어도 전송은 한 번 수행한다', async () => {
  let calls = 0;
  const fetcher = (async () => { calls += 1; return new Response('', { status: 500 }); }) as unknown as typeof fetch;

  await deliverLeadSheet({
    kv: undefined, url: 'https://example.test/exec',
    row: buildLeadSheetRow(rawLead()), receiptNo: RECEIPT,
    fetcher, sleep: noSleep,
  });

  // 중복을 막을 수단이 없으므로 재시도하지 않는다.
  assert.equal(calls, 1);
});
