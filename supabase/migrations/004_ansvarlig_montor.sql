-- ============================================================================
-- IMEM Portal – ansvarlig montør per heis (for "min service-liste")
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

alter table public.heiser
  add column if not exists ansvarlig_montor uuid
    references public.profiles (id) on delete set null;

create index if not exists heiser_ansvarlig_idx
  on public.heiser (ansvarlig_montor);
