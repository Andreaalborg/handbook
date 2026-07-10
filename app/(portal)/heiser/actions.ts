'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireProfile } from '@/lib/auth'
import type { LoggType } from '@/lib/types'

function tekst(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? '').trim()
  return v || null
}

// ---------------------------------------------------------------------------
// KUNDER
// ---------------------------------------------------------------------------
export async function createKunde(formData: FormData) {
  await requireProfile()
  const supabase = await createClient()

  const navn = tekst(formData, 'navn')
  if (!navn) return

  await supabase.from('kunder').insert({
    navn,
    org_nummer: tekst(formData, 'org_nummer'),
    kontaktperson: tekst(formData, 'kontaktperson'),
    telefon: tekst(formData, 'telefon'),
    epost: tekst(formData, 'epost'),
    merknader: tekst(formData, 'merknader'),
  })

  revalidatePath('/kunder')
  redirect('/kunder')
}

export async function deleteKunde(kundeId: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('kunder').delete().eq('id', kundeId)
  revalidatePath('/kunder')
}

// ---------------------------------------------------------------------------
// HEISER
// ---------------------------------------------------------------------------
function heisFelter(fd: FormData) {
  return {
    kunde_id: tekst(fd, 'kunde_id'),
    navn: String(fd.get('navn') ?? '').trim(),
    adresse: tekst(fd, 'adresse'),
    kommune: tekst(fd, 'kommune'),
    tilgangstype: tekst(fd, 'tilgangstype'),
    tilgang_kode: tekst(fd, 'tilgang_kode'),
    nokkelboks_plassering: tekst(fd, 'nokkelboks_plassering'),
    kontaktperson: tekst(fd, 'kontaktperson'),
    telefon: tekst(fd, 'telefon'),
    epost: tekst(fd, 'epost'),
    tilgangstider: tekst(fd, 'tilgangstider'),
    parkering: tekst(fd, 'parkering'),
    merknader: tekst(fd, 'merknader'),
    service_intervall: Math.min(
      4,
      Math.max(1, parseInt(String(fd.get('service_intervall') ?? '1'), 10) || 1)
    ),
    ansvarlig_montor: tekst(fd, 'ansvarlig_montor'),
    type: String(fd.get('type') ?? 'service') === 'engangsjobb' ? 'engangsjobb' : 'service',
    // Admin har valgt type i skjemaet → synken skal ikke overstyre den senere.
    type_manuell: true,
  }
}

/** Synk koblede kontaktpersoner til nøyaktig de valgte. */
async function syncKontakter(
  supabase: Awaited<ReturnType<typeof createClient>>,
  heisId: string,
  kontaktIds: string[]
) {
  await supabase.from('heis_kontakt').delete().eq('heis_id', heisId)
  if (kontaktIds.length > 0) {
    await supabase
      .from('heis_kontakt')
      .insert(kontaktIds.map((kontakt_id) => ({ heis_id: heisId, kontakt_id })))
  }
}

export async function createHeis(formData: FormData) {
  await requireProfile()
  const supabase = await createClient()

  const felter = heisFelter(formData)
  if (!felter.navn) return

  const { data, error } = await supabase
    .from('heiser')
    .insert(felter)
    .select('id')
    .single()

  if (error) {
    console.error('createHeis:', error.message)
    return
  }

  const kontaktIds = formData.getAll('kontakt_ids').map(String).filter(Boolean)
  await syncKontakter(supabase, data.id, kontaktIds)

  revalidatePath('/heiser')
  redirect(`/heiser/${data.id}`)
}

export async function updateHeis(heisId: string, formData: FormData) {
  await requireProfile()
  const supabase = await createClient()

  const felter = heisFelter(formData)
  if (!felter.navn) return

  const { error } = await supabase.from('heiser').update(felter).eq('id', heisId)
  if (error) console.error('updateHeis:', error.message)

  const kontaktIds = formData.getAll('kontakt_ids').map(String).filter(Boolean)
  await syncKontakter(supabase, heisId, kontaktIds)

  revalidatePath(`/heiser/${heisId}`)
  revalidatePath('/heiser')
}

export async function deleteHeis(heisId: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('heiser').delete().eq('id', heisId)
  revalidatePath('/heiser')
  redirect('/heiser')
}

// ---------------------------------------------------------------------------
// HEIS-LOGG
// ---------------------------------------------------------------------------
export async function addLogg(heisId: string, formData: FormData) {
  const profile = await requireProfile()
  const supabase = await createClient()

  const dato = String(formData.get('dato') ?? '').trim()
  const type = String(formData.get('type') ?? 'service') as LoggType

  await supabase.from('heis_logg').insert({
    heis_id: heisId,
    dato: dato || new Date().toISOString().slice(0, 10),
    type,
    utfort_av: tekst(formData, 'utfort_av') ?? profile.full_name,
    kommentar: tekst(formData, 'kommentar'),
    opprettet_av: profile.id,
  })

  revalidatePath(`/heiser/${heisId}`)
}

export async function deleteLogg(loggId: string, heisId: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('heis_logg').delete().eq('id', loggId)
  revalidatePath(`/heiser/${heisId}`)
}
