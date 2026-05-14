import { ImageResponse } from 'next/og'

export function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const size = Math.min(512, Math.max(32, parseInt(searchParams.get('size') ?? '192')))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #064e3b 0%, #111827 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.55),
        }}
      >
        ⚽
      </div>
    ),
    { width: size, height: size }
  )
}
