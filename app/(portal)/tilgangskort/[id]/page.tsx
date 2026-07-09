import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { updateKort, deleteKort } from '../actions'
import { KortFields } from '../KortFields'
import { DeleteButton } from '@/components/ui/DeleteButton'
import type { Kunde, Profile, Tilgangskort } from '@/lib/types'

export const metadata: Metadata = { title: 'Tilgangskort' }

export default async function KortDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: kort } = await supabase
    .from('tilgangskort')
    .select('*')
    .eq('id', id)
    .single()
  if (!kort) notFound()

  const [{ data: kunderData }, { data: eiereData }, { data: heiserData }, { data: koblinger }] =
    await Promise.all([
      supabase.from('kunder').select('*').order('navn'),
      supabase.from('profiles').select('*').eq('active', true).order('full_name'),
      supabase.from('heiser').select('id, navn, kunder(navn)').order('navn'),
      supabase.from('kort_tilgang').select('heis_id').eq('kort_id', id),
    ])

  const kunder = (kunderData ?? []) as Kunde[]
  const eiere = (eiereData ?? []) as Profile[]
  const heiser = (heiserData ?? []).map((h) => {
    const k = h.kunder as unknown as { navn: string } | { navn: string }[] | null
    return {
      id: h.id as string,
      navn: h.navn as string,
      kundeNavn: (Array.isArray(k) ? k[0]?.navn : k?.navn) ?? 'Uten kunde',
    }
  })
  const valgteHeisIds = (koblinger ?? []).map((k) => k.heis_id)

  const oppdater = updateKort.bind(null, id)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/tilgangskort"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Tilbake til tilgangskort
        </Link>
        {profile.role === 'admin' && (
          <DeleteButton
            action={deleteKort.bind(null, id)}
            confirmText={`Slette kort ${(kort as Tilgangskort).kortnummer}?`}
            label="Slett kort"
          />
        )}
      </div>

      <div className="card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          Kort {(kort as Tilgangskort).kortnummer}
        </h1>
        <form action={oppdater}>
          <KortFields
            kunder={kunder}
            eiere={eiere}
            heiser={heiser}
            kort={kort as Tilgangskort}
            valgteHeisIds={valgteHeisIds}
          />
          <div className="pt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              Lagre endringer
            </button>
            <Link href="/tilgangskort" className="btn-secondary">
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
