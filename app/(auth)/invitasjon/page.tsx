import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordForm } from '../PasswordForm'

export const metadata: Metadata = { title: 'Fullfør registrering' }

export default function InvitasjonPage() {
  return (
    <AuthCard
      title="Velkommen til IMEM"
      subtitle="Fyll inn navn og velg et passord for å aktivere kontoen din."
    >
      <PasswordForm askName label="Aktiver konto" />
    </AuthCard>
  )
}
