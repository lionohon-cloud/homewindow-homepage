/**
 * 랜딩퍼널(/request/) 접수 → 유입고객 추적 구글시트 웹훅 전송.
 *
 * 기존 홈페이지 접수는 브라우저(src/lib/submitLead.ts)가 ERP 와 이 웹훅으로 각각 보내지만,
 * 랜딩퍼널은 서버(functions/api/request/lead.ts)가 ERP 로만 프록시해 시트에 누락돼 왔다.
 * 그 누락을 메우되, 아래 두 가지를 지킨다.
 *
 *   1. 웹훅이 실패해도 ERP 접수는 영향을 받지 않는다 — 응답을 먼저 돌려준 뒤 waitUntil 에서 보낸다.
 *   2. 같은 접수가 시트에 두 행으로 들어가지 않는다 — GAS doPost 가 appendRow 만 하고
 *      중복 검사를 하지 않으므로, ERP 가 발급한 receiptNo 를 멱등키로 삼아 KV 로 막는다.
 *
 * 시트 A열(접수일시)은 GAS 가 new Date() 로 직접 찍으므로 payload 의 timestamp 는 쓰이지 않는다.
 * 그래도 기존 홈페이지와 키 집합을 똑같이 유지하려고 함께 보낸다.
 */

/** 기존 홈페이지(src/lib/submitLead.ts)와 같은 배포본. 바꿀 때는 양쪽을 함께 고칠 것. */
const DEFAULT_GAS_LEAD_URL =
  'https://script.google.com/macros/s/AKfycbxe-lp-LqVpePEhgjIVBCifZtpS1IUSp1IdI07az8epyJVdBLVMqesVRK-s4T8-cebpTw/exec';

export const LEAD_SHEET_KV_PREFIX = 'lead-sheet:';

/** 웹훅 재시도 사이의 대기(밀리초). 첫 시도는 즉시 보낸다. */
const RETRY_BACKOFF_MS = [0, 1000, 3000];

/** 한 번의 전송에 허용하는 시간. 없으면 GAS 가 늘어질 때 워커가 끝까지 매달린다. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * 시트 한 행. 키 이름과 순서를 기존 홈페이지 payload 와 똑같이 맞춘다.
 * GAS 가 키 이름으로 열을 고르므로 이름이 어긋나면 그 열이 통째로 빈다.
 */
export interface LeadSheetRow {
  phone: string;
  channel_media: string;
  entry_form: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  visit_id: string;
  landing_path: string;
  referrer: string;
  region: string;
  consult_field: string;
  timestamp: string;
}

export function resolveGasLeadUrl(configured?: string): string {
  return configured?.trim() || DEFAULT_GAS_LEAD_URL;
}

/**
 * GAS /exec 로 한 번 보낸다. Content-Type 은 기존 홈페이지와 같은 text/plain 을 쓴다
 * (GAS 의 e.postData.contents 파싱 경로를 한 글자도 다르게 하지 않기 위함).
 * /exec 는 script.googleusercontent.com 으로 302 리다이렉트하므로 기본 follow 를 그대로 둔다.
 */
export async function postLeadSheet(
  fetcher: typeof fetch,
  url: string,
  row: LeadSheetRow,
): Promise<{ ok: boolean; status: number }> {
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return { ok: response.ok, status: response.status };
}

interface DeliverArgs {
  kv: KVNamespace | undefined;
  url: string;
  row: LeadSheetRow;
  /** ERP 가 발급한 receiptNo. 같은 접수의 재시도는 항상 같은 값이다. */
  receiptNo: string;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 중복 검사 → 전송 → 재시도 → 실패 시 사서함 적재까지 한 번에 처리한다.
 * 이 함수는 절대 throw 하지 않는다. 호출부(waitUntil)가 접수 응답과 분리돼 있기 때문이다.
 *
 * 「먼저 기록하고 나중에 보내는」 순서를 택했다. 시트가 append-only 라 중복 행을 지우는 것이
 * 누락 행을 채우는 것보다 번거롭기 때문이다. 그 대가로 워커가 전송 도중 죽으면 pending 인 채
 * 남아 그 건이 유실되는데, ERP 에는 기록이 있으므로 소급 스크립트로 복구할 수 있다.
 */
export async function deliverLeadSheet(args: DeliverArgs): Promise<void> {
  const { kv, url, row, receiptNo } = args;
  const fetcher = args.fetcher ?? fetch;
  const sleep = args.sleep ?? defaultSleep;
  const key = `${LEAD_SHEET_KV_PREFIX}${receiptNo}`;

  if (kv) {
    const seen = await kv.get(key).catch(() => null);
    if (seen) return; // 이미 보냈거나 보내는 중이다. 중복 행을 만들지 않는다.
    await kv
      .put(key, JSON.stringify({ state: 'pending', row }), {
        expirationTtl: 60 * 60 * 24 * 30,
      })
      .catch(() => undefined);
  } else {
    console.warn('[lead-sheet] KV 바인딩 미설정 — 중복 방지 없이 1회 전송');
  }

  let lastStatus = 0;
  for (let attempt = 0; attempt < RETRY_BACKOFF_MS.length; attempt += 1) {
    if (RETRY_BACKOFF_MS[attempt] > 0) await sleep(RETRY_BACKOFF_MS[attempt]);
    try {
      const result = await postLeadSheet(fetcher, url, row);
      lastStatus = result.status;
      if (result.ok) {
        console.log('[lead-sheet] 전송 완료', receiptNo, `시도 ${attempt + 1}회`);
        if (kv) {
          await kv
            .put(key, JSON.stringify({ state: 'sent', receiptNo }), {
              expirationTtl: 60 * 60 * 24 * 30,
            })
            .catch(() => undefined);
        }
        return;
      }
      // 4xx 는 다시 보내도 같은 결과이므로 재시도하지 않는다.
      // 5xx 는 구글 프런트엔드 단계에서 막힌 것이라 doPost 가 실행되지 않았을 가능성이 높다.
      // (GAS 는 스크립트 안에서 오류가 나도 200 에 {"result":"error"} 를 담아 돌려준다.)
      if (result.status < 500) break;
    } catch {
      // 응답을 받지 못했으므로 시트에 행이 들어갔는지 알 수 없다. 여기서 재시도하면
      // 이미 들어간 행 위에 같은 행을 한 번 더 쌓게 된다. GAS 의 appendRow 에는 중복
      // 검사가 없어 되돌리려면 사람이 지워야 하므로, 중복보다 누락을 택해 즉시 멈춘다.
      // 누락분은 사서함에 남고 소급 스크립트로 복구할 수 있다.
      console.error('[lead-sheet] 응답 없음 — 중복을 피해 재시도하지 않습니다', receiptNo);
      lastStatus = 0;
      break;
    }
    // KV 가 없으면 재시도해도 중복을 막을 수단이 없으므로 1회로 끝낸다.
    if (!kv) break;
  }

  console.error(
    '[lead-sheet] 전송 실패 — 사서함에 적재했습니다',
    receiptNo,
    `마지막 상태 ${lastStatus}`,
  );
  if (kv) {
    await kv
      .put(key, JSON.stringify({ state: 'failed', row, lastStatus }), {
        expirationTtl: 60 * 60 * 24 * 30,
      })
      .catch(() => undefined);
  }
}
