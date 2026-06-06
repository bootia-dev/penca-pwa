'use client'

import { useState, useEffect } from 'react'

export default function LocalTime({
  date,
  options,
  className,
}: {
  date: string
  options?: Intl.DateTimeFormatOptions
  className?: string
}) {
  const [formatted, setFormatted] = useState(() => new Date(date).toLocaleString(undefined, options))

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString(undefined, options))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return <span className={className} suppressHydrationWarning>{formatted}</span>
}
