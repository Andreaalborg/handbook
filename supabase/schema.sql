-- ============================================================================
-- IMEM Portal – databaseskjema
-- Kjør i Supabase SQL Editor (én gang) på et nytt prosjekt.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABELLER
-- ---------------------------------------------------------------------------

-- Profil per bruker (1:1 med auth.users). Rollen styrer tilgang.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  role       text not null default 'montor' check (role in ('admin', 'montor')),
  active      boolean not null default true,
  created_at timestamptz not null default now()
);

-- Saker/jobber – kjernemodulen.
create table if not exists public.saker (
  id             uuid primary key default gen_random_uuid(),
  tittel         text not null,
  beskrivelse    text,
  status         text not null default 'ny'
                   check (status in ('ny', 'pagaende', 'venter', 'ferdig')),
  adresse        text,
  kunde          text,
  tildelt_montor uuid references public.profiles (id) on delete set null,
  opprettet_av   uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists saker_tildelt_idx on public.saker (tildelt_montor);

-- Dokumenter / montørhåndbok. Selve filen ligger i Storage-bøtta 'dokumenter'.
create table if not exists public.dokumenter (
  id           uuid primary key default gen_random_uuid(),
  tittel       text not null,
  kategori     text,
  fil_sti      text,
  synlig_for   text not null default 'alle' check (synlig_for in ('alle', 'admin')),
  opprettet_av uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Sporing av sendte invitasjoner.
create table if not exists public.invitasjoner (
  id          uuid primary key default gen_random_uuid(),
  epost       text not null,
  rolle       text not null default 'montor',
  invitert_av uuid references public.profiles (id) on delete set null,
  status      text not null default 'sendt',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. HJELPEFUNKSJON – er innlogget bruker admin?
--    SECURITY DEFINER omgår RLS så vi unngår rekursjon i policyene.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. TRIGGER – opprett profil automatisk ved ny auth-bruker
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. RAD-SIKKERHET (RLS)
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.saker        enable row level security;
alter table public.dokumenter   enable row level security;
alter table public.invitasjoner enable row level security;

-- PROFILES ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Bruker kan oppdatere eget navn/telefon; admin kan oppdatere alle.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- SAKER ---------------------------------------------------------------------
drop policy if exists saker_select on public.saker;
create policy saker_select on public.saker
  for select using (public.is_admin() or tildelt_montor = auth.uid());

drop policy if exists saker_insert on public.saker;
create policy saker_insert on public.saker
  for insert with check (public.is_admin());

drop policy if exists saker_update on public.saker;
create policy saker_update on public.saker
  for update using (public.is_admin() or tildelt_montor = auth.uid())
  with check (public.is_admin() or tildelt_montor = auth.uid());

drop policy if exists saker_delete on public.saker;
create policy saker_delete on public.saker
  for delete using (public.is_admin());

-- DOKUMENTER ----------------------------------------------------------------
drop policy if exists dokumenter_select on public.dokumenter;
create policy dokumenter_select on public.dokumenter
  for select using (synlig_for = 'alle' or public.is_admin());

drop policy if exists dokumenter_write on public.dokumenter;
create policy dokumenter_write on public.dokumenter
  for all using (public.is_admin()) with check (public.is_admin());

-- INVITASJONER --------------------------------------------------------------
drop policy if exists invitasjoner_admin on public.invitasjoner;
create policy invitasjoner_admin on public.invitasjoner
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. STORAGE – privat bøtte for dokumenter
--    Opprett bøtta 'dokumenter' (privat) i Storage-UI, eller kjør:
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('dokumenter', 'dokumenter', false)
on conflict (id) do nothing;

drop policy if exists dok_les on storage.objects;
create policy dok_les on storage.objects
  for select using (bucket_id = 'dokumenter' and auth.role() = 'authenticated');

drop policy if exists dok_skriv on storage.objects;
create policy dok_skriv on storage.objects
  for insert with check (bucket_id = 'dokumenter' and public.is_admin());

drop policy if exists dok_slett on storage.objects;
create policy dok_slett on storage.objects
  for delete using (bucket_id = 'dokumenter' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. FØRSTE ADMIN
--    Etter at du har logget inn/registrert første bruker, kjør (bytt e-post):
--
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'deg@imemnorway.no');
-- ---------------------------------------------------------------------------
