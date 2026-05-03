/**
 * GET /api/as/admin/photo-url — 폐기됨 (2026-05-03 B안 ERP 단일화).
 */
import { errorResponse, corsHeaders } from '../../../_shared/cors';

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction = async () => {
  return errorResponse('AS 사진은 ERP 시스템에서 조회됩니다.', 410);
};
