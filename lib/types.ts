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
