'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { setPassword, type ActionState } from './actions'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Lagrer …' : label}
    </button>
  )
}

/**
 * Skjema for å sette passord. Med `askName` vises også navnefelt (brukes ved
 * invitasjon der montøren fyller ut navn første gang).
 */
export function PasswordForm({
  askName = false,
  label = 'Lagre passord',
}: {
  askName?: boolean
  label?: string
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    setPassword,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {askName && (
        <div>
          <label htmlFor="full_name" className="form-label">
            Fullt navn
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="form-input"
            placeholder="Ola Nordmann"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="form-label">
          Nytt passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="form-input"
        />
        <p className="mt-1 text-xs text-gray-500">Minst 8 tegn.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="form-label">
          Bekreft passord
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="form-input"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton label={label} />
    </form>
  )
}
