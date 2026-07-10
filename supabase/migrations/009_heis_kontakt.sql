-- ============================================================================
-- IMEM Portal – koble kontaktpersoner til heiser (many-to-many)
-- Kjør i Supabase SQL Editor ETTER 007_kontakter.sql.
-- ============================================================================

create table if not exists public.heis_kontakt (
  id         uuid primary key default gen_random_uuid(),
  heis_id    uuid not null references public.heiser (id) on delete cascade,
  kontakt_id uuid not null references public.kontakter (id) on delete cascade,
  unique (heis_id, kontakt_id)
);

create index if not exists heis_kontakt_heis_idx on public.heis_kontakt (heis_id);
create index if not exists heis_kontakt_kontakt_idx on public.heis_kontakt (kontakt_id);

-- RLS: alle innloggede kan lese/koble/fjerne koblinger.
alter table public.heis_kontakt enable row level security;

drop policy if exists heis_kontakt_select on public.heis_kontakt;
create policy heis_kontakt_select on public.heis_kontakt for select
  using (auth.role() = 'authenticated');
drop policy if exists heis_kontakt_insert on public.heis_kontakt;
create policy heis_kontakt_insert on public.heis_kontakt for insert
  with check (auth.role() = 'authenticated');
drop policy if exists heis_kontakt_delete on public.heis_kontakt;
create policy heis_kontakt_delete on public.heis_kontakt for delete
  using (auth.role() = 'authenticated');
