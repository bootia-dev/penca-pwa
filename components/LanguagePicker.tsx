'use client'

import { useTransition } from 'react'
import { setLocale } from '@/app/actions/locale'
import type { Locale } from '@/lib/i18n'

export default function LanguagePicker({ current }: { current: Locale }) {
  const [isPending, startTransition] = useTransition()
  const next = current === 'en' ? 'es' : 'en'

  return (
    <button
      onClick={() => startTransition(() => setLocale(next))}
      disabled={isPending}
      className="text-xs font-semibold text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-800 disabled:opacity-50"
    >
      {next.toUpperCase()}
    </button>
  )
}
