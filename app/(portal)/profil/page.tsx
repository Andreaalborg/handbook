import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/PageHeader'
import { PasswordForm } from '@/app/(auth)/PasswordForm'
import { ROLLE_LABEL } from '@/lib/types'

export const metadata: Metadata = { title: 'Min profil' }

export default async function ProfilPage() {
  const profile = await requireProfile()

  return (
    <>
      <PageHeader title="Min profil" description="Kontoinnstillinger." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Konto</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Navn</dt>
              <dd className="text-gray-900 font-medium">
                {profile.full_name || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Rolle</dt>
              <dd className="text-gray-900 font-medium">
                {ROLLE_LABEL[profile.role]}
              </dd>
            </div>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Bytt passord</h2>
          <p className="text-sm text-gray-500 mb-4">
            Velg et nytt passord (minst 8 tegn).
          </p>
          <PasswordForm label="Bytt passord" />
        </section>
      </div>
    </>
  )
}
