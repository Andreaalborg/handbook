# IMEM Portal – oppsett

Intern ansattportal (Next.js 16 + Supabase). Kjør stegene under én gang for å
komme i gang. Deretter fungerer innlogging, roller og invitasjoner.

## 1. Opprett Supabase-prosjekt

1. Gå til https://supabase.com → **New project** (velg region EU, f.eks. Frankfurt).
2. Når prosjektet er klart: **Project Settings → API** og kopier:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (hemmelig!)

## 2. Sett miljøvariabler

Kopier `.env.local.example` til `.env.local` og lim inn de tre verdiene over.
`.env.local` er allerede i `.gitignore` – den skal aldri committes.

## 3. Kjør databaseskjemaet

Åpne **SQL Editor** i Supabase, lim inn hele `supabase/schema.sql` og kjør.
Dette oppretter tabeller (`profiles`, `saker`, `dokumenter`, `invitasjoner`),
RLS-policyer, `is_admin()`-funksjonen, trigger for auto-profil og
Storage-bøtta `dokumenter`.

## 4. Slå på sikkerhet i Supabase Auth

**Authentication → Policies / Settings:**
- Skru **AV** "Allow new users to sign up" (vi bruker kun invitasjon).
- Skru **PÅ** "Leaked password protection" (sjekker mot HaveIBeenPwned).
- Sett minimum passordlengde til 8+.

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000` (lokalt) / `https://portal.imemnorway.no` (prod).
- Legg til begge under "Redirect URLs" med `/auth/callback`.

## 5. Opprett første admin

Første bruker må inviteres eller opprettes manuelt, deretter gjøres til admin:

1. **Authentication → Users → Add user** (sett e-post + midlertidig passord),
   eller inviter deg selv når appen kjører.
2. Kjør i SQL Editor (bytt e-post):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'deg@imemnorway.no');
   ```

## 6. Kjør lokalt

```bash
npm install      # allerede gjort
npm run dev      # http://localhost:3000
```

Logg inn → du havner på dashbordet. Som admin ser du **Brukere** og **Inviter**
i menyen. Inviter en montør → de får e-post → setter passord på `/invitasjon`.

## 7. Deploy til portal.imemnorway.no (Netlify)

1. Push prosjektet til et GitHub-repo.
2. Netlify → **Add new site → Import from Git** → velg repoet.
   Build: `npm run build`. Netlify oppdager Next.js automatisk.
3. **Site settings → Environment variables**: legg inn de tre Supabase-verdiene.
4. **Domain management → Add domain** → `portal.imemnorway.no`, følg DNS-stegene
   (CNAME til Netlify). Netlify utsteder HTTPS-sertifikat automatisk.
5. Oppdater Supabase **Site URL / Redirect URLs** til `https://portal.imemnorway.no`.

## Arkitektur kort

- **proxy.ts** (Next 16s middleware): oppfrisker sesjon + redirecter uinnloggede.
- **(portal)/layout.tsx**: krever innlogging server-side.
- **(portal)/admin/layout.tsx**: krever admin-rolle.
- **RLS** i Postgres: montører ser kun egne/tildelte saker; admin ser alt.
- Passord lagres bcrypt-hashet av Supabase – aldri i klartekst.
- `SUPABASE_SERVICE_ROLE_KEY` brukes kun server-side (invitasjoner).

## Moduler som kan legges til senere

Timeføring, kundedatabase, ansatt-/kontaktliste, kalender/vaktplan – bygg som
nye mapper under `app/(portal)/` + tabell med RLS etter samme mønster som `saker`.
