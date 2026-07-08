'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendReset, type ActionState } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Sender …' : 'Send lenke'}
    </button>
  )
}

export function ResetForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    sendReset,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="form-label">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="form-input"
          placeholder="navn@imemnorway.no"
        />
      </div>

      {state?.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}
        </p>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  )
}
