/**
 * POST /api/as/lookup
 * 고객 AS 접수 조회 — ERP (cahwindow-quote) 로 forward.
 *
 * 부사장님 결정 (2026-05-03 B안):
 *   상태만 노출. 사진·처리노트·이메일·주소·내용 X.
 *
 * body: { contractor_name, reception_no }
 * 응답: { reception_no, contractor_name, status, status_label, created_at }
 *   (기존 응답에서 photos·photo_urls·description·email·address 제거)
 */
import { jsonResponse, errorResponse, corsHeaders } from '../../_shared/cors';
import { isValidReceptionNo } from '../../_shared/asValidate';

interface AsEnv {
  ERP_AS_API_KEY?: string;
  ERP_BASE_URL?: string;
}

// ERP 한글 상태 → 홈페이지 표시 라벨 매핑 (기존 영문 상태값 호환)
const STATUS_TO_LEGACY: Record<string, string> = {
  접수: 'received',
  처리중: 'in_progress',
  완료: 'done',
  취소: 'canceled',
};

export const onRequestOptions: PagesFunction<AsEnv> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) => {
  let body: { contractor_name?: string; reception_no?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  const contractorName = (body.contractor_name || '').trim();
  const receptionNo = (body.reception_no || '').trim().toUpperCase();

  if (!contractorName || !receptionNo) {
    return errorResponse('계약자명과 접수번호를 모두 입력해 주세요.', 400);
  }
  if (!isValidReceptionNo(receptionNo)) {
    return errorResponse('접수번호 형식이 올바르지 않습니다.', 400);
  }

  if (!env.ERP_AS_API_KEY || !env.ERP_BASE_URL) {
    console.error('[as/lookup] ERP env 미설정');
    return errorResponse('서버 설정 오류', 500);
  }

  try {
    const url = `${env.ERP_BASE_URL.replace(/\/+$/, '')}/api/external/as-lookup`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ERP_AS_API_KEY,
      },
      body: JSON.stringify({
        receptionNo,
        customerName: contractorName,
      }),
    });
    if (res.status === 404) {
      return errorResponse('일치하는 접수내역이 없습니다.', 404);
    }
    if (!res.ok) {
      const text = await res.text();
      console.error('[as/lookup] ERP 응답 오류', res.status, text);
      return errorResponse('조회 중 오류가 발생했습니다.', 502);
    }
    const data = (await res.json()) as {
      receptionNo: string;
      status: string;
      createdAt: string | null;
    };

    // 기존 클라이언트 호환: status 영문 코드 + 한글 라벨 둘 다 제공
    const legacyStatus = STATUS_TO_LEGACY[data.status] ?? 'received';
    return jsonResponse({
      reception_no: data.receptionNo,
      contractor_name: contractorName,
      status: legacyStatus,
      status_label: data.status,
      created_at: data.createdAt,
      // 사진·처리노트 등은 의도적으로 미반환 — 부사장님 정책
      photos: [],
      photo_urls: [],
    });
  } catch (e) {
    console.error('[as/lookup] ERP 호출 실패:', e);
    return errorResponse('조회 실패', 500);
  }
};
