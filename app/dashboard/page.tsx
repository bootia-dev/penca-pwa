import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import DashboardTabs from '@/components/DashboardTabs'
import Image from 'next/image'
import type { Match, Prediction, MatchWithPrediction } from '@/types'

export const revalidate = 0

type PickRow = { user_id: string; name: string; image: string | null; predicted_a: number; predicted_b: number }

export default async function DashboardPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const userId = session!.user!.email!
  const tr = t(locale)
  const d = tr.dashboard

  const [matchesRes, predictionsRes] = await Promise.all([
    db().from('matches').select('*').order('scheduled_at', { ascending: true }),
    db().from('predictions').select('*').eq('user_id', userId),
  ])

  const matches: Match[] = matchesRes.data ?? []
  const predictions: Prediction[] = predictionsRes.data ?? []
  const predMap = new Map(predictions.map((p) => [p.match_id, p]))
  const now = new Date()

  const withPredictions: MatchWithPrediction[] = matches.map((m) => ({
    ...m,
    prediction: predMap.get(m.id) ?? null,
  }))

  const pending = withPredictions.filter(
    (m) => m.status === 'upcoming' && new Date(m.scheduled_at) > now && !m.prediction
  )
  const predicted = withPredictions.filter((m) => m.prediction)
  const liveMatches = withPredictions.filter((m) => m.status === 'live')

  // Fetch all users' predictions for live matches
  const liveMatchIds = liveMatches.map((m) => m.id)
  const { data: livePredRows } = liveMatchIds.length
    ? await db().from('predictions').select('user_id, match_id, predicted_a, predicted_b').in('match_id', liveMatchIds)
    : { data: [] }

  const liveUserIds = [...new Set((livePredRows ?? []).map((p: any) => p.user_id as string))]
  const { data: liveUsers } = liveUserIds.length
    ? await db().from('users').select('id, name, image').in('id', liveUserIds)
    : { data: [] }

  const userInfoMap = new Map((liveUsers ?? []).map((u: any) => [u.id, u]))
  const predsByMatch = new Map<string, PickRow[]>()
  for (const p of livePredRows ?? []) {
    const user = userInfoMap.get(p.user_id)
    if (!user) continue
    const arr = predsByMatch.get(p.match_id) ?? []
    arr.push({ user_id: p.user_id, name: user.name, image: user.image, predicted_a: p.predicted_a, predicted_b: p.predicted_b })
    predsByMatch.set(p.match_id, arr)
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6 bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{d.totalPoints}</p>
            <p className="text-3xl font-bold text-white">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{d.predictions}</p>
            <p className="text-3xl font-bold text-white">{predictions.length}</p>
          </div>
        </div>

        {/* Live matches */}
        {liveMatches.length > 0 && (
          <section className="mb-6">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              {d.liveNow}
            </h2>
            <div className="flex flex-col gap-3">
              {liveMatches.map((match) => {
                const picks = (predsByMatch.get(match.id) ?? []).sort((a, b) =>
                  a.user_id === userId ? -1 : b.user_id === userId ? 1 : a.name.localeCompare(b.name)
                )
                const stageLabel = tr.stages[match.stage as keyof typeof tr.stages]
                const groupLabel = match.group_name ? ` ${match.group_name}` : ''
                return (
                  <div key={match.id} className="bg-gray-800 rounded-2xl border border-red-900/50 overflow-hidden">
                    {/* Match header */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stageLabel}{groupLabel}</span>
                        <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          LIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                          <span className="text-white text-xs font-semibold text-right truncate">{match.team_a}</span>
                          <span className="text-2xl leading-none shrink-0">{match.flag_a}</span>
                        </div>
                        <div className="shrink-0 w-10 text-center">
                          <span className="text-sm text-gray-600 italic">vs</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                          <span className="text-2xl leading-none shrink-0">{match.flag_b}</span>
                          <span className="text-white text-xs font-semibold text-left truncate">{match.team_b}</span>
                        </div>
                      </div>
                    </div>

                    {/* Picks list */}
                    <div className="border-t border-gray-700/60 px-4 py-3">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{d.allPicks}</p>
                      {picks.length === 0 ? (
                        <p className="text-gray-600 text-sm">{d.noPicks}</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {picks.map((pick) => {
                            const isMe = pick.user_id === userId
                            return (
                              <div key={pick.user_id} className={`flex items-center gap-2.5 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                                {pick.image ? (
                                  <Image src={pick.image} alt={pick.name} width={24} height={24} className="rounded-full shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                                    {pick.name[0]}
                                  </div>
                                )}
                                <span className="flex-1 text-sm truncate">
                                  {pick.name}
                                  {isMe && <span className="ml-1 text-xs text-emerald-400">(you)</span>}
                                </span>
                                <span className={`text-sm font-bold tabular-nums shrink-0 ${isMe ? 'text-white' : 'text-gray-300'}`}>
                                  {pick.predicted_a} – {pick.predicted_b}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {matches.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <div className="text-4xl mb-3">📅</div>
            <p>{d.noMatches}</p>
          </div>
        ) : (
          <DashboardTabs predicted={predicted} pending={pending} tr={tr} allMatches={withPredictions} />
        )}
      </main>
    </>
  )
}
