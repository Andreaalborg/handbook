'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navItems'
import type { Rolle } from '@/lib/types'

export function Sidebar({ role }: { role: Rolle }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || role === 'admin')

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <Image
            src="/imem-logo.webp"
            alt="IMEM Lifts"
            width={851}
            height={198}
            priority
            className="h-7 w-auto"
          />
          <span className="text-sm font-medium text-gray-400">Portal</span>
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
