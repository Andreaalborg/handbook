import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Logg inn' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ neste?: string; feil?: string }>
}) {
  const { neste, feil } = await searchParams

  const feilmelding =
    feil === 'deaktivert'
      ? 'Kontoen din er deaktivert. Kontakt en administrator.'
      : feil === 'lenke'
        ? 'Lenken er ugyldig eller utløpt. Prøv på nytt.'
        : null

  return (
    <AuthCard title="Logg inn" subtitle="Tilgang for ansatte i IMEM.">
      {feilmelding && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {feilmelding}
        </p>
      )}
      <LoginForm neste={neste ?? '/dashboard'} />
    </AuthCard>
  )
}
