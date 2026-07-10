import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UsersIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  KeyIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Oversikt', href: '/dashboard', icon: HomeIcon, adminOnly: false },
  { name: 'Heiser', href: '/heiser', icon: BuildingOffice2Icon, adminOnly: false },
  { name: 'Serviceoversikt', href: '/serviceoversikt', icon: WrenchScrewdriverIcon, adminOnly: true },
  { name: 'Tilgangskort', href: '/tilgangskort', icon: KeyIcon, adminOnly: false },
  { name: 'Kontakter', href: '/kontakter', icon: UserGroupIcon, adminOnly: false },
  { name: 'Heisalarmer', href: '/heisalarmer', icon: BellAlertIcon, adminOnly: false },
  { name: 'Kunder', href: '/kunder', icon: BriefcaseIcon, adminOnly: true },
  { name: 'Saker', href: '/saker', icon: ClipboardDocumentListIcon, adminOnly: false },
  { name: 'Dokumenter', href: '/dokumenter', icon: BookOpenIcon, adminOnly: false },
  { name: 'Brukere', href: '/admin/brukere', icon: UsersIcon, adminOnly: true },
  { name: 'Inviter', href: '/admin/inviter', icon: EnvelopeIcon, adminOnly: true },
]
