'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { hentProsjekter, hentTimeforinger } from '@/lib/tripletex/client'
import type { LoggType } from '@/lib/types'

export type SyncState = {
  ok?: string
  error?: string
  detaljer?: { kunder: number; heiserNye: number; heiserOppdatert: number; logg: number }
} | null

function navnFra(e: { firstName: string | null; lastName: string | null } | null) {
  if (!e) return null
  return [e.firstName, e.lastName].filter(Boolean).join(' ') || null
}

export async function syncFraTripletex(): Promise<SyncState> {
  await requireAdmin()
  const supabase = await createClient()

  try {
    const prosjekter = await hentProsjekter()

    // ---- 1. Kunder (map: tripletex_kunde_id -> lokal id) ----
    const kundeMap = new Map<number, string>()
    const { data: eksKunder } = await supabase
      .from('kunder')
      .select('id, tripletex_kunde_id')
      .not('tripletex_kunde_id', 'is', null)
    for (const k of eksKunder ?? []) {
      if (k.tripletex_kunde_id) kundeMap.set(k.tripletex_kunde_id, k.id)
    }

    let nyeKunder = 0
    const setteKunder = new Set<number>()
    for (const p of prosjekter) {
      const c = p.customer
      if (!c || kundeMap.has(c.id) || setteKunder.has(c.id)) continue
      setteKunder.add(c.id)
      const { data } = await supabase
        .from('kunder')
        .insert({ navn: c.name, tripletex_kunde_id: c.id })
        .select('id')
        .single()
      if (data) {
        kundeMap.set(c.id, data.id)
        nyeKunder++
      }
    }

    // ---- 2. Heiser (upsert per tripletex_prosjekt_id, bevar lokale felt) ----
    const { data: eksHeiser } = await supabase
      .from('heiser')
      .select('id, tripletex_prosjekt_id')
      .not('tripletex_prosjekt_id', 'is', null)
    const heisMap = new Map<number, string>()
    for (const h of eksHeiser ?? []) {
      if (h.tripletex_prosjekt_id) heisMap.set(h.tripletex_prosjekt_id, h.id)
    }

    let nyeHeiser = 0
    let oppdaterteHeiser = 0
    for (const p of prosjekter) {
      const kundeId = p.customer ? (kundeMap.get(p.customer.id) ?? null) : null
      const adr = p.deliveryAddress

      if (heisMap.has(p.id)) {
        // Oppdater kun Tripletex-styrte felt. Adresse/kommune bare hvis satt der.
        const patch: Record<string, unknown> = { navn: p.name, kunde_id: kundeId }
        if (adr?.addressLine1) patch.adresse = adr.addressLine1
        if (adr?.city) patch.kommune = adr.city
        await supabase.from('heiser').update(patch).eq('id', heisMap.get(p.id)!)
        oppdaterteHeiser++
      } else {
        const { data } = await supabase
          .from('heiser')
          .insert({
            navn: p.name,
            kunde_id: kundeId,
            adresse: adr?.addressLine1 ?? null,
            kommune: adr?.city ?? null,
            tripletex_prosjekt_id: p.id,
          })
          .select('id')
          .single()
        if (data) {
          heisMap.set(p.id, data.id)
          nyeHeiser++
        }
      }
    }

    // ---- 3. Timeføringer -> historikk (dedupe på tripletex_entry_id) ----
    const tilDato = new Date()
    const fraDato = new Date()
    fraDato.setFullYear(fraDato.getFullYear() - 1)
    const entries = await hentTimeforinger(
      fraDato.toISOString().slice(0, 10),
      tilDato.toISOString().slice(0, 10)
    )

    const { data: eksLogg } = await supabase
      .from('heis_logg')
      .select('tripletex_entry_id')
      .not('tripletex_entry_id', 'is', null)
    const sett = new Set((eksLogg ?? []).map((l) => l.tripletex_entry_id))

    const nyeLogg = entries
      .filter((e) => e.project && heisMap.has(e.project.id) && !sett.has(e.id))
      .map((e) => {
        const akt = e.activity?.name?.toLowerCase() ?? ''
        const type: LoggType = akt.includes('service') ? 'service' : 'annet'
        return {
          heis_id: heisMap.get(e.project!.id)!,
          dato: e.date,
          type,
          utfort_av: navnFra(e.employee),
          kommentar: e.comment,
          tripletex_entry_id: e.id,
        }
      })

    if (nyeLogg.length > 0) {
      // Sett inn i porsjoner for å unngå for store forespørsler.
      for (let i = 0; i < nyeLogg.length; i += 500) {
        await supabase.from('heis_logg').insert(nyeLogg.slice(i, i + 500))
      }
    }

    revalidatePath('/heiser')
    revalidatePath('/kunder')

    return {
      ok: 'Synk fullført.',
      detaljer: {
        kunder: nyeKunder,
        heiserNye: nyeHeiser,
        heiserOppdatert: oppdaterteHeiser,
        logg: nyeLogg.length,
      },
    }
  } catch (e) {
    const melding = e instanceof Error ? e.message : 'Ukjent feil'
    console.error('syncFraTripletex:', melding)
    return { error: `Synk feilet: ${melding}` }
  }
}
