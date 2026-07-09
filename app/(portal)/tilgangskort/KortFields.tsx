import {
  KORT_TYPE_LABEL,
  type KortType,
  type Kunde,
  type Profile,
  type Tilgangskort,
} from '@/lib/types'

interface HeisValg {
  id: string
  navn: string
  kundeNavn: string
}

/**
 * Feltene for et tilgangskort. Ren server-render (ingen klient-state) –
 * heis-koblinger er avkrysningsbokser som sendes med som `heis_ids`.
 */
export function KortFields({
  kunder,
  eiere,
  heiser,
  kort,
  valgteHeisIds = [],
}: {
  kunder: Kunde[]
  eiere: Profile[]
  heiser: HeisValg[]
  kort?: Tilgangskort
  valgteHeisIds?: string[]
}) {
  const valgt = new Set(valgteHeisIds)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="kortnummer" className="form-label">
            Kortnummer *
          </label>
          <input
            id="kortnummer"
            name="kortnummer"
            required
            defaultValue={kort?.kortnummer ?? ''}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="type" className="form-label">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={kort?.type ?? 'kort'}
            className="form-input"
          >
            {(Object.keys(KORT_TYPE_LABEL) as KortType[]).map((t) => (
              <option key={t} value={t}>
                {KORT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kunde_id" className="form-label">
            Kunde
          </label>
          <select
            id="kunde_id"
            name="kunde_id"
            defaultValue={kort?.kunde_id ?? ''}
            className="form-input"
          >
            <option value="">— Velg kunde —</option>
            {kunder.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eier_id" className="form-label">
            Eier av kortet
          </label>
          <select
            id="eier_id"
            name="eier_id"
            defaultValue={kort?.eier_id ?? ''}
            className="form-input"
          >
            <option value="">— Ingen —</option>
            {eiere.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name || 'Uten navn'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tilganger: hvilke heiser kortet gir tilgang til */}
      <div>
        <span className="form-label">Tilganger (heiser dette kortet åpner)</span>
        {heiser.length === 0 ? (
          <p className="text-sm text-gray-500">Ingen heiser registrert ennå.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300 divide-y divide-gray-100">
            {heiser.map((h) => (
              <label
                key={h.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="heis_ids"
                  value={h.id}
                  defaultChecked={valgt.has(h.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{h.navn}</span>
                <span className="ml-auto text-xs text-gray-400">{h.kundeNavn}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="merknader" className="form-label">
          Merknader
        </label>
        <textarea
          id="merknader"
          name="merknader"
          rows={2}
          defaultValue={kort?.merknader ?? ''}
          className="form-input"
        />
      </div>
    </div>
  )
}
