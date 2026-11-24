-- Gate 31 metadata sync (audio files stay on-device).
-- Run in Supabase SQL editor, then set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.

create table if not exists public.tracks (
  id text primary key,
  name text not null,
  duration real not null default 0,
  bpm real not null default 0,
  peaks jsonb not null default '[]'::jsonb,
  color text not null default '#7c5cff',
  added_at bigint not null default 0
);

create table if not exists public.crates (
  id text primary key,
  name text not null,
  track_ids jsonb not null default '[]'::jsonb
);

alter table public.tracks enable row level security;
alter table public.crates enable row level security;

-- Demo policy: allow anonymous clients. Replace with auth-based policies in production.
create policy "anon tracks" on public.tracks for all using (true) with check (true);
create policy "anon crates" on public.crates for all using (true) with check (true);
