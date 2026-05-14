import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import MatchCard from '@/components/MatchCard'
import type { Match, Prediction, MatchWithPrediction } from '@/types'

export const revalidate = 60

export default async function DashboardPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const userId = session!.user!.email!
  const tr = t(locale)

  const [matchesRes, predictionsRes] = await Promise.all([
    db().from('matches').select('*').order('scheduled_at', { ascending: true }),
    db().from('predictions').select('*').eq('user_id', userId),
  ])

  const matches: Match[] = matchesRes.data ?? []
  const predictions: Prediction[] = predictionsRes.data ?? []
  const predictionMap = new Map(predictions.map((p) => [p.match_id, p]))
  const now = new Date()

  const withPredictions: MatchWithPrediction[] = matches.map((match) => ({
    ...match,
    prediction: predictionMap.get(match.id) ?? null,
  }))

  const upcoming = withPredictions.filter(
    (m) => m.status === 'upcoming' && new Date(m.scheduled_at) > now
  )
  const past = withPredictions
    .filter((m) => m.status === 'finished' || new Date(m.scheduled_at) <= now)
    .reverse()

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6 bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{tr.dashboard.totalPoints}</p>
            <p className="text-3xl font-bold text-white">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{tr.dashboard.predictions}</p>
            <p className="text-3xl font-bold text-white">{predictions.length}</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              {tr.dashboard.upcoming}
            </h2>
            <div className="flex flex-col gap-3">
              {upcoming.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  canPredict={new Date(match.scheduled_at) > now}
                  tr={tr}
                />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              {tr.dashboard.results}
            </h2>
            <div className="flex flex-col gap-3">
              {past.map((match) => (
                <MatchCard key={match.id} match={match} canPredict={false} tr={tr} />
              ))}
            </div>
          </section>
        )}

        {matches.length === 0 && (
          <div className="text-center text-gray-600 mt-20">
            <div className="text-4xl mb-3">📅</div>
            <p>{tr.dashboard.noMatches}</p>
          </div>
        )}
      </main>
    </>
  )
}
