'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { deleteKontakt } from './actions'
import { KONTAKT_KATEGORI_LABEL, type KontaktKategori } from '@/lib/types'

export interface KontaktRad {
  id: string
  navn: string
  kategori: KontaktKategori
  firma: string | null
  telefon: string | null
  epost: string | null
  kundeNavn: string | null
}

const KATEGORI_STIL: Record<KontaktKategori, string> = {
  vaktmester: 'bg-blue-50 text-blue-700',
  nokkelperson: 'bg-purple-50 text-purple-700',
  fabrikk: 'bg-amber-50 text-amber-700',
  support: 'bg-green-50 text-green-700',
  annet: 'bg-gray-100 text-gray-600',
}

export function KontaktListe({
  kontakter,
  isAdmin,
}: {
  kontakter: KontaktRad[]
  isAdmin: boolean
}) {
  const [filter, setFilter] = useState<KontaktKategori | 'alle'>('alle')
  const synlige =
    filter === 'alle' ? kontakter : kontakter.filter((k) => k.kategori === filter)

  const kategorier: (KontaktKategori | 'alle')[] = [
    'alle',
    ...(Object.keys(KONTAKT_KATEGORI_LABEL) as KontaktKategori[]),
  ]

  return (
    <div className="space-y-4">
      {/* Kategori-filter */}
      <div className="flex flex-wrap gap-2">
        {kategorier.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium border transition-colors',
              filter === k
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            )}
          >
            {k === 'alle' ? 'Alle' : KONTAKT_KATEGORI_LABEL[k]}
          </button>
        ))}
      </div>

      {synlige.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen kontakter i denne kategorien.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {synlige.map((k) => (
            <div key={k.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/kontakter/${k.id}`}
                    className="font-medium text-gray-900 hover:text-blue-700"
                  >
                    {k.navn}
                  </Link>
                  {k.firma && (
                    <p className="text-sm text-gray-500 truncate">{k.firma}</p>
                  )}
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                    KATEGORI_STIL[k.kategori]
                  )}
                >
                  {KONTAKT_KATEGORI_LABEL[k.kategori]}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                {k.telefon && (
                  <a
                    href={`tel:${k.telefon.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-blue-700 hover:underline"
                  >
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    {k.telefon}
                  </a>
                )}
                {k.epost && (
                  <a
                    href={`mailto:${k.epost}`}
                    className="flex items-center gap-2 text-blue-700 hover:underline truncate"
                  >
                    <EnvelopeIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{k.epost}</span>
                  </a>
                )}
                {k.kundeNavn && (
                  <p className="text-xs text-gray-400">Kunde: {k.kundeNavn}</p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <DeleteButton
                    action={deleteKontakt.bind(null, k.id)}
                    confirmText={`Slette kontakten ${k.navn}?`}
                    iconOnly
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
