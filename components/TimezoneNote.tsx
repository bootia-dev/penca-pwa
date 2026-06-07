'use client'

import { useState, useEffect } from 'react'

export default function TimezoneNote({ className }: { className?: string }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    const abbr = new Intl.DateTimeFormat('en', { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? ''

    const offsetMin = -new Date().getTimezoneOffset()
    const sign = offsetMin >= 0 ? '+' : '-'
    const h = Math.floor(Math.abs(offsetMin) / 60)
    const m = Math.abs(offsetMin) % 60
    const offset = m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`

    setLabel(abbr && abbr !== offset ? `${abbr} (${offset})` : offset)
  }, [])

  if (!label) return null

  return (
    <p className={className ?? 'text-xs text-gray-600 text-center'}>
      All times in {label}
    </p>
  )
}
