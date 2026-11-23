/**
 * 문자 인증(팝빌) 장애 감지 · 텔레그램 알림 · 인증 생략 허용 표시 (261123).
 *
 * sms/send 가 ERP 에서 발송 실패(5xx·SEND_FAILED·연결 실패)를 받으면
 *   1) KV 에 「장애 중」 표시를 30분 남긴다 → 그동안 견적 퍼널은 인증토큰 없는 접수를 받는다(lead.ts).
 *      화면(메인·대리점·퍼널)은 발송 실패를 받는 즉시 인증 없이 번호만 받는 쪽으로 넘어간다.
 *   2) 텔레그램 봇(@Homewindow_Assistant_bot)으로 알린다 — 10분에 한 번만(KV 로 묶음).
 * 발송이 다시 성공하면 표시를 지우고 「복구」 알림을 한 번 보낸다.
 *
 * 필요한 환경변수(Cloudflare Pages → 설정 → 환경 변수, 암호화):
 *   TELEGRAM_BOT_TOKEN  봇 토큰(BotFather 발급)
 *   TELEGRAM_CHAT_ID    알림 받을 대화방 id
 * 없으면 알림만 건너뛰고 나머지(인증 생략 허용)는 그대로 동작한다.
 */
import type { AsEnv } from './env';

const DOWN_KEY = 'sms-outage:down';
const ALERT_KEY = 'sms-outage:alerted';
const DOWN_TTL_SEC = 30 * 60;
const ALERT_GAP_SEC = 10 * 60;

/** ERP 응답(상태코드·본문 code)이 「문자 시스템 장애」인지 — 번호 오류·과다 요청은 장애가 아니다 */
export function isSmsOutage(status: number, code?: string): boolean {
  if (code === 'INVALID_TEL' || code === 'RATE_LIMIT' || code === 'INVALID_PAYLOAD') return false;
  return status >= 500 || code === 'SEND_FAILED';
}

export async function isSmsDown(env: AsEnv): Promise<boolean> {
  if (!env.REVIEW_RL) return false;
  return (await env.REVIEW_RL.get(DOWN_KEY)) === '1';
}

async function telegram(env: AsEnv, text: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  }).catch(() => undefined);
}

const nowKst = () =>
  new Date(Date.now() + 9 * 3600_000).toISOString().replace('T', ' ').slice(0, 16);

/** 발송 실패를 기록하고(장애 표시 30분) 필요하면 알린다 */
export async function reportSmsOutage(env: AsEnv, detail: string): Promise<void> {
  const kv = env.REVIEW_RL;
  if (kv) await kv.put(DOWN_KEY, '1', { expirationTtl: DOWN_TTL_SEC });
  if (kv && (await kv.get(ALERT_KEY))) return; // 10분 안에 이미 알림
  if (kv) await kv.put(ALERT_KEY, '1', { expirationTtl: ALERT_GAP_SEC });
  await telegram(
    env,
    `⚠️ 홈페이지 문자 인증 발송 실패 (${nowKst()})\n` +
      `${detail}\n` +
      `지금부터 메인·대리점·견적 퍼널은 인증 없이 번호만 받습니다. 팝빌 상태를 확인해 주세요.`,
  );
}

/** 발송이 다시 성공했을 때 — 장애 표시가 있었으면 지우고 복구 알림 */
export async function clearSmsOutage(env: AsEnv): Promise<void> {
  const kv = env.REVIEW_RL;
  if (!kv || (await kv.get(DOWN_KEY)) !== '1') return;
  await kv.delete(DOWN_KEY);
  await kv.delete(ALERT_KEY);
  await telegram(env, `✅ 홈페이지 문자 인증 발송 복구 (${nowKst()}) — 다시 인증을 받습니다.`);
}
