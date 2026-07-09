import type { Metadata } from 'next'
import { BellAlertIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Heisalarmer' }

export default async function HeisalarmerPage() {
  await requireProfile()

  return (
    <>
      <PageHeader
        title="Heisalarmer"
        description="Alarmer koblet til heiser/prosjekter."
      />
      <div className="card p-12 text-center">
        <BellAlertIcon className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-gray-500">
          Denne siden er under arbeid – detaljer fylles inn etter hvert.
        </p>
      </div>
    </>
  )
}
