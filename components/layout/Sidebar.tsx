'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { Rolle } from '@/lib/types'

const nav = [
  { name: 'Oversikt', href: '/dashboard', icon: HomeIcon, adminOnly: false },
  { name: 'Saker', href: '/saker', icon: ClipboardDocumentListIcon, adminOnly: false },
  { name: 'Dokumenter', href: '/dokumenter', icon: BookOpenIcon, adminOnly: false },
  { name: 'Brukere', href: '/admin/brukere', icon: UsersIcon, adminOnly: true },
  { name: 'Inviter', href: '/admin/inviter', icon: EnvelopeIcon, adminOnly: true },
]

export function Sidebar({ role }: { role: Rolle }) {
  const pathname = usePathname()
  const items = nav.filter((i) => !i.adminOnly || role === 'admin')

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-700">
          IMEM<span className="text-gray-900"> Portal</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
