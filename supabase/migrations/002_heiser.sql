-- ============================================================================
-- IMEM Portal – Heis-modul (kunder, heiser, arbeidslogg)
-- Kjør i Supabase SQL Editor ETTER schema.sql.
-- ============================================================================

-- Delt hjelpefunksjon: oppdater updated_at automatisk ved endring.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- KUNDER
-- ---------------------------------------------------------------------------
create table if not exists public.kunder (
  id                 uuid primary key default gen_random_uuid(),
  navn               text not null,
  org_nummer         text,
  kontaktperson      text,
  telefon            text,
  epost              text,
  tripletex_kunde_id bigint,          -- for framtidig Tripletex-kobling
  merknader          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists kunder_updated on public.kunder;
create trigger kunder_updated before update on public.kunder
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- HEISER
-- ---------------------------------------------------------------------------
create table if not exists public.heiser (
  id                    uuid primary key default gen_random_uuid(),
  kunde_id              uuid references public.kunder (id) on delete set null,
  navn                  text not null,              -- identifikator, f.eks. "Heis A" / serienr
  adresse               text,
  kommune               text,
  tilgangstype          text,                       -- nøkkelboks, kodebrikke, nøkkel, kode ...
  tilgang_kode          text,
  nokkelboks_plassering text,
  kontaktperson         text,
  telefon               text,
  epost                 text,
  tilgangstider         text,
  merknader             text,
  service_intervall     int not null default 1,     -- ganger per år (1–4)
  tripletex_prosjekt_id bigint,                     -- for framtidig Tripletex-kobling
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists heiser_kunde_idx on public.heiser (kunde_id);

drop trigger if exists heiser_updated on public.heiser;
create trigger heiser_updated before update on public.heiser
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- HEIS-LOGG (service + andre jobber = historikk per heis)
-- ---------------------------------------------------------------------------
create table if not exists public.heis_logg (
  id                uuid primary key default gen_random_uuid(),
  heis_id           uuid not null references public.heiser (id) on delete cascade,
  dato              date not null default current_date,
  type              text not null default 'service'
                      check (type in ('service','reparasjon','montasje','inspeksjon','annet')),
  utfort_av         text,                            -- montørnavn (fri tekst, evt. fra Tripletex)
  kommentar         text,
  tripletex_entry_id bigint,                         -- unngår duplikater ved framtidig sync
  opprettet_av      uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists heis_logg_heis_idx on public.heis_logg (heis_id, dato desc);

-- ---------------------------------------------------------------------------
-- RAD-SIKKERHET
--   Regel fra bruker: ALLE innloggede kan lese/opprette/endre.
--   KUN admin kan slette.
-- ---------------------------------------------------------------------------
alter table public.kunder    enable row level security;
alter table public.heiser    enable row level security;
alter table public.heis_logg enable row level security;

-- Hjelpe-makro er ikke mulig i SQL; vi gjentar policyene per tabell.

-- KUNDER --------------------------------------------------------------------
drop policy if exists kunder_select on public.kunder;
create policy kunder_select on public.kunder for select
  using (auth.role() = 'authenticated');
drop policy if exists kunder_insert on public.kunder;
create policy kunder_insert on public.kunder for insert
  with check (auth.role() = 'authenticated');
drop policy if exists kunder_update on public.kunder;
create policy kunder_update on public.kunder for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists kunder_delete on public.kunder;
create policy kunder_delete on public.kunder for delete
  using (public.is_admin());

-- HEISER --------------------------------------------------------------------
drop policy if exists heiser_select on public.heiser;
create policy heiser_select on public.heiser for select
  using (auth.role() = 'authenticated');
drop policy if exists heiser_insert on public.heiser;
create policy heiser_insert on public.heiser for insert
  with check (auth.role() = 'authenticated');
drop policy if exists heiser_update on public.heiser;
create policy heiser_update on public.heiser for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists heiser_delete on public.heiser;
create policy heiser_delete on public.heiser for delete
  using (public.is_admin());

-- HEIS-LOGG -----------------------------------------------------------------
drop policy if exists heis_logg_select on public.heis_logg;
create policy heis_logg_select on public.heis_logg for select
  using (auth.role() = 'authenticated');
drop policy if exists heis_logg_insert on public.heis_logg;
create policy heis_logg_insert on public.heis_logg for insert
  with check (auth.role() = 'authenticated');
drop policy if exists heis_logg_update on public.heis_logg;
create policy heis_logg_update on public.heis_logg for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists heis_logg_delete on public.heis_logg;
create policy heis_logg_delete on public.heis_logg for delete
  using (public.is_admin());
