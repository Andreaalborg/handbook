import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { createKunde, deleteKunde } from '../heiser/actions'
import type { Kunde } from '@/lib/types'

export const metadata: Metadata = { title: 'Kunder' }

export default async function KunderPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data } = await supabase.from('kunder').select('*').order('navn')
  const kunder = (data ?? []) as Kunde[]
  const isAdmin = profile.role === 'admin'

  return (
    <>
      <PageHeader
        title="Kunder"
        description="Kunder som heisene knyttes til."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ny kunde */}
        <section className="card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Ny kunde</h2>
          <form action={createKunde} className="space-y-3">
            <div>
              <label htmlFor="navn" className="form-label">
                Navn *
              </label>
              <input id="navn" name="navn" required className="form-input" />
            </div>
            <div>
              <label htmlFor="org_nummer" className="form-label">
                Org.nummer
              </label>
              <input id="org_nummer" name="org_nummer" className="form-input" />
            </div>
            <div>
              <label htmlFor="kontaktperson" className="form-label">
                Kontaktperson
              </label>
              <input id="kontaktperson" name="kontaktperson" className="form-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="telefon" className="form-label">
                  Telefon
                </label>
                <input id="telefon" name="telefon" className="form-input" />
              </div>
              <div>
                <label htmlFor="epost" className="form-label">
                  E-post
                </label>
                <input id="epost" name="epost" type="email" className="form-input" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              Legg til kunde
            </button>
          </form>
        </section>

        {/* Kundeliste */}
        <section className="lg:col-span-2">
          {kunder.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">
              Ingen kunder ennå.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Navn</Th>
                    <Th>Kontakt</Th>
                    <Th>Telefon</Th>
                    {isAdmin && <Th> </Th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {kunder.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {k.navn}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {k.kontaktperson ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {k.telefon ?? '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <DeleteButton
                            action={deleteKunde.bind(null, k.id)}
                            confirmText={`Slette kunden "${k.navn}"? Heiser beholdes, men mister koblingen.`}
                            iconOnly
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  )
}
