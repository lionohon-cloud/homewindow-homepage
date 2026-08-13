import type { AsEnv } from '../../_shared/env';
import { corsHeaders } from '../../_shared/cors';
import { normalizeLead } from '../../_shared/requestFunnel';
import { handleRequestProxy } from '../../_shared/requestProxy';

export const onRequestOptions: PagesFunction<AsEnv> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<AsEnv> = async ({ request, env }) =>
  handleRequestProxy(request, env, '/api/external/inbound-customers', normalizeLead);
