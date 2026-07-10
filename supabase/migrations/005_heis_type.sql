-- ============================================================================
-- IMEM Portal – skille service-heis fra engangsjobb/tilbud
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

alter table public.heiser
  add column if not exists type text not null default 'service'
    check (type in ('service', 'engangsjobb'));

-- Merker om admin har overstyrt typen manuelt. Er den false, holder synken
-- typen i takt med Tripletex (isOffer). Settes true når admin lagrer heisen.
alter table public.heiser
  add column if not exists type_manuell boolean not null default false;

create index if not exists heiser_type_idx on public.heiser (type);
