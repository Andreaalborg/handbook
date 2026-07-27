-- ============================================================================
-- IMEM Portal – oppstartsdato per heis (for riktig service første året)
-- Kjør i Supabase SQL Editor ETTER 002_heiser.sql.
-- ============================================================================

alter table public.heiser
  add column if not exists oppstartsdato date;
