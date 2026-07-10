'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireProfile } from '@/lib/auth'

/** Opprett mappe i gjeldende mappe (parentId = null → rot). */
export async function createMappe(parentId: string | null, formData: FormData) {
  const profile = await requireProfile()
  const supabase = await createClient()

  const navn = String(formData.get('navn') ?? '').trim()
  if (!navn) return

  await supabase.from('mapper').insert({
    navn,
    parent_id: parentId,
    opprettet_av: profile.id,
  })
  revalidatePath('/dokumenter')
}

/** Registrer et opplastet dokument (filen er allerede lastet til Storage). */
export async function registrerDokument(
  mappeId: string | null,
  tittel: string,
  filSti: string,
  storrelse: number
) {
  const profile = await requireProfile()
  const supabase = await createClient()

  await supabase.from('dokumenter').insert({
    tittel,
    fil_sti: filSti,
    mappe_id: mappeId,
    storrelse,
    opprettet_av: profile.id,
  })
  revalidatePath('/dokumenter')
}

/** Slett mappe (kun admin). Undermapper + dokumenter slettes via cascade i DB,
 *  men Storage-filene ryddes best-effort her. */
export async function deleteMappe(mappeId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Rydd filer i mappa fra Storage (grunn – én nivå; DB cascade tar radene).
  const { data: docs } = await supabase
    .from('dokumenter')
    .select('fil_sti')
    .eq('mappe_id', mappeId)
  const stier = (docs ?? []).map((d) => d.fil_sti).filter(Boolean) as string[]
  if (stier.length > 0) {
    await supabase.storage.from('dokumenter').remove(stier)
  }

  await supabase.from('mapper').delete().eq('id', mappeId)
  revalidatePath('/dokumenter')
}

/** Slett ett dokument (kun admin) – både rad og fil. */
export async function deleteDokument(dokumentId: string, filSti: string | null) {
  await requireAdmin()
  const supabase = await createClient()

  if (filSti) {
    await supabase.storage.from('dokumenter').remove([filSti])
  }
  await supabase.from('dokumenter').delete().eq('id', dokumentId)
  revalidatePath('/dokumenter')
}
