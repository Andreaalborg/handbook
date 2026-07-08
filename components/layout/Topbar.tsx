import { logout } from '@/app/(auth)/actions'
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
        <div className="lg:hidden text-lg font-bold text-blue-700">
          IMEM<span className="text-gray-900"> Portal</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              {initialer || 'A'}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium text-gray-900">{navn}</div>
              <div className="text-xs text-gray-500">
                {ROLLE_LABEL[profile.role]}
              </div>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logg ut
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
