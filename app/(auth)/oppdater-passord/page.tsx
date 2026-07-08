import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordForm } from '../PasswordForm'

export const metadata: Metadata = { title: 'Sett nytt passord' }

export default function OppdaterPassordPage() {
  return (
    <AuthCard
      title="Sett nytt passord"
      subtitle="Velg et nytt passord for kontoen din."
    >
      <PasswordForm label="Lagre nytt passord" />
    </AuthCard>
  )
}
