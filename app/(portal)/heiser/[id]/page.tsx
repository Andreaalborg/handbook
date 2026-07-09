import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { HeisFields } from '../HeisFields'
import { updateHeis, deleteHeis, deleteLogg } from '../actions'
import { LoggForm } from './LoggForm'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { ServiceRange, ServiceCount } from '@/components/ui/ServiceRange'
import {
  beregnServiceStatus,
  LOGG_TYPE_LABEL,
  type Heis,
  type Kunde,
  type HeisLogg,
} from '@/lib/types'

export const metadata: Metadata = { title: 'Heis' }

export default async function HeisDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: heis } = await supabase
    .from('heiser')
    .select('*')
    .eq('id', id)
    .single()

  if (!heis) notFound()
  const h = heis as Heis

  const { data: kunderData } = await supabase.from('kunder').select('*').order('navn')
  const kunder = (kunderData ?? []) as Kunde[]

  const { data: loggData } = await supabase
    .from('heis_logg')
    .select('*')
    .eq('heis_id', id)
    .order('dato', { ascending: false })
  const logg = (loggData ?? []) as HeisLogg[]

  const serviceDatoer = logg
    .filter((l) => l.type === 'service')
    .map((l) => l.dato)
  const service = beregnServiceStatus(serviceDatoer, h.service_intervall)

  const isAdmin = profile.role === 'admin'
  const oppdater = updateHeis.bind(null, h.id)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/heiser"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Tilbake til heiser
        </Link>
        {isAdmin && (
          <DeleteButton
            action={deleteHeis.bind(null, h.id)}
            confirmText={`Slette heisen "${h.navn}" og all historikk? Dette kan ikke angres.`}
            label="Slett heis"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {h.navn}
        </h1>
        <span className="text-sm text-gray-500">Service i år:</span>
        <ServiceCount status={service} />
        <span className="text-sm text-gray-500">Neste:</span>
        <ServiceRange status={service} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Detaljer & tilgang – redigerbart av alle */}
        <section className="lg:col-span-3 card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detaljer & tilgang</h2>
          <form action={oppdater}>
            <HeisFields kunder={kunder} heis={h} />
            <div className="pt-6">
              <button type="submit" className="btn-primary">
                Lagre endringer
              </button>
            </div>
          </form>
          <p className="mt-4 text-xs text-gray-400">
            Sist oppdatert{' '}
            {new Date(h.updated_at).toLocaleString('nb-NO', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        </section>

        {/* Historikk / arbeidslogg */}
        <section className="lg:col-span-2 card p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Historikk</h2>

          <LoggForm heisId={h.id} />

          <div className="mt-6 border-t border-gray-100 pt-4">
            {logg.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                Ingen registreringer ennå.
              </p>
            ) : (
              <ul className="space-y-3">
                {logg.map((l) => (
                  <li
                    key={l.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {LOGG_TYPE_LABEL[l.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(l.dato).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                      {isAdmin && (
                        <DeleteButton
                          action={deleteLogg.bind(null, l.id, h.id)}
                          confirmText="Slette denne loggføringen?"
                          iconOnly
                        />
                      )}
                    </div>
                    {l.kommentar && (
                      <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap">
                        {l.kommentar}
                      </p>
                    )}
                    {l.utfort_av && (
                      <p className="mt-1 text-xs text-gray-400">
                        Utført av {l.utfort_av}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
