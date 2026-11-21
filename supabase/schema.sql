-- ─────────────────────────────────────────────
--  문의 표 + 보안 설정 (RLS)
--  Supabase 대시보드 → SQL Editor → New query 에 통째로 붙여넣고 Run
-- ─────────────────────────────────────────────

create table if not exists public.inquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),                       -- 접수 시각 (자동)
  company     text not null check (char_length(company) between 1 and 100),  -- 회사명
  name        text not null check (char_length(name) between 1 and 50),     -- 담당자 이름
  contact     text not null check (char_length(contact) between 1 and 100), -- 연락처
  program     text not null check (program in ('임원 코칭', '리더십 강연·워크숍', '기타')), -- 관심 프로그램
  message     text check (message is null or char_length(message) <= 2000), -- 문의 내용 (선택)
  consent     boolean not null check (consent = true)                    -- 개인정보 동의 (필수)
);

comment on table public.inquiries is '홈페이지 강연·코칭 문의';

-- 보안 설정 켜기: 정책에 적힌 것만 허용됩니다
alter table public.inquiries enable row level security;

-- 방문자(anon)는 "넣기"만 할 수 있습니다. 읽기·고치기·지우기 정책은 일부러 만들지 않습니다.
drop policy if exists "방문자는 문의를 넣기만 할 수 있음" on public.inquiries;
create policy "방문자는 문의를 넣기만 할 수 있음"
  on public.inquiries
  for insert
  to anon
  with check (consent = true);

-- 한 번 더 잠금: 방문자 권한에서 읽기·고치기·지우기 자체를 뺍니다
revoke select, update, delete on public.inquiries from anon;
grant insert on public.inquiries to anon;

-- 들어온 문의는 대시보드 → Table Editor → inquiries 에서 확인합니다.
