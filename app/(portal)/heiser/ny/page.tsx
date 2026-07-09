import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createHeis } from '../actions'
import { HeisFields } from '../HeisFields'
import type { Kunde } from '@/lib/types'

export const metadata: Metadata = { title: 'Ny heis' }

export default async function NyHeisPage() {
  await requireProfile()
  const supabase = await createClient()

  const { data } = await supabase.from('kunder').select('*').order('navn')
  const kunder = (data ?? []) as Kunde[]

  return (
    <>
      <Link
        href="/heiser"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til heiser
      </Link>

      <div className="card p-6 max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Ny heis</h1>

        {kunder.length === 0 && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Tips: legg gjerne inn{' '}
            <Link href="/kunder" className="underline">
              kunder
            </Link>{' '}
            først, så kan du knytte heisen til en kunde.
          </p>
        )}

        <form action={createHeis}>
          <HeisFields kunder={kunder} />
          <div className="pt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              Opprett heis
            </button>
            <Link href="/heiser" className="btn-secondary">
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
