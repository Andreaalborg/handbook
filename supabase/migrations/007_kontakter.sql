-- ============================================================================
-- IMEM Portal – kontaktpersoner (vaktmestere, nøkkelpersoner, fabrikk, support)
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

create table if not exists public.kontakter (
  id         uuid primary key default gen_random_uuid(),
  navn       text not null,
  kategori   text not null default 'annet'
               check (kategori in ('vaktmester','nokkelperson','fabrikk','support','annet')),
  firma      text,
  telefon    text,
  epost      text,
  kunde_id   uuid references public.kunder (id) on delete set null,
  merknader  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kontakter_kategori_idx on public.kontakter (kategori);

drop trigger if exists kontakter_updated on public.kontakter;
create trigger kontakter_updated before update on public.kontakter
  for each row execute function public.set_updated_at();

-- RLS: alle innloggede kan lese/opprette/endre; kun admin sletter.
alter table public.kontakter enable row level security;

drop policy if exists kontakter_select on public.kontakter;
create policy kontakter_select on public.kontakter for select
  using (auth.role() = 'authenticated');
drop policy if exists kontakter_insert on public.kontakter;
create policy kontakter_insert on public.kontakter for insert
  with check (auth.role() = 'authenticated');
drop policy if exists kontakter_update on public.kontakter;
create policy kontakter_update on public.kontakter for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists kontakter_delete on public.kontakter;
create policy kontakter_delete on public.kontakter for delete
  using (public.is_admin());
