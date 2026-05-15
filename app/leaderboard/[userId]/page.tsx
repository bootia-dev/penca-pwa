import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'
import Image from 'next/image'
import type { MatchWithPrediction } from '@/types'

export const revalidate = 60

export default async function UserPicksPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: raw } = await params
  const userId = decodeURIComponent(raw)

  const [, locale] = await Promise.all([auth(), getLocale()])
  const tr = t(locale)

  const [userRes, matchesRes] = await Promise.all([
    db().from('users').select('id, name, image').eq('id', userId).single(),
    db()
      .from('matches')
      .select('*')
      .in('status', ['finished', 'live'])
      .order('scheduled_at', { ascending: true }),
  ])

  const user = userRes.data
  const matches: any[] = matchesRes.data ?? []
  const matchIds = matches.map((m) => m.id)

  const { data: predictions } = matchIds.length
    ? await db().from('predictions').select('*').eq('user_id', userId).in('match_id', matchIds)
    : { data: [] }

  const predMap = new Map((predictions ?? []).map((p: any) => [p.match_id, p]))

  const matchesWithPredictions: MatchWithPrediction[] = matches.map((m) => ({
    ...m,
    prediction: predMap.get(m.id) ?? null,
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <Link href="/leaderboard" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
          ← {tr.leaderboard.back}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          {user?.image ? (
            <Image src={user.image} alt={user.name} width={40} height={40} className="rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] ?? '?'}
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{user?.name}</h1>
        </div>

        {matchesWithPredictions.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">{tr.leaderboard.noFinishedPicks}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {matchesWithPredictions.map((match) => (
              <MatchCard key={match.id} match={match} canPredict={false} tr={tr} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
