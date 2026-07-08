import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireAdmin } from '@/lib/auth'
import { InviteForm } from './InviteForm'

export const metadata: Metadata = { title: 'Inviter ansatt' }

export default async function InviterPage() {
  await requireAdmin()

  return (
    <>
      <Link
        href="/admin/brukere"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tilbake til brukere
      </Link>

      <div className="card p-6 max-w-lg">
        <h1 className="text-xl font-semibold text-gray-900">Inviter ansatt</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Den ansatte får en e-post med lenke for å velge passord og aktivere
          kontoen. Ingen kan registrere seg uten invitasjon.
        </p>
        <InviteForm />
      </div>
    </>
  )
}
