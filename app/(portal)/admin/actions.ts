'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { Rolle } from '@/lib/types'

export type InviteState = { error?: string; ok?: string } | null

/**
 * Inviter ny ansatt. Kun admin. Bruker service-role for å opprette bruker og
 * sende invitasjons-e-post. Rollen settes i profiles-tabellen.
 */
export async function inviteUser(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const admin = await requireAdmin()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const role = (String(formData.get('role') ?? 'montor') as Rolle) || 'montor'
  const fullName = String(formData.get('full_name') ?? '').trim()

  if (!email || !email.includes('@')) {
    return { error: 'Ugyldig e-postadresse.' }
  }

  const supabaseAdmin = createAdminClient()
  const origin = (await headers()).get('origin') ?? ''

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${origin}/auth/callback?neste=/invitasjon`,
      data: { full_name: fullName || null },
    }
  )

  if (error) {
    return { error: `Kunne ikke invitere: ${error.message}` }
  }

  // Sett rolle/navn på profilraden (trigger har opprettet den med default montor).
  if (data.user) {
    await supabaseAdmin
      .from('profiles')
      .update({ role, full_name: fullName || null })
      .eq('id', data.user.id)
  }

  // Logg invitasjonen for sporbarhet.
  await supabaseAdmin.from('invitasjoner').insert({
    epost: email,
    rolle: role,
    invitert_av: admin.id,
    status: 'sendt',
  })

  revalidatePath('/admin/brukere')
  return { ok: `Invitasjon sendt til ${email}.` }
}

/** Endre rolle på en bruker. */
export async function setRole(userId: string, role: Rolle) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/admin/brukere')
}

/** Aktiver/deaktiver en bruker (sperrer innlogging via active-sjekk). */
export async function setActive(userId: string, active: boolean) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('profiles').update({ active }).eq('id', userId)
  revalidatePath('/admin/brukere')
}
