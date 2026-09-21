-- Supabase SQL Editor 에 통째로 붙여넣고 Run 하세요.
-- 방문자(anon)는 "쓰기(insert)"만 가능하고, 읽기/수정/삭제는 불가능합니다.
-- 응답 확인은 Supabase 대시보드 > Table Editor 에서 하세요.

create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  name          text    not null check (char_length(btrim(name)) between 1 and 100),
  invited_as    text    check (char_length(invited_as) <= 100),      -- URL ?to= 원본 값
  attend_date   date    not null,
  attend_time   text    not null check (attend_time ~ '^\d{2}:\d{2}$'),
  has_guests    boolean not null default false,
  guest_count   integer not null default 0 check (guest_count between 0 and 20),
  favorite_foods text[] not null default '{}',
  can_eat_spicy boolean not null default false,
  spicy_level   integer check (spicy_level between 1 and 5),  -- can_eat_spicy 가 true 일 때만 값이 있음
  food_notes    text    check (char_length(food_notes) <= 500)
);

-- 이미 예전 schema.sql 로 테이블을 만들었다면 위 create 는 건너뛰어지므로, 아래 두 줄이 새 컬럼을 추가해 줍니다.
alter table public.rsvps add column if not exists can_eat_spicy boolean not null default false;
alter table public.rsvps add column if not exists spicy_level integer check (spicy_level between 1 and 5);

alter table public.rsvps enable row level security;

-- 기본 권한을 모두 회수한 뒤, anon 에게는 insert 만 부여
revoke all on public.rsvps from anon, authenticated;
grant insert on public.rsvps to anon;

drop policy if exists "anon can insert rsvps" on public.rsvps;
create policy "anon can insert rsvps"
  on public.rsvps
  for insert
  to anon
  with check (true);
-- select / update / delete 정책은 일부러 만들지 않음 → anon 은 읽을 수 없음
