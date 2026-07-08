'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireProfile } from '@/lib/auth'
import type { SakStatus } from '@/lib/types'

/** Opprett ny sak (kun admin — håndheves også av RLS). */
export async function createSak(formData: FormData) {
  const profile = await requireAdmin()
  const supabase = await createClient()

  const tittel = String(formData.get('tittel') ?? '').trim()
  if (!tittel) return

  const tildelt = String(formData.get('tildelt_montor') ?? '')

  const { data, error } = await supabase
    .from('saker')
    .insert({
      tittel,
      beskrivelse: String(formData.get('beskrivelse') ?? '').trim() || null,
      adresse: String(formData.get('adresse') ?? '').trim() || null,
      kunde: String(formData.get('kunde') ?? '').trim() || null,
      tildelt_montor: tildelt || null,
      opprettet_av: profile.id,
      status: 'ny',
    })
    .select('id')
    .single()

  if (error) {
    console.error('createSak:', error.message)
    return
  }

  revalidatePath('/saker')
  redirect(`/saker/${data.id}`)
}

/** Endre status på en sak. Montør kan endre på egne tildelte saker (RLS). */
export async function setSakStatus(sakId: string, status: SakStatus) {
  await requireProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from('saker')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', sakId)

  if (error) console.error('setSakStatus:', error.message)
  revalidatePath(`/saker/${sakId}`)
  revalidatePath('/saker')
}
