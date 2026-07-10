export type Rolle = 'admin' | 'montor'

export type SakStatus = 'ny' | 'pagaende' | 'venter' | 'ferdig'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Rolle
  active: boolean
  created_at: string
}

export interface Sak {
  id: string
  tittel: string
  beskrivelse: string | null
  status: SakStatus
  adresse: string | null
  kunde: string | null
  tildelt_montor: string | null
  opprettet_av: string | null
  created_at: string
  updated_at: string
}

export interface Dokument {
  id: string
  tittel: string
  kategori: string | null
  fil_sti: string | null
  synlig_for: 'alle' | 'admin'
  opprettet_av: string | null
  created_at: string
}

export const SAK_STATUS_LABEL: Record<SakStatus, string> = {
  ny: 'Ny',
  pagaende: 'Pågående',
  venter: 'Venter',
  ferdig: 'Ferdig',
}

export const ROLLE_LABEL: Record<Rolle, string> = {
  admin: 'Administrator',
  montor: 'Montør',
}

// ---------------------------------------------------------------------------
// Heis-modul
// ---------------------------------------------------------------------------
export type LoggType =
  | 'service'
  | 'reparasjon'
  | 'montasje'
  | 'inspeksjon'
  | 'annet'

export const LOGG_TYPE_LABEL: Record<LoggType, string> = {
  service: 'Service',
  reparasjon: 'Reparasjon',
  montasje: 'Montasje',
  inspeksjon: 'Inspeksjon',
  annet: 'Annet',
}

export const TILGANGSTYPER = [
  'Nøkkelboks',
  'Kodebrikke',
  'Nøkkel',
  'Kode',
  'Åpent',
  'Annet',
] as const

export interface Kunde {
  id: string
  navn: string
  org_nummer: string | null
  kontaktperson: string | null
  telefon: string | null
  epost: string | null
  tripletex_kunde_id: number | null
  merknader: string | null
  created_at: string
  updated_at: string
}

export type HeisType = 'service' | 'engangsjobb'

export const HEIS_TYPE_LABEL: Record<HeisType, string> = {
  service: 'Service',
  engangsjobb: 'Engangsjobb',
}

export interface Heis {
  id: string
  kunde_id: string | null
  navn: string
  type: HeisType
  type_manuell: boolean
  adresse: string | null
  kommune: string | null
  tilgangstype: string | null
  tilgang_kode: string | null
  nokkelboks_plassering: string | null
  kontaktperson: string | null
  telefon: string | null
  epost: string | null
  tilgangstider: string | null
  parkering: string | null
  merknader: string | null
  service_intervall: number
  ansvarlig_montor: string | null
  tripletex_prosjekt_id: number | null
  created_at: string
  updated_at: string
}

export type KortType = 'kort' | 'brikke'

export const KORT_TYPE_LABEL: Record<KortType, string> = {
  kort: 'Tilgangskort',
  brikke: 'Kodebrikke',
}

export interface Tilgangskort {
  id: string
  kunde_id: string | null
  kortnummer: string
  type: KortType
  eier_id: string | null
  merknader: string | null
  created_at: string
  updated_at: string
}

export type KontaktKategori =
  | 'vaktmester'
  | 'nokkelperson'
  | 'fabrikk'
  | 'support'
  | 'annet'

export const KONTAKT_KATEGORI_LABEL: Record<KontaktKategori, string> = {
  vaktmester: 'Vaktmester',
  nokkelperson: 'Nøkkelperson',
  fabrikk: 'Fabrikk',
  support: 'Support',
  annet: 'Annet',
}

export interface Kontakt {
  id: string
  navn: string
  kategori: KontaktKategori
  firma: string | null
  telefon: string | null
  epost: string | null
  kunde_id: string | null
  merknader: string | null
  created_at: string
  updated_at: string
}

export interface HeisLogg {
  id: string
  heis_id: string
  dato: string
  type: LoggType
  utfort_av: string | null
  kommentar: string | null
  tripletex_entry_id: number | null
  opprettet_av: string | null
  created_at: string
}

export type ServiceStatusType = 'forfalt' | 'aktiv' | 'kommende'

export interface ServiceStatus {
  hittilIAar: number // antall servicer utført i inneværende år
  intervall: number // planlagte servicer per år
  nesteStart: string // ISO yyyy-mm-dd
  nesteSlutt: string // ISO yyyy-mm-dd
  status: ServiceStatusType
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

/**
 * Periode-basert service-status. Året deles i `intervall` like perioder
 * (4/år = kvartaler). Neste service forfaller i den neste perioden som ikke
 * har hatt service ennå. Returnerer også hvor mange servicer som er utført
 * hittil i år.
 */
export function beregnServiceStatus(
  serviceDatoer: string[],
  intervall: number,
  iDag: Date = new Date()
): ServiceStatus {
  const n = Math.min(4, Math.max(1, intervall))
  const mndPerPeriode = 12 / n
  const aar = iDag.getFullYear()
  const hittilIAar = serviceDatoer.filter(
    (d) => new Date(d).getFullYear() === aar
  ).length

  // Neste uservicede periode. Er alle utført i år → periode 1 neste år.
  let periodeAar = aar
  let idx = hittilIAar
  if (idx >= n) {
    periodeAar = aar + 1
    idx = 0
  }

  const startMnd = Math.round(idx * mndPerPeriode)
  const start = new Date(periodeAar, startMnd, 1)
  const slutt = new Date(periodeAar, startMnd + mndPerPeriode, 0)

  const t = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate())
  let status: ServiceStatusType = 'kommende'
  if (slutt < t) status = 'forfalt'
  else if (start <= t && t <= slutt) status = 'aktiv'

  return { hittilIAar, intervall: n, nesteStart: iso(start), nesteSlutt: iso(slutt), status }
}
