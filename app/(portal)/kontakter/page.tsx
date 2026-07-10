import Link from 'next/link'
import type { Metadata } from 'next'
import { PlusIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { KontaktListe, type KontaktRad } from './KontaktListe'
import type { Kontakt } from '@/lib/types'

export const metadata: Metadata = { title: 'Kontaktpersoner' }

export default async function KontakterPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const [{ data: kontaktData }, { data: kunder }] = await Promise.all([
    supabase.from('kontakter').select('*').order('navn'),
    supabase.from('kunder').select('id, navn'),
  ])

  const kundeNavn = new Map((kunder ?? []).map((k) => [k.id, k.navn]))
  const kontakter: KontaktRad[] = ((kontaktData ?? []) as Kontakt[]).map((k) => ({
    id: k.id,
    navn: k.navn,
    kategori: k.kategori,
    firma: k.firma,
    telefon: k.telefon,
    epost: k.epost,
    kundeNavn: k.kunde_id ? (kundeNavn.get(k.kunde_id) ?? null) : null,
  }))

  return (
    <>
      <PageHeader
        title="Kontaktpersoner"
        description="Vaktmestere, nøkkelpersoner, fabrikker og support."
        action={
          <Link href="/kontakter/ny" className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Ny kontakt
          </Link>
        }
      />

      {kontakter.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Ingen kontakter ennå.{' '}
          <Link href="/kontakter/ny" className="text-blue-600 hover:underline">
            Legg til den første
          </Link>
          .
        </div>
      ) : (
        <KontaktListe kontakter={kontakter} isAdmin={profile.role === 'admin'} />
      )}
    </>
  )
}
