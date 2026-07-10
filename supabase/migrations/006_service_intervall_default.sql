-- ============================================================================
-- IMEM Portal – standard service-intervall = 4/år (kvartalsvis)
-- Kjør i Supabase SQL Editor. Kan kjøres etter at heiser er synket.
-- ============================================================================

-- Nye heiser får 4 servicer/år som standard.
alter table public.heiser alter column service_intervall set default 4;

-- Bump alle som fortsatt står på gammel standard (1) til 4.
-- Heiser du allerede har justert til noe annet enn 1 røres ikke.
update public.heiser set service_intervall = 4 where service_intervall = 1;
