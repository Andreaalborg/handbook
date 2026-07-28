import type { Metadata } from 'next'
import { CalculatorIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Formler og utregning' }

export default async function FormlerPage() {
  await requireProfile()

  return (
    <>
      <PageHeader
        title="Formler og utregning"
        description="Formler og kalkulatorer for utregninger ute på jobb – slipp å huske alt i hodet."
      />
      <div className="card p-12 text-center">
        <CalculatorIcon className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-gray-500">
          Formler og kalkulatorer legges inn her etter hvert.
        </p>
      </div>
    </>
  )
}
