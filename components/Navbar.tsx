import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'

export default async function Navbar() {
  const session = await auth()
  const isAdmin = process.env.ADMIN_EMAILS?.split(',').includes(session?.user?.email ?? '')

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-white font-bold text-lg tracking-tight">
          Penca
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
              Admin
            </Link>
          )}

          {session?.user && (
            <Link href="/profile" className="flex items-center group">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-gray-700 group-hover:ring-emerald-500 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {session.user.name?.[0] ?? '?'}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
