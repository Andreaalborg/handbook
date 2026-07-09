import { cn } from '@/lib/utils'
import type { ServiceStatus } from '@/lib/types'

const STYLE: Record<ServiceStatus['status'], string> = {
  forfalt: 'bg-red-50 text-red-700 ring-red-600/20',
  aktiv: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  kommende: 'bg-green-50 text-green-700 ring-green-600/20',
}

const LABEL: Record<ServiceStatus['status'], string> = {
  forfalt: 'Forfalt',
  aktiv: 'Forfaller nå',
  kommende: 'Neste',
}

function kort(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${Number(d)}.${Number(m)}.${y}`
}

/** Viser neste service som en periode (range) med fargekode. */
export function ServiceRange({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        STYLE[status.status]
      )}
      title={LABEL[status.status]}
    >
      {kort(status.nesteStart)}–{kort(status.nesteSlutt)}
    </span>
  )
}

/** Viser «utført hittil i år» som f.eks. 2 / 4. */
export function ServiceCount({ status }: { status: ServiceStatus }) {
  const ferdig = status.hittilIAar >= status.intervall
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        ferdig ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      )}
    >
      {status.hittilIAar} / {status.intervall}
    </span>
  )
}
