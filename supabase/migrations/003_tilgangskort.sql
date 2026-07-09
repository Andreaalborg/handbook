-- ============================================================================
-- IMEM Portal – Tilgangskort / kodebrikker (koblet til heiser)
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

-- Selve kortet/brikken.
create table if not exists public.tilgangskort (
  id         uuid primary key default gen_random_uuid(),
  kunde_id   uuid references public.kunder (id) on delete set null,
  kortnummer text not null,
  type       text not null default 'kort' check (type in ('kort', 'brikke')),
  eier_id    uuid references public.profiles (id) on delete set null,
  merknader  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tilgangskort_updated on public.tilgangskort;
create trigger tilgangskort_updated before update on public.tilgangskort
  for each row execute function public.set_updated_at();

-- Kobling kort <-> heis (many-to-many). Dette er "taggen".
create table if not exists public.kort_tilgang (
  id      uuid primary key default gen_random_uuid(),
  kort_id uuid not null references public.tilgangskort (id) on delete cascade,
  heis_id uuid not null references public.heiser (id) on delete cascade,
  unique (kort_id, heis_id)
);

create index if not exists kort_tilgang_kort_idx on public.kort_tilgang (kort_id);
create index if not exists kort_tilgang_heis_idx on public.kort_tilgang (heis_id);

-- ---------------------------------------------------------------------------
-- RAD-SIKKERHET (samme regel: alle innloggede kan endre, kun admin sletter kort)
-- ---------------------------------------------------------------------------
alter table public.tilgangskort enable row level security;
alter table public.kort_tilgang enable row level security;

-- TILGANGSKORT --------------------------------------------------------------
drop policy if exists tilgangskort_select on public.tilgangskort;
create policy tilgangskort_select on public.tilgangskort for select
  using (auth.role() = 'authenticated');
drop policy if exists tilgangskort_insert on public.tilgangskort;
create policy tilgangskort_insert on public.tilgangskort for insert
  with check (auth.role() = 'authenticated');
drop policy if exists tilgangskort_update on public.tilgangskort;
create policy tilgangskort_update on public.tilgangskort for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists tilgangskort_delete on public.tilgangskort;
create policy tilgangskort_delete on public.tilgangskort for delete
  using (public.is_admin());

-- KORT_TILGANG (koblinger – alle innloggede kan opprette/fjerne tagger) ------
drop policy if exists kort_tilgang_select on public.kort_tilgang;
create policy kort_tilgang_select on public.kort_tilgang for select
  using (auth.role() = 'authenticated');
drop policy if exists kort_tilgang_insert on public.kort_tilgang;
create policy kort_tilgang_insert on public.kort_tilgang for insert
  with check (auth.role() = 'authenticated');
drop policy if exists kort_tilgang_delete on public.kort_tilgang;
create policy kort_tilgang_delete on public.kort_tilgang for delete
  using (auth.role() = 'authenticated');
