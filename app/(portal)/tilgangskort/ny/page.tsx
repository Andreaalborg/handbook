import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createKort } from '../actions'
import { KortFields } from '../KortFields'
import type { Kunde, Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Nytt tilgangskort' }

export default async function NyttKortPage() {
  await requireProfile()
  const supabase = await createClient()

  const [{ data: kunderData }, { data: eiereData }, { data: heiserData }] =
    await Promise.all([
      supabase.from('kunder').select('*').order('navn'),
      supabase.from('profiles').select('*').eq('active', true).order('full_name'),
      supabase.from('heiser').select('id, navn, kunder(navn)').order('navn'),
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

  return (
    <>
      <Link
        href="/tilgangskort"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til tilgangskort
      </Link>

      <div className="card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          Nytt tilgangskort
        </h1>
        <form action={createKort}>
          <KortFields kunder={kunder} eiere={eiere} heiser={heiser} />
          <div className="pt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              Opprett kort
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
