import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/AuthCard'
import { ResetForm } from './ResetForm'

export const metadata: Metadata = { title: 'Glemt passord' }

export default function GlemtPassordPage() {
  return (
    <AuthCard
      title="Glemt passord"
      subtitle="Få en lenke for å sette nytt passord."
      footer={
        <Link href="/login" className="text-blue-600 hover:text-blue-700">
          ← Tilbake til innlogging
        </Link>
      }
    >
      <ResetForm />
    </AuthCard>
  )
}
