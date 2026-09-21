/**
 * 휴대폰 본인확인 (260917)
 *
 * 목적 — 가맹점 시스템으로 넘기기 전에 허위번호를 막는다.
 *
 * 흐름
 *   폼 제출 → submitLead() 가 requestPhoneVerification(phone) 을 부른다
 *   → PhoneVerifyHost 가 본인확인 팝업을 띄운다 → 결과(true/false)로 접수를 이어가거나 멈춘다.
 *   폼 컴포넌트마다 팝업을 따로 달지 않으려고 전역 스토어 + 호스트 하나로 묶었다.
 *
 * 규칙 — 2자리 · 3분 유효 · 5회 오답 시 재발송 필요 · 재발송 30초 간격
 *
 * 서버 연동 (VERIFY_TEST_MODE = false)
 *   견적 퍼널(public/request)이 이미 쓰는 문자인증 API 를 그대로 쓴다.
 *     POST /api/request/sms/send    { tel, flowId }        → { ok, code? }
 *     POST /api/request/sms/verify  { tel, flowId, code }  → { ok, token?, code?, attemptsLeft? }
 *   통과하면 받은 token 을 접수(/api/erp-lead) 페이로드의 phoneVerificationToken 으로 싣고,
 *   같은 flowId 를 intakeRequestId 로 쓴다 — ERP 가 "이 번호를 이 접수에서 인증했다" 를 대조할 수 있게.
 *   인증번호를 만들고 맞는지 보는 일은 반드시 서버(ERP)가 한다. 브라우저는 번호를 모른다.
 *
 * VERIFY_TEST_MODE (로컬 시연용 · .env.local 의 VITE_PHONE_VERIFY_TEST=1)
 *   문자를 보내지 않고 화면 위에 가짜 문자 알림을 띄우며, submitLead 는 접수를 실제로 보내지 않는다.
 */

/** 로컬 시연 스위치 — .env.local 에 VITE_PHONE_VERIFY_TEST=1 을 둘 때만 켜진다.
 *  배포 빌드에는 넣지 않으므로 기본은 실제 문자인증 API 를 쓴다. */
export const VERIFY_TEST_MODE = import.meta.env.VITE_PHONE_VERIFY_TEST === "1";

export const CODE_LENGTH = 2; // 260917 결정 — 4 → 2자리. ERP 발급 자릿수와 반드시 같아야 한다.
export const CODE_TTL_MS = 3 * 60 * 1000;
export const MAX_TRIES = 5;
export const RESEND_COOLDOWN_MS = 30 * 1000;
export const MAX_SENDS = 5;

const SMS_API = "/api/request/sms";

/** 문자 본문. 마지막 줄 "@도메인 #번호" 가 있어야 안드로이드 크롬 자동 채우기(WebOTP)가 동작한다.
 *  실서비스 문자 문구는 ERP 가 만든다 — 이 형식을 ERP 문자 템플릿에도 맞춰야 한다. */
export const smsBody = (code: string) =>
  `[청암홈윈도우] 인증번호 [${code}]를 입력해주세요.\n\n@www.homewindow.kr #${code}`;

/* ── 번호별 인증 진행 상태 ─────────────────────────────── */

type Session = {
  flowId: string; // 발송·검증·접수를 하나로 묶는 UUID v4 (서버 FLOW_ID_RE 형식)
  expiresAt: number;
  sends: number;
  lastSentAt: number;
  tries: number;
  code?: string; // TEST_MODE 에서만 채운다
  token?: string; // 서버 검증 통과 시 받은 토큰
};
const sessions = new Map<string, Session>();

const digits = (phone: string) => phone.replace(/[^0-9]/g, "");

