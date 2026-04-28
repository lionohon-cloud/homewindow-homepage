-- ────────────────────────────────────────────────────────────────────
-- 청암홈윈도우 홈페이지 — AS 접수 시스템
-- Supabase SQL Editor에서 1회 실행
--
-- 실행 후 추가 작업:
--   1) Storage > Create bucket > name: as-photos, Public: OFF (private)
--   2) Authentication > Users > Add user (email + password) — 관리자 계정 1개 이상
-- ────────────────────────────────────────────────────────────────────

-- updated_at 자동 갱신용 extension (Supabase 기본 포함)
create extension if not exists moddatetime schema extensions;

-- 접수 테이블
create table if not exists as_requests (
  id uuid primary key default gen_random_uuid(),
  reception_no text unique not null,
  contractor_name text not null,
  phone text not null,
  address text not null,
  email text not null,
  description text not null,
  photos jsonb not null default '[]'::jsonb,    -- [{path, name, size, mime}]
  status text not null default 'received',      -- received | scheduled | in_progress | done | canceled
  admin_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_as_requests_lookup
  on as_requests (contractor_name, reception_no);
create index if not exists idx_as_requests_created_at
  on as_requests (created_at desc);
create index if not exists idx_as_requests_status
  on as_requests (status);

-- updated_at 자동 갱신
drop trigger if exists set_as_requests_updated_at on as_requests;
create trigger set_as_requests_updated_at
  before update on as_requests
  for each row execute function extensions.moddatetime(updated_at);

-- RLS: anon/authenticated 키로 직접 접근 차단 (모든 접근은 service_role 경유)
alter table as_requests enable row level security;

-- 정책 미설정 → service_role 외 모두 거부
-- (service_role은 RLS 우회됨)

-- ────────────────────────────────────────────────────────────────────
-- 접수번호 시퀀스: AS-yyMMdd + 6자리 zero-pad
-- 동시성을 위해 Postgres 함수 사용
-- ────────────────────────────────────────────────────────────────────
create or replace function next_reception_no() returns text
language plpgsql as $$
declare
  today_prefix text;
  seq_count int;
begin
  today_prefix := 'AS-' || to_char(now() at time zone 'Asia/Seoul', 'YYMMDD');
  -- 같은 날짜 prefix를 가진 행 수 + 1
  select count(*) + 1 into seq_count
    from as_requests
    where reception_no like today_prefix || '%';
  return today_prefix || lpad(seq_count::text, 5, '0');
end;
$$;
