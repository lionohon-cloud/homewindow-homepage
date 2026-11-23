import type { AsEnv } from '../../../_shared/env';
import { smsOutageStatus } from '../../../_shared/smsOutage';

/**
 * GET /api/request/sms/status — 문자 인증 장애 상태(261123).
 * 한승우 과장 PC 의 텔레그램 알림 필터가 1분마다 읽어 개인 봇으로 장애·복구를 알린다.
 * 시각과 응답 코드만 내보낸다(고객 정보·비밀 값 없음).
 */
export const onRequestGet: PagesFunction<AsEnv> = async ({ env }) => {
  const status = await smsOutageStatus(env).catch(() => ({ down: false, error: true }));
  return new Response(JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
