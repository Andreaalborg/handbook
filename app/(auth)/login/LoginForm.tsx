'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login, type ActionState } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Logger inn …' : 'Logg inn'}
    </button>
  )
}

export function LoginForm({ neste }: { neste: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(login, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="neste" value={neste} />

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

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="form-label">
            Passord
          </label>
          <Link
            href="/glemt-passord"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Glemt passord?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="form-input"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
