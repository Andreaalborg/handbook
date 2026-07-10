import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  ServiceRange,
  ServiceCount,
  ServiceStatusBadge,
} from '@/components/ui/ServiceRange'
import { beregnServiceStatus, type Heis, type ServiceStatus } from '@/lib/types'

export const metadata: Metadata = { title: 'Serviceoversikt' }

type HeisMedKunde = Heis & { kunder: { navn: string } | null }
type Rad = { heis: HeisMedKunde; service: ServiceStatus }

const STATUS_PRIO = { forfalt: 0, aktiv: 1, kommende: 2 }

export default async function ServiceoversiktPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Kun service-heiser (engangsjobber ekskluderes).
  const { data } = await supabase
    .from('heiser')
    .select('*, kunder(navn)')
    .eq('type', 'service')
    .order('navn')
  const heiser = (data ?? []) as HeisMedKunde[]

  const { data: serviceRader } = await supabase
    .from('heis_logg')
    .select('heis_id, dato')
    .eq('type', 'service')
  const datoerPerHeis = new Map<string, string[]>()
  for (const r of serviceRader ?? []) {
    const liste = datoerPerHeis.get(r.heis_id) ?? []
    liste.push(r.dato)
    datoerPerHeis.set(r.heis_id, liste)
  }

  const rader: Rad[] = heiser.map((heis) => ({
    heis,
    service: beregnServiceStatus(datoerPerHeis.get(heis.id) ?? [], heis.service_intervall),
  }))

  // Summer.
  const planlagt = rader.reduce((s, r) => s + r.service.intervall, 0)
  const utfort = rader.reduce((s, r) => s + r.service.hittilIAar, 0)
  const gjenstaar = rader.reduce(
    (s, r) => s + Math.max(0, r.service.intervall - r.service.hittilIAar),
    0
  )
  const etterslep = rader.filter((r) => r.service.status === 'forfalt').length
  const detteKvartalet = rader.filter((r) => r.service.status === 'aktiv').length

  // Grupper per kunde; sorter heiser innen kunde etter hvor mye det haster.
  const grupper = new Map<string, Rad[]>()
  for (const r of rader) {
    const navn = r.heis.kunder?.navn ?? 'Uten kunde'
    ;(grupper.get(navn) ?? grupper.set(navn, []).get(navn)!).push(r)
  }
  const grupperListe = [...grupper.entries()]
    .map(([navn, r]) => ({
      navn,
      rader: r.sort((a, b) => STATUS_PRIO[a.service.status] - STATUS_PRIO[b.service.status]),
    }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'))

  const naa = new Date()
  const kvartal = Math.floor(naa.getMonth() / 3) + 1

  return (
    <>
      <PageHeader
        title="Serviceoversikt"
        description={`Q${kvartal} ${naa.getFullYear()} – planlagte og utestående servicer per kunde.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Stat label="Planlagt i år" value={planlagt} />
        <Stat label="Utført hittil" value={utfort} tone="green" />
        <Stat label="Gjenstår i år" value={gjenstaar} />
        <Stat label="Dette kvartalet" value={detteKvartalet} tone="amber" />
        <Stat label="På etterslep" value={etterslep} tone="red" />
      </div>

      {heiser.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen service-heiser ennå. Synk fra Tripletex på{' '}
          <Link href="/heiser" className="text-blue-600 hover:underline">
            Heiser
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-6">
          {grupperListe.map((g) => (
            <section key={g.navn} className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-900">{g.navn}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <Th>Heis</Th>
                      <Th>Utført i år</Th>
                      <Th>Neste service</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {g.rader.map(({ heis, service }) => (
                      <tr key={heis.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/heiser/${heis.id}`}
                            className="text-sm font-medium text-blue-700 hover:underline"
                          >
                            {heis.navn}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <ServiceCount status={service} />
                        </td>
                        <td className="px-4 py-3">
                          <ServiceRange status={service} />
                        </td>
                        <td className="px-4 py-3">
                          <ServiceStatusBadge status={service} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'green' | 'amber' | 'red'
}) {
  const farge = {
    default: 'text-gray-900',
    green: 'text-green-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  }[tone]
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${farge}`}>{value}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
      {children}
    </th>
  )
}
