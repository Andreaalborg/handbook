import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Oppfrisker Supabase-sesjonen på hver request og håndhever innlogging.
 * Kalles fra roten `proxy.ts` (Next.js 16s erstatning for middleware).
 *
 * Viktig: returner alltid `supabaseResponse`-objektet uendret slik at
 * oppdaterte auth-cookies sendes tilbake til browseren.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IKKE legg kode mellom createServerClient og getUser() — det kan
  // gi vanskelige feil med tilfeldig utlogging.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase ikke konfigurert / nettverksfeil: behandle som uinnlogget.
    // Beskyttede ruter sender da til /login (ingen tilgang gis).
    user = null
  }

  const path = request.nextUrl.pathname

  // Offentlige ruter som ikke krever innlogging.
  const isPublic =
    path.startsWith('/login') ||
    path.startsWith('/invitasjon') ||
    path.startsWith('/glemt-passord') ||
    path.startsWith('/oppdater-passord') ||
    path.startsWith('/auth')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('neste', path)
    return NextResponse.redirect(url)
  }

  // Innlogget bruker som treffer /login sendes til dashbordet.
  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
