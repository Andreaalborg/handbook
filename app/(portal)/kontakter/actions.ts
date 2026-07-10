'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireProfile } from '@/lib/auth'
import type { KontaktKategori } from '@/lib/types'

function tekst(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? '').trim()
  return v || null
}

const KATEGORIER: KontaktKategori[] = [
  'vaktmester',
  'nokkelperson',
  'fabrikk',
  'support',
  'annet',
]

function felter(fd: FormData) {
  const k = String(fd.get('kategori') ?? 'annet') as KontaktKategori
  return {
    navn: String(fd.get('navn') ?? '').trim(),
    kategori: KATEGORIER.includes(k) ? k : 'annet',
    firma: tekst(fd, 'firma'),
    telefon: tekst(fd, 'telefon'),
    epost: tekst(fd, 'epost'),
    kunde_id: tekst(fd, 'kunde_id'),
    merknader: tekst(fd, 'merknader'),
  }
}

export async function createKontakt(formData: FormData) {
  await requireProfile()
  const supabase = await createClient()
  const f = felter(formData)
  if (!f.navn) return
  await supabase.from('kontakter').insert(f)
  revalidatePath('/kontakter')
  redirect('/kontakter')
}

export async function updateKontakt(id: string, formData: FormData) {
  await requireProfile()
  const supabase = await createClient()
  const f = felter(formData)
  if (!f.navn) return
  await supabase.from('kontakter').update(f).eq('id', id)
  revalidatePath('/kontakter')
  redirect('/kontakter')
}

export async function deleteKontakt(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('kontakter').delete().eq('id', id)
  revalidatePath('/kontakter')
  redirect('/kontakter')
}
