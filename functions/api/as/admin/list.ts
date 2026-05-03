/**
 * GET /api/as/admin/list — 폐기됨 (2026-05-03 B안 ERP 단일화).
 * AS 관리는 ERP 시스템 (cahwindow-quote.vercel.app/admin/support) 으로 이전.
 */
import { errorResponse, corsHeaders } from '../../../_shared/cors';

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction = async () => {
  return errorResponse(
    'AS 관리는 ERP 시스템(cahwindow-quote.vercel.app/admin/support)에서 처리됩니다.',
    410,
  );
};
