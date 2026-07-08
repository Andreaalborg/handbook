import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SAK_STATUS_LABEL, type Sak } from '@/lib/types'

export const metadata: Metadata = { title: 'Oversikt' }

export default async function DashboardPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  // RLS sørger for at montører kun ser egne/tildelte saker.
  const { data: saker } = await supabase
    .from('saker')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(6)

  const mine = (saker ?? []) as Sak[]
  const aktive = mine.filter((s) => s.status !== 'ferdig').length

  const fornavn = profile.full_name?.split(' ')[0] || 'der'

  return (
    <>
      <PageHeader
        title={`Hei, ${fornavn} 👋`}
        description="Her er en oversikt over saker og snarveier."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Aktive saker" value={aktive} />
        <StatCard label="Totalt tildelt" value={mine.length} />
        <StatCard
          label="Ferdige"
          value={mine.filter((s) => s.status === 'ferdig').length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Siste saker</h2>
            <Link
              href="/saker"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Se alle →
            </Link>
          </div>

          {mine.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Ingen saker ennå.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {mine.map((sak) => (
                <li key={sak.id}>
                  <Link
                    href={`/saker/${sak.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sak.tittel}
                      </p>
                      {sak.adresse && (
                        <p className="text-xs text-gray-500 truncate">
                          {sak.adresse}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={sak.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Snarveier</h2>
          <div className="space-y-2">
            <Snarvei href="/saker" icon={ClipboardDocumentListIcon} label="Alle saker" />
            <Snarvei href="/dokumenter" icon={BookOpenIcon} label="Montørhåndbok" />
            {profile.role === 'admin' && (
              <Snarvei href="/admin/brukere" icon={UsersIcon} label="Administrer brukere" />
            )}
          </div>
        </section>
      </div>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Snarvei({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300"
    >
      <Icon className="h-5 w-5 text-blue-600" />
      {label}
    </Link>
  )
}
