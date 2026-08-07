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

export interface Mappe {
  id: string
  navn: string
  parent_id: string | null
  opprettet_av: string | null
  created_at: string
}

export interface Dokument {
  id: string
  tittel: string
  kategori: string | null
  fil_sti: string | null
  mappe_id: string | null
  storrelse: number | null
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
  oppstartsdato: string | null
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
  planlagtIAar: number // planlagte servicer i år (justert for oppstartsdato)
  intervall: number // årlig rate (1–4)
  nesteStart: string // ISO yyyy-mm-dd
  nesteSlutt: string // ISO yyyy-mm-dd
  status: ServiceStatusType
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

/** Parser 'YYYY-MM-DD' som lokal dato (unngår tidssone-skli). */
function lokalDato(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/**
 * Periode-basert service-status. Året deles i `intervall` like perioder
 * (4/år = kvartaler).
 *
 * Telleren teller DEKKEDE PERIODER, ikke enkeltbesøk: flere servicedager i
 * samme kvartal (f.eks. en større jobb ført på Service/HK) teller som at det
 * kvartalet er dekket – aldri mer enn planlagt.
 *
 * For nye/moderniserte heiser teller kun perioder som starter etter
 * oppstartsdato det første året – slik at en heis satt opp midt i året ikke
 * får etterslep for kvartaler den ikke var i drift.
 */
export function beregnServiceStatus(
  serviceDatoer: string[],
  intervall: number,
  oppstartsdato: string | null = null,
  iDag: Date = new Date()
): ServiceStatus {
  const n = Math.min(4, Math.max(1, intervall))
  const mndPerPeriode = 12 / n
  const aar = iDag.getFullYear()
  const t = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate())

  // Alle perioder (start + slutt) for inneværende år.
  const alle: { start: Date; slutt: Date }[] = []
  for (let i = 0; i < n; i++) {
    const start = new Date(aar, Math.round(i * mndPerPeriode), 1)
    const slutt = new Date(aar, Math.round(i * mndPerPeriode) + mndPerPeriode, 0)
    alle.push({ start, slutt })
  }

  // Kvalifiserte perioder i år (starter >= oppstartsdato hvis oppstart er i år).
  let kvalifiserte = alle
  if (oppstartsdato) {
    const opp = lokalDato(oppstartsdato)
    if (opp.getFullYear() === aar) {
      kvalifiserte = alle.filter((p) => p.start >= opp)
    } else if (opp.getFullYear() > aar) {
      kvalifiserte = []
    }
  }
  const planlagtIAar = kvalifiserte.length

  // Hvilke kvalifiserte perioder har minst ett servicebesøk?
  const datoerIAar = serviceDatoer
    .map(lokalDato)
    .filter((d) => d.getFullYear() === aar)
  const dekket = kvalifiserte.map((p) =>
    datoerIAar.some((d) => d >= p.start && d <= p.slutt)
  )
  const hittilIAar = dekket.filter(Boolean).length

  // Neste = første udekkede periode; alle dekket → periode 1 neste år.
  const forsteUdekket = dekket.findIndex((x) => !x)
  let nesteStart: Date
  let nesteSlutt: Date
  if (forsteUdekket >= 0) {
    nesteStart = kvalifiserte[forsteUdekket].start
    nesteSlutt = kvalifiserte[forsteUdekket].slutt
  } else {
    nesteStart = new Date(aar + 1, 0, 1)
    nesteSlutt = new Date(aar + 1, mndPerPeriode, 0)
  }

  let status: ServiceStatusType = 'kommende'
  if (nesteSlutt < t) status = 'forfalt'
  else if (nesteStart <= t && t <= nesteSlutt) status = 'aktiv'

  return {
    hittilIAar,
    planlagtIAar,
    intervall: n,
    nesteStart: iso(nesteStart),
    nesteSlutt: iso(nesteSlutt),
    status,
  }
}
