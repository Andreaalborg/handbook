'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { setSakStatus } from '../actions'
import { SAK_STATUS_LABEL, type SakStatus } from '@/lib/types'

const REKKEFOLGE: SakStatus[] = ['ny', 'pagaende', 'venter', 'ferdig']

export function StatusChanger({
  sakId,
  current,
}: {
  sakId: string
  current: SakStatus
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-2">
      {REKKEFOLGE.map((status) => {
        const active = status === current
        return (
          <button
            key={status}
            disabled={pending || active}
            onClick={() =>
              startTransition(() => {
                setSakStatus(sakId, status)
              })
            }
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-default',
              active
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {SAK_STATUS_LABEL[status]}
          </button>
        )
      })}
    </div>
  )
}
