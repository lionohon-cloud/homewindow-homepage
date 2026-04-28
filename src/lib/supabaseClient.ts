/**
 * 브라우저용 Supabase 클라이언트
 * - 관리자 로그인(Supabase Auth)에만 사용
 * - 데이터(as_requests) 접근은 모두 Cloudflare Functions(/api/as/*) 경유
 *   (anon key로 RLS 통과 못 함 — service_role은 서버에만 보관)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    throw new Error(
      'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수가 없습니다. .env.local 확인'
    );
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'hw-admin-as',
    },
  });

  return _client;
}