function uuidV4() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  const b = new Uint8Array(16);
  globalThis.crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function post(path: "send" | "verify", body: Record<string, unknown>) {
  try {
    const res = await fetch(`${SMS_API}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let json: Record<string, unknown> = {};
    try {
      json = await res.json();
    } catch {
      /* 본문 없음 */
    }
    return { ok: false, status: res.status, ...json } as {
      ok: boolean;
      code?: string;
      token?: string;
      attemptsLeft?: number;
      error?: string;
    };
  } catch {
    return { ok: false, code: path === "send" ? "SEND_FAILED" : "VERIFY_FAILED" };
  }
}

/* ── 발송 ───────────────────────────────────────────────── */

export type SendResult =
  | { ok: true; expiresAt: number }
  | { ok: false; reason: "cooldown"; waitMs: number; expiresAt: number }
  | { ok: false; reason: "limit" | "failed"; message: string };

export async function sendCode(phone: string): Promise<SendResult> {
  const now = Date.now();
  const prev = sessions.get(phone);
  if (prev && now - prev.lastSentAt < RESEND_COOLDOWN_MS) {
    // 30초 안에 다시 연 경우 — 방금 보낸 번호가 아직 유효하니 그 시간을 그대로 이어 쓴다
    return { ok: false, reason: "cooldown", waitMs: RESEND_COOLDOWN_MS - (now - prev.lastSentAt), expiresAt: prev.expiresAt };
  }
  if (prev && prev.sends >= MAX_SENDS) {
    return { ok: false, reason: "limit", message: "인증번호를 너무 많이 요청했어요. 잠시 후 다시 시도해 주세요." };
  }

  const session: Session = {
    flowId: prev?.flowId ?? uuidV4(),
    expiresAt: now + CODE_TTL_MS,
    sends: (prev?.sends ?? 0) + 1,
    lastSentAt: now,
    tries: 0,
  };

  if (VERIFY_TEST_MODE) {
    session.code = String(Math.floor(Math.random() * 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
    sessions.set(phone, session);
    await new Promise((r) => setTimeout(r, 500)); // 발송 대기 흉내
    emitFakeSms(phone, session.code);
    return { ok: true, expiresAt: session.expiresAt };
  }

  const r = await post("send", { tel: digits(phone), flowId: session.flowId });
  if (!r.ok) {
    if (r.code === "RATE_LIMIT") {
      return { ok: false, reason: "limit", message: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." };
    }
    if (r.code === "INVALID_TEL") {
      return { ok: false, reason: "failed", message: "번호를 다시 확인해 주세요." };
    }
    return { ok: false, reason: "failed", message: "문자 발송에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }
  sessions.set(phone, session);
  return { ok: true, expiresAt: session.expiresAt };
}

/* ── 확인 ───────────────────────────────────────────────── */

export type CheckResult = "ok" | "wrong" | "expired" | "locked" | "error";

export async function checkCode(
  phone: string,
  input: string,
): Promise<{ result: CheckResult; left: number | null }> {
  const s = sessions.get(phone);
  if (!s || Date.now() > s.expiresAt) return { result: "expired", left: 0 };

  if (VERIFY_TEST_MODE) {
    await new Promise((r) => setTimeout(r, 250));
    if (s.tries >= MAX_TRIES) return { result: "locked", left: 0 };
    if (input === s.code) {
      s.token = `TEST-TOKEN-${Date.now()}`;
      return { result: "ok", left: MAX_TRIES - s.tries };
    }
    s.tries += 1;
    const left = MAX_TRIES - s.tries;
    return { result: left <= 0 ? "locked" : "wrong", left };
  }

  const r = await post("verify", { tel: digits(phone), flowId: s.flowId, code: input });
  if (r.ok && r.token) {
    s.token = r.token;
    return { result: "ok", left: null };
  }
  const left = typeof r.attemptsLeft === "number" ? r.attemptsLeft : null;
  if (r.code === "CODE_MISMATCH") return { result: left === 0 ? "locked" : "wrong", left };
  if (r.code === "CODE_EXPIRED") return { result: "expired", left: 0 };
  if (r.code === "TOO_MANY_ATTEMPTS") return { result: "locked", left: 0 };
  return { result: "error", left };
}

/**
 * 접수 직전에 한 번 꺼내 쓴다 — flowId(=intakeRequestId) 와 서버 토큰.
 * 꺼내면 지운다: 토큰은 접수 한 건에만 쓰는 것으로 보고, 다음 접수는 다시 인증한다.
 */
export function takeVerification(phone: string): { flowId: string; token: string } | null {
  const s = sessions.get(phone);
  if (!s?.token) return null;
  sessions.delete(phone);
  return { flowId: s.flowId, token: s.token };
}

/* ── 가짜 문자 알림 (TEST_MODE 전용) ───────────────────── */

export type FakeSms = { id: number; phone: string; code: string; body: string };
type SmsListener = (sms: FakeSms) => void;
const smsListeners = new Set<SmsListener>();
export const onFakeSms = (fn: SmsListener) => {
  smsListeners.add(fn);
  return () => void smsListeners.delete(fn);
};
function emitFakeSms(phone: string, code: string) {
  const sms = { id: Date.now(), phone, code, body: smsBody(code) };
  smsListeners.forEach((fn) => fn(sms));
}

/* ── 팝업 요청 스토어 ───────────────────────────────────── */

export type VerifyRequest = { phone: string; resolve: (verified: boolean) => void };
type ReqListener = (req: VerifyRequest | null) => void;
const reqListeners = new Set<ReqListener>();
let current: VerifyRequest | null = null;

export const onVerifyRequest = (fn: ReqListener) => {
  reqListeners.add(fn);
  fn(current);
  return () => void reqListeners.delete(fn);
};

/** 본인확인 팝업을 띄우고, 통과하면 true · 닫으면 false 로 끝난다. */
export function requestPhoneVerification(phone: string): Promise<boolean> {
  current?.resolve(false);
  return new Promise<boolean>((resolve) => {
    current = {
      phone,
      resolve: (v) => {
        current = null;
        reqListeners.forEach((fn) => fn(null));
        resolve(v);
      },
    };
    const req = current;
    reqListeners.forEach((fn) => fn(req));
  });
}

/** 전화번호 표기 통일 — 01012345678 / 010-1234-5678 모두 010-1234-5678 로 */
export function normalizePhone(raw: string) {
  const d = digits(raw);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return raw;
}
