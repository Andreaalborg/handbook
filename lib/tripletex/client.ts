// Tripletex API v2-klient. KUN server-side (bruker hemmelige tokens).
// Autentisering: consumer- + employee-token → session-token → HTTP Basic.

const BASE = process.env.TRIPLETEX_API_BASE ?? 'https://tripletex.no/v2'

export interface TxProject {
  id: number
  name: string
  number: string | null
  displayName: string | null
  isClosed: boolean
  isOffer: boolean
  customer: { id: number; name: string } | null
  deliveryAddress: {
    addressLine1: string | null
    postalCode: string | null
    city: string | null
  } | null
}

export interface TxTimesheetEntry {
  id: number
  date: string
  hours: number
  comment: string | null
  employee: { firstName: string | null; lastName: string | null } | null
  project: { id: number } | null
  activity: { name: string | null } | null
}

/**
 * Lager en kortlevd session-token. Støtter to flyter:
 *  - PROD (nytt): JWT refresh-token (tlxr_) via POST :createFromRefreshToken
 *  - TEST (gammelt): consumer- + employee-token via PUT :create
 * Velges automatisk ut fra hvilke miljøvariabler som er satt.
 */
async function getSessionToken(): Promise<string> {
  const refresh = process.env.TRIPLETEX_REFRESH_TOKEN

  // Nytt system (produksjon): refresh-token -> session-token
  if (refresh) {
    const res = await fetch(`${BASE}/token/session/:createFromRefreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh, ttlSeconds: 28800 }),
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`Tripletex-innlogging feilet (${res.status})`)
    }
    return (await res.json()).value.token as string
  }

  // Gammelt system (testmiljø): consumer + employee -> session-token
  const consumer = process.env.TRIPLETEX_CONSUMER_TOKEN
  const employee = process.env.TRIPLETEX_EMPLOYEE_TOKEN
  if (!consumer || !employee) {
    throw new Error(
      'Mangler Tripletex-nøkler (TRIPLETEX_REFRESH_TOKEN, eller CONSUMER + EMPLOYEE)'
    )
  }

  const exp = new Date()
  exp.setDate(exp.getDate() + 1)
  const params = new URLSearchParams({
    consumerToken: consumer,
    employeeToken: employee,
    expirationDate: exp.toISOString().slice(0, 10),
  })
  const res = await fetch(`${BASE}/token/session/:create?${params}`, {
    method: 'PUT',
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Tripletex-innlogging feilet (${res.status})`)
  }
  return (await res.json()).value.token as string
}

function authHeader(sessionToken: string): string {
  // Brukernavn 0 = selskapet som eier employee-tokenet.
  return 'Basic ' + Buffer.from(`0:${sessionToken}`).toString('base64')
}

/** Intern GET med paginering. Henter alle sider. */
async function getAll<T>(
  sessionToken: string,
  path: string,
  params: Record<string, string>
): Promise<T[]> {
  const out: T[] = []
  let from = 0
  const count = 1000
  for (;;) {
    const q = new URLSearchParams({ ...params, from: String(from), count: String(count) })
    const res = await fetch(`${BASE}${path}?${q}`, {
      headers: { Authorization: authHeader(sessionToken) },
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`Tripletex ${path} feilet (${res.status})`)
    }
    const json = await res.json()
    const values: T[] = json.values ?? []
    out.push(...values)
    const full = json.fullResultSize ?? out.length
    from += count
    if (out.length >= full || values.length === 0) break
  }
  return out
}

/** Henter alle prosjekter (= heiser). */
export async function hentProsjekter(): Promise<TxProject[]> {
  const token = await getSessionToken()
  return getAll<TxProject>(token, '/project', {
    fields:
      'id,name,number,displayName,isClosed,isOffer,customer(id,name),deliveryAddress(addressLine1,postalCode,city)',
  })
}

/** Henter timeføringer i et datointervall (YYYY-MM-DD). */
export async function hentTimeforinger(
  dateFrom: string,
  dateTo: string
): Promise<TxTimesheetEntry[]> {
  const token = await getSessionToken()
  return getAll<TxTimesheetEntry>(token, '/timesheet/entry', {
    dateFrom,
    dateTo,
    fields:
      'id,date,hours,comment,employee(firstName,lastName),project(id),activity(name)',
  })
}

/** Enkel tilkoblingstest – returnerer antall prosjekter eller kaster feil. */
export async function testTilkobling(): Promise<number> {
  const prosjekter = await hentProsjekter()
  return prosjekter.length
}
