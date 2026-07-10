import {
  KONTAKT_KATEGORI_LABEL,
  type KontaktKategori,
  type Kontakt,
  type Kunde,
} from '@/lib/types'

export function KontaktFields({
  kunder,
  kontakt,
}: {
  kunder: Kunde[]
  kontakt?: Kontakt
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="navn" className="form-label">
            Navn *
          </label>
          <input
            id="navn"
            name="navn"
            required
            defaultValue={kontakt?.navn ?? ''}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="kategori" className="form-label">
            Kategori
          </label>
          <select
            id="kategori"
            name="kategori"
            defaultValue={kontakt?.kategori ?? 'vaktmester'}
            className="form-input"
          >
            {(Object.keys(KONTAKT_KATEGORI_LABEL) as KontaktKategori[]).map((k) => (
              <option key={k} value={k}>
                {KONTAKT_KATEGORI_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="firma" className="form-label">
            Firma
          </label>
          <input
            id="firma"
            name="firma"
            defaultValue={kontakt?.firma ?? ''}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="kunde_id" className="form-label">
            Tilknyttet kunde (valgfritt)
          </label>
          <select
            id="kunde_id"
            name="kunde_id"
            defaultValue={kontakt?.kunde_id ?? ''}
            className="form-input"
          >
            <option value="">— Ingen —</option>
            {kunder.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="telefon" className="form-label">
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            defaultValue={kontakt?.telefon ?? ''}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="epost" className="form-label">
            E-post
          </label>
          <input
            id="epost"
            name="epost"
            type="email"
            defaultValue={kontakt?.epost ?? ''}
            className="form-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="merknader" className="form-label">
          Merknader
        </label>
        <textarea
          id="merknader"
          name="merknader"
          rows={2}
          defaultValue={kontakt?.merknader ?? ''}
          className="form-input"
        />
      </div>
    </div>
  )
}
