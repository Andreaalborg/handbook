'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface KortRad {
  id: string
  kortnummer: string
  type: string
  eier: string | null
  tilganger: string[]
}

export interface KortKundeGruppe {
  navn: string
  kort: KortRad[]
}

export function KortByKunde({ grupper }: { grupper: KortKundeGruppe[] }) {
  const [lukket, setLukket] = useState<Set<string>>(new Set())
  const toggle = (navn: string) =>
    setLukket((prev) => {
      const neste = new Set(prev)
      neste.has(navn) ? neste.delete(navn) : neste.add(navn)
      return neste
    })

  return (
    <div className="space-y-3">
      {grupper.map((g) => {
        const apen = !lukket.has(g.navn)
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
              <span className="ml-auto text-sm text-gray-400">
                {g.kort.length} kort
              </span>
            </button>

            {apen && (
              <div className="border-t border-gray-100">
                {/* Desktop: tabell */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Kortnummer</Th>
                        <Th>Type</Th>
                        <Th>Tilganger</Th>
                        <Th>Eier</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {g.kort.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/tilgangskort/${k.id}`}
                              className="text-sm font-medium text-blue-700 hover:underline"
                            >
                              {k.kortnummer}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {k.type}
                          </td>
                          <td className="px-4 py-3">
                            <Chips verdier={k.tilganger} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {k.eier ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil: kort */}
                <div className="md:hidden divide-y divide-gray-100">
                  {g.kort.map((k) => (
                    <Link
                      key={k.id}
                      href={`/tilgangskort/${k.id}`}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-blue-700">
                          {k.kortnummer}
                        </span>
                        <span className="text-xs text-gray-400">{k.type}</span>
                      </div>
                      <div className="mt-1.5">
                        <Chips verdier={k.tilganger} />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Eier: {k.eier ?? '—'}
                      </p>
                    </Link>
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
      {children}
    </th>
  )
}
