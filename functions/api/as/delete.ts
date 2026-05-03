/**
 * DELETE /api/as/delete  — 폐기됨 (2026-05-03 B안 ERP 단일화).
 *
 * 기존 Supabase 기반 취소 기능. ERP 단일화 후 ERP 측 /admin/support 에서 처리.
 * 호출 시 410 Gone 응답.
 */
import { errorResponse, corsHeaders } from '../../_shared/cors';

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction = async () => {
  return errorResponse(
    'AS 취소는 ERP 시스템에서 처리됩니다. 관리자에게 문의하세요.',
    410,
  );
};
