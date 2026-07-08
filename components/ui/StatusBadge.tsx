import { cn } from '@/lib/utils'
import { SAK_STATUS_LABEL, type SakStatus } from '@/lib/types'

const styles: Record<SakStatus, string> = {
  ny: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  pagaende: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  venter: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  ferdig: 'bg-green-50 text-green-700 ring-green-600/20',
}

export function StatusBadge({ status }: { status: SakStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[status]
      )}
    >
      {SAK_STATUS_LABEL[status]}
    </span>
  )
}
