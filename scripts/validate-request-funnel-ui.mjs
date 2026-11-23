import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

class FakeClassList {
  names = new Set();

  add(...names) { names.forEach((name) => this.names.add(name)); }
  remove(...names) { names.forEach((name) => this.names.delete(name)); }
  contains(name) { return this.names.has(name); }
}

class FakeElement {
  constructor({ text = '', value = '' } = {}) {
    this.textContent = text;
    this.value = value;
    this.innerHTML = '';
    this.disabled = false;
    this.readOnly = false;
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.queries = new Map();
    this.attributes = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  async dispatch(type) {
    for (const listener of this.listeners.get(type) || []) {
      await listener({ target: this, key: '', preventDefault() {} });
    }
  }

  click() { return this.dispatch('click'); }
  focus() {}
  setAttribute(name, value) { this.attributes.set(name, value); }
  querySelector(selector) { return this.queries.get(selector) || null; }
}

const source = readFileSync('public/request/app.js', 'utf8');
const functionStart = source.indexOf('function initTelVerify(){');
const functionEnd = source.indexOf('/* ── 모달 열고 닫기 ── */', functionStart);
assert.ok(functionStart >= 0 && functionEnd > functionStart, 'initTelVerify source must be present');
const initSource = source.slice(functionStart, functionEnd);

const telField = new FakeElement();
const tel = new FakeElement({ value: '010-1234-5678' });
const send = new FakeElement({ text: '인증번호 받기' });
const codeField = new FakeElement();
codeField.classList.add('hidden');
const code = new FakeElement();
const check = new FakeElement({ text: '확인' });
const note = new FakeElement();
const label = new FakeElement();
const telError = new FakeElement({ text: '연락처를 다시 확인해 주세요.' });
const codeError = new FakeElement({ text: '인증번호가 맞지 않습니다.' });
telField.queries.set('label', label);
telField.queries.set('.err', telError);
codeField.queries.set('.err', codeError);

const elements = new Map([
  ['f-tel', telField],
  ['i-tel', tel],
  ['send-code', send],
  ['f-code', codeField],
  ['i-code', code],
  ['check-code', check],
  ['code-note', note],
]);

const requests = [];
let attempt = 0;
async function fakeFetch(url, init) {
  requests.push({ url, body: JSON.parse(String(init.body)) });
  attempt += 1;
  if (attempt === 1) {
    return new Response(JSON.stringify({ ok: false, code: 'SEND_FAILED' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const flowId = '018f47a0-e5d2-4fe2-8f54-57562212f99f';
const initTelVerify = new Function(
  '$', 'fetch', 'track', 'SMS_API', 'FLOW_ID', 'document', 'setInterval', 'clearInterval',
  `${initSource}; return initTelVerify;`,
)(
  (id) => elements.get(id) || null,
  fakeFetch,
  () => {},
  '/api/request',
  flowId,
  { createElement: () => new FakeElement() },
  () => 1,
  () => {},
);

const V = initTelVerify();
assert.equal(send.disabled, false, 'valid phone should enable SMS send');

// 261123 — 문자 발송 장애(SEND_FAILED·5xx)면 고객을 막지 않고 인증 없이 번호만으로 진행한다
await send.click();
assert.equal(V.isVerified(), true, 'SMS outage must let the customer continue without verification');
assert.equal(V.token(), '', 'no verification token during outage');
assert.equal(codeField.classList.contains('hidden'), true, 'verification field stays hidden during outage');
assert.equal(send.disabled, true, 'send button is locked once bypassed');
assert.equal(telField.classList.contains('bad'), false, 'outage bypass must not show a phone error');
assert.equal(requests.length, 1);
assert.deepEqual(requests[0], {
  url: '/api/request/sms/send',
  body: { tel: '01012345678', flowId },
});

console.log('Request funnel SMS outage bypass UI is safe.');
