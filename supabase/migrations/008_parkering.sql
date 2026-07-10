-- ============================================================================
-- IMEM Portal – parkeringsinfo per heis
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

alter table public.heiser
  add column if not exists parkering text;
