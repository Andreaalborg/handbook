import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Supabase-klient for server-komponenter, server actions og route handlers.
 * I Next.js 16 er `cookies()` asynkron, derfor `await`.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // `setAll` kalt fra en Server Component. Kan ignoreres når
            // proxy.ts oppdaterer sesjonen på hver request.
          }
        },
      },
    }
  )
}

/**
 * Admin-klient med service-role-key. KUN server-side (aldri eksponer nøkkelen
 * til klienten). Brukes til invitasjoner og andre admin-operasjoner som
 * omgår RLS.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
