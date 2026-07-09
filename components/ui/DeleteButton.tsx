'use client'

import { useTransition } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

/**
 * Slette-knapp med bekreftelse. Tar en bundet server-action som prop.
 * Vises kun for admin (kalleren bestemmer det).
 */
export function DeleteButton({
  action,
  confirmText,
  label,
  iconOnly = false,
}: {
  action: () => Promise<void>
  confirmText: string
  label?: string
  iconOnly?: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) startTransition(() => action())
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50',
        iconOnly ? 'p-1.5' : 'border border-red-200 px-3 py-1.5'
      )}
      title={label ?? 'Slett'}
    >
      <TrashIcon className="h-4 w-4" />
      {!iconOnly && (label ?? 'Slett')}
    </button>
  )
}
