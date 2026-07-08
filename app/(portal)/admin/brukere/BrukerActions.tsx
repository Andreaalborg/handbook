'use client'

import { useTransition } from 'react'
import { setRole, setActive } from '../actions'
import type { Rolle } from '@/lib/types'

export function BrukerActions({
  userId,
  role,
  active,
  isSelf,
}: {
  userId: string
  role: Rolle
  active: boolean
  isSelf: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={pending || isSelf}
        onChange={(e) =>
          startTransition(() => setRole(userId, e.target.value as Rolle))
        }
        className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-60"
        title={isSelf ? 'Du kan ikke endre din egen rolle' : undefined}
      >
        <option value="montor">Montør</option>
        <option value="admin">Administrator</option>
      </select>

      <button
        disabled={pending || isSelf}
        onClick={() => startTransition(() => setActive(userId, !active))}
        className="rounded-md border border-gray-300 px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        title={isSelf ? 'Du kan ikke deaktivere deg selv' : undefined}
      >
        {active ? 'Deaktiver' : 'Aktiver'}
      </button>
    </div>
  )
}
