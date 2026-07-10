import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createKontakt } from '../actions'
import { KontaktFields } from '../KontaktFields'
import type { Kunde } from '@/lib/types'

export const metadata: Metadata = { title: 'Ny kontakt' }

export default async function NyKontaktPage() {
  await requireProfile()
  const supabase = await createClient()
  const { data } = await supabase.from('kunder').select('*').order('navn')
  const kunder = (data ?? []) as Kunde[]

  return (
    <>
      <Link
        href="/kontakter"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til kontakter
      </Link>

      <div className="card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Ny kontakt</h1>
        <form action={createKontakt}>
          <KontaktFields kunder={kunder} />
          <div className="pt-6 flex gap-3">
            <button type="submit" className="btn-primary">
              Lagre kontakt
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
