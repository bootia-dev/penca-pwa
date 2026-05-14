import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import BottomNav from '@/components/BottomNav'
import { getLocale, t } from '@/lib/i18n'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Penca - World Cup Predictions',
  description: 'Compete with friends predicting football match results',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Penca',
  },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const tr = t(locale)

  return (
    <html lang={locale} className={`${geist.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full bg-gray-950 text-white antialiased">
        <Providers>
          <ServiceWorkerRegistrar />
          {children}
          <BottomNav labels={tr.bottomNav} />
        </Providers>
      </body>
    </html>
  )
}
