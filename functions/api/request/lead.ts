import type { AsEnv } from '../../_shared/env';
import { corsHeaders } from '../../_shared/cors';
import { buildLeadSheetRow, normalizeLead } from '../../_shared/requestFunnel';
import { handleRequestProxy } from '../../_shared/requestProxy';
import { deliverLeadSheet, resolveGasLeadUrl } from '../../_shared/leadSheet';

export const onRequestOptions: PagesFunction<AsEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env, waitUntil }) =>
  handleRequestProxy(
    request,
    env,
    '/api/external/inbound-customers',
    normalizeLead,
    ({ rawBody, erpResult }) => {
      // 같은 접수의 재시도를 ERP 가 이미 걸러 준 경우다. 시트에 두 행이 생기지 않도록 넘긴다.
      // merged 는 기존 고객 문서에 병합된 것일 뿐 이번 접수 자체는 신규이므로 걸러내지 않는다.
      if (erpResult.idempotent === true) return;

      const receiptNo = typeof erpResult.receiptNo === 'string' ? erpResult.receiptNo : '';
      if (!receiptNo) {
        // 멱등키가 없으면 재시도할 때 중복을 막을 수단이 없다. 누락이 중복보다 낫다.
        console.error('[lead-sheet] ERP 응답에 receiptNo 가 없어 전송하지 않았습니다');
        return;
      }

      let row;
      try {
        row = buildLeadSheetRow(rawBody);
      } catch {
        console.error('[lead-sheet] 시트 행 생성 실패', receiptNo);
        return;
      }

      // 접수 응답은 이미 사용자에게 나갔다. 전송은 여기서부터 백그라운드로 진행된다.
      waitUntil(
        deliverLeadSheet({
          kv: env.REVIEW_RL,
          url: resolveGasLeadUrl(env.GAS_LEAD_WEBHOOK_URL),
          row,
          receiptNo,
        }),
      );
    },
  );
