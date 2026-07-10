import Link from 'next/link'
import type { Metadata } from 'next'
import { PlusIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { SyncButton } from './SyncButton'
import { HeiserByKunde, type KundeGruppe } from './HeiserByKunde'
import { beregnServiceStatus, type Heis } from '@/lib/types'

export const metadata: Metadata = { title: 'Heiser' }

type HeisMedKunde = Heis & { kunder: { navn: string } | null }

export default async function HeiserPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data } = await supabase
    .from('heiser')
    .select('*, kunder(navn)')
    .order('navn', { ascending: true })
  const heiser = (data ?? []) as HeisMedKunde[]

  // Alle service-datoer per heis (for teller + neste periode).
  const { data: serviceRader } = await supabase
    .from('heis_logg')
    .select('heis_id, dato')
    .eq('type', 'service')
  const datoerPerHeis = new Map<string, string[]>()
  for (const r of serviceRader ?? []) {
    const liste = datoerPerHeis.get(r.heis_id) ?? []
    liste.push(r.dato)
    datoerPerHeis.set(r.heis_id, liste)
  }

  // Hvilke tilgangskort som åpner hver heis.
  const { data: kortRader } = await supabase
    .from('kort_tilgang')
    .select('heis_id, tilgangskort(kortnummer)')
  const kortPerHeis = new Map<string, string[]>()
  for (const r of kortRader ?? []) {
    const tk = r.tilgangskort as unknown as
      | { kortnummer: string }
      | { kortnummer: string }[]
      | null
    const nr = Array.isArray(tk) ? tk[0]?.kortnummer : tk?.kortnummer
    if (!nr) continue
    const liste = kortPerHeis.get(r.heis_id) ?? []
    liste.push(nr)
    kortPerHeis.set(r.heis_id, liste)
  }

  // Grupper per kunde.
  const grupper = new Map<string, KundeGruppe>()
  for (const h of heiser) {
    const navn = h.kunder?.navn ?? 'Uten kunde'
    if (!grupper.has(navn)) grupper.set(navn, { navn, heiser: [] })
    grupper.get(navn)!.heiser.push({
      id: h.id,
      navn: h.navn,
      type: h.type,
      tilgang_kode: h.tilgang_kode,
      tilgangstider: h.tilgangstider,
      kontaktperson: h.kontaktperson,
      telefon: h.telefon,
      kort: (kortPerHeis.get(h.id) ?? []).sort(),
      service: beregnServiceStatus(datoerPerHeis.get(h.id) ?? [], h.service_intervall),
    })
  }
  const grupperListe = [...grupper.values()].sort((a, b) =>
    a.navn.localeCompare(b.navn, 'nb')
  )

  return (
    <>
      <PageHeader
        title="Heiser"
        description="Lokasjoner, tilganger og service, gruppert per kunde."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
            {profile.role === 'admin' && <SyncButton />}
            <Link href="/heiser/ny" className="btn-primary">
              <PlusIcon className="h-5 w-5" />
              Ny heis
            </Link>
          </div>
        }
      />

      {heiser.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen heiser registrert ennå.{' '}
          <Link href="/heiser/ny" className="text-blue-600 hover:underline">
            Legg til den første
          </Link>
          .
        </div>
      ) : (
        <HeiserByKunde grupper={grupperListe} />
      )}
    </>
  )
}
