'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { ServiceRange, ServiceCount } from '@/components/ui/ServiceRange'
import type { HeisType, ServiceStatus } from '@/lib/types'

export interface HeisRad {
  id: string
  navn: string
  type: HeisType
  tilgang_kode: string | null
  tilgangstider: string | null
  parkering: string | null
  kontaktperson: string | null
  telefon: string | null
  kort: string[]
  service: ServiceStatus
}

export interface KundeGruppe {
  navn: string
  heiser: HeisRad[]
}

type Filter = 'service' | 'engangsjobb' | 'alle'

const FILTRE: { key: Filter; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'engangsjobb', label: 'Engangsjobber' },
  { key: 'alle', label: 'Alle' },
]

export function HeiserByKunde({ grupper }: { grupper: KundeGruppe[] }) {
  // Alle grupper åpne som standard; klikk for å lukke.
  // Standard: alle grupper lukket. `apne` inneholder de som er åpne.
  const [apne, setApne] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<Filter>('service')
  const [apneHeiser, setApneHeiser] = useState<Set<string>>(new Set())
  const toggle = (navn: string) =>
    setApne((prev) => {
      const neste = new Set(prev)
      neste.has(navn) ? neste.delete(navn) : neste.add(navn)
      return neste
    })
  const toggleHeis = (id: string) =>
    setApneHeiser((prev) => {
      const neste = new Set(prev)
      neste.has(id) ? neste.delete(id) : neste.add(id)
      return neste
    })

  // Filtrer heiser per type, og skjul kunder som blir tomme.
  const synlige = grupper
    .map((g) => ({
      ...g,
      heiser: g.heiser.filter((h) => filter === 'alle' || h.type === filter),
    }))
    .filter((g) => g.heiser.length > 0)

  const alleApne = synlige.length > 0 && synlige.every((g) => apne.has(g.navn))
  const toggleAlle = () =>
    setApne(alleApne ? new Set() : new Set(synlige.map((g) => g.navn)))

  return (
    <div className="space-y-3">
      {/* Filter + åpne/lukk alle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
          {FILTRE.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={toggleAlle} className="btn-secondary">
          {alleApne ? 'Lukk alle' : 'Åpne alle'}
        </button>
      </div>

      {synlige.length === 0 && (
        <div className="card p-10 text-center text-gray-500">
          Ingen heiser i dette filteret.
        </div>
      )}

      {synlige.map((g) => {
        const apen = apne.has(g.navn)
        return (
          <div key={g.navn} className="card overflow-hidden">
            {/* Kunde-header (dropdown) */}
            <button
              type="button"
              onClick={() => toggle(g.navn)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <ChevronRightIcon
                className={cn(
                  'h-5 w-5 text-gray-400 transition-transform',
                  apen && 'rotate-90'
                )}
              />
              <span className="font-semibold text-gray-900">{g.navn}</span>
              <span className="ml-auto text-sm text-gray-400">
                {g.heiser.length} heis{g.heiser.length === 1 ? '' : 'er'}
              </span>
            </button>

            {apen && (
              <div className="border-t border-gray-100">
                {/* Desktop: tabell */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Heis</Th>
                        <Th>Kode</Th>
                        <Th>Tilgangstid</Th>
                        <Th>Kontaktperson</Th>
                        <Th>Telefon</Th>
                        <Th>Kort</Th>
                        <Th>Service i år</Th>
                        <Th>Neste service</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {g.heiser.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/heiser/${h.id}`}
                              className="text-sm font-medium text-blue-700 hover:underline"
                            >
                              {h.navn}
                            </Link>
                            {h.type === 'engangsjobb' && <EngangsTag />}
                          </td>
                          <Td>{h.tilgang_kode}</Td>
                          <Td>{h.tilgangstider}</Td>
                          <Td>{h.kontaktperson}</Td>
                          <Td>{h.telefon}</Td>
                          <td className="px-4 py-3">
                            <Chips verdier={h.kort} />
                          </td>
                          <td className="px-4 py-3">
                            <ServiceCount status={h.service} />
                          </td>
                          <td className="px-4 py-3">
                            <ServiceRange status={h.service} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kompakte kort med «Vis mer» */}
                <div className="md:hidden divide-y divide-gray-100">
                  {g.heiser.map((h) => {
                    const utvidet = apneHeiser.has(h.id)
                    return (
                      <div key={h.id} className="px-4 py-3">
                        {/* Alltid synlig: navn, utført, neste service */}
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/heiser/${h.id}`}
                            className="font-medium text-blue-700"
                          >
                            {h.navn}
                            {h.type === 'engangsjobb' && <EngangsTag />}
                          </Link>
                          <ServiceCount status={h.service} />
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Neste:</span>
                          <ServiceRange status={h.service} />
                        </div>

                        {/* Resten bak «Vis mer» */}
                        {utvidet && (
                          <div className="mt-3">
                            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                              <Rad label="Kode" verdi={h.tilgang_kode} />
                              <Rad label="Tilgangstid" verdi={h.tilgangstider} />
                              <Rad label="Kontakt" verdi={h.kontaktperson} />
                              <Rad label="Telefon" verdi={h.telefon} />
                            </dl>
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">Kort</span>
                              <div className="mt-0.5">
                                <Chips verdier={h.kort} />
                              </div>
                            </div>
                            {h.parkering && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-400">
                                  Parkering
                                </span>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {h.parkering}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleHeis(h.id)}
                          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {utvidet ? 'Vis mindre' : 'Vis mer'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
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

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
      {children || '—'}
    </td>
  )
}

function Rad({ label, verdi }: { label: string; verdi: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-700">{verdi || '—'}</dd>
    </div>
  )
}

function EngangsTag() {
  return (
    <span className="ml-2 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 align-middle">
      Engangsjobb
    </span>
  )
}

function Chips({ verdier }: { verdier: string[] }) {
  if (verdier.length === 0)
    return <span className="text-sm text-gray-400">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {verdier.map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
        >
          {v}
        </span>
      ))}
    </div>
  )
}
