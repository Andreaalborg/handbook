'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; ok?: string } | null

/** E-post + passord innlogging. */
export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const neste = String(formData.get('neste') ?? '/dashboard')

  if (!email || !password) {
    return { error: 'Fyll inn e-post og passord.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Feil e-post eller passord.' }
  }

  revalidatePath('/', 'layout')
  redirect(neste.startsWith('/') ? neste : '/dashboard')
}

/** Logg ut. */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/** Send lenke for tilbakestilling av passord. */
export async function sendReset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Fyll inn e-post.' }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?neste=/oppdater-passord`,
  })

  // Ikke avslør om e-posten finnes (unngå kontooppregning).
  if (error) console.error('resetPasswordForEmail:', error.message)
  return { ok: 'Hvis e-posten finnes, er en lenke sendt.' }
}

/**
 * Setter nytt passord. Brukes både etter invitasjon og ved tilbakestilling —
 * i begge tilfeller er brukeren allerede autentisert via callback-lenken.
 */
export async function setPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()

  if (password.length < 8) {
    return { error: 'Passordet må være minst 8 tegn.' }
  }
  if (password !== confirm) {
    return { error: 'Passordene er ikke like.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Lenken er utløpt. Be admin om en ny invitasjon.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  // Oppdater navn på profilen hvis oppgitt (ved invitasjon).
  if (fullName) {
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
