import Link from 'next/link'
import type { Metadata } from 'next'
import { PlusIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { KortByKunde, type KortKundeGruppe } from './KortByKunde'
import { KORT_TYPE_LABEL, type Tilgangskort, type Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Tilgangskort' }

export default async function TilgangskortPage() {
  await requireProfile()
  const supabase = await createClient()

  const [{ data: kortData }, { data: profiler }, { data: kunder }, { data: koblinger }] =
    await Promise.all([
      supabase.from('tilgangskort').select('*').order('kortnummer'),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('kunder').select('id, navn'),
      supabase.from('kort_tilgang').select('kort_id, heiser(navn)'),
    ])

  const kort = (kortData ?? []) as Tilgangskort[]
  const eierNavn = new Map(
    (profiler ?? []).map((p: Pick<Profile, 'id' | 'full_name'>) => [p.id, p.full_name])
  )
  const kundeNavn = new Map((kunder ?? []).map((k) => [k.id, k.navn]))

  // kort_id -> liste med heis-navn
  const tilgangPerKort = new Map<string, string[]>()
  for (const rad of koblinger ?? []) {
    const h = rad.heiser as unknown as
      | { navn: string }
      | { navn: string }[]
      | null
    const navn = Array.isArray(h) ? h[0]?.navn : h?.navn
    if (!navn) continue
    const liste = tilgangPerKort.get(rad.kort_id) ?? []
    liste.push(navn)
    tilgangPerKort.set(rad.kort_id, liste)
  }

  // Grupper per kunde.
  const grupper = new Map<string, KortKundeGruppe>()
  for (const k of kort) {
    const navn = k.kunde_id ? (kundeNavn.get(k.kunde_id) ?? 'Uten kunde') : 'Uten kunde'
    if (!grupper.has(navn)) grupper.set(navn, { navn, kort: [] })
    grupper.get(navn)!.kort.push({
      id: k.id,
      kortnummer: k.kortnummer,
      type: KORT_TYPE_LABEL[k.type],
      eier: k.eier_id ? (eierNavn.get(k.eier_id) ?? null) : null,
      tilganger: (tilgangPerKort.get(k.id) ?? []).sort(),
    })
  }
  const grupperListe = [...grupper.values()].sort((a, b) =>
    a.navn.localeCompare(b.navn, 'nb')
  )

  return (
    <>
      <PageHeader
        title="Tilgangskort & kodebrikker"
        description="Kort og brikker koblet til heisene de gir tilgang til, gruppert per kunde."
        action={
          <Link href="/tilgangskort/ny" className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Nytt kort
          </Link>
        }
      />

      {kort.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen tilgangskort registrert ennå.{' '}
          <Link href="/tilgangskort/ny" className="text-blue-600 hover:underline">
            Legg til det første
          </Link>
          .
        </div>
      ) : (
        <KortByKunde grupper={grupperListe} />
      )}
    </>
  )
}
