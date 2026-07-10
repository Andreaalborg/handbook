'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { registrerDokument } from './actions'

export function LastOppFil({ mappeId }: { mappeId: string | null }) {
  const [laster, setLaster] = useState(false)
  const [feil, setFeil] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setLaster(true)
    setFeil(null)
    const supabase = createClient()

    try {
      for (const file of Array.from(files)) {
        const trygtNavn = file.name.replace(/[^\w.\-]/g, '_')
        const sti = `${crypto.randomUUID()}-${trygtNavn}`
        const { error } = await supabase.storage
          .from('dokumenter')
          .upload(sti, file)
        if (error) throw error
        await registrerDokument(mappeId, file.name, sti, file.size)
      }
      router.refresh()
    } catch (err) {
      setFeil(err instanceof Error ? err.message : 'Opplasting feilet')
    } finally {
      setLaster(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="btn-primary cursor-pointer">
        <ArrowUpTrayIcon className="h-5 w-5" />
        {laster ? 'Laster opp …' : 'Last opp fil'}
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handle}
          disabled={laster}
          className="hidden"
        />
      </label>
      {feil && <p className="mt-1 text-xs text-red-600">{feil}</p>}
    </div>
  )
}
