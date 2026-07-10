import Image from 'next/image'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { MobileNav } from './MobileNav'
import { ROLLE_LABEL, type Profile } from '@/lib/types'

export function Topbar({ profile }: { profile: Profile }) {
  const navn = profile.full_name || 'Ansatt'
  const initialer = navn
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 shrink-0 border-b border-gray-200 bg-white">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Mobil: hamburger + logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNav role={profile.role} />
          <Image
            src="/imem-logo.webp"
            alt="IMEM Lifts"
            width={851}
            height={198}
            className="h-6 w-auto"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-gray-50"
            title="Min profil"
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {initialer || 'A'}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium text-gray-900">{navn}</div>
              <div className="text-xs text-gray-500">
                {ROLLE_LABEL[profile.role]}
              </div>
            </div>
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              Logg ut
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
