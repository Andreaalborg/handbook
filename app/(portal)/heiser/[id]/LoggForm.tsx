'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { addLogg } from '../actions'
import { LOGG_TYPE_LABEL, type LoggType } from '@/lib/types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Lagrer …' : 'Legg til i historikk'}
    </button>
  )
}

export function LoggForm({ heisId }: { heisId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const idag = new Date().toISOString().slice(0, 10)
  const action = addLogg.bind(null, heisId)

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd)
        formRef.current?.reset()
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dato" className="form-label">
            Dato
          </label>
          <input
            id="dato"
            name="dato"
            type="date"
            defaultValue={idag}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="type" className="form-label">
            Type
          </label>
          <select id="type" name="type" defaultValue="service" className="form-input">
            {(Object.keys(LOGG_TYPE_LABEL) as LoggType[]).map((t) => (
              <option key={t} value={t}>
                {LOGG_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="utfort_av" className="form-label">
          Utført av
        </label>
        <input
          id="utfort_av"
          name="utfort_av"
          className="form-input"
          placeholder="Ditt navn hvis tomt"
        />
      </div>

      <div>
        <label htmlFor="kommentar" className="form-label">
          Kommentar / hva ble gjort
        </label>
        <textarea id="kommentar" name="kommentar" rows={2} className="form-input" />
      </div>

      <SubmitButton />
    </form>
  )
}
