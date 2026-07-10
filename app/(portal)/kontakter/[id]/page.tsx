import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { updateKontakt, deleteKontakt } from '../actions'
import { KontaktFields } from '../KontaktFields'
import { DeleteButton } from '@/components/ui/DeleteButton'
import type { Kunde, Kontakt } from '@/lib/types'

export const metadata: Metadata = { title: 'Kontakt' }

export default async function KontaktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const [{ data: kontakt }, { data: kunderData }] = await Promise.all([
    supabase.from('kontakter').select('*').eq('id', id).single(),
    supabase.from('kunder').select('*').order('navn'),
  ])
  if (!kontakt) notFound()
  const kunder = (kunderData ?? []) as Kunde[]

  const oppdater = updateKontakt.bind(null, id)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/kontakter"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Tilbake til kontakter
        </Link>
        {profile.role === 'admin' && (
          <DeleteButton
            action={deleteKontakt.bind(null, id)}
            confirmText={`Slette kontakten ${(kontakt as Kontakt).navn}?`}
            label="Slett"
          />
        )}
      </div>

      <div className="card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          {(kontakt as Kontakt).navn}
        </h1>
        <form action={oppdater}>
          <KontaktFields kunder={kunder} kontakt={kontakt as Kontakt} />
          <div className="pt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              Lagre endringer
            </button>
            <Link href="/kontakter" className="btn-secondary">
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
