import type { Metadata } from 'next'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Dokument } from '@/lib/types'

export const metadata: Metadata = { title: 'Dokumenter' }

export default async function DokumenterPage() {
  await requireProfile()
  const supabase = await createClient()

  const { data } = await supabase
    .from('dokumenter')
    .select('*')
    .order('kategori', { ascending: true })
    .order('tittel', { ascending: true })

  const dokumenter = (data ?? []) as Dokument[]

  // Grupper etter kategori.
  const grupper = dokumenter.reduce<Record<string, Dokument[]>>((acc, d) => {
    const key = d.kategori || 'Annet'
    ;(acc[key] ??= []).push(d)
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title="Montørhåndbok & dokumenter"
        description="Rutiner, sjekklister og annen dokumentasjon."
      />

      {dokumenter.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen dokumenter er lastet opp ennå.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grupper).map(([kategori, docs]) => (
            <section key={kategori}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                {kategori}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs.map((d) => (
                  <div
                    key={d.id}
                    className="card p-4 flex items-start gap-3"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {d.tittel}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(d.created_at).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
