/**
 * POST /api/ai-chat — AI상담 자유입력 분류 프록시 (시군구 개편 Phase E, 2026-07-10).
 *
 * 역할 축소판(사장님 확정): LLM 은 **자유입력 문장을 분기(창호/AS/기타)로 분류**만 한다.
 *   창호 견적 문답은 기존 매크로가 담당(LLM 아님), AS·기타는 폼 수집.
 *   상담·가격·기술 답변 금지 — 접수 전용.
 *
 * 보안·비용 가드:
 *   - rate limit: KV REVIEW_RL, IP 당 20회/분 (LLM 호출 비용 보호)
 *   - 입력 상한: 메시지 최근 6개 · 각 400자
 *   - 타임아웃 10초 → 실패 시 클라이언트가 버튼 분기로 폴백
 *   - 키: ANTHROPIC_API_KEY (Cloudflare Pages 환경변수 — ERP 와 공유 키, 사장님 확정)
 */
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors';
import { checkRate } from '../_shared/rateLimit';

interface AiChatEnv {
  ANTHROPIC_API_KEY?: string;
  /** CF Workers→Anthropic 직접 호출은 403(Request not allowed) — AI Gateway 경유 필수.
   *  ERP(vox-classify 등)와 동일 패턴. 두 값 모두 있으면 게이트웨이, 없으면 직접(폴백). */
  CF_ACCOUNT_ID?: string;
  CF_AI_GATEWAY_ID?: string;
  REVIEW_RL?: KVNamespace;
}

const SYSTEM_PROMPT = `너는 창호(샷시) 시공 회사 "청암홈윈도우" 홈페이지의 접수 안내 도우미다.
고객의 문장을 읽고 아래 분기 중 하나로 분류해 route_intent 도구를 호출하라. 분류 외의 일은 하지 않는다.

분기 기준 (정확히 구분):
- window_consult_quote: **창호 관련 상담 전반 — 창호 주제의 기본값.** 창·샷시(창문) 교체·견적·시공은 물론 **방충망·안전방충망·방범망, 단열·결로·소음, 부분수리**까지 창호에 관한 것이면 전부. (예: "창호 교체 상담받고 싶어요", "샷시 견적 문의요", "방충망 교체하려고요")
- window_estimate: 고객이 **예상 견적을 직접 계산해 보고 싶다고 명시**한 경우만. (예: "예상 견적 미리 볼 수 있어요?", "견적 계산해볼래요") 단순 "견적 문의/상담"은 window_consult_quote 다.
- window_consult: **그린리모델링, 무이자할부** 문의만.
- as: 이미 시공받은 제품의 하자/수리/AS 요청 (잠금장치, 유리 파손, 바퀴, 물샘 등)
- inquiry: 창호와 무관한 문의 (현금영수증, 일정 변경, 협력 제안, 채용, 세금계산서 등)
- smalltalk: 인사·잡담·의미 불명 (분류 불가)

★ 중요: 방충망이든 뭐든 창호 관련 상담은 전부 window_consult_quote 다 (사장님 확정 2026-07-10). window_estimate 는 "직접/미리 계산" 의사가 뚜렷할 때만.
★ 중요: 창호 교체·견적 이야기가 나오면 기본은 window_consult_quote (전문 상담 연결) — window_estimate 는 "직접/미리 계산" 의사가 뚜렷할 때만.

reply 규칙: 한국어 한 문장, 존댓말, 친근하게. 가격·기술 확답 금지.
- window_consult_quote → "창호 교체 상담이시군요! 전문 영업팀장님께 바로 연결해드릴게요." (확인 없이 바로 진행되는 분기라 되묻지 않는다)
- window_estimate → "예상 견적을 직접 확인해보시겠어요? 진행할까요?" (되묻는 톤)
- window_consult → "OO 상담이시군요! 전문 담당자 상담으로 연결해드릴까요?" (되묻는 톤)
- as → "AS 접수 도와드릴까요?"
- inquiry → "문의 접수 도와드릴까요?"
- smalltalk → 무엇을 도와드릴지 되묻는 멘트`;

const ROUTE_TOOL = {
  name: 'route_intent',
  description: '고객 문장의 분기 분류 결과',
  input_schema: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: [
          'window_consult_quote',
          'window_estimate',
          'window_consult',
          'as',
          'inquiry',
          'smalltalk',
        ],
      },
      reply: { type: 'string', description: '고객에게 보여줄 한두 문장 안내' },
    },
    required: ['intent', 'reply'],
  },
} as const;

export const onRequestOptions: PagesFunction<AiChatEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AiChatEnv> = async ({ request, env }) => {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse('AI 상담 환경변수(ANTHROPIC_API_KEY) 미설정', 503);
  }

  // rate limit — LLM 비용 보호 (리드 프록시들과 달리 필수)
  const rl = await checkRate(env.REVIEW_RL, request, {
    limit: 20,
    windowSec: 60,
    bucketKey: 'aichat',
  });
  if (rl.blocked) {
    return errorResponse('요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  let body: { messages?: Array<{ role?: string; content?: string }> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return errorResponse('JSON 형식 오류', 400);
  }

  // 입력 상한 — 최근 6개, 각 400자, role 화이트리스트
  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim(),
    )
    .slice(-6)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content!.slice(0, 400) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return errorResponse('messages 형식 오류 (마지막은 user)', 400);
  }

  // Anthropic 은 Cloudflare 엣지発 직접 호출을 403 으로 차단 → 회사 AI Gateway 경유 (ERP 동일 패턴).
  //   계정/게이트웨이 ID 는 비밀값 아님(대시보드 URL·게이트웨이 이름) — env 로 덮어쓰기 가능한 기본값.
  const gwAccount = env.CF_ACCOUNT_ID || 'c4f7a789a4be601f8ba3f46c4fe2a62f';
  const gwId = env.CF_AI_GATEWAY_ID || 'cahwindow';
  const apiUrl = `https://gateway.ai.cloudflare.com/v1/${gwAccount}/${gwId}/anthropic/v1/messages`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
        tools: [ROUTE_TOOL],
        tool_choice: { type: 'tool', name: 'route_intent' },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[ai-chat] Anthropic 오류:', res.status, t.slice(0, 300));
      return errorResponse('AI 분류 실패', 502);
    }
    const data = (await res.json()) as {
      content?: Array<{ type: string; name?: string; input?: { intent?: string; reply?: string } }>;
    };
    const toolUse = data.content?.find((c) => c.type === 'tool_use' && c.name === 'route_intent');
    const intent = toolUse?.input?.intent;
    const reply = toolUse?.input?.reply;
    if (!intent || !reply) {
      return errorResponse('AI 응답 형식 오류', 502);
    }
    return jsonResponse({ intent, reply });
  } catch (e) {
    console.error('[ai-chat] 호출 실패:', e);
    return errorResponse('AI 분류 시간 초과', 504);
  } finally {
    clearTimeout(timer);
  }
};
