import {
  TILGANGSTYPER,
  HEIS_TYPE_LABEL,
  KONTAKT_KATEGORI_LABEL,
  type HeisType,
  type KontaktKategori,
  type Heis,
  type Kunde,
  type Profile,
} from '@/lib/types'

export interface KontaktValg {
  id: string
  navn: string
  kategori: KontaktKategori
  telefon: string | null
}

/**
 * Feltene for en heis. Brukes både ved oppretting og redigering.
 * Rendrer kun input-feltene – <form>-taggen ligger i sidene som bruker dette.
 */
export function HeisFields({
  kunder,
  montorer,
  kontakter,
  valgteKontaktIds = [],
  heis,
}: {
  kunder: Kunde[]
  montorer: Profile[]
  kontakter: KontaktValg[]
  valgteKontaktIds?: string[]
  heis?: Heis
}) {
  const valgt = new Set(valgteKontaktIds)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Felt label="Navn / ID *" htmlFor="navn">
          <input
            id="navn"
            name="navn"
            required
            defaultValue={heis?.navn ?? ''}
            className="form-input"
            placeholder="F.eks. Heis A / serienr"
          />
        </Felt>

        <Felt label="Kunde" htmlFor="kunde_id">
          <select
            id="kunde_id"
            name="kunde_id"
            defaultValue={heis?.kunde_id ?? ''}
            className="form-input"
          >
            <option value="">— Velg kunde —</option>
            {kunder.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn}
              </option>
            ))}
          </select>
        </Felt>

        <Felt label="Adresse" htmlFor="adresse">
          <input id="adresse" name="adresse" defaultValue={heis?.adresse ?? ''} className="form-input" />
        </Felt>

        <Felt label="Kommune" htmlFor="kommune">
          <input id="kommune" name="kommune" defaultValue={heis?.kommune ?? ''} className="form-input" />
        </Felt>

        <Felt label="Tilgangstype" htmlFor="tilgangstype">
          <input
            id="tilgangstype"
            name="tilgangstype"
            list="tilgangstyper"
            defaultValue={heis?.tilgangstype ?? ''}
            className="form-input"
            placeholder="Nøkkelboks, kodebrikke ..."
          />
          <datalist id="tilgangstyper">
            {TILGANGSTYPER.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Felt>

        <Felt label="Kode" htmlFor="tilgang_kode">
          <input id="tilgang_kode" name="tilgang_kode" defaultValue={heis?.tilgang_kode ?? ''} className="form-input" />
        </Felt>

        <Felt label="Plassering nøkkelboks" htmlFor="nokkelboks_plassering">
          <input
            id="nokkelboks_plassering"
            name="nokkelboks_plassering"
            defaultValue={heis?.nokkelboks_plassering ?? ''}
            className="form-input"
          />
        </Felt>

        <Felt label="Tilgangstider" htmlFor="tilgangstider">
          <input
            id="tilgangstider"
            name="tilgangstider"
            defaultValue={heis?.tilgangstider ?? ''}
            className="form-input"
            placeholder="F.eks. 07–16 hverdager"
          />
        </Felt>

        <Felt label="Kontaktperson" htmlFor="kontaktperson">
          <input id="kontaktperson" name="kontaktperson" defaultValue={heis?.kontaktperson ?? ''} className="form-input" />
        </Felt>

        <Felt label="Telefon" htmlFor="telefon">
          <input id="telefon" name="telefon" defaultValue={heis?.telefon ?? ''} className="form-input" />
        </Felt>

        <Felt label="E-post" htmlFor="epost">
          <input id="epost" name="epost" type="email" defaultValue={heis?.epost ?? ''} className="form-input" />
        </Felt>

        <Felt label="Service pr. år (1–4)" htmlFor="service_intervall">
          <input
            id="service_intervall"
            name="service_intervall"
            type="number"
            min={1}
            max={4}
            defaultValue={heis?.service_intervall ?? 4}
            className="form-input"
          />
        </Felt>

        <Felt label="Type" htmlFor="type">
          <select
            id="type"
            name="type"
            defaultValue={heis?.type ?? 'service'}
            className="form-input"
          >
            {(Object.keys(HEIS_TYPE_LABEL) as HeisType[]).map((t) => (
              <option key={t} value={t}>
                {HEIS_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Felt>

        <Felt label="Ansvarlig montør" htmlFor="ansvarlig_montor">
          <select
            id="ansvarlig_montor"
            name="ansvarlig_montor"
            defaultValue={heis?.ansvarlig_montor ?? ''}
            className="form-input"
          >
            <option value="">— Ingen —</option>
            {montorer.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || 'Uten navn'}
              </option>
            ))}
          </select>
        </Felt>
      </div>

      {/* Koble kontaktpersoner fra registeret */}
      <div>
        <span className="form-label">Kontaktpersoner (fra registeret)</span>
        {kontakter.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ingen kontakter ennå. Legg dem inn under Kontakter først.
          </p>
        ) : (
          <div className="max-h-56 overflow-y-auto rounded-md border border-gray-300 divide-y divide-gray-100">
            {kontakter.map((k) => (
              <label
                key={k.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="kontakt_ids"
                  value={k.id}
                  defaultChecked={valgt.has(k.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{k.navn}</span>
                <span className="text-xs text-gray-400">
                  {KONTAKT_KATEGORI_LABEL[k.kategori]}
                </span>
                {k.telefon && (
                  <span className="ml-auto text-xs text-gray-400">{k.telefon}</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <Felt label="Parkering" htmlFor="parkering">
        <textarea
          id="parkering"
          name="parkering"
          rows={2}
          defaultValue={heis?.parkering ?? ''}
          className="form-input"
          placeholder="Hvor kan montør parkere? Evt. kode/avtale."
        />
      </Felt>

      <Felt label="Merknader / kommentarer" htmlFor="merknader">
        <textarea
          id="merknader"
          name="merknader"
          rows={3}
          defaultValue={heis?.merknader ?? ''}
          className="form-input"
        />
      </Felt>
    </div>
  )
}

function Felt({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="form-label">
        {label}
      </label>
      {children}
    </div>
  )
}
