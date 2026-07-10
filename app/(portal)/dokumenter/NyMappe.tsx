'use client'

import { useRef, useState } from 'react'
import { FolderPlusIcon } from '@heroicons/react/24/outline'
import { createMappe } from './actions'

export function NyMappe({ parentId }: { parentId: string | null }) {
  const [apen, setApen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const action = createMappe.bind(null, parentId)

  if (!apen) {
    return (
      <button
        type="button"
        onClick={() => setApen(true)}
        className="btn-secondary"
      >
        <FolderPlusIcon className="h-5 w-5" />
        Ny mappe
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd)
        formRef.current?.reset()
        setApen(false)
      }}
      className="flex items-center gap-2"
    >
      <input
        name="navn"
        autoFocus
        required
        placeholder="Mappenavn"
        className="form-input py-1.5"
      />
      <button type="submit" className="btn-primary">
        Opprett
      </button>
      <button
        type="button"
        onClick={() => setApen(false)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Avbryt
      </button>
    </form>
  )
}
