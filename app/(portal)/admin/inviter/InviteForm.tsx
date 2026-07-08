'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { inviteUser, type InviteState } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Sender …' : 'Send invitasjon'}
    </button>
  )
}

export function InviteForm() {
  const [state, formAction] = useActionState<InviteState, FormData>(
    inviteUser,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="form-label">
          Navn
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className="form-input"
          placeholder="Ola Nordmann"
        />
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          E-post *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="form-input"
          placeholder="navn@imemnorway.no"
        />
      </div>

      <div>
        <label htmlFor="role" className="form-label">
          Rolle
        </label>
        <select id="role" name="role" className="form-input" defaultValue="montor">
          <option value="montor">Montør</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {state?.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}
        </p>
      )}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
