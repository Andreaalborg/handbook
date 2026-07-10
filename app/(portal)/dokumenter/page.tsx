import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FolderIcon,
  DocumentIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NyMappe } from './NyMappe'
import { LastOppFil } from './LastOppFil'
import { deleteMappe, deleteDokument } from './actions'
import type { Mappe, Dokument } from '@/lib/types'

export const metadata: Metadata = { title: 'Dokumenter' }

function storrelse(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default async function DokumenterPage({
  searchParams,
}: {
  searchParams: Promise<{ mappe?: string }>
}) {
  const profile = await requireProfile()
  const { mappe } = await searchParams
  const mappeId = mappe ?? null
  const supabase = await createClient()
  const isAdmin = profile.role === 'admin'

  // Alle mapper (for smulesti) + undermapper i gjeldende mappe.
  const { data: alleMapper } = await supabase
    .from('mapper')
    .select('*')
    .order('navn')
  const mapper = (alleMapper ?? []) as Mappe[]
  const undermapper = mapper.filter((m) => m.parent_id === mappeId)

  // Dokumenter i gjeldende mappe.
  const dokQuery = supabase.from('dokumenter').select('*').order('tittel')
  const { data: dokData } = mappeId
    ? await dokQuery.eq('mappe_id', mappeId)
    : await dokQuery.is('mappe_id', null)
  const dokumenter = (dokData ?? []) as Dokument[]

  // Signerte nedlastingslenker.
  const stier = dokumenter.map((d) => d.fil_sti).filter(Boolean) as string[]
  const lenker = new Map<string, string>()
  if (stier.length > 0) {
    const { data: signed } = await supabase.storage
      .from('dokumenter')
      .createSignedUrls(stier, 3600)
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) lenker.set(s.path, s.signedUrl)
    }
  }

  // Smulesti fra rot til gjeldende mappe.
  const sti: Mappe[] = []
  let peker = mappeId
  const map = new Map(mapper.map((m) => [m.id, m]))
  while (peker) {
    const m = map.get(peker)
    if (!m) break
    sti.unshift(m)
    peker = m.parent_id
  }

  return (
    <>
      <PageHeader
        title="Dokumenter"
        description="Filarkiv med mapper. Alle kan lese og laste opp."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <NyMappe parentId={mappeId} />
            <LastOppFil mappeId={mappeId} />
          </div>
        }
      />

      {/* Smulesti */}
      <nav className="mb-4 flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <Link href="/dokumenter" className="hover:text-gray-900">
          Dokumenter
        </Link>
        {sti.map((m) => (
          <span key={m.id} className="flex items-center gap-1">
            <ChevronRightIcon className="h-4 w-4 text-gray-300" />
            <Link href={`/dokumenter?mappe=${m.id}`} className="hover:text-gray-900">
              {m.navn}
            </Link>
          </span>
        ))}
      </nav>

      {undermapper.length === 0 && dokumenter.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Tom mappe. Lag en undermappe eller last opp en fil.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Undermapper */}
          {undermapper.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {undermapper.map((m) => (
                <div key={m.id} className="card p-4 flex items-center gap-3">
                  <Link
                    href={`/dokumenter?mappe=${m.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <FolderIcon className="h-6 w-6 text-blue-600 shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {m.navn}
                    </span>
                  </Link>
                  {isAdmin && (
                    <DeleteButton
                      action={deleteMappe.bind(null, m.id)}
                      confirmText={`Slette mappa «${m.navn}» og alt innhold?`}
                      iconOnly
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Filer */}
          {dokumenter.length > 0 && (
            <div className="card divide-y divide-gray-100">
              {dokumenter.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <DocumentIcon className="h-6 w-6 text-gray-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    {d.fil_sti && lenker.get(d.fil_sti) ? (
                      <a
                        href={lenker.get(d.fil_sti)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {d.tittel}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">{d.tittel}</span>
                    )}
                    <p className="text-xs text-gray-400">
                      {storrelse(d.storrelse)}
                      {d.storrelse ? ' · ' : ''}
                      {new Date(d.created_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>
                  {isAdmin && (
                    <DeleteButton
                      action={deleteDokument.bind(null, d.id, d.fil_sti)}
                      confirmText={`Slette «${d.tittel}»?`}
                      iconOnly
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
