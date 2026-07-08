import Link from 'next/link'
import type { Metadata } from 'next'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { BrukerActions } from './BrukerActions'
import { ROLLE_LABEL, type Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Brukere' }

export default async function BrukerePage() {
  const meg = await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  const brukere = (data ?? []) as Profile[]

  return (
    <>
      <PageHeader
        title="Brukere & tilganger"
        description="Administrer ansatte, roller og tilgang."
        action={
          <Link href="/admin/inviter" className="btn-primary">
            <EnvelopeIcon className="h-5 w-5" />
            Inviter ansatt
          </Link>
        }
      />

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Navn</Th>
              <Th>Rolle</Th>
              <Th>Status</Th>
              <Th>Handling</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {brukere.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {b.full_name || 'Uten navn'}
                    {b.id === meg.id && (
                      <span className="ml-2 text-xs text-gray-400">(deg)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {ROLLE_LABEL[b.role]}
                </td>
                <td className="px-4 py-3">
                  {b.active ? (
                    <span className="text-sm text-green-700">Aktiv</span>
                  ) : (
                    <span className="text-sm text-gray-400">Deaktivert</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <BrukerActions
                    userId={b.id}
                    role={b.role}
                    active={b.active}
                    isSelf={b.id === meg.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
