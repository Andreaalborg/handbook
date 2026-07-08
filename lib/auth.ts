import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

/**
 * Henter innlogget bruker + profil (med rolle) server-side.
 * Redirecter til /login hvis ikke innlogget.
 * Brukes i (portal)/layout.tsx og sider som trenger brukerkontekst.
 */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Ingen profilrad ennå (f.eks. rett etter invitasjon) — behandle som montør.
  if (!profile) {
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      phone: null,
      role: 'montor',
      active: true,
      created_at: user.created_at,
    }
  }

  if (!profile.active) {
    redirect('/login?feil=deaktivert')
  }

  return profile as Profile
}

/** Som requireProfile, men krever admin-rolle. Ellers redirect til dashbordet. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') {
    redirect('/dashboard?feil=ingen-tilgang')
  }
  return profile
}
