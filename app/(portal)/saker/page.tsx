import Link from 'next/link'
import type { Metadata } from 'next'
import { PlusIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Sak } from '@/lib/types'

export const metadata: Metadata = { title: 'Saker' }

export default async function SakerPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data } = await supabase
    .from('saker')
    .select('*')
    .order('updated_at', { ascending: false })

  const saker = (data ?? []) as Sak[]

  return (
    <>
      <PageHeader
        title="Saker"
        description={
          profile.role === 'admin'
            ? 'Alle saker i systemet.'
            : 'Saker som er tildelt deg.'
        }
        action={
          profile.role === 'admin' ? (
            <Link href="/saker/ny" className="btn-primary">
              <PlusIcon className="h-5 w-5" />
              Ny sak
            </Link>
          ) : null
        }
      />

      {saker.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen saker å vise.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Sak</Th>
                <Th>Kunde</Th>
                <Th>Adresse</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {saker.map((sak) => (
                <tr key={sak.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/saker/${sak.id}`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      {sak.tittel}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sak.kunde || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sak.adresse || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sak.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
