'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireProfile } from '@/lib/auth'
import type { KortType } from '@/lib/types'

function tekst(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? '').trim()
  return v || null
}

function kortFelter(fd: FormData) {
  const type = (String(fd.get('type') ?? 'kort') as KortType) || 'kort'
  return {
    kortnummer: String(fd.get('kortnummer') ?? '').trim(),
    type,
    kunde_id: tekst(fd, 'kunde_id'),
    eier_id: tekst(fd, 'eier_id'),
    merknader: tekst(fd, 'merknader'),
  }
}

/** Synk koblingene kort <-> heiser til nøyaktig de valgte heisene. */
async function syncTilganger(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kortId: string,
  heisIds: string[]
) {
  // Enkelt og robust: fjern alle, sett inn de valgte på nytt.
  await supabase.from('kort_tilgang').delete().eq('kort_id', kortId)
  if (heisIds.length > 0) {
    await supabase
      .from('kort_tilgang')
      .insert(heisIds.map((heis_id) => ({ kort_id: kortId, heis_id })))
  }
}

export async function createKort(formData: FormData) {
  await requireProfile()
  const supabase = await createClient()

  const felter = kortFelter(formData)
  if (!felter.kortnummer) return

  const { data, error } = await supabase
    .from('tilgangskort')
    .insert(felter)
    .select('id')
    .single()
  if (error || !data) {
    console.error('createKort:', error?.message)
    return
  }

  const heisIds = formData.getAll('heis_ids').map(String).filter(Boolean)
  await syncTilganger(supabase, data.id, heisIds)

  revalidatePath('/tilgangskort')
  revalidatePath('/heiser')
  redirect('/tilgangskort')
}

export async function updateKort(kortId: string, formData: FormData) {
  await requireProfile()
  const supabase = await createClient()

  const felter = kortFelter(formData)
  if (!felter.kortnummer) return

  await supabase.from('tilgangskort').update(felter).eq('id', kortId)

  const heisIds = formData.getAll('heis_ids').map(String).filter(Boolean)
  await syncTilganger(supabase, kortId, heisIds)

  revalidatePath('/tilgangskort')
  revalidatePath('/heiser')
  redirect('/tilgangskort')
}

export async function deleteKort(kortId: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('tilgangskort').delete().eq('id', kortId)
  revalidatePath('/tilgangskort')
  revalidatePath('/heiser')
  redirect('/tilgangskort')
}
