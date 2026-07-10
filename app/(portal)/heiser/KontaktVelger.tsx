'use client'

import { useState } from 'react'
import {
  ChevronUpDownIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { KONTAKT_KATEGORI_LABEL, type KontaktKategori } from '@/lib/types'

export interface KontaktValg {
  id: string
  navn: string
  kategori: KontaktKategori
  telefon: string | null
}

/**
 * Søkbar flervalgs-dropdown for å koble kontaktpersoner til en heis.
 * Valgte id-er sendes med skjemaet som skjulte `kontakt_ids`-felt.
 */
export function KontaktVelger({
  kontakter,
  valgteKontaktIds = [],
}: {
  kontakter: KontaktValg[]
  valgteKontaktIds?: string[]
}) {
  const [valgt, setValgt] = useState<Set<string>>(new Set(valgteKontaktIds))
  const [apen, setApen] = useState(false)
  const [sok, setSok] = useState('')

  const toggle = (id: string) =>
    setValgt((prev) => {
      const neste = new Set(prev)
      neste.has(id) ? neste.delete(id) : neste.add(id)
      return neste
    })

  const valgteKontakter = kontakter.filter((k) => valgt.has(k.id))
  const filtrert = kontakter.filter((k) =>
    k.navn.toLowerCase().includes(sok.trim().toLowerCase())
  )

  return (
    <div>
      <span className="form-label">Kontaktpersoner (fra registeret)</span>

      {/* Skjulte felt for skjema-innsending */}
      {[...valgt].map((id) => (
        <input key={id} type="hidden" name="kontakt_ids" value={id} />
      ))}

      {/* Valgte som chips */}
      {valgteKontakter.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {valgteKontakter.map((k) => (
            <span
              key={k.id}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-sm text-blue-700"
            >
              {k.navn}
              <button
                type="button"
                onClick={() => toggle(k.id)}
                className="hover:text-blue-900"
                aria-label={`Fjern ${k.navn}`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown-knapp */}
      <button
        type="button"
        onClick={() => setApen((v) => !v)}
        className="form-input flex items-center justify-between text-left"
      >
        <span className="text-gray-500">
          {valgt.size > 0 ? `${valgt.size} valgt` : 'Velg kontaktpersoner …'}
        </span>
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {apen && (
        <div className="mt-1 rounded-md border border-gray-300 bg-white shadow-sm">
          {/* Søk */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Søk etter navn …"
              className="w-full text-sm focus:outline-none"
              autoFocus
            />
          </div>

          {/* Liste */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtrert.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">Ingen treff.</p>
            ) : (
              filtrert.map((k) => {
                const erValgt = valgt.has(k.id)
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggle(k.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <CheckIcon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        erValgt ? 'text-blue-600' : 'text-transparent'
                      )}
                    />
                    <span className="text-sm text-gray-900">{k.navn}</span>
                    <span className="text-xs text-gray-400">
                      {KONTAKT_KATEGORI_LABEL[k.kategori]}
                    </span>
                    {k.telefon && (
                      <span className="ml-auto text-xs text-gray-400">
                        {k.telefon}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2 text-right">
            <button
              type="button"
              onClick={() => setApen(false)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ferdig
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
