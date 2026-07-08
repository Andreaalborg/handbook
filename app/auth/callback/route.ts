import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback: bytter engangs-koden fra e-postlenker (invitasjon eller
 * tilbakestilling) mot en sesjon, og sender brukeren videre.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const neste = searchParams.get('neste') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${neste}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?feil=lenke`)
}
