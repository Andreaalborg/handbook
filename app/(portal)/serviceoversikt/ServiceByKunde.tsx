'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import {
  ServiceRange,
  ServiceCount,
  ServiceStatusBadge,
} from '@/components/ui/ServiceRange'
import type { ServiceStatus } from '@/lib/types'

export interface ServiceRad {
  id: string
  navn: string
  service: ServiceStatus
}

export interface ServiceKundeGruppe {
  navn: string
  rader: ServiceRad[]
}

export function ServiceByKunde({ grupper }: { grupper: ServiceKundeGruppe[] }) {
  // Standard: alt lukket.
  const [apne, setApne] = useState<Set<string>>(new Set())
  const toggle = (navn: string) =>
    setApne((prev) => {
      const neste = new Set(prev)
      neste.has(navn) ? neste.delete(navn) : neste.add(navn)
      return neste
    })

  const alleApne = grupper.length > 0 && grupper.every((g) => apne.has(g.navn))
  const toggleAlle = () =>
    setApne(alleApne ? new Set() : new Set(grupper.map((g) => g.navn)))

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={toggleAlle} className="btn-secondary">
          {alleApne ? 'Lukk alle' : 'Åpne alle'}
        </button>
      </div>

      {grupper.map((g) => {
        const apen = apne.has(g.navn)
        // Antall som krever handling (etterslep + dette kvartalet).
        const krever = g.rader.filter(
          (r) => r.service.status !== 'kommende'
        ).length
        return (
          <div key={g.navn} className="card overflow-hidden">
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
              {krever > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  {krever} å gjøre
                </span>
              )}
              <span className="ml-auto text-sm text-gray-400">
                {g.rader.length} heis{g.rader.length === 1 ? '' : 'er'}
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
                        <Th>Utført i år</Th>
                        <Th>Neste service</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {g.rader.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/heiser/${r.id}`}
                              className="text-sm font-medium text-blue-700 hover:underline"
                            >
                              {r.navn}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <ServiceCount status={r.service} />
                          </td>
                          <td className="px-4 py-3">
                            <ServiceRange status={r.service} />
                          </td>
                          <td className="px-4 py-3">
                            <ServiceStatusBadge status={r.service} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kort */}
                <div className="md:hidden divide-y divide-gray-100">
                  {g.rader.map((r) => (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/heiser/${r.id}`}
                          className="font-medium text-blue-700"
                        >
                          {r.navn}
                        </Link>
                        <ServiceCount status={r.service} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Neste:</span>
                        <ServiceRange status={r.service} />
                      </div>
                      <div className="mt-1.5">
                        <ServiceStatusBadge status={r.service} />
                      </div>
                    </div>
                  ))}
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
