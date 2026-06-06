'use client'

export default function LocalTime({
  date,
  options,
  className,
}: {
  date: string
  options?: Intl.DateTimeFormatOptions
  className?: string
}) {
  const formatted = new Date(date).toLocaleString(undefined, options)
  return <span className={className} suppressHydrationWarning>{formatted}</span>
}
