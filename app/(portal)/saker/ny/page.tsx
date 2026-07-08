import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createSak } from '../actions'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Ny sak' }

export default async function NySakPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('active', true)
    .order('full_name')

  const montorer = (data ?? []) as Profile[]

  return (
    <>
      <Link
        href="/saker"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til saker
      </Link>

      <div className="card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Ny sak</h1>

        <form action={createSak} className="space-y-4">
          <div>
            <label htmlFor="tittel" className="form-label">
              Tittel *
            </label>
            <input id="tittel" name="tittel" required className="form-input" />
          </div>

          <div>
            <label htmlFor="beskrivelse" className="form-label">
              Beskrivelse
            </label>
            <textarea
              id="beskrivelse"
              name="beskrivelse"
              rows={4}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kunde" className="form-label">
                Kunde
              </label>
              <input id="kunde" name="kunde" className="form-input" />
            </div>
            <div>
              <label htmlFor="adresse" className="form-label">
                Adresse
              </label>
              <input id="adresse" name="adresse" className="form-input" />
            </div>
          </div>

          <div>
            <label htmlFor="tildelt_montor" className="form-label">
              Tildel montør
            </label>
            <select
              id="tildelt_montor"
              name="tildelt_montor"
              className="form-input"
            >
              <option value="">— Ikke tildelt —</option>
              {montorer.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || 'Uten navn'}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="submit" className="btn-primary">
              Opprett sak
            </button>
            <Link href="/saker" className="btn-secondary">
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
