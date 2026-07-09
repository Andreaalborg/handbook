'use client'

import { useState, useTransition } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { syncFraTripletex, type SyncState } from './tripletex-actions'

export function SyncButton() {
  const [pending, start] = useTransition()
  const [state, setState] = useState<SyncState>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setState(await syncFraTripletex()))}
        className="btn-secondary"
      >
        <ArrowPathIcon className={pending ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
        {pending ? 'Synkroniserer …' : 'Synk fra Tripletex'}
      </button>

      {state?.ok && state.detaljer && (
        <p className="text-xs text-green-700">
          {state.detaljer.heiserNye} nye heiser, {state.detaljer.heiserOppdatert}{' '}
          oppdatert, {state.detaljer.kunder} kunder, {state.detaljer.logg}{' '}
          loggføringer.
        </p>
      )}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  )
}
