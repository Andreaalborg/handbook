-- ============================================================================
-- IMEM Portal – dokumentarkiv med mapper/undermapper + filopplasting
-- Kjør i Supabase SQL Editor ETTER schema.sql.
-- ============================================================================

-- Mapper (kan nestes via parent_id).
create table if not exists public.mapper (
  id           uuid primary key default gen_random_uuid(),
  navn         text not null,
  parent_id    uuid references public.mapper (id) on delete cascade,
  opprettet_av uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists mapper_parent_idx on public.mapper (parent_id);

-- Utvid dokumenter med mappe-tilhørighet + filstørrelse.
alter table public.dokumenter
  add column if not exists mappe_id uuid references public.mapper (id) on delete cascade;
alter table public.dokumenter
  add column if not exists storrelse bigint;

create index if not exists dokumenter_mappe_idx on public.dokumenter (mappe_id);

-- ---------------------------------------------------------------------------
-- RLS: alle innloggede kan lese/opprette/laste opp; kun admin sletter.
-- ---------------------------------------------------------------------------
alter table public.mapper enable row level security;

drop policy if exists mapper_select on public.mapper;
create policy mapper_select on public.mapper for select
  using (auth.role() = 'authenticated');
drop policy if exists mapper_insert on public.mapper;
create policy mapper_insert on public.mapper for insert
  with check (auth.role() = 'authenticated');
drop policy if exists mapper_update on public.mapper;
create policy mapper_update on public.mapper for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists mapper_delete on public.mapper;
create policy mapper_delete on public.mapper for delete
  using (public.is_admin());

-- Dokumenter: åpne opp for at alle innloggede kan lese + laste opp.
drop policy if exists dokumenter_select on public.dokumenter;
create policy dokumenter_select on public.dokumenter for select
  using (auth.role() = 'authenticated');
drop policy if exists dokumenter_write on public.dokumenter;
drop policy if exists dokumenter_insert on public.dokumenter;
create policy dokumenter_insert on public.dokumenter for insert
  with check (auth.role() = 'authenticated');
drop policy if exists dokumenter_update on public.dokumenter;
create policy dokumenter_update on public.dokumenter for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists dokumenter_delete on public.dokumenter;
create policy dokumenter_delete on public.dokumenter for delete
  using (public.is_admin());

-- Storage: la alle innloggede laste opp til 'dokumenter'-bøtta (les fantes fra før).
drop policy if exists dok_skriv on storage.objects;
create policy dok_skriv on storage.objects
  for insert with check (bucket_id = 'dokumenter' and auth.role() = 'authenticated');
