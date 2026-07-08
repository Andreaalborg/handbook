import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { StatusChanger } from './StatusChanger'
import type { Sak, Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Sak' }

export default async function SakDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireProfile()
  const supabase = await createClient()

  const { data: sak } = await supabase
    .from('saker')
    .select('*')
    .eq('id', id)
    .single()

  if (!sak) notFound()
  const s = sak as Sak

  let montor: Profile | null = null
  if (s.tildelt_montor) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', s.tildelt_montor)
      .single()
    montor = (data as Profile) ?? null
  }

  return (
    <>
      <Link
        href="/saker"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til saker
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h1 className="text-2xl font-bold text-gray-900">{s.tittel}</h1>
          {s.beskrivelse && (
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">
              {s.beskrivelse}
            </p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Endre status
            </h2>
            <StatusChanger sakId={s.id} current={s.status} />
          </div>
        </div>

        <aside className="card p-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Detaljer</h2>
          <dl className="space-y-3 text-sm">
            <Rad label="Kunde" verdi={s.kunde} />
            <Rad label="Adresse" verdi={s.adresse} />
            <Rad label="Tildelt montør" verdi={montor?.full_name ?? 'Ikke tildelt'} />
            <Rad
              label="Opprettet"
              verdi={new Date(s.created_at).toLocaleDateString('nb-NO')}
            />
          </dl>
        </aside>
      </div>
    </>
  )
}

function Rad({ label, verdi }: { label: string; verdi: string | null }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium">{verdi || '—'}</dd>
    </div>
  )
}
