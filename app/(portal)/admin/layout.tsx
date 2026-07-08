import { requireAdmin } from '@/lib/auth'

// Ekstra vakt: alt under /admin krever admin-rolle.
// requireAdmin() redirecter montører til dashbordet.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
