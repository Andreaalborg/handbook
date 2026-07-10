import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UsersIcon,
  BuildingOffice2Icon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ServiceRange } from '@/components/ui/ServiceRange'
import { beregnServiceStatus, type Sak, type Heis } from '@/lib/types'

export const metadata: Metadata = { title: 'Oversikt' }

export default async function DashboardPage() {
  const profile = await requireProfile()
  const supabase = await createClient()
  const isMontor = profile.role === 'montor'

  // Saker (RLS: montør ser kun sine tildelte).
  const { data: sakerData } = await supabase
    .from('saker')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(6)
  const saker = (sakerData ?? []) as Sak[]
  const aktive = saker.filter((s) => s.status !== 'ferdig').length

  // Montør: heiser der jeg er ansvarlig, med service-status.
  let mineHeiser: { heis: Heis; service: ReturnType<typeof beregnServiceStatus> }[] = []
  if (isMontor) {
    const { data: h } = await supabase
      .from('heiser')
      .select('*')
      .eq('ansvarlig_montor', profile.id)
      .order('navn')
    const heiser = (h ?? []) as Heis[]
    const ids = heiser.map((x) => x.id)
    const datoerPerHeis = new Map<string, string[]>()
    if (ids.length > 0) {
      const { data: logg } = await supabase
        .from('heis_logg')
        .select('heis_id, dato')
        .eq('type', 'service')
        .in('heis_id', ids)
      for (const r of logg ?? []) {
        const liste = datoerPerHeis.get(r.heis_id) ?? []
        liste.push(r.dato)
        datoerPerHeis.set(r.heis_id, liste)
      }
    }
    mineHeiser = heiser.map((heis) => ({
      heis,
      service: beregnServiceStatus(datoerPerHeis.get(heis.id) ?? [], heis.service_intervall),
    }))
  }

  const forfalt = mineHeiser.filter((m) => m.service.status !== 'kommende').length
  const fornavn = profile.full_name?.split(' ')[0] || 'der'

  return (
    <>
      <PageHeader
        title={`Hei, ${fornavn} 👋`}
        description={
          isMontor ? 'Dine saker og heiser.' : 'Oversikt over saker og snarveier.'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label={isMontor ? 'Mine aktive saker' : 'Aktive saker'} value={aktive} />
        {isMontor ? (
          <>
            <StatCard label="Mine heiser" value={mineHeiser.length} />
            <StatCard label="Service forfaller/forfalt" value={forfalt} />
          </>
        ) : (
          <>
            <StatCard label="Saker vist" value={saker.length} />
            <StatCard
              label="Ferdige"
              value={saker.filter((s) => s.status === 'ferdig').length}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          {/* Saker */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                {isMontor ? 'Mine saker' : 'Siste saker'}
              </h2>
              <Link href="/saker" className="text-sm text-blue-600 hover:text-blue-700">
                Se alle →
              </Link>
            </div>
            {saker.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">Ingen saker ennå.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {saker.map((sak) => (
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
                          <p className="text-xs text-gray-500 truncate">{sak.adresse}</p>
                        )}
                      </div>
                      <StatusBadge status={sak.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Montør: mine heiser (service) */}
          {isMontor && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Mine heiser – service</h2>
                <Link href="/heiser" className="text-sm text-blue-600 hover:text-blue-700">
                  Alle heiser →
                </Link>
              </div>
              {mineHeiser.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  Ingen heiser er tildelt deg ennå.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {mineHeiser.map(({ heis, service }) => (
                    <li key={heis.id}>
                      <Link
                        href={`/heiser/${heis.id}`}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {heis.navn}
                          </p>
                          {heis.adresse && (
                            <p className="text-xs text-gray-500 truncate">{heis.adresse}</p>
                          )}
                        </div>
                        <ServiceRange status={service} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Snarveier</h2>
          <div className="space-y-2">
            <Snarvei href="/heiser" icon={BuildingOffice2Icon} label="Heiser" />
            <Snarvei href="/saker" icon={ClipboardDocumentListIcon} label="Saker" />
            <Snarvei href="/tilgangskort" icon={KeyIcon} label="Tilgangskort" />
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
