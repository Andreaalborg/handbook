'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navItems'
import type { Rolle } from '@/lib/types'

/** Hamburger-meny + skuff for mobil/nettbrett (skjult på lg+). */
export function MobileNav({ role }: { role: Rolle }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || role === 'admin')

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        aria-label="Åpne meny"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Bakgrunn */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Skuff */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Image
                src="/imem-logo.webp"
                alt="IMEM Lifts"
                width={851}
                height={198}
                className="h-7 w-auto"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900"
                aria-label="Lukk meny"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
