'use client'

import { useState } from 'react'

export default function Avatar({ src, name, size = 28 }: { src: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full bg-gray-600 flex items-center justify-center font-bold shrink-0 text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
}
