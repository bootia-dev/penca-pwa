import { auth, signOut } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import Image from 'next/image'

export const revalidate = 0

export default async function ProfilePage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const user = session!.user!
  const userId = user.email!
  const tr = t(locale).profile

  const { data: predictions } = await db().from('predictions').select('points').eq('user_id', userId)

  const totalPoints = (predictions ?? []).reduce((sum, p) => sum + (p.points ?? 0), 0)
  const totalPredictions = predictions?.length ?? 0
  const exactScores = (predictions ?? []).filter((p) => p.points === 3).length

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="flex flex-col items-center text-center mb-8">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'User'}
              width={80}
              height={80}
              className="rounded-full ring-4 ring-gray-700 mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {user.name?.[0] ?? '?'}
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label={tr.points} value={totalPoints} color="text-yellow-400" />
          <StatCard label={tr.predictions} value={totalPredictions} color="text-blue-400" />
          <StatCard label={tr.exactScores} value={exactScores} color="text-emerald-400" />
        </div>

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
          >
            {tr.signOut}
          </button>
        </form>
      </main>
    </>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
    </div>
  )
}
