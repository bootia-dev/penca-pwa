'use client'

import { useState, useEffect } from 'react'

export default function LocalTime({
  date,
  options,
  className,
  locale,
}: {
  date: string
  options?: Intl.DateTimeFormatOptions
  className?: string
  locale?: string
}) {
  const [formatted, setFormatted] = useState(() => new Date(date).toLocaleString(locale, options))

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString(locale, options))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, locale])

  return <span className={className} suppressHydrationWarning>{formatted}</span>
}
